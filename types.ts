// ---------------------------------------------------------------------------
// API request / response shapes shared between client and server
// ---------------------------------------------------------------------------

export interface GenerateRequest {
  /** Full GitHub repository URL */
  url: string;
}

export interface GenerateSuccessResponse {
  success: true;
  markdown: string;
  meta: {
    owner: string;
    repo: string;
    stars: number;
    language: string | null;
    tokensUsed: number;
  };
}

export interface GenerateErrorResponse {
  success: false;
  error: string;
  code:
    | "INVALID_URL"
    | "NOT_FOUND"
    | "RATE_LIMITED"
    | "PRIVATE_REPO"
    | "EMPTY_REPO"
    | "AI_ERROR"
    | "TIMEOUT"
    | "SERVER_ERROR";
}

export type GenerateResponse = GenerateSuccessResponse | GenerateErrorResponse;

// ---------------------------------------------------------------------------
// Client-side state machine
// ---------------------------------------------------------------------------

export type AppStatus =
  | "idle"
  | "fetching_repo"
  | "generating"
  | "success"
  | "error";

export interface AppState {
  status: AppStatus;
  markdown: string | null;
  error: string | null;
  meta: GenerateSuccessResponse["meta"] | null;
}
