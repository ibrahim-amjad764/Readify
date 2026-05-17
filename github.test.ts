import { parseGitHubUrl, GitHubFetchError } from "@/lib/github";

describe("parseGitHubUrl", () => {
  // ── Valid URLs ──────────────────────────────────────────────────────────
  it("parses a standard HTTPS URL", () => {
    expect(parseGitHubUrl("https://github.com/vercel/next.js")).toEqual({
      owner: "vercel",
      repo: "next.js",
    });
  });

  it("strips trailing .git suffix", () => {
    expect(parseGitHubUrl("https://github.com/facebook/react.git")).toEqual({
      owner: "facebook",
      repo: "react",
    });
  });

  it("handles URLs without https://", () => {
    expect(parseGitHubUrl("github.com/tailwindlabs/tailwindcss")).toEqual({
      owner: "tailwindlabs",
      repo: "tailwindcss",
    });
  });

  it("handles URLs with trailing slash or sub-path (tree/branch)", () => {
    const result = parseGitHubUrl(
      "https://github.com/microsoft/vscode/tree/main"
    );
    expect(result.owner).toBe("microsoft");
    expect(result.repo).toBe("vscode");
  });

  it("handles hyphens and underscores in owner/repo", () => {
    expect(
      parseGitHubUrl("https://github.com/my-org/my_cool-repo")
    ).toEqual({ owner: "my-org", repo: "my_cool-repo" });
  });

  it("trims whitespace", () => {
    expect(
      parseGitHubUrl("  https://github.com/torvalds/linux  ")
    ).toEqual({ owner: "torvalds", repo: "linux" });
  });

  it("handles www prefix", () => {
    expect(parseGitHubUrl("https://www.github.com/owner/repo")).toEqual({
      owner: "owner",
      repo: "repo",
    });
  });

  // ── Invalid URLs ─────────────────────────────────────────────────────────
  it("throws on empty string", () => {
    expect(() => parseGitHubUrl("")).toThrow("GitHub URL is required.");
  });

  it("throws on non-GitHub URL", () => {
    expect(() => parseGitHubUrl("https://gitlab.com/user/repo")).toThrow(
      "Invalid GitHub URL"
    );
  });

  it("throws on URL with only owner (no repo)", () => {
    expect(() => parseGitHubUrl("https://github.com/vercel")).toThrow();
  });

  it("throws on plain text", () => {
    expect(() => parseGitHubUrl("not a url at all")).toThrow(
      "Invalid GitHub URL"
    );
  });

  it("throws on reserved GitHub path", () => {
    expect(() =>
      parseGitHubUrl("https://github.com/explore/repos")
    ).toThrow('"explore" is a reserved GitHub path');
  });
});

describe("GitHubFetchError", () => {
  it("sets code and message correctly", () => {
    const err = new GitHubFetchError("NOT_FOUND", "Repo not found.");
    expect(err.code).toBe("NOT_FOUND");
    expect(err.message).toBe("Repo not found.");
    expect(err.name).toBe("GitHubFetchError");
    expect(err instanceof Error).toBe(true);
  });

  it("is instanceof Error", () => {
    const err = new GitHubFetchError("RATE_LIMITED", "Rate limited.");
    expect(err instanceof Error).toBe(true);
  });

  it("supports all error codes", () => {
    const codes = [
      "NOT_FOUND",
      "RATE_LIMITED",
      "PRIVATE_REPO",
      "EMPTY_REPO",
      "UNKNOWN",
    ] as const;
    for (const code of codes) {
      const err = new GitHubFetchError(code, "test");
      expect(err.code).toBe(code);
    }
  });
});
