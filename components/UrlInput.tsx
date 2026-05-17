"use client";

import { useState, useCallback, type KeyboardEvent, type FormEvent } from "react";
import { Github, Loader2, Sparkles, X } from "lucide-react";

interface UrlInputProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: (url: string) => void;
  isLoading: boolean;
  compact?: boolean;
}

// Quick client-side URL validation (full validation happens server-side)
function isPlausibleGitHubUrl(url: string): boolean {
  return /^(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+/.test(
    url.trim()
  );
}

const EXAMPLE_REPOS = [
  "https://github.com/vercel/next.js",
  "https://github.com/facebook/react",
  "https://github.com/tailwindlabs/tailwindcss",
  "https://github.com/microsoft/vscode",
];

export function UrlInput({
  value,
  onChange,
  onSubmit,
  isLoading,
  compact = false,
}: UrlInputProps) {
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = useCallback(
    (e?: FormEvent) => {
      e?.preventDefault();
      setValidationError(null);

      const trimmed = value.trim();
      if (!trimmed) {
        setValidationError("Please enter a GitHub repository URL.");
        return;
      }
      if (!isPlausibleGitHubUrl(trimmed)) {
        setValidationError(
          "That doesn't look like a GitHub URL. Try: https://github.com/owner/repo"
        );
        return;
      }

      onSubmit(trimmed);
    },
    [value, onSubmit]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !isLoading) {
        handleSubmit();
      }
    },
    [handleSubmit, isLoading]
  );

  const handleClear = useCallback(() => {
    onChange("");
    setValidationError(null);
  }, [onChange]);

  const handleExampleClick = useCallback(
    (url: string) => {
      onChange(url);
      setValidationError(null);
    },
    [onChange]
  );

  const hasValue = value.trim().length > 0;

  return (
    <div className="w-full">
      {/* Input wrapper */}
      <div
        className={`relative flex items-center gap-0 rounded-xl border transition-all duration-200 ${isFocused
            ? "border-[#F5A623]/60 shadow-[0_0_0_3px_rgba(245,166,35,0.15),0_0_20px_rgba(245,166,35,0.08)]"
            : validationError
              ? "border-red-500/50 shadow-[0_0_0_3px_rgba(239,68,68,0.08)]"
              : "border-white/10 shadow-none"
          } bg-[#111111]`}
      >
        {/* GitHub icon */}
        <div className="flex items-center pl-4 pr-2 shrink-0">
          <Github
            className={`w-5 h-5 transition-colors duration-200 ${isFocused ? "text-[#F5A623]" : "text-[#555]"
              }`}
            aria-hidden="true"
          />
        </div>

        {/* URL input */}
        <input
          type="url"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (validationError) setValidationError(null);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="https://github.com/owner/repository"
          aria-label="GitHub repository URL"
          aria-describedby={validationError ? "url-error" : undefined}
          aria-invalid={!!validationError}
          disabled={isLoading}
          spellCheck={false}
          autoComplete="off"
          className={`flex-1 bg-transparent py-3.5 text-[15px] font-mono text-[#e0e0e0] placeholder-[#3a3a3a] focus:outline-none disabled:opacity-50 min-w-0 ${compact ? "text-sm py-3" : ""
            }`}
        />

        {/* Clear button */}
        {hasValue && !isLoading && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear input"
            className="flex items-center px-2 text-[#444] hover:text-[#888] transition-colors"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        )}

        {/* Generate button */}
        <button
          type="button"
          onClick={() => handleSubmit()}
          disabled={isLoading || !hasValue}
          aria-label={isLoading ? "Generating README..." : "Generate README"}
          className={`btn-amber flex items-center gap-2 shrink-0 px-5 m-1.5 font-semibold transition-all disabled:opacity-40 ${compact ? "text-sm py-2" : "py-2.5"
            }`}
        >
          {isLoading ? (
            <>
              <Loader2
                className="w-4 h-4 animate-spin"
                aria-hidden="true"
              />
              <span className="hidden sm:inline">Generating…</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              <span>Generate</span>
            </>
          )}
        </button>
      </div>

      {/* Validation error */}
      {validationError && (
        <p
          id="url-error"
          role="alert"
          className="mt-2 text-sm text-red-400 font-mono animate-fade-in"
        >
          {validationError}
        </p>
      )}

      {/* Example repos (idle state only) */}
      {!compact && !hasValue && !isLoading && (
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          <span className="text-xs text-[#444] font-mono self-center">
            Try:
          </span>
          {EXAMPLE_REPOS.map((repo) => {
            const short = repo.replace("https://github.com/", "");
            return (
              <button
                key={repo}
                type="button"
                onClick={() => handleExampleClick(repo)}
                className="text-xs font-mono text-[#555] hover:text-[#F5A623] bg-white/[0.03] hover:bg-[#F5A623]/[0.06] border border-white/[0.06] hover:border-[#F5A623]/20 rounded-lg px-3 py-1.5 transition-all duration-200"
              >
                {short}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
