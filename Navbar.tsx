import { BookOpen, Github, Zap } from "lucide-react";

/**
 * Top navigation bar — Server Component (no interactivity needed).
 */
export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 backdrop-blur-xl bg-black/40">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo / brand */}
        <div className="flex items-center gap-2.5 select-none">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-[#F5A623]/10 border border-[#F5A623]/30">
            <BookOpen className="w-4 h-4 text-[#F5A623]" aria-hidden="true" />
          </div>
          <span
            className="text-lg font-extrabold tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Repo<span className="text-[#F5A623]">Read</span>
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-[#F5A623] bg-[#F5A623]/10 border border-[#F5A623]/20 rounded-full px-2 py-0.5">
            <Zap className="w-2.5 h-2.5" aria-hidden="true" />
            AI-Powered
          </span>
        </div>

        {/* Right side */}
        <nav className="flex items-center gap-3">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-[#888] hover:text-[#F5A623] transition-colors duration-200"
            aria-label="View on GitHub"
          >
            <Github className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
