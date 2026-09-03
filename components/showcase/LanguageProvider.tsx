"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_LOCALE, isLocale, t, type I18nKey, type Locale } from "@/lib/i18n";

const STORAGE_KEY = "portfolio.locale";

interface LanguageContextValue {
  lang: Locale;
  setLang: (lang: Locale) => void;
  t: (key: I18nKey) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: DEFAULT_LOCALE,
  setLang: () => undefined,
  t: (key) => t(key, DEFAULT_LOCALE),
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isLocale(stored)) setLangState(stored);
  }, []);

  function setLang(next: Locale) {
    setLangState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      setLang,
      t: (key) => t(key, lang),
    }),
    [lang]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function useT() {
  return useLanguage().t;
}

export function LocalizedLabel({
  k,
  className,
}: {
  k: I18nKey;
  className?: string;
}) {
  const label = useT()(k);
  return <p className={className}>{label}</p>;
}

export function LanguageToggle() {
  const { lang, setLang } = useLanguage();
  return (
    <div
      role="group"
      aria-label="Interface language"
      className="inline-flex overflow-hidden border border-emerald-500/30"
    >
      {(["en", "pt"] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setLang(option)}
          className={`px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] transition ${
            lang === option
              ? "bg-emerald-500/15 text-emerald-300"
              : "text-neutral-500 hover:text-neutral-300"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
