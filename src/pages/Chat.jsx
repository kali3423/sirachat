import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useLocalAuth } from "@/lib/localAuth";
import MessageBubble from "@/components/MessageBubble";
import EmojiPicker from "@/components/EmojiPicker";
import { Phone, Video, Smile, Paperclip, Send, Image as ImageIcon, ArrowLeft, Search, Loader2, X, Reply, Trash2, Check } from "lucide-react";
import T from "@/components/T";
import AgoraCall from "@/components/AgoraCall";
import { motion, AnimatePresence } from "framer-motion";

export default function Chat() {
  const { user: me, users } = useLocalAuth();
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

  // With two users, default to the other contact.
  useEffect(() => {
    if (!active && contacts.length > 0) setActive(contacts[0]);
  }, [contacts, active]);

  useEffect(() => {
    base44.entities.AppSetting.list().then((s) => {
      if (s && s[0]) setAppId(s[0].agora_app_id || "");
    }).catch(() => {});
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
    const users = Array.isArray(reactions[emoji]) ? [...reactions[emoji]] : [];
    const idx = users.indexOf(me?.username);
    if (idx >= 0) users.splice(idx, 1);
    else users.push(me?.username);
    if (users.length === 0) delete reactions[emoji];
    else reactions[emoji] = users;
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
    setSelectedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const deleteSelectedMessages = async () => {
    if (selectedMessages.size === 0) return;
    try {
      await Promise.all(
        Array.from(selectedMessages).map(id => base44.entities.Message.delete(id))
      );
      setSelectedMessages(new Set());
      setSelectMode(false);
    } catch (error) {
      console.error("Error deleting messages:", error);
    }
  };

  const cancelSelection = () => {
    setSelectedMessages(new Set());
    setSelectMode(false);
  };

  const showConversation = !!active;
  const filteredContacts = contacts.filter((c) =>
    !search || (c.name + c.username).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-full bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Contacts sidebar */}
      <div className={`shrink-0 border-r border-orange-100/50 bg-white/80 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/80 ${showConversation ? "hidden w-80 lg:block" : "block w-full lg:w-80"}`}>
        <div className="px-5 pb-2 pt-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="bg-gradient-to-r from-amber-600 to-[#FF6B2C] bg-clip-text text-xl font-black tracking-tight text-transparent dark:from-[#FF8047] dark:to-amber-400">
                <T k="nav.chat" />
              </h1>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {contacts.length} contact{contacts.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="relative mt-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="h-11 w-full rounded-2xl border border-orange-100 bg-gradient-to-br from-gray-50 to-white pl-11 pr-4 text-sm font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-orange-300 focus:shadow-lg focus:shadow-[#FF4D00]/10 dark:border-gray-700 dark:from-gray-800 dark:to-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
            />
          </div>
        </div>
        <div className="scrollbar-thin scrollbar-thumb-amber-200 scrollbar-track-transparent space-y-1 overflow-y-auto px-3 pb-4 dark:scrollbar-thumb-amber-900">
          {filteredContacts.map((c, index) => {
            const last = messages
              .filter(
                (m) =>
                  (m.sender_name === me?.username && m.recipient === c.username) ||
                  (m.sender_name === c.username && m.recipient === me?.username)
              )
              .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];
            const isActive = active?.username === c.username;
            return (
              <motion.div
                key={c.username}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 400, 
                  damping: 30, 
                  delay: index * 0.05 
                }}
              >
                <motion.button
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActive(c)}
                  className={`relative flex w-full items-center gap-3 overflow-hidden rounded-2xl px-4 py-3 text-left transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-orange-500 to-orange-500 shadow-lg shadow-[#FF4D00]/30 dark:from-amber-600 dark:to-[#FF6B2C]"
                      : "hover:bg-gradient-to-br hover:from-gray-50 hover:to-orange-50/50 dark:hover:from-gray-800 dark:hover:to-gray-800"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeContact"
                      className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-500"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <div className="relative z-10">
                    <div className="relative">
                      {c.profile_image ? (
                        <img 
                          src={c.profile_image} 
                          alt="" 
                          className="h-12 w-12 rounded-full object-cover ring-2 ring-white/50 dark:ring-gray-700" 
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 via-teal-500 to-orange-500 text-lg font-bold text-white shadow-lg">
                          {(c.name || c.username).charAt(0).toUpperCase()}
                        </div>
                      )}
                      <motion.span 
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 shadow-lg dark:border-gray-900" 
                      />
                    </div>
                  </div>
                  <div className={`relative z-10 min-w-0 flex-1 ${isActive ? "text-white" : ""}`}>
                    <p className="truncate text-sm font-bold">
                      {c.name}
                    </p>
                    <p className={`truncate text-xs ${isActive ? "text-white/90" : "text-gray-500 dark:text-gray-400"}`}>
                      {last ? (last.text || (last.image_url ? " Photo" : last.file_name || "📎 File")) : "Say hello 👋"}
                    </p>
                  </div>
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Conversation pane */}
      <div className={`min-w-0 flex-1 flex-col ${showConversation ? "flex" : "hidden lg:flex"}`}>
        {!active ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-3 text-5xl">💬</div>
            <p className="text-sm font-medium text-foreground">Select a contact</p>
            <p className="text-xs text-muted-foreground">Pick someone to start chatting.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-orange-100/50 bg-white/90 px-5 py-4 shadow-sm backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/90">
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.1, rotate: -90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setActive(null)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 transition-all hover:shadow-lg dark:from-gray-800 dark:to-gray-700 dark:text-gray-300 lg:hidden"
                >
                  <ArrowLeft className="h-5 w-5" />
                </motion.button>
                {selectMode ? (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={cancelSelection}
                      className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      <X className="h-4 w-4" /> Cancel
                    </motion.button>
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                      {selectedMessages.size} selected
                    </p>
                  </>
                ) : (
                  <>
                    <div className="relative">
                      {active.profile_image ? (
                        <img 
                          src={active.profile_image} 
                          alt="" 
                          className="h-11 w-11 rounded-full object-cover ring-2 ring-orange-200 dark:ring-amber-900" 
                        />
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 via-teal-500 to-orange-500 text-lg font-bold text-white shadow-lg ring-2 ring-emerald-200 dark:ring-emerald-900">
                          {(active.name || active.username).charAt(0).toUpperCase()}
                        </div>
                      )}
                      <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 shadow-lg dark:border-gray-900"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-gray-900 dark:text-gray-100">
                        {active.name}
                      </p>
                      <p className="flex items-center gap-1.5 truncate text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <motion.span
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="h-2 w-2 rounded-full bg-emerald-500"
                        />
                        <T k="chat.online" />
                      </p>
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {selectMode ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={deleteSelectedMessages}
                    disabled={selectedMessages.size === 0}
                    className="flex items-center gap-2 rounded-full bg-gradient-to-r from-red-500 to-red-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="h-4 w-4" /> Delete ({selectedMessages.size})
                  </motion.button>
                ) : (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectMode(true)}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 transition-all hover:shadow-lg dark:from-gray-800 dark:to-gray-700 dark:text-gray-300"
                      title="Select messages"
                    >
                      <Trash2 className="h-4 w-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 15 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCallMode("voice")}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#FF8047] to-orange-500 text-white shadow-lg shadow-[#FF4D00]/30 transition-all hover:shadow-xl hover:shadow-[#FF4D00]/40"
                      title="Voice call"
                    >
                      <Phone className="h-4 w-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: -15 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCallMode("video")}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-[#FF6B2C] text-white shadow-lg shadow-[#FF4D00]/30 transition-all hover:shadow-xl hover:shadow-[#FF4D00]/40"
                      title="Video call"
                    >
                      <Video className="h-4 w-4" />
                    </motion.button>
                  </>
                )}
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-5 sm:px-6">
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="h-7 w-7 animate-spin rounded-full border-2 border-orange-200 border-t-amber-600" />
                </div>
              ) : conversation.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="mb-3 text-5xl">💬</div>
                  <p className="text-sm font-medium text-foreground">No messages yet</p>
                  <p className="text-xs text-muted-foreground">Say hello to {active.name}!</p>
                </div>
              ) : (
                conversation.map((m) => (
                  <div key={m.id} className="relative">
                    {selectMode && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="absolute -left-2 top-1/2 z-10 -translate-x-full -translate-y-1/2"
                      >
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => toggleSelectMessage(m.id)}
                          className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${
                            selectedMessages.has(m.id)
                              ? "border-[#FF4D00] bg-[#FF4D00] text-white"
                              : "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800"
                          }`}
                        >
                          {selectedMessages.has(m.id) && <Check className="h-4 w-4" />}
                        </motion.button>
                      </motion.div>
                    )}
                    <div onClick={() => selectMode && toggleSelectMessage(m.id)}>
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

            {/* Input */}
            <div className="border-t border-orange-100/50 bg-white/90 px-4 py-4 shadow-lg backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/90 sm:px-6">
              {replyTo && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="mb-3 flex items-center gap-3 rounded-2xl border-l-4 border-[#FF4D00] bg-gradient-to-r from-orange-50 to-orange-50 px-4 py-3 shadow-sm dark:from-amber-900/20 dark:to-amber-900/20"
                >
                  <Reply className="h-4 w-4 shrink-0 text-[#FF4D00] dark:text-[#FF8047]" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#FF4D00] dark:text-[#FF8047]">
                      Reply to {replyTo.sender_name === me?.username ? "yourself" : replyTo.sender_name}
                    </p>
                    <p className="truncate text-xs text-gray-600 dark:text-gray-400">
                      {replyTo.text || (replyTo.image_url ? " Photo" : replyTo.file_name || "📎 File")}
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setReplyTo(null)}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-[#FF4D00] transition-all hover:bg-amber-200 dark:bg-amber-900/30 dark:text-[#FF8047]"
                  >
                    <X className="h-4 w-4" />
                  </motion.button>
                </motion.div>
              )}
              {sending && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-3 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-orange-50 to-orange-50 px-4 py-3 dark:from-amber-900/20 dark:to-amber-900/20"
                >
                  <Loader2 className="h-4 w-4 animate-spin text-[#FF4D00]" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Uploading...</p>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-orange-100 dark:bg-amber-900/30">
                      <motion.div
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="h-full w-1/2 rounded-full bg-gradient-to-r from-[#FF8047] to-orange-500"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
              <AnimatePresence>
                {showEmoji && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="mb-3"
                  >
                    <EmojiPicker
                      onPickEmoji={(e) => setText((t) => t + e)}
                      onPickSticker={(s) => {
                        send({ sticker: s });
                        setShowEmoji(false);
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="flex items-end gap-2">
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowEmoji((v) => !v)}
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all ${
                    showEmoji
                      ? "bg-gradient-to-br from-[#FF8047] to-orange-500 text-white shadow-lg shadow-[#FF4D00]/30"
                      : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 hover:from-orange-100 hover:to-orange-100 hover:text-[#FF4D00] dark:from-gray-800 dark:to-gray-700 dark:text-gray-400"
                  }`}
                >
                  <Smile className="h-5 w-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => imgRef.current?.click()}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-orange-100 text-[#FF4D00] transition-all hover:from-amber-200 hover:to-amber-200 hover:shadow-lg dark:from-amber-900/30 dark:to-amber-900/30 dark:text-[#FF8047]"
                >
                  <ImageIcon className="h-5 w-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: -10 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => fileRef.current?.click()}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-orange-100 text-[#FF4D00] transition-all hover:from-amber-200 hover:to-amber-200 hover:shadow-lg dark:from-amber-900/30 dark:to-amber-900/30 dark:text-[#FF8047]"
                >
                  <Paperclip className="h-5 w-5" />
                </motion.button>
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
                  placeholder="Type a message..."
                  className="scrollbar-thin scrollbar-thumb-amber-200 scrollbar-track-transparent max-h-32 min-h-[44px] flex-1 resize-none rounded-3xl border border-orange-100 bg-gradient-to-br from-gray-50 to-white px-5 py-3 text-sm font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-orange-300 focus:shadow-lg focus:shadow-[#FF4D00]/10 dark:border-gray-700 dark:from-gray-800 dark:to-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
                  style={{
                    fontFamily:
                      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  }}
                />
                <motion.button
                  onClick={handleSend}
                  disabled={!text.trim() || sending}
                  whileHover={{ scale: text.trim() ? 1.1 : 1 }}
                  whileTap={{ scale: text.trim() ? 0.9 : 1 }}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 via-amber-600 to-[#FF6B2C] text-white shadow-lg shadow-[#FF4D00]/40 transition-all hover:shadow-xl hover:shadow-[#FF4D00]/50 disabled:opacity-40 disabled:shadow-none"
                >
                  <Send className="h-4 w-4" />
                </motion.button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Image lightbox - Premium Design */}
      {previewImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col bg-gradient-to-br from-gray-900 via-amber-950 to-amber-950 backdrop-blur-xl"
          onClick={() => setPreviewImage(null)}
        >
          {/* Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center gap-4 border-b border-white/10 bg-black/30 px-6 py-4 backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setPreviewImage(null)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </motion.button>
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-[#FF6B2C] text-sm font-bold text-white shadow-lg">
                {(previewImage.sender_name || "U").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-white">
                  {previewImage.sender_name === me?.username ? "You" : previewImage.sender_name}
                </p>
                <p className="text-xs text-white/60">
                  {new Date(previewImage.created_date).toLocaleString([], {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
            <motion.a
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              href={previewImage.image_url}
              download
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            </motion.a>
          </motion.div>

          {/* Image Container */}
          <div className="flex flex-1 items-center justify-center p-6" onClick={(e) => e.stopPropagation()}>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              src={previewImage.image_url}
              alt="preview"
              className="max-h-[70vh] max-w-[800px] rounded-2xl object-contain shadow-2xl"
            />
          </div>

          {/* Actions */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center justify-center gap-3 border-t border-white/10 bg-black/30 px-6 py-4 backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setReplyTo(previewImage);
                setPreviewImage(null);
              }}
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-[#FF6B2C] px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl"
            >
              <Reply className="h-4 w-4" /> Reply
            </motion.button>
          </motion.div>
        </motion.div>
      )}

      {/* Call overlay */}
      {callMode && (
        <AgoraCall mode={callMode} appId={appId} onEnd={() => setCallMode(null)} />
      )}
    </div>
  );
}