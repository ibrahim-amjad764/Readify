import { NextRequest, NextResponse } from "next/server";
import { parseGitHubUrl, fetchRepoData, GitHubFetchError } from "@/lib/github";
import { generateReadme } from "@/lib/openai";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import type {
  GenerateRequest,
  GenerateResponse,
} from "@/lib/types";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

// Vercel serverless function max duration
export const maxDuration = 30;

// ---------------------------------------------------------------------------
// POST /api/generate
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse<GenerateResponse>> {
  // ── Rate limiting ──────────────────────────────────────────────────────────
  const ip = getClientIp(request);
  const rateLimitResult = checkRateLimit(ip);

  if (!rateLimitResult.allowed) {
    const retryAfterSec = Math.ceil(rateLimitResult.resetInMs / 1000);
    return NextResponse.json<GenerateResponse>(
      {
        success: false,
        error: `Rate limit exceeded. Please try again in ${retryAfterSec} seconds.`,
        code: "RATE_LIMITED",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSec),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  // ── Parse request body ────────────────────────────────────────────────────
  let body: GenerateRequest;
  try {
    body = (await request.json()) as GenerateRequest;
  } catch {
    return NextResponse.json<GenerateResponse>(
      { success: false, error: "Invalid JSON in request body.", code: "SERVER_ERROR" },
      { status: 400 }
    );
  }

  // ── Validate GitHub URL ───────────────────────────────────────────────────
  let owner: string;
  let repo: string;
  try {
    ({ owner, repo } = parseGitHubUrl(body.url));
  } catch (err) {
    return NextResponse.json<GenerateResponse>(
      {
        success: false,
        error: err instanceof Error ? err.message : "Invalid URL.",
        code: "INVALID_URL",
      },
      { status: 400 }
    );
  }

  // ── Timeout controller (25s to leave headroom before Vercel kills at 30s) ─
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25_000);

  try {
    // ── Fetch repository data ─────────────────────────────────────────────
    const repoData = await fetchRepoData(owner, repo);

    // ── Generate README ───────────────────────────────────────────────────
    const { markdown, tokensUsed } = await generateReadme({
      repoData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    return NextResponse.json<GenerateResponse>({
      success: true,
      markdown,
      meta: {
        owner,
        repo,
        stars: repoData.metadata.stars,
        language: repoData.metadata.language,
        tokensUsed,
      },
    });
  } catch (err) {
    clearTimeout(timeoutId);

    // Timeout
    if (err instanceof Error && err.name === "AbortError") {
      return NextResponse.json<GenerateResponse>(
        {
          success: false,
          error: "Request timed out (>25s). The repository may be too large or GitHub is slow.",
          code: "TIMEOUT",
        },
        { status: 504 }
      );
    }

    // GitHub-specific errors
    if (err instanceof GitHubFetchError) {
      const statusMap: Record<string, number> = {
        NOT_FOUND: 404,
        RATE_LIMITED: 429,
        PRIVATE_REPO: 403,
        AUTH_ERROR: 401,
        EMPTY_REPO: 422,
        UNKNOWN: 502,
      };
      const responseCode = err.code === "UNKNOWN" ? "AI_ERROR" : err.code;

      return NextResponse.json<GenerateResponse>(
        { success: false, error: err.message, code: responseCode },
        { status: statusMap[err.code] ?? 502 }
      );
    }

    // OpenAI / miscellaneous errors
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred.";

    console.error("[/api/generate] Unhandled error:", err);

    return NextResponse.json<GenerateResponse>(
      { success: false, error: message, code: "AI_ERROR" },
      { status: 500 }
    );
  }
}

// Block other HTTP methods
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ error: "Method not allowed." }, { status: 405 });
}
