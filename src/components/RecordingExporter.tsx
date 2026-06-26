/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Song, Recording } from '../types';
import { Play, Pause, Download, Share2, Save, Sparkles, Check, Send, AlertCircle } from 'lucide-react';

interface RecordingExporterProps {
  song: Song;
  audioUrl: string;
  rawBlob: Blob;
  score: number;
  onSave: (recording: Omit<Recording, 'id' | 'timestamp'>) => void;
  onClose: () => void;
}

export const RecordingExporter: React.FC<RecordingExporterProps> = ({
  song,
  audioUrl,
  rawBlob,
  score,
  onSave,
  onClose
}) => {
  const [singerName, setSingerName] = useState('');
  const [coverTitle, setCoverTitle] = useState(`Cover of ${song.title}`);
  const [description, setDescription] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  
  // Custom audio player state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    // Auto-play when loaded
    if (audioRef.current) {
      audioRef.current.volume = 0.8;
    }
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.error(e));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const seekVal = parseFloat(e.target.value);
      audioRef.current.currentTime = seekVal;
      setCurrentTime(seekVal);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `${singerName || 'KaraokeStar'}_${song.title.replace(/\s+/g, '_')}_Cover.webm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShareToCommunity = () => {
    onSave({
      songId: song.id,
      songTitle: song.title,
      artist: song.artist,
      singerName: singerName.trim() || 'Anonymous Star',
      audioUrl: audioUrl,
      score: score,
      likes: 0,
      ratings: [],
      comments: [],
      description: description.trim() || `Smashed a score of ${score.toLocaleString()} on ${song.title}!`
    });
    setIsSaved(true);
  };

  // Mock social shares
  const [sharingPlatform, setSharingPlatform] = useState<string | null>(null);
  const mockShare = (platform: string) => {
    setSharingPlatform(platform);
    setTimeout(() => {
      setSharingPlatform(null);
      alert(`Successfully exported and published project to ${platform}!`);
    }, 1500);
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div id="exporter_modal_backdrop" className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <audio
        ref={audioRef}
        src={audioUrl}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleAudioEnded}
      />

      <div id="exporter_panel" className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden my-8">
        {/* Abstract graphics */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Header */}
        <div className="relative z-10 flex items-center justify-between border-b border-slate-800/80 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Performance Complete!</h2>
              <p className="text-xs text-slate-400">Let's mix, save, and share your masterpiece</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="text-xs font-mono text-slate-500 hover:text-slate-300 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-xl transition-all"
          >
            Back to Home
          </button>
        </div>

        {/* Scoring Badge Showcase */}
        <div className="bg-gradient-to-r from-indigo-950 to-slate-900 border border-indigo-500/20 rounded-2xl p-4 md:p-5 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold font-mono tracking-wider text-indigo-400 uppercase">
              Official SingScore Rating
            </span>
            <div className="text-3xl font-extrabold font-mono text-white tracking-tight mt-1 flex items-baseline gap-1.5">
              {score.toLocaleString()}
              <span className="text-xs font-medium text-slate-400">points</span>
            </div>
          </div>
          <div className="text-right flex flex-col items-center md:items-end">
            <span className="text-[10px] font-mono text-slate-400">VOCAL PERFORMANCE BADGE</span>
            <span className="text-xs font-bold text-indigo-300 mt-1 px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 uppercase tracking-widest">
              {score >= 9000 ? '⭐ Legendary Vocalist ⭐' : score >= 7000 ? '🎤 Pro SingStar 🎤' : score >= 4000 ? '🎵 Singing Sensation 🎵' : '🎙️ Budding Star 🎙️'}
            </span>
          </div>
        </div>

        {/* Custom Audio Waveform and Playback controls */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 font-mono flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-indigo-500 animate-ping' : 'bg-slate-500'}`} />
              Mixed Master Track
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-500 transition-colors active:scale-95 shadow-lg shadow-indigo-600/20"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>

            {/* Custom simulated waveform bar */}
            <div className="flex-1 flex flex-col gap-1.5">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full accent-indigo-500 h-1 cursor-pointer"
              />
              {/* Retro wave pattern bar */}
              <div className="h-6 flex items-center justify-between gap-[2px] opacity-40">
                {Array.from({ length: 48 }).map((_, idx) => {
                  const currentPct = currentTime / (duration || 1);
                  const barPct = idx / 48;
                  const isActiveBar = currentPct >= barPct;
                  // synthetic pseudo height
                  const height = 15 + Math.sin(idx * 0.4) * 12 + Math.cos(idx * 0.7) * 4;
                  return (
                    <div
                      key={idx}
                      className={`flex-1 rounded-sm transition-all ${isActiveBar ? 'bg-indigo-400' : 'bg-slate-700'}`}
                      style={{ height: `${Math.abs(height)}%` }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Form & Export buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form Side */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 font-mono uppercase mb-1.5">
                Singer Name
              </label>
              <input
                type="text"
                placeholder="Enter your stage name"
                value={singerName}
                onChange={(e) => setSingerName(e.target.value)}
                maxLength={24}
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 font-mono uppercase mb-1.5">
                Cover Track Title
              </label>
              <input
                type="text"
                placeholder="Name your cover"
                value={coverTitle}
                onChange={(e) => setCoverTitle(e.target.value)}
                maxLength={40}
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 font-mono uppercase mb-1.5">
                Vibe Description
              </label>
              <textarea
                rows={2}
                placeholder="Add comments, description, or effects notes"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={120}
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all shadow-inner resize-none"
              />
            </div>
          </div>

          {/* Controls Side */}
          <div className="flex flex-col justify-between gap-4">
            {/* Native Downloads & In-App Sharing */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider">
                Export Options
              </h4>

              <button
                onClick={handleDownload}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-950/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-950 rounded-2xl text-slate-200 font-medium text-xs transition-all active:scale-98 group"
              >
                <span className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-indigo-400 group-hover:-translate-y-0.5 transition-transform" />
                  Download High Quality Mix (WAV)
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  ~{(rawBlob.size / (1024 * 1024)).toFixed(1)} MB
                </span>
              </button>

              <button
                onClick={handleShareToCommunity}
                disabled={isSaved}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-semibold text-xs transition-all duration-300 active:scale-98 border ${isSaved ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 cursor-not-allowed' : 'bg-indigo-600 border-indigo-500 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/10'}`}
              >
                {isSaved ? (
                  <>
                    <Check className="w-4 h-4" />
                    Published to Community Feed!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Publish to Community Feed
                  </>
                )}
              </button>
            </div>

            {/* Simulated external sharing platforms */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider mb-2.5">
                Simulated Cloud Export
              </h4>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { name: 'YouTube', color: 'hover:bg-red-500/10 hover:border-red-500/30 text-red-400' },
                  { name: 'TikTok', color: 'hover:bg-cyan-500/10 hover:border-cyan-500/30 text-cyan-400' },
                  { name: 'Spotify', color: 'hover:bg-emerald-500/10 hover:border-emerald-500/30 text-emerald-400' },
                  { name: 'Instagram', color: 'hover:bg-pink-500/10 hover:border-pink-500/30 text-pink-400' }
                ].map((plat) => (
                  <button
                    key={plat.name}
                    disabled={sharingPlatform !== null}
                    onClick={() => mockShare(plat.name)}
                    className={`flex flex-col items-center justify-center p-2.5 bg-slate-950/40 border border-slate-800 rounded-xl transition-all ${plat.color} active:scale-95 disabled:opacity-50`}
                  >
                    <Share2 className="w-4 h-4 mb-1 opacity-80" />
                    <span className="text-[10px] font-semibold">{plat.name}</span>
                  </button>
                ))}
              </div>
              {sharingPlatform && (
                <div className="flex items-center gap-2 mt-3 text-xs text-indigo-400 animate-pulse justify-center font-mono">
                  <Send className="w-3.5 h-3.5" />
                  <span>Synthesizing master stem and uploading to {sharingPlatform}...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
