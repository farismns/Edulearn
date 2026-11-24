const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const CSRF_ENDPOINT = "/api/auth/csrf-token";
const STATE_CHANGING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
import {
  shouldNotifyRateLimited,
  shouldNotifyUnauthorized,
  shouldRetryCsrf,
} from "@/features/auth/auth-rules.mjs";

export interface ApiResponse<TData = unknown> {
  success: boolean;
  message?: string;
  data?: TData;
  details?: unknown;
}

export class ApiError extends Error {
  readonly status: number;
  readonly details?: unknown;
  readonly response?: ApiResponse;

  constructor(status: number, message: string, response?: ApiResponse) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = response?.details;
    this.response = response;
  }
}

interface ApiFetchOptions extends RequestInit {
  suppressAuthEvents?: boolean;
  requiresSession?: boolean;
}

interface ApiEventHandlers {
  onUnauthorized?: (error: ApiError) => void;
  onRateLimited?: (error: ApiError) => void;
}

let csrfToken: string | null = null;
let csrfRequest: Promise<string> | null = null;
let apiEventHandlers: ApiEventHandlers = {};

export function setApiEventHandlers(handlers: ApiEventHandlers) {
  apiEventHandlers = handlers;
}

async function readResponse(response: Response): Promise<ApiResponse> {
  const text = await response.text();

  if (!text) {
    return { success: response.ok };
  }

  try {
    return JSON.parse(text) as ApiResponse;
  } catch {
    return {
      success: response.ok,
      message: text,
    };
  }
}

async function requestCsrfToken(): Promise<string> {
  const response = await fetch(`${API_BASE_URL}${CSRF_ENDPOINT}`, {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  const payload = await readResponse(response);

  if (!response.ok || typeof payload.data !== "object" || !payload.data) {
    throw new ApiError(
      response.status,
      payload.message || "Unable to acquire a CSRF token.",
      payload,
    );
  }

  const token = (payload.data as { csrfToken?: unknown }).csrfToken;

  if (typeof token !== "string" || token.length === 0) {
    throw new ApiError(502, "The CSRF token response was invalid.", payload);
  }

  return token;
}

async function ensureCsrfToken(forceRefresh = false): Promise<string> {
  if (!forceRefresh && csrfToken) {
    return csrfToken;
  }

  if (!csrfRequest) {
    csrfRequest = requestCsrfToken().then((token) => {
      csrfToken = token;
      return token;
    });

    csrfRequest.then(
      () => {
        csrfRequest = null;
      },
      () => {
        csrfRequest = null;
      },
    );
  }

  return csrfRequest;
}

function notifyApiError(
  error: ApiError,
  suppressAuthEvents: boolean,
  requiresSession: boolean,
) {
  if (shouldNotifyUnauthorized({ status: error.status, requiresSession, suppressAuthEvents })) {
    apiEventHandlers.onUnauthorized?.(error);
  }

  if (shouldNotifyRateLimited(error.status)) {
    apiEventHandlers.onRateLimited?.(error);
  }
}

export async function apiFetch<TData = unknown>(
  endpoint: string,
  options: ApiFetchOptions = {},
): Promise<ApiResponse<TData>> {
  const method = (options.method || "GET").toUpperCase();
  const isStateChanging = STATE_CHANGING_METHODS.has(method);
  const suppressAuthEvents = options.suppressAuthEvents === true;
  const requiresSession = options.requiresSession === true;
  const requestOptions = Object.fromEntries(
    Object.entries(options).filter(
      ([key]) => key !== "suppressAuthEvents" && key !== "requiresSession",
    ),
  ) as RequestInit;
  const headers = new Headers(requestOptions.headers);

  if (!headers.has("Content-Type") && requestOptions.body) {
    headers.set("Content-Type", "application/json");
  }

  for (let attempt = 0; attempt < 2; attempt += 1) {
    if (isStateChanging) {
      headers.set("X-CSRF-Token", await ensureCsrfToken(attempt === 1));
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...requestOptions,
      method,
      credentials: "include",
      headers,
    });
    const payload = await readResponse(response);

    if (response.ok) {
      return payload as ApiResponse<TData>;
    }

    const error = new ApiError(
      response.status,
      payload.message || `Request failed with status ${response.status}.`,
      payload,
    );

    if (
      shouldRetryCsrf({
        method,
        attempt,
        status: error.status,
        message: error.message,
      })
    ) {
      csrfToken = null;
      continue;
    }

    notifyApiError(error, suppressAuthEvents, requiresSession);
    throw error;
  }

  throw new ApiError(403, "CSRF validation failed.");
}
