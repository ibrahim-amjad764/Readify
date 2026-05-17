import { Navbar } from "../components/Navbar";
import { RepoReadApp } from "../components/RepoReadApp";

/**
 * Root page — Server Component.
 * Renders the static shell (navbar, layout) and mounts the interactive
 * client component for all dynamic state.
 */
export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 flex flex-col">
        <RepoReadApp />
      </main>

      <footer className="border-t border-white/5 py-5 px-6 text-center">
        <p className="text-sm text-[#444] font-mono">
          RepoRead &mdash; powered by{" "}
          <span className="text-[#F5A623]">GPT-4o-mini</span> &amp; GitHub API
          &mdash;{" "}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#F5A623] transition-colors"
          >
            Open Source
          </a>
        </p>
      </footer>
    </div>
  );
}
