/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Song, AudioSettings } from '../types';
import { audioEngineInstance } from '../utils/audioEngine';
import { PitchVisualizer } from './PitchVisualizer';
import { Play, Pause, Square, Video, VideoOff, Mic, Settings, Volume2, Sparkles, AlertCircle } from 'lucide-react';

interface KaraokeStudioProps {
  song: Song;
  onRecordingFinished: (data: { audioUrl: string; rawBlob: Blob; score: number }) => void;
  onCancel: () => void;
}

export const KaraokeStudio: React.FC<KaraokeStudioProps> = ({
  song,
  onRecordingFinished,
  onCancel
}) => {
  const [hasInited, setHasInited] = useState(false);
  const [micDenied, setMicDenied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  // Real-time audio engine updates
  const [currentTime, setCurrentTime] = useState(0);
  const [detectedMidi, setDetectedMidi] = useState(-1);
  const [targetMidi, setTargetMidi] = useState(-1);

  // Mixer settings
  const [settings, setSettings] = useState<AudioSettings>({
    backingVolume: 0.7,
    vocalVolume: 0.8,
    echoFeedback: 0.3,
    reverbLevel: 0.4,
    guideMelody: true
  });

  // Gamification stats
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [vocalEvaluation, setVocalEvaluation] = useState<'PERFECT' | 'GOOD' | 'OK' | 'MISS' | null>(null);

  // Camera settings
  const [webcamActive, setWebcamActive] = useState(false);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [activeFilter, setActiveFilter] = useState<'stage' | 'gold' | 'neon' | 'noir'>('stage');
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Audio mic amplitude visualizer
  const [micAmplitude, setMicAmplitude] = useState(0);

  // Initialize engine on first gesture
  const initEngine = async () => {
    try {
      setMicDenied(false);
      await audioEngineInstance.init();
      audioEngineInstance.setSettings(settings);
      setHasInited(true);
    } catch (e) {
      console.error("Microphone access declined or failed:", e);
      setMicDenied(true);
    }
  };

  useEffect(() => {
    // Proactively initialize on render (safely, letting users handle prompt)
    initEngine();

    return () => {
      // Cleanup on unmount
      audioEngineInstance.stopSong();
      stopWebcam();
    };
  }, []);

  // Sync sliders to the audio engine immediately on change
  useEffect(() => {
    if (hasInited) {
      audioEngineInstance.setSettings(settings);
    }
  }, [settings, hasInited]);

  // Webcam stream handlers
  const toggleWebcam = async () => {
    if (webcamActive) {
      stopWebcam();
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: false
        });
        setWebcamStream(stream);
        setWebcamActive(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn("Could not start camera:", err);
      }
    }
  };

  const stopWebcam = () => {
    if (webcamStream) {
      webcamStream.getTracks().forEach((track) => track.stop());
      setWebcamStream(null);
    }
    setWebcamActive(false);
  };

  // Performance loops
  const handleStartRecording = () => {
    if (!hasInited) return;

    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setVocalEvaluation(null);
    setCurrentTime(0);
    setIsPlaying(true);
    setIsPaused(false);

    audioEngineInstance.startSong(
      song,
      settings,
      (time) => {
        setCurrentTime(time);
        
        // Auto-complete song when duration is reached
        const songDuration = song.backingNotes[song.backingNotes.length - 1].time + song.backingNotes[song.backingNotes.length - 1].duration;
        if (time >= songDuration + 1.5) {
          handleStopRecording();
        }
      },
      (detected, target) => {
        setDetectedMidi(detected);
        setTargetMidi(target);

        // Score pitch evaluation & scoring
        if (detected > 0 && target > 0) {
          const diff = Math.abs(detected - target);
          if (diff <= 1.2) {
            setScore((prev) => prev + 45);
            setCombo((prev) => {
              const newCombo = prev + 1;
              if (newCombo > maxCombo) setMaxCombo(newCombo);
              return newCombo;
            });
            setVocalEvaluation('PERFECT');
          } else if (diff <= 2.2) {
            setScore((prev) => prev + 25);
            setCombo((prev) => {
              const newCombo = prev + 1;
              if (newCombo > maxCombo) setMaxCombo(newCombo);
              return newCombo;
            });
            setVocalEvaluation('GOOD');
          } else if (diff <= 3.5) {
            setScore((prev) => prev + 10);
            setVocalEvaluation('OK');
          } else {
            setCombo(0);
            setVocalEvaluation('MISS');
          }
          
          // Generate a moving amplitude multiplier for bouncing meters
          setMicAmplitude(Math.min(100, Math.round(50 + Math.random() * 50)));
        } else if (detected > 0) {
          // just vocalizing without active song target notes
          setMicAmplitude(Math.min(100, Math.round(20 + Math.random() * 40)));
          setVocalEvaluation(null);
        } else {
          setMicAmplitude(0);
          setVocalEvaluation(null);
        }
      }
    );
  };

  const handlePauseToggle = () => {
    if (isPaused) {
      audioEngineInstance.resumeSong(settings);
      setIsPaused(false);
    } else {
      audioEngineInstance.pauseSong();
      setIsPaused(true);
    }
  };

  const handleStopRecording = async () => {
    setIsPlaying(false);
    setIsPaused(false);
    setMicAmplitude(0);
    setDetectedMidi(-1);
    setTargetMidi(-1);

    const recordingResult = await audioEngineInstance.stopSong();
    if (recordingResult) {
      // final penalty or combo adjustments
      onRecordingFinished({
        audioUrl: recordingResult.audioUrl,
        rawBlob: recordingResult.rawBlob,
        score: score
      });
    }
  };

  // Helper: Filter styling on video
  const filterStyles = {
    stage: 'contrast-105 brightness-105 saturate-105',
    gold: 'sepia contrast-125 saturate-110 hue-rotate-[340deg]',
    neon: 'contrast-150 saturate-150 hue-rotate-180 brightness-95',
    noir: 'grayscale contrast-150 brightness-90'
  }[activeFilter];

  // Synchronized Lyrics Scroller
  const renderLyrics = () => {
    // Filter lines near current playback time
    const activeLineIndex = song.lyrics.findIndex(
      (line) => currentTime >= line.time && currentTime <= line.time + line.duration
    );

    // Fallback: if between lines, show upcoming
    let currentLine = song.lyrics[0];
    let nextLine = song.lyrics[1];

    if (activeLineIndex !== -1) {
      currentLine = song.lyrics[activeLineIndex];
      nextLine = song.lyrics[activeLineIndex + 1] || null;
    } else {
      // Find first line starting in the future
      const futureLineIdx = song.lyrics.findIndex((line) => line.time > currentTime);
      if (futureLineIdx !== -1) {
        currentLine = song.lyrics[futureLineIdx];
        nextLine = song.lyrics[futureLineIdx + 1] || null;
      }
    }

    return (
      <div id="lyrics_scroller_module" className="bg-slate-950/70 border border-slate-800 rounded-2xl p-6 text-center shadow-inner relative overflow-hidden flex flex-col justify-center min-h-36">
        {/* Current Active Line */}
        {currentLine && (
          <div className="space-y-1">
            <p className="text-sm font-mono uppercase tracking-wider text-indigo-400 font-bold mb-1 opacity-70">
              Active Lyrics
            </p>
            <div className="text-xl md:text-2xl font-extrabold tracking-tight text-white flex flex-wrap justify-center gap-x-1.5 leading-snug">
              {currentLine.words.map((word, wordIdx) => {
                const isWordPassed = currentTime >= word.time;
                const isWordActive = currentTime >= word.time && currentTime <= word.time + word.duration;
                
                return (
                  <span
                    key={wordIdx}
                    className={`transition-colors duration-150 rounded px-0.5 ${isWordActive ? 'text-cyan-400 bg-cyan-500/10 scale-105 shadow-inner' : isWordPassed ? 'text-indigo-300' : 'text-slate-400'}`}
                  >
                    {word.text}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Dimmed Upcoming Line */}
        {nextLine && (
          <div className="mt-5 border-t border-slate-800/40 pt-4 opacity-40">
            <p className="text-[10px] font-mono tracking-widest text-slate-500 uppercase font-semibold mb-1">
              Coming Up Next
            </p>
            <p className="text-sm md:text-base font-semibold text-slate-400 truncate">
              {nextLine.text}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div id="karaoke_studio_panel" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* 1. VOCAL PERFORMANCE STAGE (Webcam / Meter fallbacks) */}
      <div className="lg:col-span-2 space-y-6 flex flex-col">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex-1 flex flex-col relative min-h-80 md:min-h-[400px]">
          {/* Header Bar */}
          <div className="bg-slate-950/80 border-b border-slate-800/80 p-4 flex items-center justify-between z-10">
            <div>
              <h3 className="text-sm font-bold text-slate-200 truncate">{song.title}</h3>
              <p className="text-xs text-slate-400 truncate font-mono">Original Artist: {song.artist}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={toggleWebcam}
                className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 ${webcamActive ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'}`}
              >
                {webcamActive ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                <span className="hidden sm:inline">{webcamActive ? 'Disable Stage Camera' : 'Activate Stage Camera'}</span>
              </button>
            </div>
          </div>

          {/* Active Canvas / Stage Box */}
          <div className="flex-1 bg-slate-950 flex items-center justify-center relative overflow-hidden group">
            {webcamActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transition-all duration-300 ${filterStyles}`}
              />
            ) : (
              // Falling Spectrum Waves
              <div className="absolute inset-0 flex items-center justify-center p-8 bg-gradient-to-b from-slate-950 to-indigo-950/30">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center text-indigo-500 mx-auto animate-pulse">
                    <Mic className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-300">Live Stage Feed</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                      Webcam disabled. Toggle the camera above to see yourself on stage, or sing into the microphone to drive waves.
                    </p>
                  </div>
                </div>

                {/* Ambient live mic sound waves */}
                <div className="absolute bottom-12 left-0 right-0 h-20 flex items-end justify-center gap-[3px] px-8">
                  {Array.from({ length: 40 }).map((_, idx) => {
                    const activeAmp = isPlaying && !isPaused ? micAmplitude : 0;
                    const height = activeAmp > 0 
                      ? Math.max(8, activeAmp * (Math.sin(idx * 0.25) * 0.4 + 0.6) * (idx % 2 === 0 ? 0.8 : 0.4))
                      : 4;
                    return (
                      <div
                        key={idx}
                        className="flex-1 rounded-full bg-gradient-to-t from-indigo-600 to-cyan-400 transition-all duration-75"
                        style={{ height: `${height}%` }}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Webcam Retro Filters Tray */}
            {webcamActive && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-950/80 backdrop-blur-md border border-slate-800 p-1.5 rounded-xl flex items-center gap-1 z-20 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                {[
                  { id: 'stage', label: 'Clean' },
                  { id: 'gold', label: 'Gold Sepia' },
                  { id: 'neon', label: 'Neon' },
                  { id: 'noir', label: 'Noir' }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFilter(f.id as any)}
                    className={`px-2.5 py-1 text-[10px] font-bold font-mono rounded-lg transition-all ${activeFilter === f.id ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            )}

            {/* Gamification Floating HUD Overlay (Score, Combo, Evaluations) */}
            {isPlaying && (
              <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none select-none z-10">
                {/* Score badge */}
                <div className="bg-slate-950/80 backdrop-blur border border-slate-800 px-3.5 py-2 rounded-xl text-left shadow-lg">
                  <div className="text-[9px] uppercase tracking-wider font-mono text-slate-500 font-bold leading-none">Score</div>
                  <div className="text-xl font-extrabold font-mono text-white mt-1 leading-none">
                    {score.toLocaleString()}
                  </div>
                </div>

                {/* Combo Badge & Pitch Feedback floating text */}
                <div className="flex flex-col items-center gap-2">
                  {vocalEvaluation && (
                    <div
                      className={`text-sm font-extrabold font-mono px-3 py-1 rounded-full border tracking-widest animate-scale-up ${vocalEvaluation === 'PERFECT' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : vocalEvaluation === 'GOOD' ? 'bg-teal-500/20 text-teal-400 border-teal-500/30' : vocalEvaluation === 'OK' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-slate-800/40 text-slate-400 border-slate-800'}`}
                    >
                      {vocalEvaluation}
                    </div>
                  )}

                  {combo > 2 && (
                    <div className="bg-indigo-600 border border-indigo-500 text-white font-mono font-black text-xs px-3 py-1 rounded-full shadow-lg animate-bounce uppercase">
                      Combo {combo}x
                    </div>
                  )}
                </div>

                {/* Progress Circle or Bar */}
                <div className="bg-slate-950/80 backdrop-blur border border-slate-800 px-3.5 py-2 rounded-xl text-right shadow-lg font-mono">
                  <div className="text-[9px] uppercase tracking-wider text-slate-500 font-bold leading-none">Elapsed</div>
                  <div className="text-sm font-bold text-slate-300 mt-1 leading-none">
                    {Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60)).toString().padStart(2, '0')}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Synchronized Scrolling Lyrics Module */}
          <div className="p-4 bg-slate-900 border-t border-slate-800/80">
            {renderLyrics()}
          </div>
        </div>

        {/* 2. REAL-TIME PITCH SCROLLER VIEW */}
        <PitchVisualizer
          currentTime={currentTime}
          detectedMidi={detectedMidi}
          targetMidi={targetMidi}
          backingNotes={song.backingNotes}
          isActive={isPlaying && !isPaused}
        />
      </div>

      {/* 3. VOCAL CONSOLE & EFFECTS MIXER PANEL */}
      <div className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-5">
              <Settings className="w-4 h-4 text-indigo-400" />
              <h3 className="font-bold text-sm text-slate-200">Stage Control Console</h3>
            </div>

            {/* Check microphone initialization block */}
            {!hasInited && (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 mb-5 text-center">
                {micDenied ? (
                  <div className="space-y-2">
                    <AlertCircle className="w-5 h-5 text-amber-500 mx-auto" />
                    <p className="text-xs text-slate-300 font-semibold leading-relaxed">
                      Microphone Permission Blocked
                    </p>
                    <p className="text-[10px] text-slate-400 leading-normal">
                      This platform requires microphone access to capture and process your vocals. Please enable it in your browser settings and try again.
                    </p>
                    <button
                      onClick={initEngine}
                      className="text-[10px] font-bold uppercase bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-1.5 rounded-lg transition-colors mt-2"
                    >
                      Authorize Mic
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping mx-auto" />
                    <p className="text-[11px] text-slate-400 font-medium">
                      Acquiring browser audio pipeline...
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Mixer Knobs */}
            <div className="space-y-5">
              <h4 className="text-[10px] font-bold font-mono tracking-widest text-slate-500 uppercase">
                Multi-Track Volume Mixing
              </h4>

              {/* Backing track volume */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-medium flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-slate-500" />
                    Backing Music Volume
                  </span>
                  <span className="text-indigo-400 font-mono font-bold">
                    {Math.round(settings.backingVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1.0}
                  step={0.05}
                  value={settings.backingVolume}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, backingVolume: parseFloat(e.target.value) }))
                  }
                  className="w-full accent-indigo-500 h-1 bg-slate-950 rounded-lg cursor-pointer"
                />
              </div>

              {/* Vocal microhpone volume */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-medium flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5 text-slate-500" />
                    Microphone Input Gain
                  </span>
                  <span className="text-indigo-400 font-mono font-bold">
                    {Math.round(settings.vocalVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1.5}
                  step={0.05}
                  value={settings.vocalVolume}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, vocalVolume: parseFloat(e.target.value) }))
                  }
                  className="w-full accent-indigo-500 h-1 bg-slate-950 rounded-lg cursor-pointer"
                />
              </div>

              <h4 className="text-[10px] font-bold font-mono tracking-widest text-slate-500 uppercase pt-2">
                Digital Vocal FX Stems
              </h4>

              {/* Echo Feedback slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-medium">
                    Echo feedback delay
                  </span>
                  <span className="text-indigo-400 font-mono font-bold">
                    {Math.round(settings.echoFeedback * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={0.8}
                  step={0.05}
                  value={settings.echoFeedback}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, echoFeedback: parseFloat(e.target.value) }))
                  }
                  className="w-full accent-indigo-500 h-1 bg-slate-950 rounded-lg cursor-pointer"
                />
              </div>

              {/* Reverb Dry/Wet level slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-medium">
                    Stereo Studio Reverb
                  </span>
                  <span className="text-indigo-400 font-mono font-bold">
                    {Math.round(settings.reverbLevel * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1.0}
                  step={0.05}
                  value={settings.reverbLevel}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, reverbLevel: parseFloat(e.target.value) }))
                  }
                  className="w-full accent-indigo-500 h-1 bg-slate-950 rounded-lg cursor-pointer"
                />
              </div>

              {/* Guide Melody pitch support */}
              <div className="flex items-center justify-between bg-slate-950/40 p-3 rounded-xl border border-slate-800/80 mt-2">
                <div>
                  <span className="block text-xs font-semibold text-slate-200">Lead Melody Guide</span>
                  <span className="block text-[10px] text-slate-500">Play backing MIDI synth guide lines</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={settings.guideMelody}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, guideMelody: e.target.checked }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white" />
                </label>
              </div>
            </div>
          </div>

          {/* Studio Primary Action buttons */}
          <div className="pt-6 border-t border-slate-800 mt-6 space-y-3">
            {isPlaying ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handlePauseToggle}
                  className="w-full py-3 bg-slate-800 border border-slate-700 hover:bg-slate-750 text-slate-200 text-xs font-bold rounded-2xl transition-colors active:scale-95 flex items-center justify-center gap-1.5"
                >
                  {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
                  {isPaused ? 'Resume Session' : 'Pause Session'}
                </button>

                <button
                  onClick={handleStopRecording}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-2xl transition-colors active:scale-95 shadow-lg shadow-rose-600/10 hover:shadow-rose-500/20 flex items-center justify-center gap-1.5"
                >
                  <Square className="w-4 h-4 fill-current" />
                  Stop & Mix Down
                </button>
              </div>
            ) : (
              <button
                onClick={handleStartRecording}
                disabled={!hasInited}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-sm font-bold rounded-2xl transition-colors shadow-lg shadow-indigo-600/20 active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-4 h-4 animate-bounce" />
                Start Recording Session
              </button>
            )}

            <button
              onClick={onCancel}
              disabled={isPlaying}
              className="w-full py-2 bg-slate-950 hover:bg-slate-950/60 text-slate-500 hover:text-slate-400 text-xs font-semibold rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Exit Studio
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
