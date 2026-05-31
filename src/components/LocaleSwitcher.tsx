"use client";

import { useState, useRef, useEffect } from "react";
import { Globe } from "lucide-react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { routing, type Locale } from "@/i18n/routing";

const localeNames: Record<Locale, string> = {
  en: "English",
  ja: "日本語",
  ko: "한국어",
  "zh-CN": "简体中文",
  de: "Deutsch",
  fr: "Français",
  es: "Español",
};

const localeLabels: Record<Locale, string> = {
  en: "EN",
  ja: "JA",
  ko: "KO",
  "zh-CN": "ZH",
  de: "DE",
  fr: "FR",
  es: "ES",
};

export function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function handleSelect(selectedLocale: Locale) {
    setOpen(false);
    router.replace(pathname, { locale: selectedLocale });
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1.5 border-[2px] border-ink/30 rounded-full px-2.5 py-1 text-xs font-semibold text-ink bg-warm-white transition-colors hover:border-ink/50"
        aria-label="Language"
      >
        <Globe className="size-3.5" />
        {localeLabels[locale]}
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Language"
          className="absolute right-0 top-full mt-2 bg-warm-white border-[2px] border-ink rounded-[12px] shadow-[4px_4px_0px_#1c1917] p-1 min-w-[180px] z-50"
        >
          {routing.locales.map((loc) => (
            <button
              key={loc}
              type="button"
              role="option"
              aria-selected={loc === locale}
              onClick={() => handleSelect(loc)}
              className={`flex w-full items-center justify-between px-3 py-2 rounded-[8px] text-sm transition-colors ${
                loc === locale
                  ? "bg-ink text-cream font-bold"
                  : "text-ink hover:bg-linen"
              }`}
            >
              <span>{localeNames[loc]}</span>
              <span
                className={`text-xs ${
                  loc === locale ? "text-cream/70" : "text-text-secondary"
                }`}
              >
                {localeLabels[loc]}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
