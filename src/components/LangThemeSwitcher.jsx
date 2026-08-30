import React from "react";
import { useI18n, useTheme } from "@/lib/i18n";
import { Sun, Moon } from "lucide-react";

const LANGS = [
  { code: "en", label: "EN" },
  { code: "fr", label: "FR" },
  { code: "ar", label: "ع" },
];

export default function LangThemeSwitcher() {
  const { lang, setLang } = useI18n();
  const { theme, toggle } = useTheme();
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5 rounded-full border border-border bg-muted/40 p-0.5">
        {LANGS.map((l) => (
          <button
            key={l.code}
            onClick={() => setLang(l.code)}
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${lang === l.code ? "bg-orange-500 text-white" : "text-muted-foreground hover:text-foreground"}`}
          >
            {l.label}
          </button>
        ))}
      </div>
      <button
        onClick={toggle}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-muted/40 text-muted-foreground transition hover:text-foreground"
        title="Toggle theme"
      >
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
    </div>
  );
}