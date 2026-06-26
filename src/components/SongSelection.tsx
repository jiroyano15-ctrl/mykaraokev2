/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Song } from '../types';
import { SONGS } from '../songsData';
import { Play, Search, Award, Music, Sparkles, Loader2, CheckCircle2, AlertTriangle, Globe, ArrowRight } from 'lucide-react';

interface SongSelectionProps {
  onSelectSong: (song: Song) => void;
  highScores: Record<string, number>;
  availableSongs: Song[];
  onAddSong: (song: Song) => void;
}

export const SongSelection: React.FC<SongSelectionProps> = ({
  onSelectSong,
  highScores,
  availableSongs,
  onAddSong,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');

  // AI Track Generator States
  const [aiQuery, setAiQuery] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiStage, setAiStage] = useState(0); // 0: idle, 1: searching, 2: analyzing, 3: synthesizing
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSources, setAiSources] = useState<{ title: string; uri: string }[]>([]);
  const [successSong, setSuccessSong] = useState<Song | null>(null);
  const [isFallback, setIsFallback] = useState(false);
  const [fallbackReason, setFallbackReason] = useState<string | null>(null);

  // Auto-progress simulated sub-stages for a beautiful interactive loading experience
  useEffect(() => {
    let interval: any;
    if (isAiLoading) {
      setAiStage(1);
      interval = setInterval(() => {
        setAiStage((prev) => {
          if (prev < 3) return prev + 1;
          return prev;
        });
      }, 3500);
    } else {
      setAiStage(0);
    }
    return () => clearInterval(interval);
  }, [isAiLoading]);

  // Handler: Request full-stack API to fetch song and build track
  const handleFetchSongFromAi = async (e: React.FormEvent) => {
    e.preventDefault();
    const queryStr = aiQuery.trim();
    if (!queryStr) return;

    setIsAiLoading(true);
    setAiError(null);
    setSuccessSong(null);
    setAiSources([]);
    setIsFallback(false);
    setFallbackReason(null);

    try {
      const response = await fetch('/api/ai/fetch-song', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: queryStr }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import song track from the web.');
      }

      if (data.song && data.song.id) {
        onAddSong(data.song);
        setSuccessSong(data.song);
        setAiSources(data.sources || []);
        setIsFallback(!!data.isFallback);
        setFallbackReason(data.fallbackReason || null);
        setAiQuery('');
      } else {
        throw new Error('AI search returned an invalid track structure.');
      }
    } catch (err: any) {
      console.error('[AI Song Fetch Error]', err);
      setAiError(err.message || 'An unexpected error occurred while importing the song.');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Derive unique genres from actual available tracklist
  const genres = ['All', ...Array.from(new Set(availableSongs.map((s) => s.genre.split(' / ')[0])))];
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

  const filteredSongs = availableSongs.filter((song) => {
    const matchesSearch =
      song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGenre =
      selectedGenre === 'All' || song.genre.startsWith(selectedGenre);

    const matchesDiff =
      selectedDifficulty === 'All' || song.difficulty === selectedDifficulty;

    return matchesSearch && matchesGenre && matchesDiff;
  });

  return (
    <div id="song_selection_wrapper" className="space-y-6">
      
      {/* 1. Header Panels Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Standard Library Filters */}
        <div id="song_selection_header" className="lg:col-span-7 bg-gradient-to-br from-slate-900 to-indigo-950 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black font-display tracking-tight text-white flex items-center gap-2">
                  <Music className="w-5 h-5 text-indigo-400" />
                  Vocal Song Library
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Choose from pre-synchronized master tracks or search your custom imported library.
                </p>
              </div>
              <div className="text-[10px] font-mono bg-slate-950/80 border border-slate-800/80 px-3 py-1.5 rounded-xl text-indigo-300 self-start sm:self-auto">
                {filteredSongs.length} Tracks Matching
              </div>
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search title, artist..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
                />
              </div>
              
              <div>
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="w-full px-2 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
                >
                  {genres.map((g) => (
                    <option key={g} value={g} className="bg-slate-950">
                      Genre: {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full px-2 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
                >
                  {difficulties.map((d) => (
                    <option key={d} value={d} className="bg-slate-950">
                      Difficulty: {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Song Search & Import */}
        <div id="ai_song_importer_panel" className="lg:col-span-5 bg-gradient-to-br from-indigo-950/30 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
              <h3 className="text-base font-bold text-white tracking-tight">AI Song Importer</h3>
              <span className="text-[9px] uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded-md font-mono font-bold leading-none">
                Live Search
              </span>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              Search any song. AI will retrieve real-world lyrics via Google Search grounding and auto-synthesize precise timing grids.
            </p>

            {/* AI Generator Input Form */}
            {!isAiLoading && (
              <form onSubmit={handleFetchSongFromAi} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. 'Billie Jean' or 'Hotel California'"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
                />
                <button
                  type="submit"
                  disabled={!aiQuery.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold text-xs rounded-xl transition-all shadow-md active:scale-95 whitespace-nowrap"
                >
                  Create Track
                </button>
              </form>
            )}

            {/* AI Loading State */}
            {isAiLoading && (
              <div className="space-y-3 py-1">
                <div className="flex items-center gap-2.5">
                  <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                  <span className="text-[11px] font-mono font-bold text-indigo-300 uppercase tracking-wider">
                    {aiStage === 1 && "Stage 1: Grounded Web Search..."}
                    {aiStage === 2 && "Stage 2: Aligning Timelines..."}
                    {aiStage === 3 && "Stage 3: Structuring Notes..."}
                  </span>
                </div>
                
                {/* Custom Timed Stepper */}
                <div className="space-y-1 text-[10px] font-mono text-slate-400">
                  <div className={`flex items-center gap-1.5 ${aiStage >= 1 ? 'text-indigo-300' : 'text-slate-600'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${aiStage >= 1 ? 'bg-indigo-400' : 'bg-slate-700'}`} />
                    <span>Searching web lyrics & metadata</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${aiStage >= 2 ? 'text-indigo-300' : 'text-slate-600'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${aiStage >= 2 ? 'bg-indigo-400' : 'bg-slate-700'}`} />
                    <span>Auto-aligning syllable timeline markers</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${aiStage >= 3 ? 'text-indigo-300' : 'text-slate-600'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${aiStage >= 3 ? 'bg-indigo-400' : 'bg-slate-700'}`} />
                    <span>Generating structured pitch intervals</span>
                  </div>
                </div>

                {/* Simulated progress bar */}
                <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 transition-all duration-[3500ms] ease-out rounded-full"
                    style={{ width: `${(aiStage / 3) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Error Message Box */}
            {aiError && (
              <div className="flex items-start gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p className="text-xs text-rose-300 leading-relaxed font-mono">
                  {aiError}
                </p>
              </div>
            )}

            {/* Success Import Notification */}
            {successSong && (
              <div className="space-y-3">
                <div className={`flex items-start gap-2.5 p-2.5 rounded-xl border ${isFallback ? 'bg-amber-500/10 border-amber-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                  {isFallback ? (
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  <div className="text-xs">
                    <span className={`font-bold ${isFallback ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {isFallback ? "Procedurally Generated!" : "Imported Successfully!"}
                    </span>
                    <p className="text-slate-300 mt-0.5 leading-relaxed">
                      "{successSong.title}" is ready in your library.
                    </p>
                    {isFallback && (
                      <p className="text-[10px] text-amber-300/80 mt-1.5 leading-relaxed font-mono">
                        Notice: {fallbackReason || "Gemini API quota is currently full on your Cloud account. We utilized our offline high-fidelity timeline generator so you can perform immediately!"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectSong(successSong)}
                    className={`flex items-center gap-1 px-3 py-1.5 font-semibold text-xs rounded-lg transition-all active:scale-95 ${isFallback ? 'bg-amber-600 hover:bg-amber-500 text-slate-950' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}
                  >
                    Sing Now
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  {/* Sources Grounding List */}
                  {aiSources.length > 0 && (
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                      <Globe className="w-3 h-3 text-slate-400" />
                      <span className="truncate max-w-[120px] md:max-w-[160px]">
                        Sources:{" "}
                        {aiSources.slice(0, 3).map((src, idx) => (
                          <a 
                            key={idx}
                            href={src.uri} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-indigo-400 hover:underline inline mx-0.5"
                          >
                            [{idx + 1}]
                          </a>
                        ))}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Song Grid List */}
      <div id="songs_grid_viewport" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSongs.length > 0 ? (
          filteredSongs.map((song) => {
            const score = highScores[song.id] || 0;
            const diffColors = {
              Easy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
              Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
              Hard: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }[song.difficulty];

            return (
              <div
                key={song.id}
                id={`song_card_${song.id}`}
                className="group relative bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 hover:bg-slate-800/60 transition-all duration-300 shadow-md flex flex-col justify-between"
              >
                {/* Decorative Glowing Corner */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className={`text-[10px] font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-full border ${diffColors}`}>
                      {song.difficulty}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      BPM: {song.bpm}
                    </span>
                  </div>

                  <h3 className="font-semibold text-base text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-1">
                    {song.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                    {song.artist}
                  </p>

                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    <span className="text-[10px] bg-slate-950 text-slate-400 border border-slate-800/80 px-2 py-0.5 rounded-md">
                      {song.genre}
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Award className={`w-4 h-4 ${score > 0 ? 'text-amber-500' : 'text-slate-600'}`} />
                    <div>
                      <div className="text-[9px] uppercase tracking-wider font-mono text-slate-500 leading-none">
                        Personal Best
                      </div>
                      <div className="text-xs font-mono font-bold text-slate-300 mt-0.5">
                        {score > 0 ? `${score.toLocaleString()} pts` : 'No Record'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectSong(song)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 text-white font-medium text-xs rounded-xl hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/10 hover:shadow-indigo-500/20 active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Sing
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
            <Music className="w-8 h-8 mb-2.5 text-slate-600" />
            <p className="text-sm">No songs match your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};
