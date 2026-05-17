import { Octokit } from "@octokit/rest";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RepoMetadata {
  owner: string;
  repo: string;
  description: string | null;
  stars: number;
  forks: number;
  language: string | null;
  topics: string[];
  license: string | null;
  defaultBranch: string;
  homepage: string | null;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RepoFile {
  name: string;
  path: string;
  type: "file" | "dir" | "symlink" | "submodule";
}

export interface RepoData {
  metadata: RepoMetadata;
  fileTree: RepoFile[];
  packageJson: Record<string, unknown> | null;
  existingReadme: string | null;
  detectedLanguages: string[];
}

export interface ParsedGitHubUrl {
  owner: string;
  repo: string;
}

export type GitHubError =
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "PRIVATE_REPO"
  | "AUTH_ERROR"
  | "EMPTY_REPO"
  | "UNKNOWN";

export class GitHubFetchError extends Error {
  constructor(
    public readonly code: GitHubError,
    message: string
  ) {
    super(message);
    this.name = "GitHubFetchError";
  }
}

// ---------------------------------------------------------------------------
// URL parsing
// ---------------------------------------------------------------------------

/**
 * Validates and extracts owner/repo from a GitHub URL.
 * Supports:
 *   https://github.com/owner/repo
 *   https://github.com/owner/repo.git
 *   https://github.com/owner/repo/tree/branch
 *   github.com/owner/repo
 */
export function parseGitHubUrl(url: string): ParsedGitHubUrl {
  // Trim and normalise
  const trimmed = url.trim();

  // Must not be empty
  if (!trimmed) {
    throw new Error("GitHub URL is required.");
  }

  // Reject obvious non-GitHub URLs early
  const GITHUB_PATTERN =
    /^(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)/;

  const match = trimmed.match(GITHUB_PATTERN);
  if (!match) {
    throw new Error(
      "Invalid GitHub URL. Expected format: https://github.com/owner/repo"
    );
  }

  const owner = match[1];
  // Strip .git suffix
  const repo = match[2].replace(/\.git$/, "");

  // Basic sanity: owner/repo should not contain spaces or be empty
  if (!owner || !repo) {
    throw new Error("Could not extract owner and repository name from URL.");
  }

  // Guard against GitHub reserved paths that are not repos
  const RESERVED = ["about", "explore", "marketplace", "topics", "collections"];
  if (RESERVED.includes(owner.toLowerCase())) {
    throw new Error(`"${owner}" is a reserved GitHub path, not a user/org.`);
  }

  return { owner, repo };
}

// ---------------------------------------------------------------------------
// Octokit singleton
// ---------------------------------------------------------------------------

function createOctokit(): Octokit {
  return new Octokit({
    auth: process.env.GITHUB_TOKEN || undefined,
    throttle: {
      onRateLimit: () => false,
      onSecondaryRateLimit: () => false,
    },
  });
}

// ---------------------------------------------------------------------------
// Fetch helpers
// ---------------------------------------------------------------------------

/** Converts Octokit status codes into typed errors */
function mapOctokitError(err: unknown): GitHubFetchError {
  if (err && typeof err === "object" && "status" in err) {
    const status = (err as { status: number }).status;
    if (status === 401) {
      return new GitHubFetchError(
        "AUTH_ERROR",
        "GitHub authentication failed. Check GITHUB_TOKEN and ensure it is valid."
      );
    }
    if (status === 404) {
      return new GitHubFetchError(
        "NOT_FOUND",
        "Repository not found. It may be private or does not exist."
      );
    }
    if (status === 403 || status === 429) {
      return new GitHubFetchError(
        "RATE_LIMITED",
        "GitHub API rate limit exceeded. Add a GITHUB_TOKEN to increase limits."
      );
    }
    if (status === 451) {
      return new GitHubFetchError(
        "PRIVATE_REPO",
        "Repository is not accessible."
      );
    }
  }
  return new GitHubFetchError(
    "UNKNOWN",
    err instanceof Error ? err.message : "Unknown GitHub API error."
  );
}

/** Safely fetch a single file's content (base64 → utf-8). Returns null if missing. */
async function fetchFileContent(
  octokit: Octokit,
  owner: string,
  repo: string,
  path: string
): Promise<string | null> {
  try {
    const { data } = await octokit.repos.getContent({ owner, repo, path });
    if (Array.isArray(data) || data.type !== "file") return null;
    if (!("content" in data) || typeof data.content !== "string") return null;
    return Buffer.from(data.content, "base64").toString("utf-8");
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Main fetch function
// ---------------------------------------------------------------------------

/**
 * Fetches all data needed to generate a README for a GitHub repository.
 * Designed to be fast: concurrent fetches, early exits, size guards.
 */
export async function fetchRepoData(
  owner: string,
  repo: string
): Promise<RepoData> {
  const octokit = createOctokit();

  // ── 1. Repository metadata ────────────────────────────────────────────────
  let repoResponse: Awaited<ReturnType<typeof octokit.repos.get>>;
  try {
    repoResponse = await octokit.repos.get({ owner, repo });
  } catch (err) {
    throw mapOctokitError(err);
  }

  const r = repoResponse.data;

  if (r.private) {
    throw new GitHubFetchError(
      "PRIVATE_REPO",
      "This repository is private. Only public repositories are supported."
    );
  }

  const metadata: RepoMetadata = {
    owner,
    repo,
    description: r.description ?? null,
    stars: r.stargazers_count ?? 0,
    forks: r.forks_count ?? 0,
    language: r.language ?? null,
    topics: r.topics ?? [],
    license: r.license?.spdx_id ?? null,
    defaultBranch: r.default_branch ?? "main",
    homepage: r.homepage ?? null,
    isPrivate: r.private,
    createdAt: r.created_at ?? "",
    updatedAt: r.updated_at ?? "",
  };

  // ── 2. Root file tree + common files (concurrent) ────────────────────────
  const [rootContents, packageJsonRaw, readmeRaw, packageLockRaw, pipfileRaw] =
    await Promise.all([
      // Root directory listing
      octokit.repos
        .getContent({ owner, repo, path: "" })
        .then((res) => {
          if (!Array.isArray(res.data)) return [] as RepoFile[];
          return res.data.map((item) => ({
            name: item.name,
            path: item.path,
            type: item.type as RepoFile["type"],
          }));
        })
        .catch(() => [] as RepoFile[]),

      // package.json
      fetchFileContent(octokit, owner, repo, "package.json"),

      // README (try common casings)
      (async () => {
        for (const name of ["README.md", "readme.md", "Readme.md", "README"]) {
          const content = await fetchFileContent(octokit, owner, repo, name);
          if (content) return content;
        }
        return null;
      })(),

      // package-lock / yarn.lock (just check existence for package manager detection)
      fetchFileContent(octokit, owner, repo, "package-lock.json"),
      fetchFileContent(octokit, owner, repo, "Pipfile"),
    ]);

  if (rootContents.length === 0) {
    throw new GitHubFetchError("EMPTY_REPO", "Repository appears to be empty.");
  }

  // ── 3. Parse package.json ─────────────────────────────────────────────────
  let packageJson: Record<string, unknown> | null = null;
  if (packageJsonRaw) {
    try {
      packageJson = JSON.parse(packageJsonRaw) as Record<string, unknown>;
    } catch {
      // Malformed package.json – ignore
    }
  }

  // ── 4. Detect languages from file extensions ─────────────────────────────
  const EXT_TO_LANG: Record<string, string> = {
    ".ts": "TypeScript",
    ".tsx": "TypeScript (React)",
    ".js": "JavaScript",
    ".jsx": "JavaScript (React)",
    ".py": "Python",
    ".go": "Go",
    ".rs": "Rust",
    ".java": "Java",
    ".cs": "C#",
    ".cpp": "C++",
    ".c": "C",
    ".rb": "Ruby",
    ".php": "PHP",
    ".swift": "Swift",
    ".kt": "Kotlin",
    ".dart": "Dart",
    ".ex": "Elixir",
    ".vue": "Vue.js",
    ".svelte": "Svelte",
  };

  const detectedSet = new Set<string>();
  if (metadata.language) detectedSet.add(metadata.language);
  if (packageLockRaw !== null) detectedSet.add("Node.js (npm)");
  if (pipfileRaw !== null) detectedSet.add("Python (pipenv)");

  for (const file of rootContents) {
    const ext = file.name.includes(".")
      ? "." + file.name.split(".").pop()!.toLowerCase()
      : "";
    if (EXT_TO_LANG[ext]) detectedSet.add(EXT_TO_LANG[ext]);
  }

  // Trim README to 2000 chars to avoid bloating the AI prompt
  const trimmedReadme =
    readmeRaw && readmeRaw.length > 2000
      ? readmeRaw.slice(0, 2000) + "\n... [truncated]"
      : readmeRaw;

  return {
    metadata,
    fileTree: rootContents,
    packageJson,
    existingReadme: trimmedReadme,
    detectedLanguages: Array.from(detectedSet),
  };
}
