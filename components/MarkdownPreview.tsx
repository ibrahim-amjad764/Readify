"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Eye, Code2, Star, GitFork, RotateCcw } from "lucide-react";
import { CopyButton } from "./CopyButton";
import type { GenerateSuccessResponse } from "@/lib/types";

interface MarkdownPreviewProps {
  markdown: string;
  meta: GenerateSuccessResponse["meta"] | null;
  onReset: () => void;
}

type Tab = "preview" | "raw";

export function MarkdownPreview({ markdown, meta, onReset }: MarkdownPreviewProps) {
  const [activeTab, setActiveTab] = useState<Tab>("preview");

  return (
    <div className="animate-fade-in">
      {/* Meta info bar */}
      {meta && (
        <div className="flex flex-wrap items-center gap-3 mb-4 px-1">
          <span className="text-sm font-mono text-[#F5A623] font-semibold">
            {meta.owner}/{meta.repo}
          </span>

          {meta.language && (
            <span className="text-xs font-mono text-[#666] bg-white/[0.04] border border-white/[0.07] rounded-md px-2 py-0.5">
              {meta.language}
            </span>
          )}

          <div className="flex items-center gap-3 text-xs text-[#555] font-mono">
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3" aria-hidden="true" />
              {meta.stars.toLocaleString()}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-[#444] font-mono hidden sm:inline">
              ~{meta.tokensUsed.toLocaleString()} tokens used
            </span>
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 text-xs text-[#555] hover:text-[#F5A623] bg-white/[0.03] hover:bg-[#F5A623]/[0.06] border border-white/[0.06] hover:border-[#F5A623]/20 rounded-lg px-3 py-1.5 transition-all font-mono"
              aria-label="Generate a new README"
            >
              <RotateCcw className="w-3 h-3" aria-hidden="true" />
              New
            </button>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-white/[0.07] mb-0">
        {/* Tabs */}
        <div className="flex" role="tablist" aria-label="View mode">
          {(["preview", "raw"] as Tab[]).map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-mono border-b-2 transition-all duration-150 ${activeTab === tab
                  ? "border-[#F5A623] text-[#F5A623]"
                  : "border-transparent text-[#555] hover:text-[#888]"
                }`}
            >
              {tab === "preview" ? (
                <Eye className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <Code2 className="w-3.5 h-3.5" aria-hidden="true" />
              )}
              {tab === "preview" ? "Preview" : "Markdown"}
            </button>
          ))}
        </div>

        {/* Copy button */}
        <div className="pr-1 pb-1">
          <CopyButton text={markdown} />
        </div>
      </div>

      {/* Content panel */}
      <div
        className="glass-card mt-0 rounded-t-none border-t-0 min-h-[60vh] overflow-auto"
        role="tabpanel"
      >
        {activeTab === "preview" ? (
          <div className="markdown-body p-6 sm:p-8">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {markdown}
            </ReactMarkdown>
          </div>
        ) : (
          <pre className="p-6 sm:p-8 text-sm font-mono text-[#c0c0c0] whitespace-pre-wrap break-words leading-relaxed">
            {markdown}
          </pre>
        )}
      </div>
    </div>
  );
}
