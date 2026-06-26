/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LeaderboardEntry } from '../types';
import { SONGS } from '../songsData';
import { Award, Trophy, Users, Star, Calendar } from 'lucide-react';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ entries }) => {
  const [selectedSongId, setSelectedSongId] = useState<string>('all');

  // Filter entries based on dropdown selection
  const filteredEntries = selectedSongId === 'all'
    ? entries
    : entries.filter((e) => e.songId === selectedSongId);

  // Sort by score descending
  const sortedEntries = [...filteredEntries].sort((a, b) => b.score - a.score);

  return (
    <div id="leaderboard_container" className="space-y-6">
      {/* Intro Panel */}
      <div id="leaderboard_intro" className="bg-gradient-to-r from-slate-900 to-indigo-950 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500 fill-current" />
            Global Hall of Fame
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            See the highest scoring vocal performances across all tracks on the platform.
          </p>
        </div>

        {/* Dropdown Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-500 font-bold uppercase">Filter:</span>
          <select
            value={selectedSongId}
            onChange={(e) => setSelectedSongId(e.target.value)}
            className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
          >
            <option value="all">All Songs Combined</option>
            {SONGS.map((song) => (
              <option key={song.id} value={song.id}>
                {song.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Leaderboard Table / Cards */}
      <div id="leaderboard_list_container" className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-lg">
        {sortedEntries.length > 0 ? (
          <div className="divide-y divide-slate-800/50">
            {sortedEntries.map((entry, index) => {
              const rank = index + 1;
              
              // Styling for top ranks
              const isPodium = rank <= 3;
              const podiumColors = {
                1: 'bg-amber-500/10 text-amber-400 border-amber-500/20 text-lg font-bold',
                2: 'bg-slate-300/10 text-slate-300 border-slate-300/20 text-base font-bold',
                3: 'bg-amber-700/10 text-amber-600 border-amber-700/20 text-sm font-bold'
              }[rank as 1 | 2 | 3] || 'text-slate-400 text-sm font-mono';

              const medalIcons = {
                1: '🥇',
                2: '🥈',
                3: '🥉'
              }[rank as 1 | 2 | 3];

              return (
                <div
                  key={entry.id}
                  id={`leaderboard_entry_${entry.id}`}
                  className={`flex items-center justify-between p-4 transition-all hover:bg-slate-800/40 ${isPodium ? 'bg-indigo-500/[0.015]' : ''}`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Rank Badge */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border font-mono ${podiumColors}`}>
                      {medalIcons ? medalIcons : rank}
                    </div>

                    {/* Singer Information */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-100 truncate">
                          {entry.username}
                        </span>
                        {rank === 1 && (
                          <span className="text-[9px] uppercase tracking-widest font-mono text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 font-bold">
                            Championship Lead
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5 flex items-center gap-1.5">
                        <span>Song:</span>
                        <span className="text-slate-400 font-sans font-medium">
                          {entry.songTitle}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Score details */}
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-sm font-bold font-mono text-indigo-400">
                        {entry.score.toLocaleString()}
                      </div>
                      <div className="text-[9px] uppercase font-mono tracking-wider text-slate-500 leading-none mt-0.5">
                        SingScore
                      </div>
                    </div>

                    {/* Timestamp display */}
                    <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-slate-500 border-l border-slate-800 pl-4 h-8">
                      <Calendar className="w-3 h-3 text-slate-600" />
                      <span>{entry.timestamp}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 flex flex-col items-center justify-center text-slate-500">
            <Users className="w-10 h-10 mb-2.5 text-slate-600 animate-pulse" />
            <p className="text-sm">No scores submitted yet for this view.</p>
            <p className="text-xs text-slate-600 mt-1">
              Be the first to hit the studio, nail the pitch, and lock down your rank!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
