"use client";

import { FileText, Zap, Copy, Eye } from "lucide-react";

const FEATURES = [
  { icon: Zap, label: "AI-powered analysis", sub: "GPT-4o-mini" },
  { icon: FileText, label: "9 README sections", sub: "auto-generated" },
  { icon: Eye, label: "Live preview", sub: "GitHub-style render" },
  { icon: Copy, label: "One-click copy", sub: "paste-ready markdown" },
];

export function HeroSection() {
  return (
    <section className="w-full max-w-2xl mx-auto px-4 sm:px-6 pt-16 pb-10 text-center">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 text-xs font-mono text-[#F5A623] bg-[#F5A623]/10 border border-[#F5A623]/20 rounded-full px-3 py-1 mb-8">
        <span className="w-1.5 h-1.5 rounded-full bg-[#F5A623] animate-pulse" />
        Free to use · No signup required
      </div>

      {/* Headline */}
      <h1
        className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-5 leading-[1.1]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Stop writing
        <br />
        <span className="gradient-text">READMEs by hand.</span>
      </h1>

      {/* Sub-headline */}
      <p className="text-lg text-[#888] mb-10 max-w-xl mx-auto leading-relaxed">
        Paste any GitHub repository URL and get a professional,
        production-grade README in seconds — powered by AI analysis of your
        actual codebase.
      </p>

      {/* Feature pills */}
      <div className="flex flex-wrap justify-center gap-3 mb-2">
        {FEATURES.map(({ icon: Icon, label, sub }) => (
          <div
            key={label}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm"
          >
            <Icon className="w-3.5 h-3.5 text-[#F5A623] shrink-0" aria-hidden="true" />
            <span className="text-[#c0c0c0] font-medium">{label}</span>
            <span className="text-[#555] text-xs">· {sub}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
