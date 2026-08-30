import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image } from "@/components/ui/image";
import { FileText, Download, Loader2, Reply, Check, CheckCheck, Smile } from "lucide-react";

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏", "🔥", "🎉"];
const EMOJI_FONT = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji","Segoe UI Symbol"';

export default function MessageBubble({
  message,
  isMine,
  messages,
  currentUsername,
  onImageClick,
  onReply,
  onReact,
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const hasContent =
    message.text || message.image_url || message.file_url || message.sticker;

  if (!hasContent) return null;

  const replied = message.reply_to
    ? messages?.find((m) => m.id === message.reply_to)
    : null;
  const reactions =
    message.reactions && typeof message.reactions === "object"
      ? message.reactions
      : {};
  const activeReactions = Object.entries(reactions).filter(
    ([, users]) => Array.isArray(users) && users.length > 0
  );

  let pressTimer = null;
  const startPress = () => {
    pressTimer = setTimeout(() => setShowActions((v) => !v), 450);
  };
  const cancelPress = () => {
    if (pressTimer) clearTimeout(pressTimer);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 380, 
        damping: 28, 
        mass: 0.8,
        delay: 0.05 
      }}
      className={`group relative flex ${isMine ? "justify-end" : "justify-start"}`}
    >
      {/* Quick reactions popup */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 10 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className={`absolute z-30 ${isMine ? "right-0" : "left-0"} -top-14 flex items-center gap-1 rounded-2xl border border-orange-200/50 bg-white/95 px-2 py-1.5 shadow-2xl shadow-[#FF4D00]/20 backdrop-blur-xl dark:border-amber-800/50 dark:bg-gray-900/95`}
          >
            {QUICK_REACTIONS.map((e, i) => (
              <motion.button
                key={e}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03, type: "spring", stiffness: 500, damping: 25 }}
                whileHover={{ scale: 1.3, rotate: 10 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  onReact?.(message, e);
                  setShowActions(false);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-xl transition-all hover:bg-gradient-to-br hover:from-orange-50 hover:to-orange-50 dark:hover:from-amber-900/30 dark:hover:to-amber-900/30"
                style={{ fontFamily: EMOJI_FONT }}
              >
                {e}
              </motion.button>
            ))}
            <div className="mx-1 h-6 w-px bg-amber-200 dark:bg-amber-800" />
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: QUICK_REACTIONS.length * 0.03, type: "spring", stiffness: 500, damping: 25 }}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                onReply?.(message);
                setShowActions(false);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-[#FF4D00] transition-all hover:bg-gradient-to-br hover:from-orange-50 hover:to-orange-50 dark:text-[#FF8047] dark:hover:from-amber-900/30 dark:hover:to-amber-900/30"
              title="Reply"
            >
              <Reply className="h-4 w-4" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        whileHover={{ scale: 1.01 }}
        onPointerDown={startPress}
        onPointerUp={cancelPress}
        onPointerLeave={cancelPress}
        onContextMenu={(e) => {
          e.preventDefault();
          setShowActions((v) => !v);
        }}
        className={`relative max-w-[78%] sm:max-w-[70%] ${
          isMine
            ? "rounded-[20px] rounded-br-[6px] bg-gradient-to-br from-orange-500 via-amber-600 to-[#FF6B2C] text-white shadow-lg shadow-[#FF4D00]/30"
            : "rounded-[20px] rounded-bl-[6px] bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 text-gray-900 shadow-md dark:from-gray-800 dark:via-gray-800 dark:to-gray-700 dark:text-gray-100"
        } overflow-hidden px-4 py-2.5 transition-all duration-300 group-hover:shadow-xl ${
          isMine ? "group-hover:shadow-[#FF4D00]/40" : "group-hover:shadow-gray-300/40 dark:group-hover:shadow-gray-900/60"
        }`}
      >
        {replied && (
          <motion.div
            initial={{ opacity: 0, x: isMine ? 10 : -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={`mb-2 rounded-xl border-l-4 px-3 py-2 ${
              isMine 
                ? "border-white/60 bg-white/15 backdrop-blur-sm" 
                : "border-[#FF8047] bg-orange-50/80 dark:border-amber-600 dark:bg-amber-900/30"
            }`}
          >
            <p
              className={`text-xs font-bold ${
                isMine ? "text-white/95" : "text-[#CC3D00] dark:text-[#FF8047]"
              }`}
            >
              {replied.sender_name === currentUsername ? "You" : replied.sender_name}
            </p>
            <p
              className={`mt-0.5 truncate text-xs ${
                isMine ? "text-white/85" : "text-gray-600 dark:text-gray-400"
              }`}
            >
              {replied.text ||
                (replied.image_url ? " Photo" : replied.file_name || "📎 File")}
            </p>
          </motion.div>
        )}

        {!isMine && (
          <p className="mb-1 text-xs font-bold text-[#FF4D00] dark:text-[#FF8047]">
            {message.sender_name || "Friend"}
          </p>
        )}

        {message.sticker && (
          <motion.div
            initial={{ scale: 0.5, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="py-2 text-7xl leading-none"
            style={{ fontFamily: EMOJI_FONT }}
          >
            {message.sticker}
          </motion.div>
        )}

        {message.image_url && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="relative mb-1.5 overflow-hidden rounded-2xl"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onImageClick?.(message)}
              className="block w-full"
            >
              <Image
                src={message.image_url}
                alt="shared"
                className="max-h-80 w-full rounded-2xl object-cover"
                fittingType="fit"
                onLoad={() => setImgLoaded(true)}
              />
            </motion.button>
            {!imgLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                <Loader2 className="h-6 w-6 animate-spin text-[#FF4D00]" />
              </div>
            )}
            {/* iOS-style image overlay gradient */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-t from-black/10 via-transparent to-transparent" />
          </motion.div>
        )}

        {message.file_url && (
          <motion.a
            href={message.file_url}
            target="_blank"
            rel="noreferrer"
            whileHover={{ scale: 1.02, x: 2 }}
            whileTap={{ scale: 0.98 }}
            className={`mb-1.5 flex items-center gap-3 rounded-xl p-3 transition-all ${
              isMine 
                ? "bg-white/20 hover:bg-white/30 backdrop-blur-sm" 
                : "bg-gradient-to-br from-orange-50 to-orange-50 hover:from-orange-100 hover:to-orange-100 dark:from-amber-900/20 dark:to-amber-900/20 dark:hover:from-amber-900/30 dark:hover:to-amber-900/30"
            }`}
          >
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                isMine 
                  ? "bg-white/30 shadow-inner" 
                  : "bg-gradient-to-br from-red-500 to-[#FF6B2C] text-white shadow-lg"
              }`}
            >
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {message.file_name || "Document"}
              </p>
              <p className={`text-xs ${isMine ? "text-white/75" : "text-gray-500 dark:text-gray-400"}`}>
                {message.file_type || "file"}
              </p>
            </div>
            <Download className={`h-5 w-5 ${isMine ? "text-white/80" : "text-gray-400"}`} />
          </motion.a>
        )}

        {message.text && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="whitespace-pre-wrap break-words text-[15px] leading-relaxed"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
          >
            {message.text}
          </motion.p>
        )}

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className={`mt-1.5 flex items-center justify-end gap-1.5 text-right text-[11px] font-medium ${
            isMine ? "text-white/70" : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {new Date(message.created_date).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
          {isMine &&
            (message.read ? (
              <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
              >
                <CheckCheck className="h-3.5 w-3.5 text-amber-300" />
              </motion.div>
            ) : (
              <Check className="h-3.5 w-3.5" />
            ))}
        </motion.p>
      </motion.div>

      {/* Reactions display */}
      {activeReactions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className={`absolute -bottom-3 flex flex-wrap gap-1 ${isMine ? "right-2" : "left-2"}`}
        >
          {activeReactions.map(([emoji, users]) => (
            <motion.span
              key={emoji}
              whileHover={{ scale: 1.15, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1 rounded-full border border-orange-200/50 bg-white/95 px-2 py-0.5 text-sm shadow-lg shadow-[#FF4D00]/10 backdrop-blur-xl transition-all hover:shadow-xl dark:border-amber-800/50 dark:bg-gray-900/95"
              style={{ fontFamily: EMOJI_FONT }}
            >
              {emoji}
              <span className="text-[11px] font-semibold text-[#FF4D00] dark:text-[#FF8047]">
                {users.length}
              </span>
            </motion.span>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}