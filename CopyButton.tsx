"use client";

import { useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";

interface CopyButtonProps {
  text: string;
  label?: string;
}

type CopyState = "idle" | "copied" | "error";

export function CopyButton({ text, label = "Copy" }: CopyButtonProps) {
  const [copyState, setCopyState] = useState<CopyState>("idle");

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 2200);
    } catch {
      // Fallback for browsers without clipboard API
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.cssText =
          "position:fixed;left:-9999px;top:-9999px;opacity:0;";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setCopyState("copied");
        setTimeout(() => setCopyState("idle"), 2200);
      } catch {
        setCopyState("error");
        setTimeout(() => setCopyState("idle"), 2000);
      }
    }
  }, [text]);

  const isCopied = copyState === "copied";
  const isError = copyState === "error";

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={isCopied}
      aria-label={isCopied ? "Copied to clipboard!" : `${label} markdown to clipboard`}
      aria-live="polite"
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-mono transition-all duration-200 border ${
        isCopied
          ? "bg-green-500/10 border-green-500/30 text-green-400"
          : isError
            ? "bg-red-500/10 border-red-500/30 text-red-400"
            : "bg-[#F5A623]/10 border-[#F5A623]/25 text-[#F5A623] hover:bg-[#F5A623]/15 hover:border-[#F5A623]/40"
      }`}
    >
      {isCopied ? (
        <>
          <Check className="w-3.5 h-3.5" aria-hidden="true" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" aria-hidden="true" />
          {label}
        </>
      )}
    </button>
  );
}
