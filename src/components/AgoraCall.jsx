import React, { useEffect, useRef, useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import { Phone, Mic, MicOff, VideoOff, Video, Loader2, PhoneOff, Monitor, Settings, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CHANNEL = "sira-chat-room";

export default function AgoraCall({ mode, appId, onEnd }) {
  const [seconds, setSeconds] = useState(0);
  const [status, setStatus] = useState(appId ? "connecting" : "noappid");
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [speakerOff, setSpeakerOff] = useState(false);
  const [remote, setRemote] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const clientRef = useRef(null);
  const audioRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    let active = true;
    const client = appId ? AgoraRTC.createClient({ mode: "rtc", codec: "vp8" }) : null;
    clientRef.current = client;

    (async () => {
      if (!client) return;
      client.on("user-published", async (user, mediaType) => {
        try {
          await client.subscribe(user, mediaType);
          if (mediaType === "video") {
            user.videoTrack.play(remoteVideoRef.current);
            setRemote(true);
          } else {
            user.audioTrack.play();
          }
        } catch {}
      });
      client.on("user-unpublished", (user, mediaType) => {
        if (mediaType === "video") setRemote(false);
      });
      client.on("user-left", () => setRemote(false));

      try {
        await client.join(appId, CHANNEL, null, null);
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        audioRef.current = audioTrack;
        const tracks = [audioTrack];
        if (mode === "video") {
          const vTrack = await AgoraRTC.createCameraVideoTrack();
          videoRef.current = vTrack;
          vTrack.play(localVideoRef.current);
          tracks.push(vTrack);
        }
        await client.publish(tracks);
        if (active) setStatus("connected");
      } catch {
        if (active) setStatus("error");
      }
    })();

    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return async () => {
      active = false;
      clearInterval(timer);
      try {
        if (audioRef.current) audioRef.current.close();
        if (videoRef.current) videoRef.current.close();
        if (client) await client.leave();
      } catch {}
    };
  }, []);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const toggleMute = () => {
    const a = audioRef.current;
    if (!a) return;
    a.setEnabled(muted);
    setMuted(!muted);
  };

  const toggleCam = () => {
    const v = videoRef.current;
    if (!v) return;
    v.setEnabled(camOff);
    setCamOff(!camOff);
  };

  const toggleSpeaker = () => {
    setSpeakerOff(!speakerOff);
    // Toggle audio output mute/unmute would go here if needed
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#1a1a1a]">
      {/* Top Bar - Discord Style */}
      <div className="flex items-center justify-between border-b border-gray-800 bg-[#111111] px-6 py-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Sira Chat" className="h-8 w-8" />
            <div>
              <h2 className="text-sm font-semibold text-white">Voice Channel</h2>
              <p className="text-xs text-gray-400">
                {mode === "video" ? "Video Call" : "Voice Call"} · {fmt(seconds)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <AnimatePresence mode="wait">
            {status === "connecting" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 rounded-lg bg-yellow-500/10 px-3 py-1.5 text-xs text-yellow-400"
              >
                <Loader2 className="h-3 w-3 animate-spin" /> Connecting...
              </motion.div>
            )}
            {status === "connected" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-400"
              >
                <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                Connected {remote && "· 2 participants"}
              </motion.div>
            )}
            {status === "error" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs text-red-400"
              >
                Connection error
              </motion.div>
            )}
            {status === "noappid" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs text-red-400"
              >
                No Agora App ID
              </motion.div>
            )}
          </AnimatePresence>

          <button className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-800 hover:text-white">
            <Users className="h-5 w-5" />
          </button>
          <button className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-800 hover:text-white">
            <Monitor className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        {mode === "video" ? (
          <>
            {/* Remote Video (Main) */}
            <div className="absolute inset-0">
              <div
                ref={remoteVideoRef}
                className="h-full w-full bg-[#1a1a1a]"
                style={{ display: remote ? "block" : "none" }}
              />
              {!remote && (
                <div className="flex h-full w-full items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-32 w-32 items-center justify-center rounded-full bg-[#2a2a2a]">
                      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#FF4D00] text-3xl font-bold text-white">
                        U
                      </div>
                    </div>
                    <p className="text-lg font-semibold text-white">Waiting for participant...</p>
                    <p className="text-sm text-gray-400">Invite someone to start the call</p>
                  </div>
                </div>
              )}
            </div>

            {/* Local Video (Picture-in-Picture) */}
            <div className="absolute bottom-6 right-6 z-10">
              <div className="relative overflow-hidden rounded-xl border-2 border-gray-700 bg-[#1a1a1a] shadow-2xl">
                <div
                  ref={localVideoRef}
                  className="h-44 w-64"
                  style={{ display: camOff ? "none" : "block" }}
                />
                {camOff && (
                  <div className="flex h-44 w-64 items-center justify-center bg-[#1a1a1a]">
                    <div className="text-center">
                      <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-[#2a2a2a]">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FF4D00] text-sm font-bold text-white">
                          Y
                        </div>
                      </div>
                      <p className="text-xs text-gray-400">Camera Off</p>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1 text-xs text-white backdrop-blur-sm">
                  You
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Voice Call View */
          <div className="flex items-center justify-center">
            <div className="text-center">
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  boxShadow: [
                    "0 0 0 0px rgba(255, 77, 0, 0.4)",
                    "0 0 0 20px rgba(255, 77, 0, 0)",
                    "0 0 0 0px rgba(255, 77, 0, 0.4)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mx-auto mb-6 flex h-40 w-40 items-center justify-center rounded-full bg-[#2a2a2a]"
              >
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-[#FF4D00] text-4xl font-bold text-white">
                  <Phone className="h-16 w-16" />
                </div>
              </motion.div>
              <h3 className="mb-2 text-2xl font-bold text-white">Voice Connected</h3>
              <p className="text-gray-400">{remote ? "In call with participant" : "Waiting for participant..."}</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Control Bar - Discord Style */}
      <div className="border-t border-gray-800 bg-[#111111] px-6 py-4">
        <div className="flex items-center justify-center gap-3">
          {/* Microphone Toggle */}
          <button
            onClick={toggleMute}
            className={`group relative flex h-12 w-12 items-center justify-center rounded-lg transition-all ${
              muted
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]"
            }`}
            title={muted ? "Unmute" : "Mute"}
          >
            {muted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            <div className="absolute -top-8 hidden rounded bg-black px-2 py-1 text-xs text-white group-hover:block">
              {muted ? "Unmute" : "Mute"}
            </div>
          </button>

          {/* Camera Toggle (Video only) */}
          {mode === "video" && (
            <button
              onClick={toggleCam}
              className={`group relative flex h-12 w-12 items-center justify-center rounded-lg transition-all ${
                camOff
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]"
              }`}
              title={camOff ? "Turn on camera" : "Turn off camera"}
            >
              {camOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
              <div className="absolute -top-8 hidden rounded bg-black px-2 py-1 text-xs text-white group-hover:block">
                {camOff ? "Turn on camera" : "Turn off camera"}
              </div>
            </button>
          )}

          {/* Settings */}
          <button
            className="group relative flex h-12 w-12 items-center justify-center rounded-lg bg-[#2a2a2a] text-white transition-all hover:bg-[#3a3a3a]"
            title="Settings"
          >
            <Settings className="h-5 w-5" />
            <div className="absolute -top-8 hidden rounded bg-black px-2 py-1 text-xs text-white group-hover:block">
              Settings
            </div>
          </button>

          {/* Disconnect Button */}
          <button
            onClick={onEnd}
            className="group relative flex h-12 w-12 items-center justify-center rounded-lg bg-red-500 text-white transition-all hover:bg-red-600"
            title="Disconnect"
          >
            <PhoneOff className="h-5 w-5" />
            <div className="absolute -top-8 hidden rounded bg-black px-2 py-1 text-xs text-white group-hover:block">
              Disconnect
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
