import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// iOS-style emoji categories
const EMOJI_CATEGORIES = {
  smileys: {
    name: "😊 Smileys",
    emojis: [
      "😀","😃","😄","😁","😆","😅","🤣","😂","🙂","🙃",
      "😉","😊","😇","🥰","😍","🤩","😘","😗","☺️","😚",
      "😙","🥲","😋","😛","😜","🤪","😝","🤑","🤗","🤭",
      "🤫","🤔","🤐","🤨","😐","😑","😶","😏","😒","🙄",
      "😬","🤥","😌","😔","😪","🤤","😴","😷","🤒","🤕",
      "🤢","🤮","🤧","🥵","🥶","🥴","😵","🤯","🤠","🥳",
      "🥸","😎","🤓","🧐","😕","😟","🙁","☹️","😮","😯",
      "😲","😳","🥺","😦","😧","😨","😰","😥","😢","😭",
      "😱","😖","😣","😞","😓","😩","😫","🥱","😤","😡",
      "😠","🤬","😈","👿","💀","☠️","💩","🤡","👹","👺"
    ]
  },
  gestures: {
    name: "👋 Gestures",
    emojis: [
      "👋","🤚","🖐","✋","🖖","👌","🤌","🤏","✌️","🤞",
      "🤟","🤘","🤙","👈","👉","👆","🖕","👇","☝️","👍",
      "👎","✊","👊","🤛","🤜","👏","🙌","👐","🤲","🤝",
      "🙏","✍️","💅","🤳","💪","🦾","🦿","🦵","🦶","👂",
      "🦻","👃","🧠","🫀","🫁","🦷","🦴","👀","👁","👅"
    ]
  },
  hearts: {
    name: "❤️ Hearts",
    emojis: [
      "❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔",
      "❤️‍🔥","❤️‍🩹","💕","💞","💓","💗","💖","💘","💝","💟",
      "☮️","✝️","☪️","🕉","☸️","✡️","🔯","🕎","☯️","☦️"
    ]
  },
  animals: {
    name: "🐶 Animals",
    emojis: [
      "🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯",
      "🦁","🐮","🐷","🐽","🐸","🐵","🙈","🙉","🙊","🐒",
      "🐔","🐧","🐦","🐤","🐣","🐥","🦆","🦅","🦉","🦇",
      "🐺","🐗","🐴","🦄","🐝","🐛","🦋","🐌","🐞","🐜"
    ]
  },
  food: {
    name: "🍕 Food",
    emojis: [
      "🍏","🍎","🍐","🍊","🍋","🍌","🍉","🍇","🍓","🫐",
      "🍈","🍒","🍑","🥭","🍍","🥥","🥝","🍅","🍆","🥑",
      "🥦","🥬","🥒","🌶","🫑","🌽","🥕","🫒","🧄","🧅",
      "🥔","🍠","🥐","🥯","🍞","🥖","🥨","🧀","🥚","🍳",
      "🧈","🥞","🧇","🥓","🥩","🍗","🍖","🦴","🌭","🍔",
      "🍟","🍕","🫓","🥪","🥙","🧆","🌮","🌯","🫔","🥗",
      "🍝","🍜","🍲","🍛","🍣","🍱","🥟","🦪","🍤","🍙"
    ]
  },
  activities: {
    name: "⚽ Activities",
    emojis: [
      "⚽","🏀","🏈","⚾","🥎","🎾","🏐","🏉","🥏","🎱",
      "🪀","🏓","🏸","🏒","🏑","🥍","🏏","🪃","🥅","⛳",
      "🪁","🏹","🎣","🤿","🥊","🥋","🎽","🛹","🛼","🛷",
      "⛸","🥌","🎿","⛷","🏂","🪂","🏋️","🤼","🤸","⛹️",
      "🤺","🤾","🏌️","🏇","🧘","🏄","🏊","🤽","🚣","🧗"
    ]
  },
  travel: {
    name: "✈️ Travel",
    emojis: [
      "🚗","🚕","🚙","🚌","🚎","🏎","🚓","🚑","🚒","🚐",
      "🛻","🚚","🚛","🚜","🦯","🦽","🦼","🛴","🚲","🛵",
      "🏍","🛺","🚨","🚔","🚍","🚘","🚖","🚡","🚠","🚟",
      "🚃","🚋","🚞","🚝","🚄","🚅","🚈","🚂","🚆","🚇",
      "🚊","🚉","✈️","🛫","🛬","🛩","💺","🛰","🚀","🛸"
    ]
  },
  objects: {
    name: "💡 Objects",
    emojis: [
      "⌚","📱","📲","💻","⌨️","🖥","🖨","🖱","🖲","🕹",
      "🗜","💾","💿","📀","📼","📷","📸","📹","🎥","📽",
      "🎞","📞","☎️","📟","📠","📺","📻","🎙","🎚","🎛",
      "🧭","⏱","⏲","⏰","🕰","⌛","⏳","📡","🔋","🔌",
      "💡","🔦","🕯","🪔","🧯","🛢","💸","💵","💴","💶",
      "💷","🪙","💰","💳","🧾","💎","⚖️","🪜","🧰","🪛"
    ]
  },
  symbols: {
    name: "🔣 Symbols",
    emojis: [
      "❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔",
      "❣️","💕","💞","💓","💗","💖","💘","💝","💟","☮️",
      "✝️","☪️","🕉","☸️","✡️","🔯","🕎","☯️","☦️","🛐",
      "⛎","♈","♉","♊","♋","♌","♍","♎","♏","♐",
      "♑","♒","♓","🆔","⚛️","🉑","☢️","☣️","📴","📳",
      "🈶","🈚","🈸","🈺","🈷️","✴️","🆚","💮","🉐","㊙️",
      "㊗️","🈴","🈵","🈹","🈲","🅰️","🅱️","🆎","🆑","🅾️"
    ]
  },
  flags: {
    name: "🏁 Flags",
    emojis: [
      "🏁","🚩","🎌","🏴","🏳️","🏳️‍🌈","🏳️‍⚧️","🏴‍☠️","🇦🇫","🇦🇽",
      "🇦🇱","🇩🇿","🇦🇸","🇦🇩","🇦🇴","🇦🇮","🇦🇶","🇦🇬","🇦🇷","🇦🇲",
      "🇦🇼","🇦🇺","🇦🇹","🇦🇿","🇧🇸","🇧🇭","🇧🇩","🇧🇧","🇧🇾","🇧🇪",
      "🇧🇿","🇧🇯","🇧🇲","🇧🇹","🇧🇴","🇧🇦","🇧🇼","🇧🇷","🇮🇴","🇻🇬"
    ]
  }
};

const STICKERS = [
  "🎉","🎊","🎈","🎁","🎀","🎂","🧁","🍰","🎓","📚",
  "✏️","📝","💯","⭐","🌟","✨","💫","⚡","🔥","💥",
  "💖","💝","💗","💓","💕","💞","🌈","☀️","🌙","⭐",
  "🎯","🏆","🥇","🥈","🥉","🏅","🎖","👑","💎","💍"
];

export default function EmojiPicker({ onPickEmoji, onPickSticker }) {
  const [activeCategory, setActiveCategory] = useState("smileys");
  const [tab, setTab] = useState("emoji");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="w-80 overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-white via-white to-orange-50/30 shadow-2xl backdrop-blur-xl dark:from-gray-900 dark:via-gray-900 dark:to-gray-800"
    >
      {/* Tabs */}
      <div className="border-b border-border/30 bg-white/80 px-3 pb-2 pt-3 backdrop-blur-xl dark:bg-gray-900/80">
        <div className="flex gap-1.5 rounded-2xl bg-gray-100/80 p-1 dark:bg-gray-800/50">
          <button
            onClick={() => setTab("emoji")}
            className={`relative flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-300 ${
              tab === "emoji"
                ? "bg-white text-[#FF4D00] shadow-lg shadow-[#FF4D00]/20 dark:bg-gray-700"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            {tab === "emoji" && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 rounded-xl bg-gradient-to-br from-orange-50 to-white shadow-lg dark:from-gray-700 dark:to-gray-600"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative">Emojis</span>
          </button>
          <button
            onClick={() => setTab("sticker")}
            className={`relative flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-300 ${
              tab === "sticker"
                ? "bg-white text-[#FF4D00] shadow-lg shadow-[#FF4D00]/20 dark:bg-gray-700"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            {tab === "sticker" && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 rounded-xl bg-gradient-to-br from-orange-50 to-white shadow-lg dark:from-gray-700 dark:to-gray-600"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative"> Stickers</span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {tab === "emoji" ? (
          <motion.div
            key="emoji"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Category tabs */}
            <div className="scrollbar-hide flex gap-1 overflow-x-auto border-b border-border/30 bg-white/60 px-3 py-2 backdrop-blur-xl dark:bg-gray-900/60">
              {Object.entries(EMOJI_CATEGORIES).map(([key, category]) => (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  className={`shrink-0 rounded-lg px-2 py-1.5 text-xl transition-all duration-200 ${
                    activeCategory === key
                      ? "scale-110 bg-orange-100 shadow-sm dark:bg-amber-900/30"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                  title={category.name}
                  style={{ fontFamily: '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji","Segoe UI Symbol"' }}
                >
                  {category.emojis[0]}
                </button>
              ))}
            </div>

            {/* Emoji grid */}
            <div className="scrollbar-thin scrollbar-thumb-amber-200 scrollbar-track-transparent max-h-64 overflow-y-auto p-3 dark:scrollbar-thumb-amber-800">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-8 gap-1"
              >
                {EMOJI_CATEGORIES[activeCategory].emojis.map((emoji, index) => (
                  <motion.button
                    key={emoji}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.01, type: "spring", stiffness: 400, damping: 25 }}
                    whileHover={{ scale: 1.3, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onPickEmoji(emoji)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-2xl transition-all hover:bg-gradient-to-br hover:from-orange-50 hover:to-orange-50 dark:hover:from-amber-900/20 dark:hover:to-amber-900/20"
                    style={{ fontFamily: '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji","Segoe UI Symbol"' }}
                  >
                    {emoji}
                  </motion.button>
                ))}
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="sticker"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="scrollbar-thin scrollbar-thumb-amber-200 scrollbar-track-transparent max-h-72 overflow-y-auto p-4 dark:scrollbar-thumb-amber-800"
          >
            <div className="grid grid-cols-6 gap-3">
              {STICKERS.map((sticker, index) => (
                <motion.button
                  key={sticker}
                  initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: index * 0.02, type: "spring", stiffness: 300, damping: 20 }}
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  whileTap={{ scale: 0.8, rotate: -10 }}
                  onClick={() => onPickSticker(sticker)}
                  className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-50 via-amber-50 to-orange-50 text-4xl shadow-lg transition-all hover:shadow-xl hover:shadow-[#FF4D00]/20 dark:from-amber-900/20 dark:via-amber-900/20 dark:to-amber-900/20"
                  style={{ fontFamily: '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji","Segoe UI Symbol"' }}
                >
                  {sticker}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}