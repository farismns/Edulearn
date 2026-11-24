const STATE_CHANGING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function isCsrfFailure(status, message) {
  return status === 403 && message === "CSRF validation failed.";
}

export function shouldRetryCsrf({ method, attempt, status, message }) {
  return (
    STATE_CHANGING_METHODS.has(method.toUpperCase()) &&
    attempt === 0 &&
    isCsrfFailure(status, message)
  );
}

export function shouldNotifyUnauthorized({
  status,
  requiresSession,
  suppressAuthEvents,
}) {
  return status === 401 && requiresSession && !suppressAuthEvents;
}

export function shouldNotifyRateLimited(status) {
  return status === 429;
}

export function getSessionStatusFromHttp(status) {
  if (status === 200) return "authenticated";
  if (status === 401) return "unauthenticated";
  return "error";
}

export function getLogoutClientState(serverRevocationConfirmed) {
  return {
    status: "unauthenticated",
    serverRevocationConfirmed,
  };
}

export function getSafeInternalPath(value) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  return value;
}
