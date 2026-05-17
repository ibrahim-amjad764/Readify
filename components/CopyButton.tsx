"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyButtonProps {
  text: string;
  label?: string;
  duration?: number;
  className?: string;
}

export function CopyButton({ 
  text, 
  label = "Copy", 
  duration = 2000,
  className = "" 
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), duration);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      disabled={copied}
      className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-all 
        ${copied 
          ? "bg-green-500/20 text-green-400 border border-green-500/30 cursor-not-allowed" 
          : "bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 hover:border-amber-500/50"
        } ${className}`}
      data-testid="copy-button"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4" data-testid="check-icon" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" data-testid="copy-icon" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}