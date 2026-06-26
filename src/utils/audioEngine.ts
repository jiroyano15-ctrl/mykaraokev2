/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Song, AudioSettings, Note } from '../types';

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private micStream: MediaStream | null = null;
  private micSourceNode: MediaStreamAudioSourceNode | null = null;
  
  // Nodes in the chain
  private vocalGain: GainNode | null = null;
  private backingGain: GainNode | null = null;
  private delayNode: DelayNode | null = null;
  private delayFeedbackGain: GainNode | null = null;
  private delayDryWetGain: GainNode | null = null;
  private reverbNode: ConvolverNode | null = null;
  private reverbDryWetGain: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private masterGain: GainNode | null = null;
  
  // Recording
  private recordingDestination: MediaStreamAudioDestinationNode | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  
  // Sequencer / Song play state
  private activeSong: Song | null = null;
  private startTime: number = 0;
  private isPlaying: boolean = false;
  private isPaused: boolean = false;
  private pauseTime: number = 0;
  private nextNoteIndex: number = 0;
  private sequencerTimer: number | null = null;
  private timeUpdateTimer: number | null = null;
  private lastScheduledBeat: number = -1;
  
  // Event handlers
  private onTimeUpdate: ((time: number) => void) | null = null;
  private onPitchUpdate: ((pitch: number, notePitch: number) => void) | null = null;
  
  // Pitch data caching
  private analyserBuffer: Float32Array = new Float32Array(2048);

  constructor() {
    // AudioEngine instances are typically lazy-initialized on user gesture
  }

  /**
   * Initializes the Audio Context and requests Mic Permissions
   */
  async init(): Promise<void> {
    if (this.ctx) return;

    // Create audio context
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContextClass();
    
    // Request microphone access
    this.micStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      },
      video: false
    });

    // Create mic source
    this.micSourceNode = this.ctx.createMediaStreamSource(this.micStream);

    // Create mixer and effect nodes
    this.vocalGain = this.ctx.createGain();
    this.backingGain = this.ctx.createGain();
    this.masterGain = this.ctx.createGain();
    
    // Create delay (echo) node
    this.delayNode = this.ctx.createDelay(2.0);
    this.delayFeedbackGain = this.ctx.createGain();
    this.delayDryWetGain = this.ctx.createGain();
    
    // Initialize delay settings
    this.delayNode.delayTime.value = 0.35;
    this.delayFeedbackGain.gain.value = 0.4;
    this.delayDryWetGain.gain.value = 0.0; // dry initially

    // Create reverb (convolver) node
    this.reverbNode = this.ctx.createConvolver();
    this.reverbDryWetGain = this.ctx.createGain();
    this.reverbDryWetGain.gain.value = 0.0; // dry initially
    
    // Generate synthetic stereo impulse response for algorithmic reverb
    this.generateSyntheticReverb(1.5, 2.0);

    // Create vocal analyser for real-time pitch tracking
    this.analyserNode = this.ctx.createAnalyser();
    this.analyserNode.fftSize = 2048;
    this.analyserBuffer = new Float32Array(this.analyserNode.fftSize);

    // Create recording destination node to bounce down mixed performance
    this.recordingDestination = this.ctx.createMediaStreamDestination();

    // CONNECT VOCAL CHAIN
    // mic -> vocalGain -> analyser -> reverb & delay & clean output -> master
    this.micSourceNode.connect(this.vocalGain);
    this.vocalGain.connect(this.analyserNode);
    
    // Reverb loop
    this.vocalGain.connect(this.reverbNode);
    this.reverbNode.connect(this.reverbDryWetGain);
    this.reverbDryWetGain.connect(this.masterGain);
    this.reverbDryWetGain.connect(this.recordingDestination); // send reverb to recording

    // Delay/Echo loop
    this.vocalGain.connect(this.delayNode);
    this.delayNode.connect(this.delayFeedbackGain);
    this.delayFeedbackGain.connect(this.delayNode); // feedback loop
    this.delayNode.connect(this.delayDryWetGain);
    this.delayDryWetGain.connect(this.masterGain);
    this.delayDryWetGain.connect(this.recordingDestination); // send delay to recording

    // Clean direct vocal
    this.vocalGain.connect(this.masterGain);
    this.vocalGain.connect(this.recordingDestination); // send vocal to recording

    // CONNECT BACKING MUSIC CHAIN
    // backingGain -> master & recording destination
    this.backingGain.connect(this.masterGain);
    this.backingGain.connect(this.recordingDestination);

    // CONNECT MASTER OUT
    this.masterGain.connect(this.ctx.destination);

    // Set default volume levels
    this.vocalGain.gain.value = 1.0;
    this.backingGain.gain.value = 0.8;
    this.masterGain.gain.value = 1.0;
  }

  /**
   * Generates a stereo white-noise exponential decay buffer for studio reverb simulation
   */
  private generateSyntheticReverb(duration: number, decay: number) {
    if (!this.ctx || !this.reverbNode) return;
    
    const rate = this.ctx.sampleRate;
    const len = rate * duration;
    const buffer = this.ctx.createBuffer(2, len, rate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < len; i++) {
        // Exponentially decaying white noise
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
      }
    }
    
    this.reverbNode.buffer = buffer;
  }

  /**
   * Applies the sliders and settings to Web Audio Nodes in real time
   */
  setSettings(settings: AudioSettings) {
    if (!this.ctx) return;
    
    if (this.vocalGain) {
      this.vocalGain.gain.value = settings.vocalVolume;
    }
    
    if (this.backingGain) {
      this.backingGain.gain.value = settings.backingVolume;
    }

    if (this.delayDryWetGain && this.delayFeedbackGain) {
      // Adjust echo levels
      this.delayDryWetGain.gain.value = settings.echoFeedback > 0 ? 0.35 : 0.0;
      this.delayFeedbackGain.gain.value = settings.echoFeedback;
    }

    if (this.reverbDryWetGain) {
      // Adjust reverb level
      this.reverbDryWetGain.gain.value = settings.reverbLevel * 0.5; // Scale to avoid clipping
    }
  }

  /**
   * Gets the active audio context time
   */
  getCurrentTime(): number {
    if (!this.ctx || !this.isPlaying) return 0;
    if (this.isPaused) return this.pauseTime;
    return this.ctx.currentTime - this.startTime;
  }

  /**
   * Starts a karaoke song with backing synthesizers, synchronized timers, and recorders
   */
  startSong(
    song: Song,
    settings: AudioSettings,
    onTimeUpdate: (time: number) => void,
    onPitchUpdate: (pitch: number, notePitch: number) => void
  ) {
    this.activeSong = song;
    this.onTimeUpdate = onTimeUpdate;
    this.onPitchUpdate = onPitchUpdate;
    this.isPlaying = true;
    this.isPaused = false;
    this.nextNoteIndex = 0;
    this.lastScheduledBeat = -1;

    if (!this.ctx) return;
    
    // Ensure Context is resumed (browser gesture safeguard)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.startTime = this.ctx.currentTime;
    this.setSettings(settings);

    // Setup media recording of the mixed performance
    if (this.recordingDestination) {
      this.recordedChunks = [];
      try {
        // Prefer standard audio formats
        const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg';
        this.mediaRecorder = new MediaRecorder(this.recordingDestination.stream, { mimeType });
        
        this.mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            this.recordedChunks.push(e.data);
          }
        };
        
        this.mediaRecorder.start(100); // chunk every 100ms
      } catch (e) {
        console.error("Could not start MediaRecorder:", e);
      }
    }

    // Start scheduler and pitch tracking loops
    this.startSequencer(settings.guideMelody);
    this.startTimerLoops();
  }

  /**
   * Schedules backing track instruments (melody lead, bass, drums, chords) 150ms in advance
   */
  private startSequencer(guideMelody: boolean) {
    if (!this.ctx || !this.activeSong) return;

    const lookAhead = 0.15; // 150ms schedule window
    const interval = 40; // run every 40ms

    this.sequencerTimer = window.setInterval(() => {
      if (!this.ctx || !this.activeSong || this.isPaused) return;

      const elapsed = this.ctx.currentTime - this.startTime;

      // 1. SCHEDULE MELODY SYNTHS & CHORDS
      while (
        this.nextNoteIndex < this.activeSong.backingNotes.length &&
        this.activeSong.backingNotes[this.nextNoteIndex].time <= elapsed + lookAhead
      ) {
        const note = this.activeSong.backingNotes[this.nextNoteIndex];
        const schedTime = this.startTime + note.time;
        
        // Only schedule if notes are in the future
        if (schedTime >= this.ctx.currentTime) {
          // Play Melody Lead (Guide Note)
          if (guideMelody) {
            this.playSynthNote(note.midiPitch, note.duration, schedTime, 'triangle', 0.12);
          } else {
            // Very subtle ticking to help user stay on pitch
            this.playSynthNote(note.midiPitch, 0.05, schedTime, 'sine', 0.01);
          }

          // Play Auto-Chords backing (Sawtooth + lowpass, creating a nice analog synth pad)
          this.playBackingChord(note.midiPitch, note.duration, schedTime);
        }
        this.nextNoteIndex++;
      }

      // 2. SCHEDULE RETRO SYNTH DRUM BEATS (Kick, Snare, Hi-hat)
      const bpm = this.activeSong.bpm;
      const beatDuration = 60 / bpm;
      const currentBeat = Math.floor(elapsed / beatDuration);
      
      // Schedule drums for the next beat ahead of time
      const nextBeatTime = (currentBeat + 1) * beatDuration;
      if (nextBeatTime <= elapsed + lookAhead) {
        const schedBeat = currentBeat + 1;
        if (schedBeat > this.lastScheduledBeat) {
          const schedTime = this.startTime + (schedBeat * beatDuration);
          
          // Simple professional drum grid
          // Beat 1, 3: Kick drum
          // Beat 2, 4: Snare drum
          // Beat 1.5, 2.5, 3.5, 4.5 (eighths): Crisp hi-hat
          const patternIdx = schedBeat % 4;
          
          if (patternIdx === 0 || patternIdx === 2) {
            this.playKickDrum(schedTime);
          } else if (patternIdx === 1 || patternIdx === 3) {
            this.playSnareDrum(schedTime);
          }
          
          // Schedule hi-hats slightly offset
          this.playHiHat(schedTime - (beatDuration / 2));
          this.playHiHat(schedTime);

          // Schedule a warm deep bass line on first beat of each bar
          if (patternIdx === 0 && this.nextNoteIndex > 0) {
            // Find nearby melody note to lock the key
            const nearbyNote = this.activeSong.backingNotes[Math.max(0, this.nextNoteIndex - 1)];
            this.playBassNote(nearbyNote.midiPitch - 24, beatDuration * 2, schedTime); // 2 octaves down
          }

          this.lastScheduledBeat = schedBeat;
        }
      }

    }, interval);
  }

  /**
   * Synthesizes a beautiful individual musical note using dynamic frequency and envelope ramping
   */
  private playSynthNote(midiPitch: number, duration: number, time: number, type: OscillatorType, volume: number) {
    if (!this.ctx || !this.backingGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(this.midiToFreq(midiPitch), time);
    
    // Envelope: Attack, Decay, Sustain, Release
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(volume, time + 0.02);
    gain.gain.setValueAtTime(volume, time + duration - 0.05);
    gain.gain.linearRampToValueAtTime(0, time + duration);

    osc.connect(gain);
    gain.connect(this.backingGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  /**
   * Auto-arranges chords dynamically based on the active melody note
   */
  private playBackingChord(melodyPitch: number, duration: number, time: number) {
    if (!this.ctx || !this.backingGain) return;

    // Create a rich, warm triad chord pad (lowpass filtered sawtooth wave)
    const pitches = [melodyPitch - 12, melodyPitch - 12 + 4, melodyPitch - 12 + 7]; // Major triad 1-octave down
    // Switch to minor chord if song is in a minor feel (Frank Sinatra's jazz vibe!)
    if (this.activeSong?.id === 'flyme' && (melodyPitch % 12 === 2 || melodyPitch % 12 === 9)) {
      pitches[1] = melodyPitch - 12 + 3; // minor third
    }

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(350, time); // warm retro sound

    pitches.forEach((pitch) => {
      if (!this.ctx || !this.backingGain) return;
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(this.midiToFreq(pitch), time);

      // Soft swelling pad envelope
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.04, time + 0.08); // quiet background harmony
      gain.gain.setValueAtTime(0.04, time + duration - 0.05);
      gain.gain.linearRampToValueAtTime(0, time + duration);

      osc.connect(gain);
      gain.connect(filter);
      osc.start(time);
      osc.stop(time + duration);
    });

    filter.connect(this.backingGain);
  }

  /**
   * Synthesizes a deep warm bass note
   */
  private playBassNote(midiPitch: number, duration: number, time: number) {
    if (!this.ctx || !this.backingGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(this.midiToFreq(midiPitch), time);

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.15, time + 0.04);
    gain.gain.setValueAtTime(0.15, time + duration - 0.1);
    gain.gain.linearRampToValueAtTime(0, time + duration);

    osc.connect(gain);
    gain.connect(this.backingGain);
    osc.start(time);
    osc.stop(time + duration);
  }

  /**
   * Synthesizes a retro kick drum using rapid frequency sweeping
   */
  private playKickDrum(time: number) {
    if (!this.ctx || !this.backingGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // Frequency sweep from 150Hz down to 40Hz to recreate kick punch
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(45, time + 0.1);

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.35, time + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

    osc.connect(gain);
    gain.connect(this.backingGain);
    osc.start(time);
    osc.stop(time + 0.12);
  }

  /**
   * Synthesizes a crisp retro snare drum using noise and bandpass filters
   */
  private playSnareDrum(time: number) {
    if (!this.ctx || !this.backingGain) return;

    const bufferSize = this.ctx.sampleRate * 0.12; // 120ms burst
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.15, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.backingGain);

    noise.start(time);
    noise.stop(time + 0.12);
  }

  /**
   * Synthesizes a crisp hi-hat cymbal
   */
  private playHiHat(time: number) {
    if (!this.ctx || !this.backingGain) return;

    const bufferSize = this.ctx.sampleRate * 0.03; // 30ms snap
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7000, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.06, time + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.backingGain);

    noise.start(time);
    noise.stop(time + 0.03);
  }

  /**
   * Starts high-fidelity lyric syncing and real-time autocorrelation vocal pitch tracking loops
   */
  private startTimerLoops() {
    if (!this.ctx) return;

    // 1. Synchronized visual timeline updates
    this.timeUpdateTimer = window.setInterval(() => {
      if (!this.onTimeUpdate) return;
      this.onTimeUpdate(this.getCurrentTime());
    }, 33); // ~30 fps for smooth lyrics highlighters

    // 2. Pitch detection correlation loop
    const trackPitch = () => {
      if (!this.isPlaying || this.isPaused || !this.ctx || !this.analyserNode || !this.onPitchUpdate || !this.activeSong) return;

      this.analyserNode.getFloatTimeDomainData(this.analyserBuffer);
      const vocalFreq = this.autoCorrelate(this.analyserBuffer, this.ctx.sampleRate);
      
      const elapsed = this.getCurrentTime();
      
      // Look up target pitch from backing notes at current elapsed time
      const currentTargetNote = this.activeSong.backingNotes.find(
        (n) => elapsed >= n.time && elapsed <= n.time + n.duration
      );

      const targetMidi = currentTargetNote ? currentTargetNote.midiPitch : -1;
      let detectedMidi = -1;

      if (vocalFreq > 0) {
        detectedMidi = this.freqToMidi(vocalFreq);
      }

      this.onPitchUpdate(detectedMidi, targetMidi);
      
      if (this.isPlaying && !this.isPaused) {
        requestAnimationFrame(trackPitch);
      }
    };

    requestAnimationFrame(trackPitch);
  }

  /**
   * Autocorrelation fundamental pitch detection algorithm
   */
  private autoCorrelate(buffer: Float32Array, sampleRate: number): number {
    const SIZE = buffer.length;
    let r1 = 0, r2 = SIZE - 1;
    const thres = 0.2;
    
    // Find absolute root-mean-square power
    let sum = 0;
    for (let i = 0; i < SIZE; i++) {
      sum += buffer[i] * buffer[i];
    }
    const rms = Math.sqrt(sum / SIZE);
    if (rms < 0.012) {
      return -1; // Ignore room noise/silence
    }

    // Clip starting noise
    for (let i = 0; i < SIZE / 2; i++) {
      if (Math.abs(buffer[i]) < rms * thres) {
        r1 = i;
      } else {
        break;
      }
    }
    // Clip ending noise
    for (let i = SIZE - 1; i >= SIZE / 2; i--) {
      if (Math.abs(buffer[i]) < rms * thres) {
        r2 = i;
      } else {
        break;
      }
    }

    const buf = buffer.subarray(r1, r2);
    const len = buf.length;
    if (len < 64) return -1; // Too short to correlate

    const c = new Float32Array(len);
    for (let i = 0; i < len; i++) {
      for (let j = 0; j < len - i; j++) {
        c[i] += buf[j] * buf[j + i];
      }
    }

    // Find first local trough (zero crossing equivalent)
    let d = 0;
    while (d < len - 1 && c[d] > c[d + 1]) {
      d++;
    }

    // Find highest peak after the trough
    let maxval = -1;
    let maxpos = -1;
    for (let i = d; i < len; i++) {
      if (c[i] > maxval) {
        maxval = c[i];
        maxpos = i;
      }
    }

    let T0 = maxpos;

    // Refine correlation pos with parabolic interpolation
    if (maxpos > 0 && maxpos < len - 1) {
      const x1 = c[maxpos - 1];
      const x2 = c[maxpos];
      const x3 = c[maxpos + 1];
      const a = (x1 + x3 - 2 * x2) / 2;
      const b = (x3 - x1) / 2;
      if (a !== 0) {
        T0 = maxpos - b / (2 * a);
      }
    }

    const freq = sampleRate / T0;
    // Keep frequency within standard vocal limits (80Hz - 1100Hz)
    if (freq > 80 && freq < 1100) {
      return freq;
    }
    return -1;
  }

  /**
   * Pauses vocal playback and sequencer
   */
  pauseSong() {
    if (!this.isPlaying || this.isPaused || !this.ctx) return;
    this.isPaused = true;
    this.pauseTime = this.ctx.currentTime - this.startTime;
    
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
    }
    
    this.clearTimers();
  }

  /**
   * Resumes vocal playback and sequencer
   */
  resumeSong(settings: AudioSettings) {
    if (!this.isPlaying || !this.isPaused || !this.ctx) return;
    this.isPaused = false;
    this.startTime = this.ctx.currentTime - this.pauseTime;
    
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
    }

    this.startSequencer(settings.guideMelody);
    this.startTimerLoops();
  }

  /**
   * Stops active performance, finalizing recording and shutting down nodes
   */
  stopSong(): Promise<{ audioUrl: string; duration: number; rawBlob: Blob } | null> {
    return new Promise((resolve) => {
      this.isPlaying = false;
      this.isPaused = false;
      this.clearTimers();

      const finalDuration = this.ctx ? this.ctx.currentTime - this.startTime : 0;

      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.onstop = () => {
          // Combine chunks into output audio blob
          const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg';
          const audioBlob = new Blob(this.recordedChunks, { type: mimeType });
          const audioUrl = URL.createObjectURL(audioBlob);
          resolve({ audioUrl, duration: finalDuration, rawBlob: audioBlob });
        };
        this.mediaRecorder.stop();
      } else {
        resolve(null);
      }
    });
  }

  private clearTimers() {
    if (this.sequencerTimer) {
      clearInterval(this.sequencerTimer);
      this.sequencerTimer = null;
    }
    if (this.timeUpdateTimer) {
      clearInterval(this.timeUpdateTimer);
      this.timeUpdateTimer = null;
    }
  }

  /**
   * Converts frequency (Hz) to midi note integer
   */
  private freqToMidi(f: number): number {
    return Math.round(12 * Math.log2(f / 440) + 69);
  }

  /**
   * Converts midi note integer to frequency (Hz)
   */
  private midiToFreq(m: number): number {
    return 440 * Math.pow(2, (m - 69) / 12);
  }

  /**
   * Safe teardown of mic streams and context
   */
  destroy() {
    this.clearTimers();
    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => track.stop());
    }
    if (this.ctx) {
      this.ctx.close();
    }
  }
}
export const audioEngineInstance = new AudioEngine();
