"use client";

import { useState, useCallback } from "react";
import { UrlInput } from "./UrlInput";
import { MarkdownPreview } from "./MarkdownPreview";
import { StatusBanner } from "./StatusBanner";
import { HeroSection } from "./HeroSection";
import type { AppState, GenerateResponse } from "@/lib/types";

const INITIAL_STATE: AppState = {
  status: "idle",
  markdown: null,
  error: null,
  meta: null,
};

/**
 * Root client component.
 * Owns the app state machine and orchestrates child components.
 */
export function RepoReadApp() {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [url, setUrl] = useState("");

  const handleGenerate = useCallback(async (repoUrl: string) => {
    setState({ status: "fetching_repo", markdown: null, error: null, meta: null });

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: repoUrl }),
        signal: AbortSignal.timeout(30_000),
      });

      const data = (await response.json()) as GenerateResponse;

      if (!data.success) {
        setState({
          status: "error",
          markdown: null,
          error: data.error,
          meta: null,
        });
        return;
      }

      setState({
        status: "success",
        markdown: data.markdown,
        error: null,
        meta: data.meta,
      });
    } catch (err) {
      const isTimeout =
        err instanceof Error &&
        (err.name === "TimeoutError" || err.name === "AbortError");

      setState({
        status: "error",
        markdown: null,
        error: isTimeout
          ? "Request timed out. Please try again."
          : err instanceof Error
            ? err.message
            : "An unexpected error occurred.",
        meta: null,
      });
    }
  }, []);

  const handleReset = useCallback(() => {
    setState(INITIAL_STATE);
    setUrl("");
  }, []);

  const isLoading =
    state.status === "fetching_repo" || state.status === "generating";

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero visible only in idle state */}
      {state.status === "idle" && <HeroSection />}

      {/* Input panel */}
      <div
        className={`w-full transition-all duration-500 ${state.status === "idle"
            ? "max-w-2xl mx-auto px-4 sm:px-6 pb-10"
            : "max-w-screen-xl mx-auto px-4 sm:px-6 pt-6 pb-4"
          }`}
      >
        <UrlInput
          value={url}
          onChange={setUrl}
          onSubmit={handleGenerate}
          isLoading={isLoading}
          compact={state.status !== "idle"}
        />
      </div>

      {/* Status / error banner */}
      {(state.status === "error" || isLoading) && (
        <div className="max-w-screen-xl mx-auto w-full px-4 sm:px-6 pb-4">
          <StatusBanner status={state.status} error={state.error} />
        </div>
      )}

      {/* Main content: split-pane on desktop, stacked on mobile */}
      {state.status === "success" && state.markdown && (
        <div className="flex-1 max-w-screen-xl mx-auto w-full px-4 sm:px-6 pb-8">
          <MarkdownPreview
            markdown={state.markdown}
            meta={state.meta}
            onReset={handleReset}
          />
        </div>
      )}
    </div>
  );
}
