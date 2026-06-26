/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Enable JSON body parsing for incoming requests
app.use(express.json());

// --- KTV Rooms State Management ---
interface RoomMember {
  id: string;
  username: string;
  avatar: string;
  role: 'host' | 'singer' | 'spectator';
  isStreaming?: boolean;
  filter?: 'stage' | 'gold' | 'neon' | 'noir';
}

interface KtvRoom {
  id: string;
  name: string;
  hostId: string;
  passcode?: string;
  activeSongId: string | null;
  activeSongSingerId: string | null;
  queue: {
    id: string;
    song: any;
    queuedBy: string;
    singerId: string;
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

const rooms: Record<string, KtvRoom> = {
  "VIP-CHILL": {
    id: "VIP-CHILL",
    name: "🎤 VIP Penthouse Lounge",
    hostId: "system",
    activeSongId: null,
    activeSongSingerId: null,
    queue: [],
    members: [],
    history: [
      { songTitle: "Billie Jean", artist: "Michael Jackson", singerName: "KingOfPop99", score: 9450, timestamp: "Just now" },
      { songTitle: "Yesterday", artist: "The Beatles", singerName: "GuitarHero", score: 8700, timestamp: "5 mins ago" }
    ]
  },
  "ROCK-STAGE": {
    id: "ROCK-STAGE",
    name: "⚡ Neon Rock Arena",
    hostId: "system",
    activeSongId: null,
    activeSongSingerId: null,
    queue: [],
    members: [],
    history: [
      { songTitle: "Hotel California", artist: "Eagles", singerName: "CaliforniaSun", score: 9150, timestamp: "10 mins ago" }
    ]
  }
};


// --- SingRoom KTV Party State Management ---
interface YTPlaylistItem {
  id: string;
  videoId: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  queuedBy: string;
}

interface SingRoomParty {
  id: string;
  name: string;
  hostId: string;
  hostName: string;
  isPlaying: boolean;
  activeSong: YTPlaylistItem | null;
  queue: YTPlaylistItem[];
  members: { id: string; name: string; isHost: boolean }[];
  history: YTPlaylistItem[];
}

const partyRooms: Record<string, SingRoomParty> = {};

function generateRoomCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Scrape or call YouTube API to get live karaoke search results
async function searchYoutube(query: string, apiKey?: string) {
  if (apiKey) {
    try {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=15&key=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.items) {
        return data.items.map((item: any) => ({
          videoId: item.id.videoId,
          title: item.snippet?.title || "Unknown Title",
          thumbnail: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url || "",
          channelTitle: item.snippet?.channelTitle || "Unknown Channel",
          description: item.snippet?.description || ""
        }));
      }
    } catch (e) {
      console.error("Error fetching from official YouTube API, falling back to scraper:", e);
    }
  }

  // Fallback: Scrape YouTube's results page for actual live videos!
  try {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9"
      }
    });
    const html = await response.text();
    const match = html.match(/ytInitialData\s*=\s*({.+?});/);
    if (match) {
      const json = JSON.parse(match[1]);
      const contents = json.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents;
      if (contents && Array.isArray(contents)) {
        const results = [];
        for (const item of contents) {
          const video = item.videoRenderer;
          if (video && video.videoId) {
            results.push({
              videoId: video.videoId,
              title: video.title?.runs?.[0]?.text || "Unknown Title",
              thumbnail: video.thumbnail?.thumbnails?.[0]?.url || "",
              channelTitle: video.ownerText?.runs?.[0]?.text || "Unknown Channel",
              description: video.detailedMetadataSnippets?.[0]?.snippetText?.runs?.[0]?.text || ""
            });
            if (results.length >= 15) break;
          }
        }
        if (results.length > 0) return results;
      }
    }
  } catch (e) {
    console.error("Scraping fallback failed:", e);
  }

  // Ultimate static fallback with beautiful preset karaoke options in case of internet error
  return [
    {
      videoId: "L0MK7qz13bU",
      title: "Bohemian Rhapsody - Queen (Karaoke Version)",
      thumbnail: "https://i.ytimg.com/vi/L0MK7qz13bU/mqdefault.jpg",
      channelTitle: "Sing King",
      description: "Sing along to Bohemian Rhapsody by Queen."
    },
    {
      videoId: "Fas4N_7_g48",
      title: "Don't Stop Believin' - Journey (Karaoke Version)",
      thumbnail: "https://i.ytimg.com/vi/Fas4N_7_g48/mqdefault.jpg",
      channelTitle: "Sing King",
      description: "Sing along to Don't Stop Believin' by Journey."
    },
    {
      videoId: "S9GvF6U_Ew0",
      title: "I Want It That Way - Backstreet Boys (Karaoke)",
      thumbnail: "https://i.ytimg.com/vi/S9GvF6U_Ew0/mqdefault.jpg",
      channelTitle: "Karaoke Academy",
      description: "Sing I Want It That Way karaoke."
    }
  ];
}


// Lazy-initialized Gemini AI client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please set it in the Secrets panel under Settings.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// ----------------- API ROUTES -----------------

// API Endpoint to get all active KTV party rooms
app.get("/api/rooms", (req, res) => {
  res.json(Object.values(rooms));
});

// SingRoom KTV REST Endpoints
app.post("/api/party-rooms/create", (req, res) => {
  const { name, hostName } = req.body;
  if (!name || typeof name !== "string" || !name.trim() || !hostName || typeof hostName !== "string" || !hostName.trim()) {
    return res.status(400).json({ error: "Room name and Host nickname are required." });
  }

  let code = generateRoomCode();
  let attempts = 0;
  while (partyRooms[code] && attempts < 100) {
    code = generateRoomCode();
    attempts++;
  }

  const newRoom: SingRoomParty = {
    id: code,
    name: name.trim().substring(0, 30),
    hostId: "", // will be assigned upon host connection
    hostName: hostName.trim().substring(0, 20),
    isPlaying: false,
    activeSong: null,
    queue: [],
    members: [],
    history: []
  };

  partyRooms[code] = newRoom;
  console.log(`[SingRoom Party Room Created] Room ${name} created with 5-char code: ${code}`);
  res.status(201).json(newRoom);
});

app.post("/api/party-rooms/join", (req, res) => {
  const { code, name } = req.body;
  if (!code || typeof code !== "string" || !code.trim() || !name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "Alphanumeric room code and participant nickname are required." });
  }

  const cleanCode = code.toUpperCase().trim();
  const room = partyRooms[cleanCode];
  if (!room) {
    return res.status(404).json({ error: "We couldn't find a SingRoom with that 5-digit code. Please verify and try again!" });
  }

  res.json(room);
});

app.get("/api/youtube/suggest", async (req, res) => {
  const query = req.query.q as string;
  if (!query || typeof query !== "string" || !query.trim()) {
    return res.json([]);
  }

  try {
    const url = `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(query.trim())}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      }
    });
    const data = await response.json();
    if (Array.isArray(data) && data[1]) {
      return res.json(data[1]);
    }
    res.json([]);
  } catch (error) {
    console.error("YouTube suggestions proxy error:", error);
    res.json([]);
  }
});

app.get("/api/youtube/search", async (req, res) => {
  let query = req.query.q as string;
  if (!query || typeof query !== "string" || !query.trim()) {
    return res.status(400).json({ error: "Search query is required." });
  }

  query = query.trim();
  if (!query.toLowerCase().includes("karaoke")) {
    query = `${query} karaoke`;
  }

  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    const results = await searchYoutube(query, apiKey);
    res.json(results);
  } catch (error: any) {
    console.error("YouTube search error:", error);
    res.status(500).json({ error: "Failed to fetch search results: " + error.message });
  }
});


// API Endpoint to create a custom KTV party room
app.post("/api/rooms/create", (req, res) => {
  const { name, passcode } = req.body;
  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "Please enter a valid room name." });
  }

  const cleanName = name.trim();
  const roomCode = "KTV-" + Math.floor(1000 + Math.random() * 9000);
  
  const newRoom: KtvRoom = {
    id: roomCode,
    name: cleanName,
    hostId: "system", // will be assigned to the first joining user
    passcode: passcode || undefined,
    activeSongId: null,
    activeSongSingerId: null,
    queue: [],
    members: [],
    history: []
  };

  rooms[roomCode] = newRoom;
  console.log(`[Room Created] ${cleanName} created with code: ${roomCode}`);
  res.status(201).json(newRoom);
});

// API Endpoint to fetch, ground and generate structured Song data
app.post("/api/ai/fetch-song", async (req, res) => {
  const { query } = req.body;
  if (!query || typeof query !== "string" || !query.trim()) {
    return res.status(400).json({ error: "Please enter a valid song title or search query." });
  }

  try {
    const ai = getGeminiClient();

    console.log(`[AI Search] Grounding and searching for song lyrics and details: "${query}"`);
    
    // Step 1: Query Gemini 3.5 Flash with Search Grounding to fetch the lyrics, rhythm and details
    const searchResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Search the web for the accurate lyrics, artist name, and tempo (BPM) of the song: "${query}". Retrieve the full lyrics, original artist, typical BPM (tempo), genre, and general melodic lines. Provide a summary of the song structure including the verses and choruses with text.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const lyricsDataText = searchResponse.text;
    console.log("[AI Search] Search results retrieved successfully.");

    // Extract grounding source URLs
    const chunks = searchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources = chunks
      ? chunks
          .map((chunk: any) => ({
            title: chunk.web?.title || "Web Search Result",
            uri: chunk.web?.uri || "",
          }))
          .filter((src: any) => src.uri)
      : [];

    console.log(`[AI Search] Extracted ${sources.length} sources from web search.`);

    // Step 2: Convert retrieved text details into high-fidelity structured karaoke song JSON format
    console.log("[AI Synth] Generating structured, synchronized song JSON...");
    
    const structureResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `You are a high-fidelity karaoke audio engineer.
Based on the lyrics and song data retrieved for the song below, generate a fully synchronized Karaoke Song object in JSON.

Here are the retrieved song lyrics and details:
${lyricsDataText}

You MUST follow these strict mapping rules to generate a valid, realistic, high-fidelity karaoke song:
1. Create an ID for the song based on the title (lowercase, alphanumeric, e.g., 'billiejean').
2. Identify the original artist, genre, and typical BPM (default to 100 if unknown). Assess difficulty as 'Easy', 'Medium', or 'Hard' based on vocal complexity.
3. Generate a highly detailed 'backingNotes' array. Backing notes represent individual sung syllables with exact 'time' (start time in seconds), 'duration' (seconds), 'midiPitch' (standard midi note between 55 and 76 matching the melody contour), and 'syllable'.
   - Notes MUST start around 2.0 or 3.0 seconds (intro delay).
   - Space notes realistically over time. Do not cluster them.
   - Syllables should form continuous words and lines (e.g. 'Twin-' and 'kle ').
   - The timing should match the lines in the 'lyrics' array exactly.
4. Generate a highly detailed 'lyrics' array representing each line of the song.
   - Each 'LyricLine' has a 'time' (start time in seconds, which must match the first backingNote of that line), 'duration' (total line length), 'text' (the full line string, e.g. "Twinkle twinkle little star"), and 'words' (a list of LyricWord elements, split correctly, with their start 'time', 'duration', and 'midiPitch').
   - Make sure all timestamps are monotonically increasing.
   - Provide at least 3-4 full sections (e.g. Verse 1, Chorus, Verse 2, Chorus) so the song has some depth (aim for 20-40 seconds or more of gameplay).
   - Ensure 'highScore' is initialized to 0.

Generate only valid JSON conforming to the requested schema. Do not truncate the JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            artist: { type: Type.STRING },
            genre: { type: Type.STRING },
            difficulty: { type: Type.STRING, description: "Must be 'Easy', 'Medium', or 'Hard'" },
            bpm: { type: Type.INTEGER },
            backingNotes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  time: { type: Type.NUMBER, description: "Start time of syllable in seconds (monotonically increasing)" },
                  duration: { type: Type.NUMBER, description: "Duration in seconds" },
                  midiPitch: { type: Type.INTEGER, description: "MIDI pitch of syllable (55 to 76)" },
                  syllable: { type: Type.STRING, description: "The syllable or word fragment sung" },
                },
                required: ["time", "duration", "midiPitch", "syllable"],
              },
            },
            lyrics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  time: { type: Type.NUMBER, description: "Start time of phrase in seconds" },
                  duration: { type: Type.NUMBER, description: "Duration of phrase in seconds" },
                  text: { type: Type.STRING, description: "Full line lyric text" },
                  words: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        time: { type: Type.NUMBER, description: "Start time of word in seconds" },
                        duration: { type: Type.NUMBER, description: "Duration of word in seconds" },
                        text: { type: Type.STRING, description: "Word text" },
                        midiPitch: { type: Type.INTEGER },
                      },
                      required: ["time", "duration", "text"],
                    },
                  },
                },
                required: ["time", "duration", "text", "words"],
              },
            },
          },
          required: ["id", "title", "artist", "genre", "difficulty", "bpm", "backingNotes", "lyrics"],
        },
      },
    });

    const songJsonString = structureResponse.text;
    if (!songJsonString) {
      throw new Error("Could not parse song structure from Gemini response.");
    }

    const song = JSON.parse(songJsonString);
    song.highScore = 0; // Initialize high score

    console.log(`[AI Synth] Successfully parsed song: "${song.title}" by ${song.artist}`);

    return res.json({ song, sources });
  } catch (error: any) {
    // Graceful degradation: Log a clean warning instead of dumping a stack trace to console.error
    const isQuotaExceeded = error?.message?.includes("429") || error?.status === "RESOURCE_EXHAUSTED";
    if (isQuotaExceeded) {
      console.warn(`[AI Search Warning] Gemini API quota is fully exhausted (429). Activating high-fidelity offline procedural song generator for query: "${query}"`);
    } else {
      console.warn(`[AI Search Warning] Gemini API encountered an issue (${error?.message || "Internal Error"}). Falling back to procedural synthesizer.`);
    }
    
    try {
      // Create high-fidelity procedural track immediately
      const fallbackSong = generateProceduralSong(query);
      console.log(`[AI Fallback] Successfully synthesized procedural song for "${fallbackSong.title}"`);
      
      return res.json({ 
        song: fallbackSong, 
        sources: [
          {
            title: "Local High-Fidelity Procedural Audio Synthesizer (Active Fallback)",
            uri: "https://ai.google.dev/gemini-api/docs/rate-limits"
          }
        ],
        isFallback: true,
        fallbackReason: isQuotaExceeded 
          ? "The Gemini API quota is currently full on your account (429 Resource Exhausted). We activated our offline high-fidelity timeline generator so you can perform right away!"
          : "The Gemini API is currently offline. We activated our offline high-fidelity timeline generator so you can perform right away!"
      });
    } catch (fallbackErr: any) {
      return res.status(500).json({
        error: "Failed to generate track both via Gemini and via our procedural synthesizer: " + fallbackErr.message
      });
    }
  }
});

/**
 * Procedural High-Fidelity Karaoke Song Generator
 * Safely runs offline or when API quota is exhausted, providing timed notes, lyrics, and melodic pitch contours.
 */
function generateProceduralSong(query: string): any {
  let title = query.trim();
  let artist = "Universal Karaoke Legend";
  
  // Try to parse "Title by Artist"
  if (title.toLowerCase().includes(" by ")) {
    const parts = title.split(/\s+by\s+/i);
    if (parts.length >= 2) {
      title = parts[0].trim();
      artist = parts[1].trim();
    }
  }
  
  // Format casing beautifully
  title = title.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
  artist = artist.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
  
  const norm = title.toLowerCase();
  let genre = "Pop / Synth Classic";
  let difficulty = "Medium";
  let bpm = 110;
  let phrases: string[] = [];

  if (norm.includes("billie jean")) {
    artist = "Michael Jackson";
    genre = "Pop / Dance";
    difficulty = "Hard";
    bpm = 117;
    phrases = [
      "She was more like a beauty queen from a movie scene",
      "I said don't mind but what do you mean I am the one",
      "Who will dance on the floor in the round",
      "People always told me be careful of what you do",
      "And don't go around breaking young girls' hearts",
      "Billie Jean is not my lover she's just a girl",
      "Who claims that I am the one but the kid is not my son"
    ];
  } else if (norm.includes("yesterday")) {
    artist = "The Beatles";
    genre = "Classic Rock / Pop";
    difficulty = "Easy";
    bpm = 96;
    phrases = [
      "Yesterday all my troubles seemed so far away",
      "Now it looks as though they're here to stay",
      "Oh I believe in yesterday",
      "Suddenly I'm not half the man I used to be",
      "There's a shadow hanging over me",
      "Oh yesterday came suddenly"
    ];
  } else if (norm.includes("hotel california")) {
    artist = "Eagles";
    genre = "Classic Rock";
    difficulty = "Medium";
    bpm = 74;
    phrases = [
      "On a dark desert highway cool wind in my hair",
      "Warm smell of colitas rising up through the air",
      "Up ahead in the distance I saw a shimmering light",
      "My head grew heavy and my sight grew dim",
      "I had to stop for the night",
      "Welcome to the Hotel California such a lovely place",
      "Plenty of room at the Hotel California any time of year"
    ];
  } else if (norm.includes("bohemian rhapsody")) {
    artist = "Queen";
    genre = "Classic Rock / Opera";
    difficulty = "Hard";
    bpm = 72;
    phrases = [
      "Is this the real life is this just fantasy",
      "Caught in a landslide no escape from reality",
      "Open your eyes look up to the skies and see",
      "I'm just a poor boy I need no sympathy",
      "Because I'm easy come easy go little high little low"
    ];
  } else {
    // Elegant procedural song generator
    phrases = [
      `Oh we are singing ${title} tonight`,
      `Feel the music hold the microphone so tight`,
      `Let the beautiful melody lift you high above`,
      `Perform ${title} with ultimate joy and love`,
      `You are the absolute star of the stage today`,
      `So hit every note and let the rhythm lead the way`
    ];
  }

  const backingNotes: any[] = [];
  const lyrics: any[] = [];
  
  // Melodic contour mapping matching typical comfortable singing notes
  const pitchContour = [60, 62, 64, 65, 67, 69, 67, 65, 64, 62];

  phrases.forEach((phraseText, lineIdx) => {
    const lineStartTime = 4.0 + lineIdx * 8.0; // 4s, 12s, 20s, 28s, 36s...
    const wordsInPhrase = phraseText.split(" ");
    const lineDuration = wordsInPhrase.length * 0.8;
    
    const wordObjects: any[] = [];
    
    wordsInPhrase.forEach((wordText, wordIdx) => {
      const wordStartTime = lineStartTime + wordIdx * 0.8;
      const wordDuration = 0.5;
      const midiPitch = pitchContour[wordIdx % pitchContour.length];
      
      wordObjects.push({
        time: Number(wordStartTime.toFixed(2)),
        duration: wordDuration,
        text: wordText + " ",
        midiPitch
      });
      
      backingNotes.push({
        time: Number(wordStartTime.toFixed(2)),
        duration: wordDuration,
        midiPitch,
        syllable: wordText
      });
    });

    lyrics.push({
      time: Number(lineStartTime.toFixed(2)),
      duration: Number(lineDuration.toFixed(2)),
      text: phraseText,
      words: wordObjects
    });
  });

  const id = "proc_" + title.toLowerCase().replace(/[^a-z0-9]/g, "") + "_" + Math.floor(Math.random() * 1000);

  return {
    id,
    title,
    artist,
    genre,
    difficulty,
    bpm,
    backingNotes,
    lyrics,
    highScore: 0
  };
}

// --- WebSocket Live Room Sync Engine ---
const activeConnections = new Map<WebSocket, { roomId: string; memberId: string }>();

wss.on("connection", (ws: WebSocket) => {
  console.log("[WS Connection] A client connected.");

  ws.on("message", (rawMessage: string) => {
    try {
      const data = JSON.parse(rawMessage);
      const { type, roomId } = data;

      switch (type) {
        case "join-room": {
          const { username, avatar, memberId } = data;
          if (!roomId || !username) return;

          // Check if room exists. If not, auto-create it!
          if (!rooms[roomId]) {
            rooms[roomId] = {
              id: roomId,
              name: `🎶 ${username}'s Karaoke Room`,
              hostId: memberId,
              activeSongId: null,
              activeSongSingerId: null,
              queue: [],
              members: [],
              history: []
            };
          }

          const room = rooms[roomId];

          // Check if user is already in the room
          let member = room.members.find(m => m.id === memberId);
          if (!member) {
            const isFirst = room.members.length === 0;
            const role = isFirst || room.hostId === "system" || room.hostId === memberId ? "host" : "spectator";
            if (isFirst) {
              room.hostId = memberId;
            }

            member = {
              id: memberId,
              username,
              avatar: avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
              role,
              isStreaming: false,
              filter: "stage"
            };
            room.members.push(member);
          }

          // Track this connection
          activeConnections.set(ws, { roomId, memberId });

          // Broadcast system message to everyone in room
          broadcastToRoom(roomId, {
            type: "room-updated",
            room
          });

          broadcastToRoom(roomId, {
            type: "chat-message",
            message: {
              id: "sys_" + Date.now() + "_" + Math.floor(Math.random()*1000),
              roomId,
              sender: "System",
              text: `🎉 ${username} entered the karaoke room! Welcome!`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              type: "system"
            }
          });
          break;
        }

        case "send-message": {
          const { sender, text, image } = data;
          if (!roomId || !sender || (!text && !image)) return;

          broadcastToRoom(roomId, {
            type: "chat-message",
            message: {
              id: "msg_" + Date.now() + "_" + Math.floor(Math.random()*1000),
              roomId,
              sender,
              text: text || "",
              image: image || null,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              type: image ? "image" : "text"
            }
          });
          break;
        }

        case "queue-song": {
          const { song, queuedBy, singerId } = data;
          if (!roomId || !song) return;

          const room = rooms[roomId];
          if (!room) return;

          const queueItem = {
            id: "q_" + Date.now() + "_" + Math.floor(Math.random()*1000),
            song,
            queuedBy,
            singerId
          };

          room.queue.push(queueItem);

          // If there is no active song, auto-start this song immediately
          if (!room.activeSongId) {
            room.activeSongId = song.id;
            room.activeSongSingerId = singerId;

            // Make the singer role "singer" temporarily
            const currentSinger = room.members.find(m => m.id === singerId);
            if (currentSinger) {
              currentSinger.role = "singer";
            }
          }

          broadcastToRoom(roomId, {
            type: "room-updated",
            room
          });

          broadcastToRoom(roomId, {
            type: "chat-message",
            message: {
              id: "sys_" + Date.now(),
              roomId,
              sender: "System",
              text: `🎵 ${queuedBy} queued "${song.title}" by ${song.artist}!`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              type: "cheer"
            }
          });
          break;
        }

        case "remove-queued-song": {
          const { queueItemId } = data;
          if (!roomId || !queueItemId) return;

          const room = rooms[roomId];
          if (!room) return;

          room.queue = room.queue.filter(item => item.id !== queueItemId);
          broadcastToRoom(roomId, {
            type: "room-updated",
            room
          });
          break;
        }

        case "next-song": {
          const room = rooms[roomId];
          if (!room) return;

          // Remove the top song from queue (the one that just finished or skipped)
          if (room.queue.length > 0) {
            room.queue.shift();
          }

          // Reset singer roles to spectator
          room.members.forEach(m => {
            if (m.role === "singer") m.role = "spectator";
            // Host remains host
            if (m.id === room.hostId) m.role = "host";
          });

          // Set next song if available
          if (room.queue.length > 0) {
            const nextItem = room.queue[0];
            room.activeSongId = nextItem.song.id;
            room.activeSongSingerId = nextItem.singerId;

            const nextSinger = room.members.find(m => m.id === nextItem.singerId);
            if (nextSinger) {
              nextSinger.role = "singer";
            }
          } else {
            room.activeSongId = null;
            room.activeSongSingerId = null;
          }

          broadcastToRoom(roomId, {
            type: "room-updated",
            room
          });
          break;
        }

        case "send-reaction": {
          const { emoji, sender } = data;
          if (!roomId) return;

          broadcastToRoom(roomId, {
            type: "reaction-received",
            emoji,
            sender
          });
          break;
        }

        case "play-sound-effect": {
          const { effectName, sender } = data;
          if (!roomId) return;

          broadcastToRoom(roomId, {
            type: "sound-effect-received",
            effectName,
            sender
          });
          break;
        }

        case "update-singer-stream": {
          const { isStreaming, filter, memberId } = data;
          if (!roomId || !memberId) return;

          const room = rooms[roomId];
          if (!room) return;

          const member = room.members.find(m => m.id === memberId);
          if (member) {
            member.isStreaming = isStreaming;
            if (filter) member.filter = filter;
          }

          broadcastToRoom(roomId, {
            type: "room-updated",
            room
          });
          break;
        }

        case "vocal-performance-update": {
          const { score, combo, activeLyricIndex, currentTime, isPlaying } = data;
          if (!roomId) return;

          // Broadcast performance stats directly to spectators so their lyrics highlight and screen updates
          broadcastToRoom(roomId, {
            type: "vocal-performance-updated",
            score,
            combo,
            activeLyricIndex,
            currentTime,
            isPlaying
          }, ws); // skip the sender
          break;
        }

        case "submit-performance-score": {
          const { songTitle, artist, singerName, score } = data;
          if (!roomId) return;

          const room = rooms[roomId];
          if (!room) return;

          room.history.unshift({
            songTitle,
            artist,
            singerName,
            score,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });

          // Limit history to 10
          if (room.history.length > 10) room.history.pop();

          broadcastToRoom(roomId, {
            type: "room-updated",
            room
          });
          break;
        }

        // --- SingRoom KTV Party Room Event Handlers ---
        case "party-join": {
          const { name, isHost, userId } = data;
          if (!roomId || !name || !userId) return;

          if (!partyRooms[roomId]) {
            partyRooms[roomId] = {
              id: roomId,
              name: `🎶 ${name}'s SingRoom`,
              hostId: userId,
              hostName: name,
              isPlaying: false,
              activeSong: null,
              queue: [],
              members: [],
              history: []
            };
          }

          const room = partyRooms[roomId];
          
          if (isHost && !room.hostId) {
            room.hostId = userId;
            room.hostName = name;
          }

          let member = room.members.find(m => m.id === userId);
          if (!member) {
            member = { id: userId, name: name.trim(), isHost: room.hostId === userId || isHost };
            room.members.push(member);
          } else {
            member.isHost = room.hostId === userId || isHost;
          }

          activeConnections.set(ws, { roomId, memberId: userId });
          console.log(`[WS party-join] User ${name} joined party room ${roomId}. Host? ${member.isHost}`);

          broadcastToRoom(roomId, {
            type: "party-updated",
            room
          });
          break;
        }

        case "party-add-song": {
          const { song, queuedBy } = data;
          if (!roomId || !song) return;

          const room = partyRooms[roomId];
          if (!room) return;

          const playlistItem: YTPlaylistItem = {
            id: "item_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
            videoId: song.videoId,
            title: song.title,
            thumbnail: song.thumbnail,
            channelTitle: song.channelTitle,
            queuedBy
          };

          if (!room.activeSong) {
            room.activeSong = playlistItem;
            room.isPlaying = true;
          } else {
            room.queue.push(playlistItem);
          }

          console.log(`[WS party-add-song] Room ${roomId}: ${queuedBy} added "${song.title}"`);

          broadcastToRoom(roomId, {
            type: "party-updated",
            room
          });
          break;
        }

        case "party-remove-song": {
          const { itemId } = data;
          if (!roomId || !itemId) return;

          const room = partyRooms[roomId];
          if (!room) return;

          if (room.activeSong && room.activeSong.id === itemId) {
            if (room.queue.length > 0) {
              room.activeSong = room.queue.shift() || null;
              room.isPlaying = true;
            } else {
              room.activeSong = null;
              room.isPlaying = false;
            }
          } else {
            room.queue = room.queue.filter(item => item.id !== itemId);
          }

          console.log(`[WS party-remove-song] Room ${roomId}: Removed item ${itemId}`);

          broadcastToRoom(roomId, {
            type: "party-updated",
            room
          });
          break;
        }

        case "party-reorder-queue": {
          const { queue } = data;
          if (!roomId || !queue) return;

          const room = partyRooms[roomId];
          if (!room) return;

          room.queue = queue;
          console.log(`[WS party-reorder-queue] Room ${roomId}: Reordered queue`);

          broadcastToRoom(roomId, {
            type: "party-updated",
            room
          });
          break;
        }

        case "party-playback-control": {
          const { action, value } = data;
          if (!roomId) return;

          const room = partyRooms[roomId];
          if (!room) return;

          console.log(`[WS party-playback-control] Room ${roomId}: Action=${action} Value=${value}`);

          if (action === "play") {
            room.isPlaying = true;
          } else if (action === "pause") {
            room.isPlaying = false;
          } else if (action === "next") {
            if (room.activeSong) {
              room.history.push(room.activeSong);
              if (room.history.length > 20) room.history.shift();
            }
            if (room.queue.length > 0) {
              room.activeSong = room.queue.shift() || null;
              room.isPlaying = true;
            } else {
              room.activeSong = null;
              room.isPlaying = false;
            }
          } else if (action === "prev") {
            if (room.history.length > 0) {
              const prevSong = room.history.pop()!;
              if (room.activeSong) {
                room.queue.unshift(room.activeSong);
              }
              room.activeSong = prevSong;
              room.isPlaying = true;
            }
          }

          broadcastToRoom(roomId, {
            type: "party-updated",
            room
          });

          broadcastToRoom(roomId, {
            type: "party-playback-updated",
            action,
            value
          });
          break;
        }

        case "party-sound-effect": {
          const { soundId, userName } = data;
          if (!roomId || !soundId) return;
          console.log(`[WS party-sound-effect] Room ${roomId}: ${userName} triggered ${soundId}`);
          broadcastToRoom(roomId, {
            type: "party-sound-effect",
            soundId,
            userName
          });
          break;
        }

        case "video-call-signal": {
          if (!roomId) return;
          broadcastToRoom(roomId, data, ws);
          break;
        }
      }
    } catch (e) {
      console.error("[WS Server Error] Failed to process message:", e);
    }
  });

  ws.on("close", () => {
    const connInfo = activeConnections.get(ws);
    if (connInfo) {
      const { roomId, memberId } = connInfo;
      activeConnections.delete(ws);

      const room = rooms[roomId];
      if (room) {
        const index = room.members.findIndex(m => m.id === memberId);
        if (index !== -1) {
          const [removedMember] = room.members.splice(index, 1);
          
          // If the host disconnected, assign next member as host
          if (room.hostId === memberId) {
            if (room.members.length > 0) {
              room.hostId = room.members[0].id;
              room.members[0].role = "host";
            } else {
              room.hostId = "system";
            }
          }

          // If the singer disconnected, advance queue
          if (room.activeSongSingerId === memberId) {
            // Remove singer's song from top of queue if active
            if (room.queue.length > 0 && room.queue[0].singerId === memberId) {
              room.queue.shift();
            }

            // Set next song if available
            if (room.queue.length > 0) {
              const nextItem = room.queue[0];
              room.activeSongId = nextItem.song.id;
              room.activeSongSingerId = nextItem.singerId;

              const nextSinger = room.members.find(m => m.id === nextItem.singerId);
              if (nextSinger) {
                nextSinger.role = "singer";
              }
            } else {
              room.activeSongId = null;
              room.activeSongSingerId = null;
            }
          }

          broadcastToRoom(roomId, {
            type: "room-updated",
            room
          });

          broadcastToRoom(roomId, {
            type: "chat-message",
            message: {
              id: "sys_leave_" + Date.now(),
              roomId,
              sender: "System",
              text: `🚪 ${removedMember.username} left the room.`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              type: "system"
            }
          });
        }

        // Clean up empty non-default rooms to save memory
        if (room.members.length === 0 && !["VIP-CHILL", "ROCK-STAGE"].includes(roomId)) {
          console.log(`[WS Server] Cleaning up empty room: ${roomId}`);
          delete rooms[roomId];
        }
      }

      // Clean up party room if it exists
      const partyRoom = partyRooms[roomId];
      if (partyRoom) {
        const index = partyRoom.members.findIndex(m => m.id === memberId);
        if (index !== -1) {
          const [removedMember] = partyRoom.members.splice(index, 1);
          console.log(`[WS Close] User ${removedMember.name} left party room ${roomId}`);

          if (partyRoom.hostId === memberId) {
            if (partyRoom.members.length > 0) {
              partyRoom.hostId = partyRoom.members[0].id;
              partyRoom.hostName = partyRoom.members[0].name;
              partyRoom.members[0].isHost = true;
              console.log(`[WS Close] Assigning new host: ${partyRoom.hostName}`);
            } else {
              partyRoom.hostId = "";
              partyRoom.hostName = "";
            }
          }

          if (partyRoom.members.length === 0) {
            console.log(`[WS Close] Cleaning up empty party room: ${roomId}`);
            delete partyRooms[roomId];
          } else {
            broadcastToRoom(roomId, {
              type: "party-updated",
              room: partyRoom
            });
          }
        }
      }
    }
    console.log("[WS Connection] A client disconnected.");
  });
});

function broadcastToRoom(roomId: string, payload: any, skipSocket?: WebSocket) {
  const json = JSON.stringify(payload);
  activeConnections.forEach((info, connWs) => {
    if (info.roomId === roomId && connWs !== skipSocket && connWs.readyState === WebSocket.OPEN) {
      connWs.send(json);
    }
  });
}

// ----------------- VITE DEVELOPMENT / PRODUCTION MIDDLEWARE -----------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Bind the HTTP/WS server on port 3000
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server started. Listening on http://localhost:${PORT}`);
  });
}

startServer();

