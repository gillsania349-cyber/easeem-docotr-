import Link from "next/link";

const BRAND = "#0B57B7";
const BRAND_50 = "#EAF2FC";
const CREAM = "#F5F7FA";
const CARD_BORDER = "#E4E7EC";
const INK = "#101828";
const INK_2 = "#344054";
const SUBTLE = "#667085";
const FONT = '"Figtree", system-ui, -apple-system, "Segoe UI", sans-serif';

function BrandMark() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="PakMed home">
      <span
        className="flex items-center justify-center shrink-0"
        style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: BRAND }}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </span>
      <span className="font-extrabold leading-none text-[20px] tracking-[-0.035em]" style={{ color: INK }}>
        Pak<span style={{ color: BRAND }}>Med</span>
      </span>
    </Link>
  );
}

export function LegalH2({ children }) {
  return (
    <h2 className="text-[18px] font-extrabold tracking-[-0.02em] mt-7 mb-2.5 first:mt-0" style={{ color: INK }}>
      {children}
    </h2>
  );
}

export function LegalP({ children }) {
  return (
    <p className="text-[14.5px] leading-[1.7] mb-3.5" style={{ color: INK_2 }}>
      {children}
    </p>
  );
}

export function LegalUl({ children }) {
  return (
    <ul className="list-disc pl-5 mb-4 space-y-1.5 text-[14.5px] leading-[1.7]" style={{ color: INK_2 }}>
      {children}
    </ul>
  );
}

export function LegalNote({ children }) {
  return (
    <div
      className="mt-6 rounded-[14px] px-4 py-3.5 text-[13.5px] leading-relaxed"
      style={{ backgroundColor: BRAND_50, border: "1px solid #B9D3F2", color: INK_2 }}
    >
      {children}
    </div>
  );
}

export default function LegalPageShell({ title, updated, children }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: CREAM, fontFamily: FONT, color: INK }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800&display=swap');`}</style>

      <header className="sticky top-0 z-40 bg-white" style={{ borderBottom: `1px solid ${CARD_BORDER}` }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-[64px] flex items-center justify-between gap-4">
          <BrandMark />
          <nav className="flex items-center gap-2 sm:gap-3 text-[13.5px] font-semibold">
            <Link href="/privacy" className="px-3 py-2 rounded-lg hidden sm:inline" style={{ color: INK_2 }}>
              Privacy Policy
            </Link>
            <Link href="/terms" className="px-3 py-2 rounded-lg hidden sm:inline" style={{ color: INK_2 }}>
              Terms of Use
            </Link>
            <Link
              href="/"
              className="h-10 px-4 rounded-xl inline-flex items-center text-white font-bold"
              style={{ backgroundColor: BRAND }}
            >
              Back to PakMed
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section
          style={{
            background: `linear-gradient(135deg, ${BRAND_50} 0%, #fff 45%, ${CREAM} 100%)`,
            borderBottom: `1px solid ${CARD_BORDER}`,
          }}
        >
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
            <p className="text-[12px] font-bold tracking-[0.1em] uppercase mb-3" style={{ color: BRAND }}>
              Legal
            </p>
            <h1 className="text-[34px] sm:text-[44px] font-extrabold tracking-[-0.035em] leading-tight" style={{ color: INK }}>
              {title}
            </h1>
            <p className="text-[14px] mt-3" style={{ color: SUBTLE }}>
              Last updated: {updated}
            </p>
          </div>
        </section>

        <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div
            className="rounded-3xl bg-white px-5 py-7 sm:px-10 sm:py-10"
            style={{ border: `1px solid ${CARD_BORDER}`, boxShadow: "0 1px 2px rgba(16,24,40,0.04)" }}
          >
            {children}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/privacy"
              className="h-11 px-4 rounded-xl inline-flex items-center text-[13.5px] font-bold bg-white"
              style={{ color: BRAND, border: `1.5px solid ${BRAND}` }}
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="h-11 px-4 rounded-xl inline-flex items-center text-[13.5px] font-bold bg-white"
              style={{ color: BRAND, border: `1.5px solid ${BRAND}` }}
            >
              Terms of Use
            </Link>
            <Link
              href="/"
              className="h-11 px-4 rounded-xl inline-flex items-center text-[13.5px] font-bold text-white"
              style={{ backgroundColor: BRAND }}
            >
              Return home
            </Link>
          </div>
        </article>
      </main>

      <footer style={{ backgroundColor: "#0B1A33" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-[13px]" style={{ color: "#8592A8" }}>
            © {new Date().getFullYear()} PakMed. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-[13px]" style={{ color: "#8592A8" }}>
            <Link href="/privacy" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white">
              Terms of Use
            </Link>
            <Link href="/" className="hover:text-white">
              Home
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
