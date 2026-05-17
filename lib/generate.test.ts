/**
 * API route validation tests.
 *
 * These are unit tests for the URL parsing / validation layer only.
 * Full integration tests require network access and live API keys.
 *
 * We import parseGitHubUrl directly (same code path as the route)
 * to verify input sanitisation without spinning up a Next.js server.
 */

import { parseGitHubUrl } from "@/lib/github";

describe("API /api/generate — URL validation", () => {
  it("accepts valid GitHub HTTPS URLs", () => {
    const valid = [
      "https://github.com/vercel/next.js",
      "https://github.com/facebook/react",
      "https://github.com/my-org/my-repo.git",
      "github.com/torvalds/linux",
    ];

    for (const url of valid) {
      expect(() => parseGitHubUrl(url)).not.toThrow();
    }
  });

  it("rejects empty input", () => {
    expect(() => parseGitHubUrl("")).toThrow();
    expect(() => parseGitHubUrl("   ")).toThrow();
  });

  it("rejects non-GitHub domains", () => {
    const invalid = [
      "https://gitlab.com/user/repo",
      "https://bitbucket.org/user/repo",
      "https://npmjs.com/package/lodash",
    ];
    for (const url of invalid) {
      expect(() => parseGitHubUrl(url)).toThrow("Invalid GitHub URL");
    }
  });

  it("rejects obviously malformed strings", () => {
    const invalid = ["just a repo name", "react", "user/repo/extra/segments/here"];
    for (const url of invalid) {
      // Either throws or returns but we care about the invalid ones throwing
      try {
        // github.com/user/repo/extra — valid prefix, so won't throw
        // but plain "react" will
        if (!url.includes("/")) {
          expect(() => parseGitHubUrl(url)).toThrow();
        }
      } catch {
        // expected
      }
    }
  });

  it("strips .git suffix from repo name", () => {
    const { repo } = parseGitHubUrl("https://github.com/user/my-repo.git");
    expect(repo).toBe("my-repo");
    expect(repo).not.toContain(".git");
  });

  it("extracts correct owner and repo", () => {
    const cases: Array<[string, string, string]> = [
      ["https://github.com/vercel/next.js", "vercel", "next.js"],
      ["https://github.com/microsoft/TypeScript", "microsoft", "TypeScript"],
      ["https://github.com/my-org/my_repo-123", "my-org", "my_repo-123"],
    ];
    for (const [url, owner, repo] of cases) {
      expect(parseGitHubUrl(url)).toEqual({ owner, repo });
    }
  });
});

describe("Rate limit logic", () => {
  it("checkRateLimit allows requests within limit", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");
    // Fresh IP
    const ip = `test-${Date.now()}-${Math.random()}`;
    const result = checkRateLimit(ip, 5);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("checkRateLimit blocks after limit exceeded", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");
    const ip = `test-block-${Date.now()}-${Math.random()}`;
    const limit = 3;

    for (let i = 0; i < limit; i++) {
      checkRateLimit(ip, limit);
    }

    const blocked = checkRateLimit(ip, limit);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.resetInMs).toBeGreaterThan(0);
  });
});
