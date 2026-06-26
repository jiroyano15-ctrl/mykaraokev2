/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Note {
  time: number;       // Start time in seconds
  duration: number;   // Duration in seconds
  midiPitch: number;  // MIDI note number (e.g., 60 = C4)
  syllable: string;   // Syllable/word associated with this note
}

export interface LyricWord {
  time: number;
  duration: number;
  text: string;
  midiPitch?: number;
}

export interface LyricLine {
  time: number;       // Start time of the line in seconds
  duration: number;   // Duration of the line in seconds
  text: string;
  words: LyricWord[];
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  genre: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  bpm: number;
  highScore: number;
  backingNotes: Note[];
  lyrics: LyricLine[];
}

export interface Recording {
  id: string;
  songId: string;
  songTitle: string;
  artist: string;
  singerName: string;
  timestamp: string;
  audioUrl: string;   // Object URL or local storage simulated link
  score: number;
  likes: number;
  ratings: number[];  // Array of 1-5 star ratings
  comments: Comment[];
  description?: string;
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface LeaderboardEntry {
  id: string;
  songId: string;
  songTitle: string;
  username: string;
  score: number;
  timestamp: string;
}

export interface AudioSettings {
  backingVolume: number;
  vocalVolume: number;
  echoFeedback: number;
  reverbLevel: number;
  guideMelody: boolean;
}

export interface RoomMember {
  id: string;
  username: string;
  avatar: string;
  role: 'host' | 'singer' | 'spectator';
  isStreaming?: boolean;
  filter?: 'stage' | 'gold' | 'neon' | 'noir';
}

export interface KtvRoom {
  id: string;
  name: string;
  hostId: string;
  passcode?: string;
  activeSongId: string | null;
  activeSongSingerId: string | null;
  queue: {
    id: string; // unique queue item id
    song: Song;
    queuedBy: string; // member name
    singerId: string; // member id
  }[];
  members: RoomMember[];
  history: {
    songTitle: string;
    artist: string;
    singerName: string;
    score: number;
    timestamp: string;
  }[];
}

export interface ChatMessage {
  id: string;
  roomId: string;
  sender: string;
  text: string;
  timestamp: string;
  type: 'text' | 'system' | 'cheer';
}

export interface YTPlaylistItem {
  id: string; // Unique id for the queue item
  videoId: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  queuedBy: string;
}

export interface SingRoomParty {
  id: string; // 5-character alphanumeric room code
  name: string;
  hostId: string;
  hostName: string;
  isPlaying: boolean;
  activeSong: YTPlaylistItem | null;
  queue: YTPlaylistItem[];
  members: { id: string; name: string; isHost: boolean }[];
  history: YTPlaylistItem[];
}


