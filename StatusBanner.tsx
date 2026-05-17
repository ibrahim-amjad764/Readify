"use client";

import { AlertCircle, Loader2, Github, Bot } from "lucide-react";
import type { AppStatus } from "@/lib/types";

interface StatusBannerProps {
  status: AppStatus;
  error: string | null;
}

const LOADING_STEPS = [
  { icon: Github, label: "Fetching repository metadata…" },
  { icon: Bot, label: "Analysing file structure and dependencies…" },
  { icon: Loader2, label: "Generating README with GPT-4o-mini…" },
];

export function StatusBanner({ status, error }: StatusBannerProps) {
  if (status === "error" && error) {
    return (
      <div
        role="alert"
        className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3.5 animate-fade-in"
      >
        <AlertCircle
          className="w-5 h-5 text-red-400 shrink-0 mt-0.5"
          aria-hidden="true"
        />
        <div>
          <p className="text-sm font-semibold text-red-400">
            Something went wrong
          </p>
          <p className="text-sm text-red-400/80 mt-0.5 font-mono">{error}</p>
        </div>
      </div>
    );
  }

  if (status === "fetching_repo" || status === "generating") {
    return (
      <div className="rounded-xl border border-[#F5A623]/15 bg-[#F5A623]/[0.04] px-4 py-4 animate-fade-in">
        <div className="flex items-center gap-3 mb-3">
          <Loader2
            className="w-4 h-4 text-[#F5A623] animate-spin shrink-0"
            aria-hidden="true"
          />
          <p className="text-sm font-mono text-[#F5A623]">
            Generating your README…
          </p>
        </div>
        <div className="space-y-2 pl-7">
          {LOADING_STEPS.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#F5A623]/30 shrink-0" />
              <Icon
                className="w-3.5 h-3.5 text-[#888] shrink-0"
                aria-hidden="true"
              />
              <span className="text-xs font-mono text-[#666]">{label}</span>
            </div>
          ))}
        </div>

        {/* Shimmer progress bar */}
        <div className="mt-4 h-0.5 rounded-full bg-white/[0.05] overflow-hidden">
          <div className="h-full w-1/2 rounded-full shimmer" />
        </div>
      </div>
    );
  }

  return null;
}
