/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Recording, Comment } from '../types';
import { Star, Heart, MessageSquare, Play, Pause, Award, Send, Volume2, User } from 'lucide-react';

interface CommunityGalleryProps {
  recordings: Recording[];
  onRate: (id: string, rating: number) => void;
  onLike: (id: string) => void;
  onAddComment: (id: string, author: string, text: string) => void;
}

export const CommunityGallery: React.FC<CommunityGalleryProps> = ({
  recordings,
  onRate,
  onLike,
  onAddComment
}) => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Comments inputs
  const [authorName, setAuthorName] = useState('');
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
  const [expandedCommentsId, setExpandedCommentsId] = useState<string | null>(null);

  const handlePlayPause = (rec: Recording) => {
    if (playingId === rec.id) {
      if (audioRef.current) {
        audioRef.current.pause();
        setPlayingId(null);
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingId(rec.id);
      
      const audio = new Audio(rec.audioUrl);
      audio.volume = 0.9;
      audio.onended = () => setPlayingId(null);
      audioRef.current = audio;
      audio.play().catch(e => {
        console.error("Audio playback error:", e);
        setPlayingId(null);
      });
    }
  };

  const getAverageRating = (ratings: number[]) => {
    if (!ratings || ratings.length === 0) return 0;
    const sum = ratings.reduce((a, b) => a + b, 0);
    return Math.round((sum / ratings.length) * 10) / 10;
  };

  const handleStarClick = (recId: string, starVal: number) => {
    onRate(recId, starVal);
  };

  const handleSubmitComment = (recId: string) => {
    const text = commentTexts[recId] || '';
    if (!text.trim()) return;
    const author = authorName.trim() || 'Anonymous Reviewer';
    
    onAddComment(recId, author, text);
    
    // Reset comment text
    setCommentTexts(prev => ({ ...prev, [recId]: '' }));
  };

  return (
    <div id="community_gallery_container" className="space-y-6">
      <div id="community_intro" className="bg-gradient-to-r from-slate-900 to-indigo-950 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-400 fill-current" />
          Community Cover Feed
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Listen to recent recordings, submit star ratings, leave encouraging comments, and spark a like!
        </p>

        {/* Global reviewer name setting */}
        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-slate-950/40 border border-slate-800/80 p-3 rounded-xl max-w-md">
          <span className="text-xs font-semibold text-slate-400 font-mono">Your Stage Name:</span>
          <input
            type="text"
            placeholder="Reviewer Stage Name"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 w-full sm:w-48"
          />
        </div>
      </div>

      <div id="community_recordings_list" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {recordings.length > 0 ? (
          recordings.map((rec) => {
            const avgRate = getAverageRating(rec.ratings);
            const totalRatings = rec.ratings?.length || 0;
            const commentsList = rec.comments || [];
            const isCommentsExpanded = expandedCommentsId === rec.id;

            return (
              <div
                key={rec.id}
                id={`cover_card_${rec.id}`}
                className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700/80 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Song Title & Header */}
                  <div className="flex items-start justify-between gap-3 border-b border-slate-800/60 pb-3 mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base text-slate-100 leading-snug line-clamp-1">
                        {rec.songTitle}
                      </h3>
                      <p className="text-xs text-slate-400 font-mono mt-0.5 line-clamp-1">
                        Original: {rec.artist}
                      </p>
                    </div>

                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1 bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 font-mono text-[10px] font-bold">
                        <Award className="w-3.5 h-3.5" />
                        <span>{rec.score.toLocaleString()} pts</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono mt-1">
                        {rec.timestamp}
                      </span>
                    </div>
                  </div>

                  {/* Vocalist Singer Badge */}
                  <div className="flex items-center gap-2 mb-3.5 bg-slate-950/40 px-3.5 py-2.5 rounded-xl border border-slate-800/50">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-mono tracking-wider text-indigo-400 font-bold leading-none">
                        Vocalist Cover
                      </div>
                      <div className="text-sm font-semibold text-slate-200 mt-0.5 leading-none">
                        {rec.singerName}
                      </div>
                    </div>
                  </div>

                  {/* Description Box */}
                  <p className="text-xs text-slate-400 bg-slate-950/15 p-2.5 rounded-lg border border-slate-800/30 italic mb-4">
                    "{rec.description}"
                  </p>
                </div>

                {/* Star rating mechanism + playback and stats row */}
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/50 pt-4 mb-4">
                    {/* Audio playback button */}
                    <button
                      onClick={() => handlePlayPause(rec)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-md ${playingId === rec.id ? 'bg-indigo-500 text-white animate-pulse' : 'bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-750'}`}
                    >
                      {playingId === rec.id ? (
                        <>
                          <Pause className="w-4 h-4 fill-current animate-spin" style={{ animationDuration: '3s' }} />
                          Playing Mix
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current" />
                          Listen Cover
                        </>
                      )}
                    </button>

                    {/* Likes & Comments Toggles */}
                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 font-mono">
                      <button
                        onClick={() => onLike(rec.id)}
                        className="flex items-center gap-1 text-slate-400 hover:text-rose-500 transition-colors active:scale-90"
                      >
                        <Heart className="w-4 h-4 fill-current text-rose-500/20 hover:text-rose-500" />
                        <span>{rec.likes}</span>
                      </button>

                      <button
                        onClick={() => setExpandedCommentsId(isCommentsExpanded ? null : rec.id)}
                        className="flex items-center gap-1 hover:text-indigo-400 transition-colors"
                      >
                        <MessageSquare className="w-4 h-4 text-indigo-400/30" />
                        <span>{commentsList.length}</span>
                      </button>
                    </div>
                  </div>

                  {/* Interactive Star Rating Module */}
                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-4 mb-4">
                    <div>
                      <div className="text-[10px] font-mono text-slate-500 font-bold uppercase leading-none">
                        Vocal Star Rating
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-sm font-bold font-mono text-slate-200 leading-none">
                          {avgRate > 0 ? avgRate : 'Unrated'}
                        </span>
                        <div className="flex text-amber-400 leading-none">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star
                              key={idx}
                              className={`w-3.5 h-3.5 ${idx < Math.round(avgRate) ? 'fill-current' : 'opacity-20'}`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 leading-none">
                          ({totalRatings} votes)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-mono text-slate-400 mr-1.5">Rate:</span>
                      {Array.from({ length: 5 }).map((_, idx) => {
                        const val = idx + 1;
                        return (
                          <button
                            key={idx}
                            onClick={() => handleStarClick(rec.id, val)}
                            className="text-slate-600 hover:text-amber-400 hover:scale-125 transition-all p-0.5 active:scale-90 group"
                          >
                            <Star className="w-4 h-4 fill-current text-slate-700 group-hover:text-amber-400 group-hover:opacity-100" />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Comments Expansion Drawer */}
                  {isCommentsExpanded && (
                    <div className="mt-4 border-t border-slate-800/50 pt-4 space-y-3.5 animate-slide-down">
                      <div className="max-h-36 overflow-y-auto space-y-2.5 pr-2">
                        {commentsList.length > 0 ? (
                          commentsList.map((comm) => (
                            <div key={comm.id} className="text-xs bg-slate-950/40 border border-slate-800/40 p-2.5 rounded-xl">
                              <div className="flex items-center justify-between font-mono mb-1">
                                <span className="font-bold text-indigo-400">{comm.author}</span>
                                <span className="text-[9px] text-slate-500">{comm.timestamp}</span>
                              </div>
                              <p className="text-slate-300 leading-relaxed font-sans">
                                {comm.text}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="text-[10px] font-mono text-slate-500 text-center py-2">
                            No reviews posted yet. Be the first!
                          </div>
                        )}
                      </div>

                      {/* Comment Input form */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Write a glowing review..."
                          value={commentTexts[rec.id] || ''}
                          onChange={(e) =>
                            setCommentTexts((prev) => ({ ...prev, [rec.id]: e.target.value }))
                          }
                          onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment(rec.id)}
                          className="flex-1 px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
                        />
                        <button
                          onClick={() => handleSubmitComment(rec.id)}
                          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all flex items-center justify-center active:scale-95"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-800 rounded-3xl bg-slate-900/10">
            <Volume2 className="w-10 h-10 mb-2 text-slate-600 animate-pulse" />
            <p className="text-sm font-semibold">The Community is quiet.</p>
            <p className="text-xs text-slate-600 mt-1 max-w-sm text-center">
              Sing a song, record your cover with effects, and publish it to kickstart the community catalog!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
