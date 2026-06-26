/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect } from 'react';
import { Note } from '../types';

interface PitchVisualizerProps {
  currentTime: number;
  detectedMidi: number;
  targetMidi: number;
  backingNotes: Note[];
  isActive: boolean;
}

export const PitchVisualizer: React.FC<PitchVisualizerProps> = ({
  currentTime,
  detectedMidi,
  targetMidi,
  backingNotes,
  isActive
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const userPitchHistoryRef = useRef<{ time: number; midi: number; isMatch: boolean }[]>([]);
  const sparkParticlesRef = useRef<{ x: number; y: number; vx: number; vy: number; life: number; color: string }[]>([]);

  // Constrain MIDI range to show on screen (typically vocal C3 to C5 is MIDI 48 to 72, expand slightly)
  const MIN_MIDI = 48; // C3
  const MAX_MIDI = 76; // E5
  const MIDI_RANGE = MAX_MIDI - MIN_MIDI;

  useEffect(() => {
    // Reset history when visualizer gets inactive
    if (!isActive) {
      userPitchHistoryRef.current = [];
      sparkParticlesRef.current = [];
    }
  }, [isActive]);

  useEffect(() => {
    if (!isActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    // Viewport dimensions
    const VIEW_DURATION = 4.0; // Show 4 seconds of song at any time
    const HIT_LINE_X_PCT = 0.25; // Hit line is 25% from the left

    // Track user pitch history
    if (detectedMidi > 0) {
      const isMatch = targetMidi > 0 && Math.abs(detectedMidi - targetMidi) <= 1.5;
      userPitchHistoryRef.current.push({
        time: currentTime,
        midi: detectedMidi,
        isMatch
      });

      // Keep history pruned (only keep notes within view duration + some buffer)
      if (userPitchHistoryRef.current.length > 300) {
        userPitchHistoryRef.current.shift();
      }

      // Generate spark particles on perfect pitch match
      if (isMatch) {
        const hitX = canvas.width * HIT_LINE_X_PCT;
        const targetY = canvas.height - ((targetMidi - MIN_MIDI) / MIDI_RANGE) * canvas.height;
        for (let i = 0; i < 2; i++) {
          sparkParticlesRef.current.push({
            x: hitX,
            y: targetY,
            vx: (Math.random() - 0.5) * 4 - 1, // push slightly left-to-right
            vy: (Math.random() - 0.5) * 4,
            life: 1.0,
            color: `hsl(${120 + Math.random() * 30}, 100%, 70%)` // emerald spark
          });
        }
      }
    }

    const render = () => {
      if (!ctx || !canvas) return;

      const width = canvas.width;
      const height = canvas.height;

      // Clear with dark space backdrop
      ctx.fillStyle = '#0f172a'; // slate-900
      ctx.fillRect(0, 0, width, height);

      // Draw subtle horizontal grid lines (MIDI note guides)
      ctx.strokeStyle = '#1e293b'; // slate-800
      ctx.lineWidth = 1;
      for (let i = 1; i < 8; i++) {
        const y = (height / 8) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const getX = (time: number) => {
        // Map time to X position. 
        // CurrentTime is locked at the hit line.
        const timeDelta = time - currentTime;
        return width * HIT_LINE_X_PCT + (timeDelta / VIEW_DURATION) * width;
      };

      const getY = (midi: number) => {
        // Map MIDI number to Y coordinate (inverted so higher notes are at the top)
        const clampedMidi = Math.max(MIN_MIDI, Math.min(MAX_MIDI, midi));
        const pct = (clampedMidi - MIN_MIDI) / MIDI_RANGE;
        return height - pct * height;
      };

      // 1. DRAW UPCOMING TARGET SONGS NOTES
      backingNotes.forEach((note) => {
        const x1 = getX(note.time);
        const x2 = getX(note.time + note.duration);

        // Render if note is inside the viewport boundary
        if (x2 >= 0 && x1 <= width) {
          const y = getY(note.midiPitch);
          const barHeight = 16;

          // Check if current playing note
          const isCurrent = currentTime >= note.time && currentTime <= note.time + note.duration;

          ctx.beginPath();
          // Draw a smooth rounded capsule
          ctx.roundRect(x1, y - barHeight / 2, Math.max(8, x2 - x1), barHeight, 8);
          
          if (isCurrent) {
            // Neon cyan pulsing target
            ctx.fillStyle = 'rgba(6, 182, 212, 0.4)'; // cyan-500
            ctx.strokeStyle = '#22d3ee'; // cyan-400 glowing border
            ctx.lineWidth = 2.5;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#06b6d4';
          } else {
            // Passive slate-colored targets
            ctx.fillStyle = 'rgba(51, 65, 85, 0.3)'; // slate-700
            ctx.strokeStyle = '#475569'; // slate-600
            ctx.lineWidth = 1.5;
            ctx.shadowBlur = 0;
          }
          ctx.fill();
          ctx.stroke();
          ctx.shadowBlur = 0; // reset shadow

          // Render syllable helper text above note capsule
          if (x1 >= 0 && x1 < width - 40) {
            ctx.fillStyle = isCurrent ? '#22d3ee' : '#94a3b8';
            ctx.font = 'bold 10px "JetBrains Mono", monospace';
            ctx.fillText(note.syllable, x1 + 4, y - 12);
          }
        }
      });

      // 2. DRAW THE REAL-TIME HIT TARGET ALIGNER LINE
      const hitX = width * HIT_LINE_X_PCT;
      ctx.strokeStyle = 'rgba(226, 232, 240, 0.2)'; // white transparent
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(hitX, 0);
      ctx.lineTo(hitX, height);
      ctx.stroke();
      ctx.setLineDash([]); // Reset line dash

      // 3. DRAW HISTORIC VOCAL PERFORMANCE TRAIL
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.shadowBlur = 8;

      userPitchHistoryRef.current.forEach((pt, i) => {
        const x = getX(pt.time);
        if (x >= 0 && x <= hitX + 10) {
          const y = getY(pt.midi);
          
          ctx.beginPath();
          ctx.arc(x, y, 2.5, 0, Math.PI * 2);
          
          if (pt.isMatch) {
            ctx.fillStyle = '#34d399'; // matching emerald neon
            ctx.shadowColor = '#10b981';
          } else {
            ctx.fillStyle = '#f87171'; // off-key red neon
            ctx.shadowColor = '#ef4444';
          }
          ctx.fill();
        }
      });
      ctx.shadowBlur = 0; // reset shadow

      // 4. DRAW EXPLODING MATCH SPARK PARTICLES
      sparkParticlesRef.current.forEach((p, index) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.04; // decay life

        if (p.life <= 0) {
          sparkParticlesRef.current.splice(index, 1);
          return;
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2 * p.life, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0; // reset alpha

      // 5. DRAW REAL-TIME HIT POINTER BULLET (The active pointer)
      if (detectedMidi > 0) {
        const targetY = getY(detectedMidi);
        const isMatch = targetMidi > 0 && Math.abs(detectedMidi - targetMidi) <= 1.5;

        ctx.beginPath();
        ctx.arc(hitX, targetY, 8, 0, Math.PI * 2);
        
        if (isMatch) {
          ctx.fillStyle = '#10b981'; // solid match green
          ctx.shadowColor = '#34d399';
          ctx.shadowBlur = 15;
        } else {
          ctx.fillStyle = '#ef4444'; // solid off-key red
          ctx.shadowColor = '#f87171';
          ctx.shadowBlur = 12;
        }
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isActive, currentTime, detectedMidi, targetMidi, backingNotes]);

  return (
    <div id="pitch_visualizer_container" className="relative w-full h-44 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-inner">
      <canvas
        ref={canvasRef}
        width={800}
        height={176}
        className="w-full h-full block"
      />
      
      {/* Decorative Overlays */}
      <div id="pitch_vis_hud" className="absolute top-2 left-3 flex items-center gap-1.5 pointer-events-none select-none">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase">
          Pitch Tracking Scanner
        </span>
      </div>
      
      <div id="pitch_vis_guide" className="absolute bottom-2 right-3 flex items-center gap-4 pointer-events-none select-none font-mono text-[9px] text-slate-500">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded bg-emerald-500" />
          <span>Match</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded bg-red-500" />
          <span>Off-Key</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-1 bg-cyan-500 rounded" />
          <span>Target Notes</span>
        </div>
      </div>
    </div>
  );
};
