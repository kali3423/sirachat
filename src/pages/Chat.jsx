import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useLocalAuth } from "@/lib/localAuth";
import { useI18n } from "@/lib/i18n";
import { useShell } from "@/lib/shell";
import MessageBubble from "@/components/MessageBubble";
import EmojiPicker from "@/components/EmojiPicker";
import AgoraCall from "@/components/AgoraCall";
import { UserAvatar, IconButton, EmptyState } from "@/components/sira";
import { SkeletonRow } from "@/components/sira/Skeleton";
import {
  Phone, Video, Smile, Paperclip, Send, Image as ImageIcon, ArrowLeft,
  Search, Loader2, X, Reply, Trash2, Check, Download, CheckCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Chat() {
  const { user: me, users } = useLocalAuth();
  const { t } = useI18n();
  const { setHideChrome, setBadge } = useShell();
  const contacts = users.filter((u) => u.username !== me?.username);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [callMode, setCallMode] = useState(null); // 'voice' | 'video' | null
  const [appId, setAppId] = useState("");
  const [search, setSearch] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState(new Set());
  const scrollRef = useRef(null);
  const fileRef = useRef(null);
  const imgRef = useRef(null);

  // Desktop shows both panes side by side, so default to the other contact.
  // Mobile stays on the list until the user taps in (full-screen conversation).
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)").matches;
    if (desktop && !active && contacts.length > 0) setActive(contacts[0]);
  }, [contacts, active]);

  // On mobile, an open conversation is full-screen: hide the app chrome.
  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 1023px)").matches;
    setHideChrome(!!active && mobile);
    return () => setHideChrome(false);
  }, [active, setHideChrome]);

  useEffect(() => {
    base44.entities.AppSetting.list().then((s) => {
      const settings = Array.isArray(s) ? s : (s ? [s] : []);
      if (settings.length > 0 && settings[0]) {
        setAppId(settings[0].agora_app_id || import.meta.env.VITE_AGORA_APP_ID || "");
      } else {
        setAppId(import.meta.env.VITE_AGORA_APP_ID || "");
      }
    }).catch(() => {
      setAppId(import.meta.env.VITE_AGORA_APP_ID || "");
    });
    base44.entities.Message.list("created_date", 500).then((msgs) => {
      setMessages(Array.isArray(msgs) ? msgs : []);
      setLoading(false);
    }).catch(() => setLoading(false));
    const unsub = base44.entities.Message.subscribe((event) => {
      setMessages((prev) => {
        if (event.type === "create") {
          if (prev.some((m) => m.id === event.id)) return prev;
          return [...prev, event.data].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
        }
        if (event.type === "update") {
          return prev.map((m) => (m.id === event.id ? { ...m, ...event.data } : m));
        }
        if (event.type === "delete") {
          return prev.filter((m) => m.id !== event.id);
        }
        return prev;
      });
    });
    return unsub;
  }, []);

  const conversation = active
    ? messages
        .filter(
          (m) =>
            (m.sender_name === me?.username && m.recipient === active.username) ||
            (m.sender_name === active.username && m.recipient === me?.username)
        )
        .sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
    : [];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [conversation.length]);

  // Total unread across contacts → drives the bottom-nav "Chats" badge.
  useEffect(() => {
    const unread = messages.filter((m) => m.recipient === me?.username && !m.read).length;
    setBadge("chats", unread);
  }, [messages, me?.username, setBadge]);

  const send = async (data) => {
    if (!active) return;
    setSending(true);
    try {
      await base44.entities.Message.create({
        sender_name: me?.username,
        recipient: active.username,
        ...(replyTo ? { reply_to: replyTo.id } : {}),
        ...data,
      });
      setReplyTo(null);
    } finally {
      setSending(false);
    }
  };

  const handleReact = async (message, emoji) => {
    const reactions =
      message.reactions && typeof message.reactions === "object"
        ? { ...message.reactions }
        : {};
    const rUsers = Array.isArray(reactions[emoji]) ? [...reactions[emoji]] : [];
    const idx = rUsers.indexOf(me?.username);
    if (idx >= 0) rUsers.splice(idx, 1);
    else rUsers.push(me?.username);
    if (rUsers.length === 0) delete reactions[emoji];
    else reactions[emoji] = rUsers;
    await base44.entities.Message.update(message.id, { reactions }).catch(() => {});
    setMessages((prev) =>
      prev.map((m) => (m.id === message.id ? { ...m, reactions } : m))
    );
  };

  useEffect(() => {
    if (!active) return;
    conversation
      .filter((m) => m.recipient === me?.username && m.sender_name === active.username && !m.read)
      .forEach((m) => base44.entities.Message.update(m.id, { read: true }).catch(() => {}));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.username, conversation.length]);

  const handleSend = () => {
    if (!text.trim()) return;
    send({ text: text.trim() });
    setText("");
    setShowEmoji(false);
  };

  const handleFile = async (e, isImage) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSending(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      if (isImage) await send({ image_url: file_url });
      else await send({ file_url, file_name: file.name, file_type: file.type || "file" });
    } finally {
      setSending(false);
      e.target.value = "";
    }
  };

  const toggleSelectMessage = (messageId) => {
    setSelectedMessages((prev) => {
      const next = new Set(prev);
      next.has(messageId) ? next.delete(messageId) : next.add(messageId);
      return next;
    });
  };

  const deleteSelectedMessages = async () => {
    if (selectedMessages.size === 0) return;
    try {
      await Promise.all(
        Array.from(selectedMessages).map((id) => base44.entities.Message.delete(id))
      );
      setSelectedMessages(new Set());
      setSelectMode(false);
    } catch {
      /* deletion best-effort; realtime will reconcile */
    }
  };

  const cancelSelection = () => {
    setSelectedMessages(new Set());
    setSelectMode(false);
  };

  const openConversation = (c) => setActive(c);
  const closeConversation = () => {
    setActive(null);
    setSelectMode(false);
    setSelectedMessages(new Set());
  };

  const preview = (m) =>
    m ? (m.text || (m.image_url ? "📷 Photo" : m.sticker ? m.sticker : m.file_name || "📎 File")) : null;

  const showConversation = !!active;
  const filteredContacts = contacts.filter((c) =>
    !search || (c.name + c.username).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-full bg-background">
      {/* Contacts list */}
      <aside
        className={cn(
          "flex shrink-0 flex-col border-r border-border bg-card",
          showConversation ? "hidden w-80 lg:flex" : "flex w-full lg:w-80"
        )}
      >
        <div className="px-4 pb-3 pt-5">
          <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground">
            {t("nav.chats")}
          </h1>
          <p className="text-xs text-muted-foreground">
            {contacts.length} contact{contacts.length !== 1 ? "s" : ""}
          </p>
          <div className="relative mt-3">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations…"
              className="h-11 w-full rounded-2xl border border-border bg-muted/50 pl-10 pr-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/15"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto scrollbar-thin px-2 pb-24 lg:pb-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
          ) : filteredContacts.length === 0 ? (
            <EmptyState emoji="🔍" title="No matches" description="No conversations match your search." className="mt-6" />
          ) : (
            filteredContacts.map((c) => {
              const thread = messages.filter(
                (m) =>
                  (m.sender_name === me?.username && m.recipient === c.username) ||
                  (m.sender_name === c.username && m.recipient === me?.username)
              );
              const last = thread.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];
              const unread = thread.filter((m) => m.recipient === me?.username && !m.read).length;
              const isActive = active?.username === c.username;
              return (
                <button
                  key={c.username}
                  onClick={() => openConversation(c)}
                  className={cn(
                    "relative flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors press",
                    isActive ? "bg-primary text-primary-foreground shadow-accent" : "hover:bg-muted"
                  )}
                >
                  <UserAvatar name={c.name || c.username} src={c.profile_image} size="lg" status="online" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-bold">{c.name}</p>
                      {last && (
                        <span className={cn("shrink-0 text-[10px] tabnums", isActive ? "text-primary-foreground/70" : "text-muted-foreground")}>
                          {new Date(last.created_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn("truncate text-xs", isActive ? "text-primary-foreground/85" : "text-muted-foreground")}>
                        {preview(last) || "Say hello 👋"}
                      </p>
                      {unread > 0 && !isActive && (
                        <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-unread px-1.5 text-[10px] font-bold text-white">
                          {unread > 99 ? "99+" : unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* Conversation pane */}
      <section className={cn("min-w-0 flex-1 flex-col", showConversation ? "flex" : "hidden lg:flex")}>
        {!active ? (
          <div className="flex h-full items-center justify-center p-8">
            <EmptyState emoji="💬" title="Select a conversation" description="Pick someone from the list to start chatting." />
          </div>
        ) : (
          <>
            {/* Header */}
            <header className="flex items-center justify-between gap-2 border-b border-border bg-card/95 px-3 py-2.5 backdrop-blur-md pt-safe">
              <div className="flex min-w-0 items-center gap-2.5">
                <IconButton variant="ghost" size="md" onClick={closeConversation} className="lg:hidden" aria-label="Back">
                  <ArrowLeft className="h-5 w-5" />
                </IconButton>
                {selectMode ? (
                  <div className="flex items-center gap-2">
                    <IconButton variant="ghost" size="md" onClick={cancelSelection} aria-label="Cancel">
                      <X className="h-5 w-5" />
                    </IconButton>
                    <p className="text-sm font-bold text-foreground tabnums">{selectedMessages.size} selected</p>
                  </div>
                ) : (
                  <>
                    <UserAvatar name={active.name || active.username} src={active.profile_image} size="md" status="online" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-foreground">{active.name}</p>
                      <p className="flex items-center gap-1.5 truncate text-xs font-medium text-success">
                        <span className="h-1.5 w-1.5 rounded-full bg-online" />
                        {t("chat.online").replace("● ", "")}
                      </p>
                    </div>
                  </>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                {selectMode ? (
                  <button
                    onClick={deleteSelectedMessages}
                    disabled={selectedMessages.size === 0}
                    className="flex items-center gap-1.5 rounded-full bg-danger px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition press disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                ) : (
                  <>
                    <IconButton variant="ghost" size="md" onClick={() => setSelectMode(true)} aria-label="Select messages">
                      <Trash2 className="h-[18px] w-[18px]" />
                    </IconButton>
                    <IconButton variant="primary-soft" size="md" onClick={() => setCallMode("voice")} aria-label="Voice call">
                      <Phone className="h-[18px] w-[18px]" />
                    </IconButton>
                    <IconButton variant="primary-soft" size="md" onClick={() => setCallMode("video")} aria-label="Video call">
                      <Video className="h-[18px] w-[18px]" />
                    </IconButton>
                  </>
                )}
              </div>
            </header>

            {/* Messages */}
            <div ref={scrollRef} className="min-h-0 flex-1 space-y-3.5 overflow-y-auto scrollbar-thin bg-muted/20 px-4 py-5 sm:px-6">
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : conversation.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <EmptyState emoji="👋" title="No messages yet" description={`Say hello to ${active.name}!`} />
                </div>
              ) : (
                conversation.map((m) => (
                  <div key={m.id} className="relative">
                    {selectMode && (
                      <div className="absolute -left-1 top-1/2 z-10 -translate-y-1/2">
                        <button
                          onClick={() => toggleSelectMessage(m.id)}
                          className={cn(
                            "flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors",
                            selectedMessages.has(m.id) ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"
                          )}
                        >
                          {selectedMessages.has(m.id) && <Check className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    )}
                    <div onClick={() => selectMode && toggleSelectMessage(m.id)} className={cn(selectMode && "pl-7")}>
                      <MessageBubble
                        message={m}
                        isMine={m.sender_name === me?.username}
                        messages={conversation}
                        currentUsername={me?.username}
                        onImageClick={(msg) => !selectMode && setPreviewImage(msg)}
                        onReply={(msg) => !selectMode && setReplyTo(msg)}
                        onReact={(msg, emoji) => !selectMode && handleReact(msg, emoji)}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Composer */}
            <div className="border-t border-border bg-card px-3 py-3 pb-safe sm:px-4">
              <AnimatePresence>
                {replyTo && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-2 flex items-center gap-3 rounded-xl border-l-[3px] border-primary bg-primary-soft px-3 py-2"
                  >
                    <Reply className="h-4 w-4 shrink-0 text-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold text-primary">
                        Reply to {replyTo.sender_name === me?.username ? "yourself" : replyTo.sender_name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{preview(replyTo)}</p>
                    </div>
                    <button onClick={() => setReplyTo(null)} className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted">
                      <X className="h-4 w-4" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {sending && (
                <div className="mb-2 flex items-center gap-2.5 rounded-xl bg-muted/60 px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-1/2 animate-[sira-shimmer_1.2s_infinite] rounded-full bg-primary/70" />
                  </div>
                </div>
              )}

              <AnimatePresence>
                {showEmoji && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="mb-2"
                  >
                    <EmojiPicker
                      onPickEmoji={(e) => setText((v) => v + e)}
                      onPickSticker={(s) => {
                        send({ sticker: s });
                        setShowEmoji(false);
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-end gap-1.5">
                <IconButton
                  variant={showEmoji ? "primary" : "soft"}
                  size="md"
                  onClick={() => setShowEmoji((v) => !v)}
                  aria-label="Emoji"
                >
                  <Smile className="h-5 w-5" />
                </IconButton>
                <IconButton variant="soft" size="md" onClick={() => imgRef.current?.click()} aria-label="Send image">
                  <ImageIcon className="h-5 w-5" />
                </IconButton>
                <IconButton variant="soft" size="md" onClick={() => fileRef.current?.click()} aria-label="Attach file">
                  <Paperclip className="h-5 w-5" />
                </IconButton>
                <input ref={imgRef} type="file" accept="image/*" hidden onChange={(e) => handleFile(e, true)} />
                <input ref={fileRef} type="file" accept="application/pdf,.pdf" hidden onChange={(e) => handleFile(e, false)} />

                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  rows={1}
                  placeholder="Type a message…"
                  className="max-h-32 min-h-[44px] flex-1 resize-none rounded-3xl border border-border bg-muted/50 px-4 py-3 text-sm outline-none transition scrollbar-thin placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/15"
                />
                <IconButton
                  variant="primary"
                  size="md"
                  onClick={handleSend}
                  disabled={!text.trim() || sending}
                  aria-label="Send"
                >
                  <Send className="h-[18px] w-[18px]" />
                </IconButton>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Image lightbox */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-sm"
            onClick={() => setPreviewImage(null)}
          >
            <div
              className="flex items-center gap-3 border-b border-white/10 px-4 py-3 pt-safe"
              onClick={(e) => e.stopPropagation()}
            >
              <IconButton variant="glass" size="md" onClick={() => setPreviewImage(null)} aria-label="Close">
                <X className="h-5 w-5" />
              </IconButton>
              <div className="flex min-w-0 flex-1 items-center gap-2.5">
                <UserAvatar name={previewImage.sender_name} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-white">
                    {previewImage.sender_name === me?.username ? "You" : previewImage.sender_name}
                  </p>
                  <p className="text-xs text-white/60">
                    {new Date(previewImage.created_date).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
              <a
                href={previewImage.image_url}
                download
                onClick={(e) => e.stopPropagation()}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              >
                <Download className="h-5 w-5" />
              </a>
            </div>

            <div className="flex flex-1 items-center justify-center p-6" onClick={(e) => e.stopPropagation()}>
              <motion.img
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                src={previewImage.image_url}
                alt="preview"
                className="max-h-[78vh] max-w-full rounded-2xl object-contain shadow-2xl"
              />
            </div>

            <div className="flex items-center justify-center border-t border-white/10 px-6 py-4 pb-safe" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => {
                  setReplyTo(previewImage);
                  setPreviewImage(null);
                }}
                className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-accent transition press"
              >
                <Reply className="h-4 w-4" /> Reply
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Call overlay */}
      {callMode && <AgoraCall mode={callMode} appId={appId} onEnd={() => setCallMode(null)} />}
    </div>
  );
}
