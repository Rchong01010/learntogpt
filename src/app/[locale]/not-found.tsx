import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Nav — minimal, just the logo */}
      <header className="border-b border-[#e5e7eb] bg-white">
        <div className="mx-auto flex max-w-[1160px] items-center px-6 py-4">
          <Link href="/" className="logo-serif text-[1.5rem] font-bold text-ink">
            Learn to <span className="text-orange">GPT</span>
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6">
        <div className="text-center">
          {/* 404 badge */}
          <div className="mx-auto mb-6 inline-flex items-center rounded-full border border-[#e5e7eb] bg-white px-5 py-2 shadow-sm">
            <span className="text-[0.85rem] font-semibold text-ink" style={{ fontFamily: "monospace" }}>
              {t("errorCode")}
            </span>
          </div>

          <h1 className="text-[3rem] font-extrabold leading-[1.1] text-ink max-md:text-[2.2rem] max-[480px]:text-[1.6rem]">
            {t("title")}
          </h1>

          <p className="mx-auto mt-4 max-w-[480px] text-[1.1rem] leading-[1.7] text-text-secondary">
            {t("description")}
          </p>

          {/* Terminal-style hint */}
          <div className="mx-auto mt-8 max-w-[420px] rounded-lg border border-ink bg-ink px-6 py-4 shadow-sm">
            <p className="text-left text-[0.8rem] leading-relaxed text-[#a8a29e]" style={{ fontFamily: "monospace" }}>
              <span className="text-orange">$</span>{" "}
              <span className="text-[#e7e5e4]">{t("terminalMessage")}</span>
            </p>
          </div>

          {/* Actions */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center rounded-lg bg-orange px-[22px] py-[10px] text-[0.85rem] font-semibold text-white shadow-sm transition-all hover:bg-teal hover:shadow-md"
            >
              {t("homeLink")}
            </Link>
            <Link
              href="/curriculum"
              className="inline-flex items-center rounded-lg border border-[#e5e7eb] bg-white px-[22px] py-[10px] text-[0.85rem] font-semibold text-ink shadow-sm transition-all hover:border-orange hover:shadow-md"
            >
              {t("coursesLink")}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
