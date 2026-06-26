/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Search,
  Plus,
  Users,
  LogOut,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Tv,
  Smartphone,
  Check,
  Music,
  Share2,
  AlertCircle,
  History,
  MessageSquare,
  Send,
  Camera,
  CameraOff,
  Video,
  RefreshCw,
  X
} from "lucide-react";
import { SingRoomParty, YTPlaylistItem } from "../types";

export const SOUND_EFFECTS = [
  { id: "applause", name: "Applause", emoji: "👏", url: "https://assets.mixkit.co/active_storage/sfx/1435/1435-84.wav" },
  { id: "airhorn", name: "Hype Airhorn", emoji: "📣", url: "https://assets.mixkit.co/active_storage/sfx/2747/2747-84.wav" },
  { id: "laughter", name: "Laughter", emoji: "😂", url: "https://assets.mixkit.co/active_storage/sfx/2684/2684-84.wav" },
  { id: "boo", name: "Friendly Boo", emoji: "👎", url: "https://assets.mixkit.co/active_storage/sfx/2407/2407-84.wav" },
  { id: "drumroll", name: "Drum Roll", emoji: "🥁", url: "https://assets.mixkit.co/active_storage/sfx/2019/2019-84.wav" },
  { id: "disco", name: "Disco Laser", emoji: "✨", url: "https://assets.mixkit.co/active_storage/sfx/2013/2013-84.wav" }
];

export function playSynthesizedSound(soundId: string) {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const dest = ctx.destination;

    if (soundId === "airhorn") {
      const freqs = [150, 220, 330, 440];
      freqs.forEach((f) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(f, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(f * 0.8, ctx.currentTime + 0.8);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
        osc.connect(gain);
        gain.connect(dest);
        osc.start();
        osc.stop(ctx.currentTime + 0.8);
      });
    } else if (soundId === "disco") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 1.0);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.0);
      osc.connect(gain);
      gain.connect(dest);
      osc.start();
      osc.stop(ctx.currentTime + 1.0);
    } else if (soundId === "boo") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(90, ctx.currentTime + 1.2);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(dest);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } else if (soundId === "drumroll") {
      for (let i = 0; i < 15; i++) {
        const time = ctx.currentTime + i * 0.08;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(80, time);
        gain.gain.setValueAtTime(0.25, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.07);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(time);
        osc.stop(time + 0.07);
      }
      const crashTime = ctx.currentTime + 15 * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(400, crashTime);
      gain.gain.setValueAtTime(0.15, crashTime);
      gain.gain.exponentialRampToValueAtTime(0.01, crashTime + 0.5);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(crashTime);
      osc.stop(crashTime + 0.5);
    } else if (soundId === "applause") {
      for (let i = 0; i < 20; i++) {
        const time = ctx.currentTime + Math.random() * 1.5;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(400 + Math.random() * 300, time);
        gain.gain.setValueAtTime(0.08, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15 + Math.random() * 0.2);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(time);
        osc.stop(time + 0.35);
      }
    } else if (soundId === "laughter") {
      for (let i = 0; i < 6; i++) {
        const time = ctx.currentTime + i * 0.15;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(350, time);
        osc.frequency.exponentialRampToValueAtTime(500, time + 0.1);
        gain.gain.setValueAtTime(0.15, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.12);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(time);
        osc.stop(time + 0.12);
      }
    }
  } catch (e) {
    console.error("Failed to play synthesized sound effect:", e);
  }
}

export function playSoundEffect(soundId: string) {
  const effect = SOUND_EFFECTS.find((s) => s.id === soundId);
  if (!effect) return;
  const audio = new Audio(effect.url);
  audio.volume = 0.45;
  audio.play().catch((err) => {
    console.log("Audio file playback blocked/failed, using fallback synthesizer:", err);
    playSynthesizedSound(soundId);
  });
}

interface FloatingEmoji {
  id: string;
  emoji: string;
  userName: string;
  soundName: string;
  x: number;
}

export default function SingRoomKtv() {
  // Navigation & Join State
  const [room, setRoom] = useState<SingRoomParty | null>(null);
  const [roomIdInput, setRoomIdInput] = useState("");
  const [nickname, setNickname] = useState(() => {
    return localStorage.getItem("singroom_nickname") || "";
  });
  const [roomNameInput, setRoomNameInput] = useState("");
  const [isHostRole, setIsHostRole] = useState(false);
  const [userId] = useState(() => {
    let id = localStorage.getItem("singroom_userid");
    if (!id) {
      id = "user_" + Math.random().toString(36).substring(2, 11);
      localStorage.setItem("singroom_userid", id);
    }
    return id;
  });

  // UI States
  const [isQrJoin, setIsQrJoin] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get("room") || params.get("join");
    return !!(roomParam && roomParam.length === 5);
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await fetch(`/api/youtube/suggest?q=${encodeURIComponent(searchQuery.trim())}`);
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data);
        }
      } catch (err) {
        console.error("Error fetching suggestions:", err);
      }
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<"search" | "queue" | "sounds" | "history" | "chat">("search");
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);

  // Chat States
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [hasNewChat, setHasNewChat] = useState(false);

  const activeMobileTabRef = useRef(activeMobileTab);
  useEffect(() => {
    activeMobileTabRef.current = activeMobileTab;
    if (activeMobileTab === "chat") {
      setHasNewChat(false);
    }
  }, [activeMobileTab]);

  const sendChatMessage = (textStr?: string, imageStr?: string) => {
    const messageText = textStr !== undefined ? textStr : chatInput;
    if (!messageText.trim() && !imageStr) return;
    if (!socketRef.current || !room) return;

    socketRef.current.send(
      JSON.stringify({
        type: "send-message",
        roomId: room.id,
        sender: nickname || "Singer",
        text: messageText.trim(),
        image: imageStr || null
      })
    );
    if (textStr === undefined) {
      setChatInput("");
    }
  };

  const sendChatReaction = (emoji: string) => {
    if (!socketRef.current || !room) return;
    socketRef.current.send(
      JSON.stringify({
        type: "send-message",
        roomId: room.id,
        sender: nickname || "Singer",
        text: emoji
      })
    );
  };

  // Voice Control States
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("Tap microphone to start voice commands");
  const [isTtsEnabled, setIsTtsEnabled] = useState(true);
  const [voiceLog, setVoiceLog] = useState<{ text: string; isCommand: boolean }[]>([]);
  const recognitionRef = useRef<any>(null);

  const roomRef = useRef(room);
  useEffect(() => {
    roomRef.current = room;
  }, [room]);

  const nicknameRef = useRef(nickname);
  useEffect(() => {
    nicknameRef.current = nickname;
  }, [nickname]);

  const processVoiceCommand = async (rawText: string) => {
    const text = rawText.toLowerCase().trim();

    const speakBack = (msg: string) => {
      if (isTtsEnabled && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(msg);
        utterance.rate = 1.05;
        window.speechSynthesis.speak(utterance);
      }
    };

    // Helper to log actions
    const logAction = (cmdText: string) => {
      setVoiceLog((prev) => [{ text: cmdText, isCommand: true }, ...prev.slice(0, 9)]);
    };

    // 1. Play / Resume
    if (text === "play" || text === "resume" || text === "start" || text === "unpause" || text === "continue") {
      setVoiceStatus("Command: Play");
      logAction("▶️ Play / Resume");
      speakBack("Playing song");
      playbackControl("play");
      return;
    }

    // 2. Pause / Stop
    if (text === "pause" || text === "stop" || text === "hold" || text === "freeze") {
      setVoiceStatus("Command: Pause");
      logAction("⏸️ Pause");
      speakBack("Pausing song");
      playbackControl("pause");
      return;
    }

    // 3. Skip / Next
    if (text === "skip" || text === "next" || text === "skip song" || text === "next song") {
      setVoiceStatus("Command: Skip");
      logAction("⏭️ Skip Song");
      speakBack("Skipping song");
      playbackControl("next");
      return;
    }

    // 4. Previous / Back
    if (text === "previous" || text === "prev" || text === "back" || text === "go back") {
      setVoiceStatus("Command: Previous");
      logAction("⏮️ Previous Song");
      speakBack("Going back to previous song");
      playbackControl("prev");
      return;
    }

    // 5. Add to queue / Search & Queue
    const queuePatterns = [
      /^(?:add to queue|add)\s+(.+?)(?:\s+to\s+queue)?$/,
      /^(?:queue|sing|play)\s+(.+)$/
    ];

    let query = "";
    for (const pattern of queuePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const potentialQuery = match[1].trim();
        if (potentialQuery && potentialQuery !== "song" && potentialQuery !== "it" && potentialQuery !== "music") {
          query = potentialQuery;
          break;
        }
      }
    }

    if (query) {
      setVoiceStatus(`Searching for: "${query}"`);
      logAction(`🔍 Queue: "${query}"`);
      speakBack(`Searching for ${query}`);

      try {
        const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(query + " karaoke")}`);
        if (!response.ok) throw new Error("Search request failed");
        const results = await response.json();
        
        if (results && results.length > 0) {
          const bestMatch = results[0];
          setVoiceStatus(`Added: "${bestMatch.title}"`);
          logAction(`➕ Added "${bestMatch.title}"`);
          speakBack(`Queueing ${bestMatch.title}`);
          
          if (socketRef.current && roomRef.current) {
            socketRef.current.send(
              JSON.stringify({
                type: "party-add-song",
                roomId: roomRef.current.id,
                song: {
                  videoId: bestMatch.videoId,
                  title: bestMatch.title,
                  thumbnail: bestMatch.thumbnail,
                  channelTitle: bestMatch.channelTitle
                },
                queuedBy: nicknameRef.current || "Voice Assistant"
              })
            );
          }
        } else {
          setVoiceStatus(`No results found for "${query}"`);
          speakBack(`No karaoke results found for ${query}`);
        }
      } catch (err) {
        console.error("Voice search error:", err);
        setVoiceStatus("Search failed.");
        speakBack("Error searching for that song.");
      }
    } else {
      setVoiceStatus(`Unknown command: "${rawText}"`);
      speakBack(`Sorry, I didn't recognize that command.`);
    }
  };

  const processVoiceCommandRef = useRef(processVoiceCommand);
  useEffect(() => {
    processVoiceCommandRef.current = processVoiceCommand;
  });

  // Toggle speech listening
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setErrorMsg("");
      setVoiceStatus("Activating mic...");
      try {
        recognitionRef.current?.start();
      } catch (err: any) {
        console.error(err);
        setVoiceStatus(`Error: Could not start mic.`);
      }
    }
  };

  // Speech recognition initialization
  useEffect(() => {
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      setVoiceStatus("Voice Control not supported in this browser");
      return;
    }

    const rec = new SpeechRecognitionClass();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";

    rec.onstart = () => {
      setIsListening(true);
      setVoiceStatus("Listening... Try 'skip song' or 'queue Hello'");
    };

    rec.onend = () => {
      setIsListening(false);
    };

    rec.onerror = (event: any) => {
      console.error("Speech Recognition Error", event);
      if (event.error === "not-allowed") {
        setVoiceStatus("Microphone access denied. Check browser permissions.");
      } else {
        setVoiceStatus(`Error: ${event.error}`);
      }
      setIsListening(false);
    };

    rec.onresult = async (event: any) => {
      const transcript = event.results[event.resultIndex][0].transcript.trim();
      setVoiceStatus(`Heard: "${transcript}"`);
      setVoiceLog((prev) => [{ text: transcript, isCommand: false }, ...prev.slice(0, 9)]);
      if (processVoiceCommandRef.current) {
        await processVoiceCommandRef.current(transcript);
      }
    };

    recognitionRef.current = rec;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, []);

  const triggerFloatingEmoji = (emoji: string, userName: string, soundName: string) => {
    const id = "emoji_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
    const newEmoji: FloatingEmoji = {
      id,
      emoji,
      userName,
      soundName,
      x: Math.floor(Math.random() * 70) + 15,
    };
    setFloatingEmojis((prev) => [...prev, newEmoji]);
    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((item) => item.id !== id));
    }, 4000);
  };

  const sendSoundEffect = (soundId: string) => {
    if (!socketRef.current || !room) return;
    socketRef.current.send(
      JSON.stringify({
        type: "party-sound-effect",
        roomId: room.id,
        soundId,
        userName: nickname || "Singer"
      })
    );
  };

  // --- WebRTC Video Calling States & Logic ---
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [videoCallPeers, setVideoCallPeers] = useState<any[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isLocalCameraEnabled, setIsLocalCameraEnabled] = useState(true);
  const [isLocalMicEnabled, setIsLocalMicEnabled] = useState(true);

  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<{ [peerId: string]: RTCPeerConnection }>({});
  const isVideoCallActiveRef = useRef(false);

  useEffect(() => {
    isVideoCallActiveRef.current = isVideoCallActive;
  }, [isVideoCallActive]);

  const onVideoCallSignalRef = useRef<((data: any) => void) | null>(null);

  const createPeerConnection = (peerId: string, peerName: string, isInitiator: boolean) => {
    if (peerConnectionsRef.current[peerId]) {
      peerConnectionsRef.current[peerId].close();
    }

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" }
      ]
    });

    peerConnectionsRef.current[peerId] = pc;

    // Add local tracks to this peer connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    // Capture incoming tracks
    pc.ontrack = (event) => {
      console.log(`[WebRTC] Received remote stream from peer ${peerId} (${peerName})`);
      const remoteStream = event.streams[0];
      setVideoCallPeers(prev => {
        const exists = prev.some(p => p.id === peerId);
        if (exists) {
          return prev.map(p => p.id === peerId ? { ...p, stream: remoteStream } : p);
        } else {
          return [...prev, { id: peerId, name: peerName, stream: remoteStream }];
        }
      });
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.send(JSON.stringify({
          type: "video-call-signal",
          roomId: roomRef.current?.id,
          action: "ice-candidate",
          sender: userId,
          senderName: nicknameRef.current || "Singer",
          target: peerId,
          candidate: event.candidate
        }));
      }
    };

    if (isInitiator) {
      pc.createOffer()
        .then(offer => pc.setLocalDescription(offer))
        .then(() => {
          if (socketRef.current) {
            socketRef.current.send(JSON.stringify({
              type: "video-call-signal",
              roomId: roomRef.current?.id,
              action: "offer",
              sender: userId,
              senderName: nicknameRef.current || "Singer",
              target: peerId,
              offer: pc.localDescription
            }));
          }
        })
        .catch(err => console.error("Error creating WebRTC offer:", err));
    }

    return pc;
  };

  // Define signal receiver callback
  useEffect(() => {
    onVideoCallSignalRef.current = (data: any) => {
      const { action, sender, senderName, target, offer, answer, candidate } = data;
      if (target && target !== userId) return;

      if (action === "join") {
        if (isVideoCallActiveRef.current) {
          console.log(`[WebRTC] Peer ${senderName} joined. Initiating connection...`);
          createPeerConnection(sender, senderName, true);
        }
      } else if (action === "offer") {
        console.log(`[WebRTC] Received offer from ${senderName}`);
        const pc = createPeerConnection(sender, senderName, false);
        pc.setRemoteDescription(new RTCSessionDescription(offer))
          .then(() => pc.createAnswer())
          .then(ans => pc.setLocalDescription(ans))
          .then(() => {
            if (socketRef.current) {
              socketRef.current.send(JSON.stringify({
                type: "video-call-signal",
                roomId: roomRef.current?.id,
                action: "answer",
                sender: userId,
                senderName: nicknameRef.current || "Singer",
                target: sender,
                answer: pc.localDescription
              }));
            }
          })
          .catch(err => console.error("Error answering RTC offer:", err));
      } else if (action === "answer") {
        console.log(`[WebRTC] Received answer from ${senderName}`);
        const pc = peerConnectionsRef.current[sender];
        if (pc) {
          pc.setRemoteDescription(new RTCSessionDescription(answer))
            .catch(err => console.error("Error setting remote RTC description:", err));
        }
      } else if (action === "ice-candidate") {
        const pc = peerConnectionsRef.current[sender];
        if (pc) {
          pc.addIceCandidate(new RTCIceCandidate(candidate))
            .catch(err => console.error("Error adding RTC ICE candidate:", err));
        }
      } else if (action === "leave") {
        console.log(`[WebRTC] Peer ${sender} left the call`);
        const pc = peerConnectionsRef.current[sender];
        if (pc) {
          pc.close();
          delete peerConnectionsRef.current[sender];
        }
        setVideoCallPeers(prev => prev.filter(p => p.id !== sender));
      }
    };
  }, [userId]);

  const onJoinVideoCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 320 }, height: { ideal: 240 } },
        audio: true
      });
      
      localStreamRef.current = stream;
      setLocalStream(stream);
      setIsVideoCallActive(true);
      setIsLocalCameraEnabled(true);
      setIsLocalMicEnabled(true);

      if (socketRef.current && room) {
        socketRef.current.send(JSON.stringify({
          type: "video-call-signal",
          roomId: room.id,
          action: "join",
          sender: userId,
          senderName: nickname || "Singer"
        }));
      }
    } catch (err) {
      console.error("[WebRTC] Error starting user media:", err);
      setIsVideoCallActive(true);
      setIsLocalCameraEnabled(false);
      setIsLocalMicEnabled(false);
      if (socketRef.current && room) {
        socketRef.current.send(JSON.stringify({
          type: "video-call-signal",
          roomId: room.id,
          action: "join",
          sender: userId,
          senderName: nickname || "Singer"
        }));
      }
    }
  };

  const onLeaveVideoCall = () => {
    setIsVideoCallActive(false);
    
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    setLocalStream(null);

    Object.keys(peerConnectionsRef.current).forEach(peerId => {
      peerConnectionsRef.current[peerId].close();
      delete peerConnectionsRef.current[peerId];
    });

    if (socketRef.current && room) {
      socketRef.current.send(JSON.stringify({
        type: "video-call-signal",
        roomId: room.id,
        action: "leave",
        sender: userId
      }));
    }

    setVideoCallPeers([]);
  };

  // WebSocket Ref
  const socketRef = useRef<WebSocket | null>(null);
  const playerRef = useRef<any>(null);

  // Parse direct join from URL parameter e.g. /?room=ABCDE
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get("room") || params.get("join");
    if (roomParam && roomParam.length === 5) {
      setRoomIdInput(roomParam.toUpperCase());
    }
  }, []);

  // Save nickname to localStorage on change
  useEffect(() => {
    if (nickname.trim()) {
      localStorage.setItem("singroom_nickname", nickname.trim());
    }
  }, [nickname]);

  // Connect to WebSocket on Room Join
  useEffect(() => {
    if (!room) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}`;
    console.log(`[SingRoom WS] Connecting to ${wsUrl}`);

    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("[SingRoom WS] Connected!");
      // Send join message
      ws.send(
        JSON.stringify({
          type: "party-join",
          roomId: room.id,
          name: nickname || "Singer",
          isHost: isHostRole,
          userId
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "party-updated" && data.room) {
          setRoom(data.room);
        } else if (data.type === "party-playback-updated") {
          const { action, value } = data;
          handleRemotePlayerAction(action, value);
        } else if (data.type === "party-sound-effect") {
          const { soundId, userName } = data;
          const effect = SOUND_EFFECTS.find((s) => s.id === soundId);
          if (effect) {
            // Play audio locally on Host screen (which is the TV with speakers)
            const isCurrentUserHost = room?.hostId === userId || isHostRole;
            if (isCurrentUserHost) {
              playSoundEffect(soundId);
            }
            // Trigger floating emoji animation on Host screen
            triggerFloatingEmoji(effect.emoji, userName, effect.name);
          }
        } else if (data.type === "chat-message" && data.message) {
          setChatMessages((prev) => [...prev, data.message].slice(-150));
          
          if (activeMobileTabRef.current !== "chat") {
            setHasNewChat(true);
          }
          
          // Trigger floating emojis for emoji-only or emoji-rich short messages on Host screen
          const text = data.message.text || "";
          const isCurrentUserHost = roomRef.current?.hostId === userId || isHostRole;
          if (isCurrentUserHost && text.trim().length <= 6 && /\p{Extended_Pictographic}/u.test(text)) {
            triggerFloatingEmoji(text.trim(), data.message.sender, "Chat Reaction");
          }
        } else if (data.type === "video-call-signal") {
          onVideoCallSignalRef.current?.(data);
        }
      } catch (err) {
        console.error("[SingRoom WS Error] parsing message:", err);
      }
    };

    ws.onclose = () => {
      console.log("[SingRoom WS] Connection closed.");
      // Attempt reconnect if still in room
      setTimeout(() => {
        if (socketRef.current?.readyState === WebSocket.CLOSED) {
          // Re-trigger effect or reconnect
          console.log("[SingRoom WS] Reconnecting...");
        }
      }, 3000);
    };

    return () => {
      ws.close();
      socketRef.current = null;
    };
  }, [room?.id]);

  // Remote action listener for YouTube Player
  const handleRemotePlayerAction = (action: string, value: any) => {
    if (!playerRef.current) return;
    try {
      if (action === "play") {
        playerRef.current.playVideo();
      } else if (action === "pause") {
        playerRef.current.pauseVideo();
      }
    } catch (e) {
      console.error("Error manipulating remote player:", e);
    }
  };

  // YouTube IFrame API Lazy Setup & Loop
  useEffect(() => {
    if (!room) return;
    const isCurrentUserHost = room.hostId === userId || isHostRole;
    if (!isCurrentUserHost) {
      // Spectators or guests do not render the active iframe player
      if (playerRef.current) {
        playerRef.current = null;
      }
      return;
    }

    if (!room.activeSong) {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {}
        playerRef.current = null;
      }
      return;
    }

    const loadYoutubeAPI = (callback: () => void) => {
      if ((window as any).YT && (window as any).YT.Player) {
        callback();
        return;
      }

      if (!(window as any).onYouTubeIframeAPIReady) {
        (window as any).onYouTubeIframeAPIReady = () => {
          callback();
        };
      } else {
        const existing = (window as any).onYouTubeIframeAPIReady;
        (window as any).onYouTubeIframeAPIReady = () => {
          existing();
          callback();
        };
      }

      // Check if tag already exists
      if (!document.getElementById("yt-iframe-api-script")) {
        const tag = document.createElement("script");
        tag.id = "yt-iframe-api-script";
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }
    };

    loadYoutubeAPI(() => {
      if (playerRef.current && typeof playerRef.current.loadVideoById === "function") {
        playerRef.current.loadVideoById({
          videoId: room.activeSong?.videoId,
          startSeconds: 0
        });
        if (room.isPlaying) {
          playerRef.current.playVideo();
        } else {
          playerRef.current.pauseVideo();
        }
        return;
      }

      // Create new player
      playerRef.current = new (window as any).YT.Player("youtube-player-host", {
        height: "100%",
        width: "100%",
        videoId: room.activeSong?.videoId,
        playerVars: {
          autoplay: room.isPlaying ? 1 : 0,
          controls: 1,
          modestbranding: 1,
          rel: 0
        },
        events: {
          onReady: (event: any) => {
            if (room.isPlaying) {
              event.target.playVideo();
            } else {
              event.target.pauseVideo();
            }
          },
          onStateChange: (event: any) => {
            // Video ended (state code 0)
            if (event.data === 0) {
              console.log("[YT Player] Video ended, advancing queue...");
              playbackControl("next");
            }
          }
        }
      });
    });
  }, [room?.activeSong?.videoId, room?.hostId]);

  // Sync isPlaying state to YouTube IFrame
  useEffect(() => {
    if (playerRef.current && typeof playerRef.current.getPlayerState === "function") {
      try {
        const state = playerRef.current.getPlayerState();
        if (room?.isPlaying && state !== 1) {
          playerRef.current.playVideo();
        } else if (!room?.isPlaying && state === 1) {
          playerRef.current.pauseVideo();
        }
      } catch (e) {}
    }
  }, [room?.isPlaying]);

  // API Call: Create Room
  const createRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!roomNameInput.trim() || !nickname.trim()) {
      setErrorMsg("Please enter both a room name and your nickname!");
      return;
    }

    try {
      const response = await fetch("/api/party-rooms/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: roomNameInput.trim(),
          hostName: nickname.trim()
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to create room.");
      }

      setIsHostRole(true);
      setRoom(data);
      setSuccessMsg(`Welcome, Host! Room "${data.name}" was successfully launched.`);
    } catch (err: any) {
      setErrorMsg(err.message || "Could not spin up a new room.");
    }
  };

  // API Call: Join Room
  const joinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!roomIdInput.trim() || !nickname.trim()) {
      setErrorMsg("Please enter the 5-character room code and your nickname!");
      return;
    }

    try {
      const response = await fetch("/api/party-rooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: roomIdInput.toUpperCase().trim(),
          name: nickname.trim()
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Room not found.");
      }

      setIsHostRole(false);
      setRoom(data);
      setSuccessMsg(`Joined room "${data.name}" successfully!`);
      setIsQrJoin(false);
      try {
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (e) {
        console.error("Failed to clean up URL search parameters:", e);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to join room. Verify code is active.");
    }
  };

  // Exit/Leave current room
  const leaveRoom = () => {
    if (socketRef.current) {
      socketRef.current.close();
    }
    setRoom(null);
    setSearchResults([]);
    setSearchQuery("");
    setErrorMsg("");
    setSuccessMsg("");
    setIsHostRole(false);
  };

  // API Call: YouTube Search
  const searchSongs = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setErrorMsg("");
    setIsSearching(true);
    try {
      const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(searchQuery.trim())}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to complete YouTube search.");
      }
      setSearchResults(data);
    } catch (err: any) {
      setErrorMsg(err.message || "YouTube search failed.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSuggestion = async (suggestion: string) => {
    setSearchQuery(suggestion);
    setSuggestions([]);
    setShowSuggestions(false);

    setErrorMsg("");
    setIsSearching(true);
    try {
      const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(suggestion.trim())}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to complete YouTube search.");
      }
      setSearchResults(data);
    } catch (err: any) {
      setErrorMsg(err.message || "YouTube search failed.");
    } finally {
      setIsSearching(false);
    }
  };

  // WS send helper for Add Song
  const addSongToQueue = (song: any) => {
    if (!socketRef.current || !room) return;

    socketRef.current.send(
      JSON.stringify({
        type: "party-add-song",
        roomId: room.id,
        song: {
          videoId: song.videoId,
          title: song.title,
          thumbnail: song.thumbnail,
          channelTitle: song.channelTitle
        },
        queuedBy: nickname || "Singer"
      })
    );

    // Flash small indicator & clear search results to look responsive
    setSuccessMsg(`"${song.title}" queued!`);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // WS send helper for Remove Song
  const removeSong = (itemId: string) => {
    if (!socketRef.current || !room) return;
    socketRef.current.send(
      JSON.stringify({
        type: "party-remove-song",
        roomId: room.id,
        itemId
      })
    );
  };

  // WS send helper for Reordering Queue (shifting index)
  const shiftQueueItem = (index: number, direction: "up" | "down") => {
    if (!socketRef.current || !room) return;
    const newQueue = [...room.queue];
    const targetIdx = direction === "up" ? index - 1 : index + 1;

    if (targetIdx < 0 || targetIdx >= newQueue.length) return;

    // Swap elements
    const temp = newQueue[index];
    newQueue[index] = newQueue[targetIdx];
    newQueue[targetIdx] = temp;

    socketRef.current.send(
      JSON.stringify({
        type: "party-reorder-queue",
        roomId: room.id,
        queue: newQueue
      })
    );
  };

  // WS send helper for Playback controls
  const playbackControl = (action: "play" | "pause" | "next" | "prev") => {
    if (!socketRef.current || !room) return;
    socketRef.current.send(
      JSON.stringify({
        type: "party-playback-control",
        roomId: room.id,
        action
      })
    );
  };

  const copyRoomLink = () => {
    const url = `${window.location.origin}/?room=${room?.id}`;
    navigator.clipboard.writeText(url);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const isCurrentUserHost = room ? room.hostId === userId || isHostRole : false;

  return (
    <div id="singroom_ktv_root" className="min-h-screen bg-[#020204] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black relative overflow-x-hidden">
      
      {/* GLOWING AMBIENCE BACKDROP */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-fuchsia-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* HEADER */}
      <nav className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-black/40 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4 select-none cursor-pointer" onClick={room ? leaveRoom : undefined}>
          <div className="w-10 h-10 bg-gradient-to-tr from-cyan-500 to-fuchsia-500 rounded-lg flex items-center justify-center font-bold text-xl italic shadow-[0_0_15px_rgba(6,182,212,0.5)]">
            <Mic className="w-5 h-5 animate-pulse text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight uppercase bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent leading-none">
              My Karaoke
            </h1>
            <p className="text-[9px] text-cyan-400 font-mono tracking-widest mt-1 uppercase leading-none font-bold">
              Immersive Lounge
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex bg-white/5 border border-white/10 rounded-full px-4 py-1.5 items-center gap-3">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Mic Active: 48kHz / 24bit</span>
          </div>

          {room && (
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs font-bold leading-none text-white uppercase tracking-wide">@{nickname || "SINGER"}</p>
                  <p className="text-[9px] text-cyan-400 font-bold tracking-wider leading-none mt-1 uppercase">
                    {isCurrentUserHost ? "HOST PRO" : "GUEST PLAYER"}
                  </p>
                </div>
                <div className="w-9 h-9 rounded-full bg-slate-800 border border-white/20 flex items-center justify-center text-xs font-bold text-white uppercase font-mono shadow-inner">
                  {nickname ? nickname[0] : "S"}
                </div>
              </div>

              <button
                onClick={leaveRoom}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/25 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Leave Room</span>
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* FEEDBACK STATUS BAR */}
      {(errorMsg || successMsg) && (
        <div className="max-w-7xl w-full mx-auto px-6 mt-4">
          {errorMsg && (
            <div className="bg-rose-950/40 border border-rose-800/80 text-rose-200 px-4 py-3 rounded-xl text-xs flex items-center gap-2.5 shadow-lg animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="bg-cyan-950/40 border border-cyan-800/80 text-cyan-200 px-4 py-3 rounded-xl text-xs flex items-center gap-2.5 shadow-lg animate-fade-in">
              <Check className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>
      )}

      {/* MAIN CONTENT WORKSPACE */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col justify-center">
        
        {/* ==================== 1. LANDING PAGE (NOT IN ROOM) ==================== */}
        {!room ? (
          isQrJoin ? (
            <div className="max-w-md mx-auto w-full py-12 animate-fade-in">
              <div className="bg-white/[0.03] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden backdrop-blur-xl">
                {/* Glowing ambient background effect */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-fuchsia-500/15 rounded-full blur-3xl pointer-events-none" />

                <div className="text-center space-y-2">
                  <div className="inline-flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1.5 rounded-full text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Scanned QR Code</span>
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight font-display">
                    You're Invited to Sing!
                  </h2>
                  <p className="text-xs text-slate-400">
                    Connecting to Lounge Room Code: <span className="font-mono font-black text-cyan-400 bg-black/40 px-2.5 py-1 rounded-lg border border-white/5 ml-1 select-all">{roomIdInput}</span>
                  </p>
                </div>

                {/* Error message */}
                {errorMsg && (
                  <div className="p-3 bg-red-950/45 border border-red-900/50 rounded-xl flex items-start gap-2 text-xs text-red-300">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={joinRoom} className="space-y-5">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">
                      🎤 Pick Your Stage Nickname
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-sm">@</span>
                      <input
                        type="text"
                        maxLength={15}
                        required
                        placeholder="e.g. Vocalist99"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value.replace(/\s+/g, ""))}
                        className="w-full pl-8 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-cyan-500 transition-all shadow-inner placeholder-slate-700"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Your tracks and soundboard triggers will show up under this name!
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:from-cyan-400 hover:to-fuchsia-400 text-black font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-cyan-500/10 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Connect & Start Singing</span>
                    <Music className="w-4 h-4" />
                  </button>
                </form>

                <div className="text-center pt-2 border-t border-white/5">
                  <button
                    onClick={() => {
                      setIsQrJoin(false);
                      setErrorMsg("");
                    }}
                    className="text-xs text-slate-400 hover:text-white transition-colors underline decoration-slate-600 underline-offset-4 cursor-pointer"
                  >
                    Or create a new room instead
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto w-full py-6">
              
              {/* Landing Copy Column */}
              <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-fuchsia-500/10 to-cyan-500/10 border border-fuchsia-500/20 px-3 py-1.5 rounded-full text-xs font-mono text-fuchsia-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Next-Gen Karaoke Lounge</span>
                </div>
                <h2 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white font-display">
                  Bring the KTV Party to Your <span className="bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">Big Screen</span>
                </h2>
                <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto lg:mx-0">
                  My Karaoke lets you host karaoke on your TV or laptop. Guests can join instantly with their phones, search YouTube, and queue tracks dynamically. Perfect sync, zero fuss!
                </p>

                {/* Step Hints */}
                <div className="grid grid-cols-3 gap-4 pt-4 max-w-md mx-auto lg:mx-0 text-left">
                  <div className="space-y-1">
                    <span className="block font-mono text-xs font-bold text-cyan-400">01. Host</span>
                    <span className="block text-[11px] text-slate-500 leading-tight">Create a room on your big screen</span>
                  </div>
                  <div className="space-y-1">
                    <span className="block font-mono text-xs font-bold text-fuchsia-400">02. QR Scan</span>
                    <span className="block text-[11px] text-slate-500 leading-tight">Guests scan with their phone</span>
                  </div>
                  <div className="space-y-1">
                    <span className="block font-mono text-xs font-bold text-cyan-400">03. Sing</span>
                    <span className="block text-[11px] text-slate-500 leading-tight">Queue tracks and sing together</span>
                  </div>
                </div>
              </div>

              {/* Forms Column (Create / Join cards) */}
              <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                
                {/* NICKNAME BOX (Shared prerequisite) */}
                <div className="col-span-full bg-white/5 border border-white/10 rounded-2xl p-5 shadow-[0_0_20px_rgba(0,0,0,0.5)] space-y-3 backdrop-blur-md">
                  <label className="block text-xs font-bold font-mono tracking-wider text-slate-400 uppercase">
                    🎤 Pick Your Stage Nickname First
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-xs">@</span>
                    <input
                      type="text"
                      maxLength={15}
                      placeholder="e.g. Vocalist99"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value.replace(/\s+/g, ""))}
                      className="w-full pl-8 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-cyan-500 transition-all shadow-inner placeholder-slate-600"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono">
                    This identifier will highlight your queued tracks on the big screen!
                  </p>
                </div>

                {/* CREATE ROOM CARD */}
                <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 shadow-2xl flex flex-col justify-between hover:border-fuchsia-500/30 hover:bg-white/[0.05] transition-all duration-300">
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-lg bg-fuchsia-500/10 flex items-center justify-center text-fuchsia-400">
                      <Plus className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-white tracking-tight">Create a New Room</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Set up a central room. Designed to be opened on your TV or computer monitor.
                    </p>
                  </div>

                  <form onSubmit={createRoom} className="space-y-4 mt-6">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider">Lounge/TV Room Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Living Room Party"
                        value={roomNameInput}
                        onChange={(e) => setRoomNameInput(e.target.value)}
                        className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-fuchsia-500"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-gradient-to-r from-fuchsia-600 to-pink-700 hover:from-fuchsia-500 hover:to-pink-600 font-bold text-xs text-white rounded-xl transition-all shadow-lg shadow-fuchsia-500/10 active:scale-95 cursor-pointer"
                    >
                      Launch Room as Host
                    </button>
                  </form>
                </div>

                {/* JOIN ROOM CARD */}
                <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 shadow-2xl flex flex-col justify-between hover:border-cyan-500/30 hover:bg-white/[0.05] transition-all duration-300">
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-white tracking-tight">Join an Existing Room</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Sing along or queue songs! Enter a 5-digit code or scan a QR code from the TV.
                    </p>
                  </div>

                  <form onSubmit={joinRoom} className="space-y-4 mt-6">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider">5-digit Room Code</label>
                      <input
                        type="text"
                        required
                        maxLength={5}
                        placeholder="e.g. A9B8D"
                        value={roomIdInput}
                        onChange={(e) => setRoomIdInput(e.target.value.toUpperCase().trim())}
                        className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-lg text-xs font-mono font-bold text-cyan-400 placeholder-slate-700 uppercase tracking-widest focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-400 hover:to-teal-500 font-bold text-xs text-black rounded-xl transition-all shadow-lg shadow-cyan-500/10 active:scale-95 cursor-pointer"
                    >
                      Connect as Guest
                    </button>
                  </form>
                </div>

              </div>
            </div>
          )
        ) : (
          
          // ==================== 2. ROOM WORKSPACE (ACTIVE IN ROOM) ====================
          <div className="w-full">
            
            {/* CASE A: HOST / TV VIEW (OPTIMIZED FOR BIG SCREEN) */}
            {isCurrentUserHost ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Panel: YouTube Screen and Playback controls */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* YouTube Monitor Box */}
                  <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden aspect-video shadow-2xl relative flex flex-col justify-between">
                    
                    {room.activeSong ? (
                      /* Active song video placeholder for IFrame API */
                      <div id="youtube-player-host" className="w-full h-full" />
                    ) : (
                      /* Idle Monitor */
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-4 bg-gradient-to-b from-slate-950 to-slate-900/50">
                        <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800/80 flex items-center justify-center text-slate-500 animate-pulse">
                          <Music className="w-8 h-8 text-slate-600" />
                        </div>
                        <div className="space-y-1 max-w-sm">
                          <h4 className="text-base font-bold text-white">Lounge Screen Idle</h4>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            No tracks are currently playing. Guests can search YouTube on their devices and add songs to sync immediately!
                          </p>
                        </div>
                        <div className="text-[10px] font-mono bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-500 mt-2">
                          Your Room Code is active and listening
                        </div>
                      </div>
                    )}

                    {/* FLOATING EMOJI CANVAS OVERLAY */}
                    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
                      {floatingEmojis.map((item) => (
                        <div
                          key={item.id}
                          className="absolute bottom-0 flex flex-col items-center"
                          style={{
                            left: `${item.x}%`,
                            animation: "float-up 3.5s cubic-bezier(0.1, 0.8, 0.3, 1) forwards",
                          }}
                        >
                          <span className="text-4xl filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)] select-none">
                            {item.emoji}
                          </span>
                          <span className="bg-slate-950/90 text-[9px] text-cyan-400 font-bold px-1.5 py-0.5 rounded-full border border-cyan-500/30 shadow-lg whitespace-nowrap mt-1 font-mono tracking-wide scale-90">
                            @{item.userName}
                          </span>
                        </div>
                      ))}
                    </div>

                    <style>{`
                      @keyframes float-up {
                        0% {
                          transform: translateY(10%) scale(0.6);
                          opacity: 0;
                        }
                        10% {
                          transform: translateY(-20px) scale(1.1);
                          opacity: 1;
                        }
                        85% {
                          opacity: 1;
                        }
                        100% {
                          transform: translateY(-340px) scale(0.85);
                          opacity: 0;
                        }
                      }
                    `}</style>

                    {/* NOW PLAYING STRIP */}
                    {room.activeSong && (
                      <div className="bg-slate-900/95 border-t border-slate-800 px-5 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={room.activeSong.thumbnail}
                            alt="Now playing"
                            className="w-12 h-12 rounded-lg object-cover border border-slate-700 shrink-0"
                          />
                          <div>
                            <span className="text-[9px] uppercase font-mono tracking-widest text-cyan-400 font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
                              Now Singing
                            </span>
                            <h4 className="text-sm font-extrabold text-white line-clamp-1 leading-snug mt-0.5">
                              {room.activeSong.title}
                            </h4>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                              Queue added by <span className="text-slate-200 font-semibold">@{room.activeSong.queuedBy}</span>
                            </p>
                          </div>
                        </div>

                        {/* Player Playback Controls for Host */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => playbackControl(room.isPlaying ? "pause" : "play")}
                            className="w-10 h-10 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                            title={room.isPlaying ? "Pause" : "Play"}
                          >
                            {room.isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                          </button>
                          <button
                            onClick={() => playbackControl("next")}
                            className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700/60 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                            title="Next Song"
                          >
                            <SkipForward className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>



                  {/* HOST CONTROLS & INFO BOARD */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Share Invitation Card */}
                    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
                      <div className="space-y-2">
                        <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500">Party Invite Link</span>
                        <h4 className="text-sm font-bold text-white">Copy or share room URL</h4>
                        <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                          Give others the link or let them join from any screen using code: <strong className="text-cyan-400 font-mono">{room.id}</strong>
                        </p>
                        <button
                          onClick={copyRoomLink}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-lg text-[11px] font-semibold transition-all active:scale-95 cursor-pointer"
                        >
                          {copiedCode ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Share2 className="w-3.5 h-3.5 text-slate-400" />}
                          <span>{copiedCode ? "Copied!" : "Copy Joining Link"}</span>
                        </button>
                      </div>

                      <div className="bg-slate-950 p-2 border border-slate-800 rounded-xl shrink-0">
                        <QRCodeSVG
                          value={`${window.location.origin}/?room=${room.id}`}
                          size={110}
                          bgColor={"#090d16"}
                          fgColor={"#22d3ee"} // vibrant cyan
                          level={"H"}
                          includeMargin={true}
                        />
                      </div>
                    </div>

                    {/* Simple search helper for TV (also can add directly!) */}
                    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                          <Tv className="w-4 h-4 text-cyan-400" />
                          <span>Lounge Screen Controller</span>
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Scan the QR code with your smartphone for a beautiful, hand-held mobile remote. Guests can use it to add tracks instantly!
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono mt-2">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>Active participants: {room.members.length}</span>
                      </div>
                    </div>

                  </div>

                </div>

                {/* Right Panel: Host Central Queue Sidebar */}
                <div className="lg:col-span-4 bg-white/[0.03] border border-white/5 rounded-3xl p-5 shadow-2xl space-y-4 backdrop-blur-md">
                  {/* LIVE LOUNGE CHAT (MOVED ON TOP) */}
                  <div className="border-b border-slate-800/60 pb-4 mb-2">
                    <LoungeChatBox
                      chatMessages={chatMessages}
                      chatInput={chatInput}
                      setChatInput={setChatInput}
                      sendChatMessage={sendChatMessage}
                      sendChatReaction={sendChatReaction}
                      nickname={nickname}
                      userId={userId}
                      isVideoCallActive={isVideoCallActive}
                      setIsVideoCallActive={setIsVideoCallActive}
                      videoCallPeers={videoCallPeers}
                      localStream={localStream}
                      isLocalCameraEnabled={isLocalCameraEnabled}
                      setIsLocalCameraEnabled={setIsLocalCameraEnabled}
                      isLocalMicEnabled={isLocalMicEnabled}
                      setIsLocalMicEnabled={setIsLocalMicEnabled}
                      onJoinVideoCall={onJoinVideoCall}
                      onLeaveVideoCall={onLeaveVideoCall}
                    />
                  </div>

                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-fuchsia-400" />
                      <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-300">
                        Upcoming Queue ({room.queue.length})
                      </h3>
                    </div>
                  </div>

                  {/* Queue playlist list */}
                  <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                    {room.queue.length === 0 ? (
                      <div className="py-12 text-center text-xs text-slate-500 font-mono space-y-2">
                        <p>The queue is currently empty.</p>
                        <p className="text-[10px] text-slate-600">Guests can add tracks using the search panel!</p>
                      </div>
                    ) : (
                      room.queue.map((item, index) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-3 bg-black/40 border border-white/5 p-2.5 rounded-xl hover:border-cyan-500/20 transition-all group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={item.thumbnail}
                              alt={item.title}
                              className="w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0"
                            />
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-cyan-400 transition-colors">
                                {item.title}
                              </h4>
                              <p className="text-[9px] text-slate-500 font-mono mt-0.5">
                                Added by @{item.queuedBy}
                              </p>
                            </div>
                          </div>

                          {/* Reordering & removal controls for Host */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => shiftQueueItem(index, "up")}
                              disabled={index === 0}
                              className={`p-1 hover:bg-white/5 text-slate-400 hover:text-white rounded transition-colors ${
                                index === 0 ? "opacity-20 cursor-not-allowed" : ""
                              }`}
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => shiftQueueItem(index, "down")}
                              disabled={index === room.queue.length - 1}
                              className={`p-1 hover:bg-white/5 text-slate-400 hover:text-white rounded transition-colors ${
                                index === room.queue.length - 1 ? "opacity-20 cursor-not-allowed" : ""
                              }`}
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => removeSong(item.id)}
                              className="p-1 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 rounded transition-colors ml-1 cursor-pointer"
                              title="Remove"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* RECENTLY PLAYED SECTION */}
                  <div className="border-t border-white/5 pt-4 mt-2 space-y-3">
                    <div className="flex items-center gap-2">
                      <History className="w-4 h-4 text-cyan-400" />
                      <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-300">
                        Recently Played ({room.history?.length || 0})
                      </h3>
                    </div>

                    <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                      {!room.history || room.history.length === 0 ? (
                        <div className="py-6 text-center text-xs text-slate-500 font-mono">
                          <p>No songs played yet.</p>
                        </div>
                      ) : (
                        room.history.map((item, index) => (
                          <div
                            key={item.id + "-hist-" + index}
                            className="flex items-center justify-between gap-3 bg-black/20 border border-white/5 p-2 rounded-xl group"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <img
                                src={item.thumbnail}
                                alt={item.title}
                                className="w-8 h-8 rounded-lg object-cover border border-white/5 shrink-0 opacity-75"
                              />
                              <div className="min-w-0">
                                <h4 className="text-[11px] font-bold text-slate-300 line-clamp-1">
                                  {item.title}
                                </h4>
                                <p className="text-[9px] text-slate-500 font-mono mt-0.5">
                                  Sung by @{item.queuedBy}
                                </p>
                              </div>
                            </div>
                            <span className="text-[9px] font-mono font-bold bg-white/5 border border-white/5 px-1.5 py-0.5 rounded text-cyan-400 shrink-0">
                              Done
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* QUICK SEARCH FOR HOST */}
                  <div className="border-t border-white/5 pt-4 mt-2 space-y-2.5">
                    <h4 className="text-[11px] font-bold font-mono uppercase text-slate-400">Host Direct Search:</h4>
                    <form onSubmit={searchSongs} className="relative">
                      <input
                        type="text"
                        placeholder="Search songs directly..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => {
                          setTimeout(() => setShowSuggestions(false), 200);
                        }}
                        className="w-full pl-3 pr-8 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs placeholder-slate-600 text-white focus:outline-none focus:border-cyan-500"
                      />
                      <button
                        type="submit"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                      >
                        <Search className="w-4 h-4" />
                      </button>

                      {/* Auto-suggest suggestions list */}
                      {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl z-50 max-h-[200px] overflow-y-auto divide-y divide-slate-900/60 animate-fade-in">
                          {suggestions.map((suggestion, idx) => (
                            <button
                              key={`host-suggest-${idx}`}
                              type="button"
                              onClick={() => handleSelectSuggestion(suggestion)}
                              className="w-full px-3 py-2 text-left text-[11px] text-slate-300 hover:text-cyan-400 hover:bg-slate-900 transition-colors flex items-center gap-2 cursor-pointer"
                            >
                              <Search className="w-3 h-3 text-slate-600 shrink-0" />
                              <span className="truncate">{suggestion}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </form>

                    {searchResults.length > 0 && (
                      <div className="bg-slate-950 border border-slate-800 rounded-xl max-h-[220px] overflow-y-auto p-1.5 space-y-1 animate-fade-in shadow-inner">
                        {searchResults.map((song) => (
                          <div
                            key={song.videoId}
                            className="flex items-center justify-between gap-2 p-1.5 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
                            onClick={() => addSongToQueue(song)}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <img
                                src={song.thumbnail}
                                alt={song.title}
                                className="w-8 h-8 rounded object-cover border border-slate-800 shrink-0"
                              />
                              <div className="min-w-0">
                                <h5 className="text-[10px] font-semibold text-white line-clamp-1 leading-normal">
                                  {song.title}
                                </h5>
                                <p className="text-[9px] text-slate-500 line-clamp-1">
                                  {song.channelTitle}
                                </p>
                              </div>
                            </div>
                            <span className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white p-1 rounded shrink-0 cursor-pointer">
                              <Plus className="w-3 h-3" />
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

              </div>
            ) : (
              
              // CASE B: GUEST / MOBILE VIEW (OPTIMIZED FOR HAND-HELD CONTROLLER)
              <div className="max-w-md mx-auto space-y-6">
                
                {/* Lobby Info Stripe */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                      <Smartphone className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wide">Connected Lounge</h3>
                      <h4 className="text-sm font-extrabold text-white leading-snug mt-0.5">{room.name}</h4>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold bg-slate-950 border border-slate-800 px-2 py-1 rounded text-cyan-400">
                    {room.id}
                  </span>
                </div>



                {/* Tab layout: Search Songs vs Active Queue vs History vs Chat */}
                <div className="grid grid-cols-4 bg-black/40 p-1 rounded-xl border border-white/5 backdrop-blur-md">
                  <button
                    onClick={() => setActiveMobileTab("search")}
                    className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      activeMobileTab === "search" ? "bg-white/10 text-cyan-400 border border-white/10 shadow-[0_0_10px_rgba(34,211,238,0.1)]" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Search</span>
                  </button>
                  <button
                    onClick={() => setActiveMobileTab("queue")}
                    className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      activeMobileTab === "queue" ? "bg-white/10 text-cyan-400 border border-white/10 shadow-[0_0_10px_rgba(34,211,238,0.1)]" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Queue ({room.queue.length})</span>
                  </button>
                  <button
                    onClick={() => setActiveMobileTab("history")}
                    className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      activeMobileTab === "history" ? "bg-white/10 text-cyan-400 border border-white/10 shadow-[0_0_10px_rgba(34,211,238,0.1)]" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <History className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">History</span>
                  </button>
                  <button
                    onClick={() => setActiveMobileTab("chat")}
                    className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer relative ${
                      activeMobileTab === "chat" ? "bg-white/10 text-cyan-400 border border-white/10 shadow-[0_0_10px_rgba(34,211,238,0.1)]" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <div className="relative">
                      <MessageSquare className="w-3.5 h-3.5" />
                      {hasNewChat && (
                        <span className="absolute -top-1 -right-1 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                        </span>
                      )}
                    </div>
                    <span>Chat</span>
                  </button>
                </div>

                {/* NOW PLAYING CARD AT TOP */}
                {room.activeSong && (
                  <div className="bg-fuchsia-950/25 border border-fuchsia-500/20 rounded-2xl p-4 flex items-center gap-3 shadow-lg backdrop-blur-md">
                    <img
                      src={room.activeSong.thumbnail}
                      alt="Now playing"
                      className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0 animate-pulse"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="inline-block text-[9px] font-mono uppercase bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/10 px-2 py-0.5 rounded font-bold">
                        Now Singing
                      </span>
                      <h4 className="text-xs font-extrabold text-white line-clamp-1 mt-1 leading-snug">
                        {room.activeSong.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Added by @{room.activeSong.queuedBy}
                      </p>
                    </div>
                  </div>
                )}

                {/* TAB B1: SEARCH VIEW */}
                {activeMobileTab === "search" && (
                  <div className="space-y-4 animate-fade-in">
                    <form onSubmit={searchSongs} className="flex gap-2 relative">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="Search YouTube track (e.g. Queen)"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onFocus={() => setShowSuggestions(true)}
                          onBlur={() => {
                            setTimeout(() => setShowSuggestions(false), 200);
                          }}
                          className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-cyan-500 text-white placeholder-slate-600"
                        />

                        {/* Auto-suggest suggestions list */}
                        {showSuggestions && suggestions.length > 0 && (
                          <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl z-50 max-h-[220px] overflow-y-auto divide-y divide-slate-900/60 animate-fade-in">
                            {suggestions.map((suggestion, idx) => (
                              <button
                                key={`guest-suggest-${idx}`}
                                type="button"
                                onClick={() => handleSelectSuggestion(suggestion)}
                                className="w-full px-4 py-2.5 text-left text-xs text-slate-300 hover:text-cyan-400 hover:bg-slate-900 transition-colors flex items-center gap-2 cursor-pointer"
                              >
                                <Search className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                                <span className="truncate">{suggestion}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        type="submit"
                        className="px-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl text-xs transition-all active:scale-95 flex items-center justify-center gap-1 cursor-pointer shrink-0"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>Search</span>
                      </button>
                    </form>

                    {/* Search results loading indicator */}
                    {isSearching && (
                      <div className="py-12 text-center text-xs text-slate-500 font-mono flex flex-col items-center gap-2">
                        <span className="w-5 h-5 rounded-full border-2 border-cyan-400/20 border-t-cyan-400 animate-spin" />
                        <span>Retrieving high-fidelity YouTube search results...</span>
                      </div>
                    )}

                    {/* Search Results Cards */}
                    {!isSearching && searchResults.length > 0 && (
                      <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
                        {searchResults.map((song) => (
                          <div
                            key={song.videoId}
                            className="flex items-center justify-between gap-3 bg-slate-900 border border-slate-800/80 p-2.5 rounded-2xl hover:border-slate-700 transition-all group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img
                                src={song.thumbnail}
                                alt={song.title}
                                className="w-12 h-12 rounded-xl object-cover border border-slate-800 shrink-0"
                              />
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug">
                                  {song.title}
                                </h4>
                                <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                                  {song.channelTitle}
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={() => addSongToQueue(song)}
                              className="px-3 py-1.5 bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white font-black text-[10px] rounded-lg transition-all shrink-0 cursor-pointer shadow-md shadow-fuchsia-600/10"
                            >
                              Add to Queue
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {!isSearching && searchResults.length === 0 && (
                      <div className="py-12 text-center text-xs text-slate-600 bg-slate-900/10 border border-slate-900 rounded-2xl">
                        <Music className="w-8 h-8 text-slate-800 mx-auto mb-2 animate-pulse" />
                        <p>Search above to load real-time YouTube songs!</p>
                        <p className="text-[10px] text-slate-700 mt-1">"karaoke" will automatically append for optimal sing-along lyrics.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB B2: CURRENT QUEUE VIEW */}
                {activeMobileTab === "queue" && (
                  <div className="space-y-4 animate-fade-in">
                    <h3 className="text-xs font-bold font-mono uppercase tracking-wide text-slate-400">
                      Upcoming Songs ({room.queue.length})
                    </h3>

                    <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
                      {room.queue.length === 0 ? (
                        <div className="py-12 text-center text-xs text-slate-600 border border-slate-900 rounded-2xl">
                          <p>The queue is currently empty.</p>
                          <p className="text-[10px] text-slate-700 mt-1">Be the first to search and add a song!</p>
                        </div>
                      ) : (
                        room.queue.map((item, index) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between gap-3 bg-slate-900 border border-slate-800/80 p-2.5 rounded-2xl"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img
                                src={item.thumbnail}
                                alt={item.title}
                                className="w-10 h-10 rounded-lg object-cover border border-slate-800 shrink-0"
                              />
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-white line-clamp-1">
                                  {item.title}
                                </h4>
                                <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                                  Queue Index: #{index + 1} • Added by @{item.queuedBy}
                                </p>
                              </div>
                            </div>

                            {/* Guests cannot delete or reorder, only view or delete their OWN song if they want (let's let them delete any for simple collab, or keep it read-only) */}
                            {item.queuedBy === nickname && (
                              <button
                                onClick={() => removeSong(item.id)}
                                className="p-1 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded transition-colors cursor-pointer"
                                title="Remove My Song"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}



                {/* TAB B4: RECENTLY PLAYED VIEW */}
                {activeMobileTab === "history" && (
                  <div className="space-y-4 animate-fade-in">
                    <h3 className="text-xs font-bold font-mono uppercase tracking-wide text-slate-400">
                      Recently Played Songs ({room.history?.length || 0})
                    </h3>

                    <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
                      {!room.history || room.history.length === 0 ? (
                        <div className="py-12 text-center text-slate-600 border border-slate-900 rounded-2xl">
                          <p>No songs have finished playing yet.</p>
                          <p className="text-[10px] text-slate-700 mt-1">They will appear here once they are played or skipped!</p>
                        </div>
                      ) : (
                        room.history.map((item, index) => (
                          <div
                            key={item.id + "-mobile-hist-" + index}
                            className="flex items-center justify-between gap-3 bg-slate-900 border border-slate-800/80 p-2.5 rounded-2xl"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img
                                src={item.thumbnail}
                                alt={item.title}
                                className="w-10 h-10 rounded-lg object-cover border border-slate-800 shrink-0 opacity-75"
                              />
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-slate-200 line-clamp-1">
                                  {item.title}
                                </h4>
                                <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                                  Sung by @{item.queuedBy}
                                </p>
                              </div>
                            </div>
                            <span className="text-[10px] font-mono font-bold bg-slate-950 border border-slate-800 px-2 py-1 rounded text-emerald-500 shrink-0">
                              Played
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* TAB B5: LOUNGE LIVE CHAT VIEW */}
                {activeMobileTab === "chat" && (
                  <div className="space-y-4 animate-fade-in">
                    <LoungeChatBox
                      chatMessages={chatMessages}
                      chatInput={chatInput}
                      setChatInput={setChatInput}
                      sendChatMessage={sendChatMessage}
                      sendChatReaction={sendChatReaction}
                      nickname={nickname}
                      userId={userId}
                      isVideoCallActive={isVideoCallActive}
                      setIsVideoCallActive={setIsVideoCallActive}
                      videoCallPeers={videoCallPeers}
                      localStream={localStream}
                      isLocalCameraEnabled={isLocalCameraEnabled}
                      setIsLocalCameraEnabled={setIsLocalCameraEnabled}
                      isLocalMicEnabled={isLocalMicEnabled}
                      setIsLocalMicEnabled={setIsLocalMicEnabled}
                      onJoinVideoCall={onJoinVideoCall}
                      onLeaveVideoCall={onLeaveVideoCall}
                    />
                  </div>
                )}

              </div>
            )}

          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-[10px] font-mono text-slate-600 mt-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>My Karaoke © 2026. Powered by YouTube and real-time WebSockets synchronization.</span>
          <span>To configure custom endpoints or YouTube keys, edit `.env` or configuration files.</span>
        </div>
      </footer>

    </div>
  );
}



export function LoungeChatBox({
  chatMessages,
  chatInput,
  setChatInput,
  sendChatMessage,
  sendChatReaction,
  nickname,
  userId,
  isVideoCallActive,
  setIsVideoCallActive,
  videoCallPeers,
  localStream,
  isLocalCameraEnabled,
  setIsLocalCameraEnabled,
  isLocalMicEnabled,
  setIsLocalMicEnabled,
  onJoinVideoCall,
  onLeaveVideoCall
}: {
  chatMessages: any[];
  chatInput: string;
  setChatInput: (val: string) => void;
  sendChatMessage: (textStr?: string, imageStr?: string) => void;
  sendChatReaction: (emoji: string) => void;
  nickname: string;
  userId: string;
  isVideoCallActive: boolean;
  setIsVideoCallActive: (val: boolean) => void;
  videoCallPeers: any[];
  localStream: MediaStream | null;
  isLocalCameraEnabled: boolean;
  setIsLocalCameraEnabled: (val: boolean) => void;
  isLocalMicEnabled: boolean;
  setIsLocalMicEnabled: (val: boolean) => void;
  onJoinVideoCall: () => void;
  onLeaveVideoCall: () => void;
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    if (isCameraActive && !capturedPhoto) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isCameraActive, facingMode, capturedPhoto]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode, width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error("Failed to start camera:", err);
      setCameraError(
        err.name === "NotAllowedError" || err.name === "PermissionDeniedError"
          ? "Camera permission denied. Please allow camera access in your browser rules or open the app in a new tab."
          : "Could not access camera. Make sure no other device or application is utilizing it."
      );
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const toggleCamera = () => {
    if (isCameraActive) {
      setIsCameraActive(false);
      setCapturedPhoto(null);
    } else {
      setIsCameraActive(true);
      setCapturedPhoto(null);
    }
  };

  const switchCamera = () => {
    setFacingMode(prev => (prev === "user" ? "environment" : "user"));
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    try {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      const videoWidth = video.videoWidth || 320;
      const videoHeight = video.videoHeight || 240;
      
      const targetWidth = 320;
      const targetHeight = Math.round((videoHeight / videoWidth) * targetWidth);
      
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      
      const ctx = canvas.getContext("2d");
      if (ctx) {
        if (facingMode === "user") {
          ctx.translate(targetWidth, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
        
        if (facingMode === "user") {
          ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
        
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        setCapturedPhoto(dataUrl);
        stopCamera();
      }
    } catch (err) {
      console.error("Error capturing photo:", err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() && !capturedPhoto) return;
    
    sendChatMessage(chatInput, capturedPhoto || undefined);
    setCapturedPhoto(null);
    setIsCameraActive(false);
  };

  const REACTION_EMOJIS = ["🎉", "👏", "🔥", "🎙️", "❤️", "🌟"];

  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-5 shadow-2xl flex flex-col h-[400px] backdrop-blur-md relative overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-3 select-none">
        <div>
          <h4 className="text-xs font-bold font-mono uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            <span>Lounge Live Chat</span>
          </h4>
          <p className="text-[10px] text-slate-400 mt-1 font-sans">
            Real-time messages, selfies, and reactions!
          </p>
        </div>
        {!isVideoCallActive ? (
          <button
            type="button"
            onClick={onJoinVideoCall}
            className="text-[9px] font-mono font-bold bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-black border border-cyan-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-[0_0_10px_rgba(34,211,238,0.15)] animate-pulse"
          >
            <Video className="w-3.5 h-3.5" />
            <span>Start Video Call</span>
          </button>
        ) : (
          <span className="text-[9px] font-mono font-bold bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-lg text-emerald-400 shrink-0 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>IN CALL</span>
          </span>
        )}
      </div>

      {/* ACTIVE VIDEO CALL REGION */}
      {isVideoCallActive && (
        <div className="border border-cyan-500/20 bg-slate-950/40 p-2.5 rounded-2xl mb-3 space-y-2 animate-fade-in relative z-20 shrink-0 shadow-lg shadow-cyan-500/5">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
              <span className="flex h-1.5 w-1.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span>
              </span>
              <span>Active Video Call ({1 + videoCallPeers.length})</span>
            </div>
            <button
              type="button"
              onClick={onLeaveVideoCall}
              className="px-2 py-0.5 text-[8px] font-mono font-bold uppercase tracking-wider bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white rounded border border-rose-500/30 transition-all cursor-pointer flex items-center gap-1 active:scale-95"
            >
              <X className="w-2.5 h-2.5" />
              <span>Leave Call</span>
            </button>
          </div>

          {/* Horizontal list of streams */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {/* Local Feed Card */}
            <div className="relative w-28 h-20 rounded-xl overflow-hidden bg-slate-950 border border-cyan-500/30 shrink-0 flex items-center justify-center group/local">
              {isLocalCameraEnabled && localStream ? (
                <video
                  ref={(el) => {
                    if (el) el.srcObject = localStream;
                  }}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover -scale-x-100"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-2 space-y-1">
                  <div className="w-6 h-6 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-slate-500">
                    <CameraOff className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                  <span className="text-[8px] font-mono text-slate-500">Camera Off</span>
                </div>
              )}
              
              {/* Overlay with local controls */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1 px-1.5 flex items-center justify-between opacity-90 group-hover/local:opacity-100 transition-opacity">
                <span className="text-[8px] font-bold font-mono text-white truncate max-w-[50px]">
                  You
                </span>
                
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const next = !isLocalMicEnabled;
                      setIsLocalMicEnabled(next);
                      if (localStream) {
                        localStream.getAudioTracks().forEach(track => track.enabled = next);
                      }
                    }}
                    className={`p-0.5 rounded cursor-pointer transition-colors ${isLocalMicEnabled ? "bg-black/60 text-cyan-400 hover:bg-black/80" : "bg-rose-600 text-white"}`}
                    title={isLocalMicEnabled ? "Mute Mic" : "Unmute Mic"}
                  >
                    {isLocalMicEnabled ? (
                      <Mic className="w-2.5 h-2.5" />
                    ) : (
                      <MicOff className="w-2.5 h-2.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !isLocalCameraEnabled;
                      setIsLocalCameraEnabled(next);
                      if (localStream) {
                        localStream.getVideoTracks().forEach(track => track.enabled = next);
                      }
                    }}
                    className={`p-0.5 rounded cursor-pointer transition-colors ${isLocalCameraEnabled ? "bg-black/60 text-cyan-400 hover:bg-black/80" : "bg-rose-600 text-white"}`}
                    title={isLocalCameraEnabled ? "Stop Video" : "Start Video"}
                  >
                    {isLocalCameraEnabled ? (
                      <Video className="w-2.5 h-2.5" />
                    ) : (
                      <CameraOff className="w-2.5 h-2.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Remote Feeds Cards */}
            {videoCallPeers.map((peer) => (
              <div 
                key={peer.id} 
                className="relative w-28 h-20 rounded-xl overflow-hidden bg-slate-950 border border-white/10 shrink-0 flex items-center justify-center"
              >
                {peer.stream ? (
                  /* Real Peer Video Element */
                  <video
                    ref={(el) => {
                      if (el) el.srcObject = peer.stream;
                    }}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-2 space-y-1">
                    <div className="w-6 h-6 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-slate-500">
                      <Video className="w-3 h-3 animate-pulse text-cyan-400" />
                    </div>
                    <span className="text-[8px] font-mono text-slate-500">Connecting...</span>
                  </div>
                )}
                
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-1 px-1.5">
                  <span className="text-[8px] font-bold font-mono text-white truncate block text-center">
                    {peer.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Message List Area */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 mb-3 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {chatMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <MessageSquare className="w-8 h-8 text-slate-700 mb-2 animate-pulse" />
            <p className="text-xs text-slate-500 font-mono">No messages in this session yet.</p>
            <p className="text-[10px] text-slate-600 font-sans mt-0.5">Be the first to say hello or snap a photo!</p>
          </div>
        ) : (
          chatMessages.map((msg) => {
            const isMe = msg.sender === nickname;
            const isSystem = msg.type === "system" || msg.sender === "System";
            const isCheer = msg.type === "cheer";

            if (isSystem || isCheer) {
              return (
                <div key={msg.id} className="text-center py-1 font-mono text-[10px]">
                  <span className="inline-block bg-black/40 border border-white/5 px-2.5 py-1 rounded-full text-cyan-400 shadow-sm leading-normal">
                    {msg.text}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[85%] ${isMe ? "ml-auto items-end" : "mr-auto items-start"}`}
              >
                <div className="flex items-center gap-1.5 mb-0.5 px-1">
                  <span className="text-[9px] font-bold text-slate-400 font-mono">
                    @{msg.sender}
                  </span>
                  <span className="text-[8px] text-slate-600 font-mono">{msg.timestamp}</span>
                </div>
                <div
                  className={`px-3 py-2 rounded-2xl text-xs font-sans break-all shadow-sm leading-relaxed space-y-1.5 ${
                    isMe
                      ? "bg-gradient-to-br from-cyan-500/20 to-fuchsia-500/20 text-cyan-100 border border-cyan-500/30 rounded-tr-none"
                      : "bg-black/40 border border-white/5 text-slate-200 rounded-tl-none"
                  }`}
                >
                  {msg.image && (
                    <div 
                      className="relative group/img overflow-hidden rounded-xl border border-white/10 max-w-[150px] cursor-pointer" 
                      onClick={() => setSelectedImage(msg.image)}
                    >
                      <img 
                        src={msg.image} 
                        alt="Shared snap" 
                        className="w-full h-auto object-cover hover:scale-105 transition-all duration-350"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-all duration-200">
                        <span className="text-[9px] font-mono bg-cyan-500 text-black px-1.5 py-0.5 rounded font-bold shadow-md">
                          ZOOM
                        </span>
                      </div>
                    </div>
                  )}
                  {msg.text && <div>{msg.text}</div>}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* CAMERA VIEWER & CAPTURE TRAY */}
      {isCameraActive && (
        <div className="bg-slate-950/95 border border-cyan-500/20 rounded-2xl p-2.5 mb-2.5 space-y-2.5 animate-fade-in relative z-10">
          <button 
            type="button"
            onClick={() => setIsCameraActive(false)}
            className="absolute top-2 right-2 p-1 rounded-full bg-slate-900/80 text-slate-400 hover:text-white border border-white/10 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          
          <div className="relative aspect-video max-h-[120px] mx-auto overflow-hidden rounded-xl bg-black border border-white/5 flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${facingMode === "user" ? "-scale-x-100" : ""}`}
            />
            
            {cameraError && (
              <div className="absolute inset-0 p-2 flex flex-col items-center justify-center text-center bg-slate-950/95 space-y-1.5">
                <AlertCircle className="w-5 h-5 text-rose-500 animate-pulse" />
                <p className="text-[9px] text-rose-400 font-mono leading-normal px-2">{cameraError}</p>
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-2 py-0.5 text-[8px] font-mono font-bold bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded cursor-pointer"
                >
                  Retry Access
                </button>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={switchCamera}
              className="px-2.5 py-1 text-[9px] font-mono font-bold bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg flex items-center gap-1 cursor-pointer border border-white/5"
              title="Flip Camera"
            >
              <RefreshCw className="w-2.5 h-2.5" />
              <span>Flip</span>
            </button>
            
            <button
              type="button"
              onClick={capturePhoto}
              className="px-3 py-1 text-[9px] font-bold bg-cyan-500 hover:bg-cyan-400 text-black rounded-lg flex items-center gap-1 cursor-pointer shadow-lg shadow-cyan-500/10 active:scale-95 transition-all"
            >
              <Camera className="w-3 h-3" />
              <span>Take Photo</span>
            </button>
          </div>
        </div>
      )}

      {/* CAPTURED SNAPSHOT ATTACHMENT PREVIEW */}
      {capturedPhoto && (
        <div className="bg-slate-900/80 border border-fuchsia-500/20 rounded-2xl p-2 mb-2.5 flex items-center gap-2 animate-fade-in z-10">
          <div className="relative w-12 h-10 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-black">
            <img src={capturedPhoto} alt="Snapshot attachment" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => setCapturedPhoto(null)}
              className="absolute -top-1 -right-1 p-0.5 rounded-full bg-rose-600 text-white cursor-pointer"
            >
              <X className="w-2 h-2" />
            </button>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[9px] font-mono font-bold text-fuchsia-400 uppercase tracking-wider">
              Photo Captured!
            </div>
            <p className="text-[8px] text-slate-400 truncate">
              Type an optional caption below and press Send!
            </p>
          </div>
          <button
            type="button"
            onClick={() => { setCapturedPhoto(null); setIsCameraActive(true); }}
            className="text-[8px] font-mono text-slate-400 hover:text-white underline cursor-pointer shrink-0"
          >
            Retake
          </button>
        </div>
      )}

      {/* Quick Reaction Tray */}
      <div className="border-t border-slate-800/60 pt-2 mb-2.5 flex items-center justify-between gap-2">
        <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider select-none shrink-0">
          Reactions:
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {REACTION_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => sendChatReaction(emoji)}
              className="text-base hover:scale-125 hover:-translate-y-0.5 transition-all active:scale-90 cursor-pointer p-0.5 rounded-lg hover:bg-slate-950 border border-transparent"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Input Tray */}
      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        {/* Camera Toggle Button */}
        <button
          type="button"
          onClick={toggleCamera}
          className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
            isCameraActive || capturedPhoto
              ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/20"
              : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700"
          }`}
          title="Toggle camera for reaction snap"
        >
          {isCameraActive ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
        </button>

        <input
          type="text"
          placeholder={capturedPhoto ? "Caption this photo..." : "Say something to the lounge..."}
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          maxLength={150}
          className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs placeholder-slate-600 text-white focus:outline-none focus:border-cyan-500"
        />
        
        <button
          type="submit"
          disabled={!chatInput.trim() && !capturedPhoto}
          className="w-9 h-9 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:hover:bg-cyan-500 text-black flex items-center justify-center transition-all active:scale-95 shrink-0 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* FULLSCREEN IMAGE ZOOM MODAL */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 animate-fade-in" 
          onClick={() => setSelectedImage(null)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-900 text-white border border-white/10 hover:bg-slate-850 cursor-pointer transition-all"
            onClick={() => setSelectedImage(null)}
          >
            <X className="w-5 h-5" />
          </button>
          <div 
            className="max-w-4xl max-h-[85vh] rounded-2xl overflow-hidden border border-white/10 bg-slate-950 shadow-2xl relative" 
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={selectedImage} 
              alt="Shared snap enlarged" 
              className="max-w-full max-h-[80vh] object-contain rounded-xl"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}
    </div>
  );
}
