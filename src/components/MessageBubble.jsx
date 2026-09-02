import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image } from "@/components/ui/image";
import { FileText, Download, Loader2, Reply, Check, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

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

  const isStickerOnly = message.sticker && !message.text && !message.image_url && !message.file_url;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 30, mass: 0.7 }}
      className={cn("group relative flex", isMine ? "justify-end" : "justify-start")}
    >
      {/* Quick reactions / reply popup */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 8 }}
            transition={{ type: "spring", stiffness: 500, damping: 32 }}
            className={cn(
              "absolute -top-[52px] z-30 flex items-center gap-0.5 rounded-2xl border border-border bg-popover px-1.5 py-1 shadow-float",
              isMine ? "right-0" : "left-0"
            )}
          >
            {QUICK_REACTIONS.map((e) => (
              <button
                key={e}
                onClick={() => {
                  onReact?.(message, e);
                  setShowActions(false);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-xl transition-transform hover:scale-125 hover:bg-muted press"
                style={{ fontFamily: EMOJI_FONT }}
              >
                {e}
              </button>
            ))}
            <div className="mx-0.5 h-6 w-px bg-border" />
            <button
              onClick={() => {
                onReply?.(message);
                setShowActions(false);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-primary transition-colors hover:bg-primary-soft press"
              title="Reply"
            >
              <Reply className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        onPointerDown={startPress}
        onPointerUp={cancelPress}
        onPointerLeave={cancelPress}
        onContextMenu={(e) => {
          e.preventDefault();
          setShowActions((v) => !v);
        }}
        className={cn(
          "relative max-w-[80%] sm:max-w-[68%] px-3.5 py-2.5 shadow-sm transition-shadow",
          isStickerOnly
            ? "bg-transparent px-1 py-0 shadow-none"
            : isMine
            ? "rounded-[20px] rounded-br-md bg-primary text-primary-foreground"
            : "rounded-[20px] rounded-bl-md border border-border bg-card text-foreground"
        )}
      >
        {replied && (
          <div
            className={cn(
              "mb-2 rounded-xl border-l-[3px] px-2.5 py-1.5",
              isMine
                ? "border-primary-foreground/50 bg-primary-foreground/15"
                : "border-primary bg-primary-soft"
            )}
          >
            <p className={cn("text-[11px] font-bold", isMine ? "text-primary-foreground/95" : "text-primary")}>
              {replied.sender_name === currentUsername ? "You" : replied.sender_name}
            </p>
            <p className={cn("mt-0.5 truncate text-[11px]", isMine ? "text-primary-foreground/80" : "text-muted-foreground")}>
              {replied.text || (replied.image_url ? "📷 Photo" : replied.file_name || "📎 File")}
            </p>
          </div>
        )}

        {!isMine && !isStickerOnly && (
          <p className="mb-0.5 text-[11px] font-bold text-primary">
            {message.sender_name || "Friend"}
          </p>
        )}

        {message.sticker && (
          <div className="py-1 text-6xl leading-none" style={{ fontFamily: EMOJI_FONT }}>
            {message.sticker}
          </div>
        )}

        {message.image_url && (
          <div className="relative mb-1.5 overflow-hidden rounded-2xl">
            <button
              onClick={() => onImageClick?.(message)}
              className="block w-full press"
            >
              <Image
                src={message.image_url}
                alt="shared"
                className="max-h-80 w-full rounded-2xl object-cover"
                fittingType="fit"
                onLoad={() => setImgLoaded(true)}
              />
            </button>
            {!imgLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
          </div>
        )}

        {message.file_url && (
          <a
            href={message.file_url}
            target="_blank"
            rel="noreferrer"
            className={cn(
              "mb-1.5 flex items-center gap-3 rounded-xl p-2.5 transition-colors press",
              isMine ? "bg-primary-foreground/15 hover:bg-primary-foreground/25" : "bg-muted hover:bg-muted/70"
            )}
          >
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                isMine ? "bg-primary-foreground/25" : "bg-danger/12 text-danger"
              )}
            >
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{message.file_name || "Document"}</p>
              <p className={cn("text-xs", isMine ? "text-primary-foreground/75" : "text-muted-foreground")}>
                {message.file_type || "file"}
              </p>
            </div>
            <Download className={cn("h-4 w-4 shrink-0", isMine ? "text-primary-foreground/80" : "text-muted-foreground")} />
          </a>
        )}

        {message.text && (
          <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">
            {message.text}
          </p>
        )}

        {!isStickerOnly && (
          <span
            className={cn(
              "mt-1 flex items-center justify-end gap-1 text-[10px] font-medium tabnums",
              isMine ? "text-primary-foreground/70" : "text-muted-foreground"
            )}
          >
            {new Date(message.created_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            {isMine &&
              (message.read ? (
                <CheckCheck className="h-3.5 w-3.5 text-primary-foreground" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              ))}
          </span>
        )}
      </div>

      {/* Reactions display */}
      {activeReactions.length > 0 && (
        <div className={cn("absolute -bottom-3 flex flex-wrap gap-1", isMine ? "right-2" : "left-2")}>
          {activeReactions.map(([emoji, users]) => (
            <span
              key={emoji}
              className="flex items-center gap-1 rounded-full border border-border bg-popover px-1.5 py-0.5 text-sm shadow-sm"
              style={{ fontFamily: EMOJI_FONT }}
            >
              {emoji}
              <span className="text-[10px] font-bold text-primary tabnums">{users.length}</span>
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
