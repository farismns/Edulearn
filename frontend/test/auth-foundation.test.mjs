import assert from "node:assert/strict";
import test from "node:test";
import {
  getLogoutClientState,
  getSafeInternalPath,
  getSessionStatusFromHttp,
  shouldNotifyRateLimited,
  shouldNotifyUnauthorized,
  shouldRetryCsrf,
} from "../src/features/auth/auth-rules.mjs";

test("CSRF retries only the first state-changing request after the documented failure", () => {
  assert.equal(
    shouldRetryCsrf({
      method: "POST",
      attempt: 0,
      status: 403,
      message: "CSRF validation failed.",
    }),
    true,
  );
  assert.equal(
    shouldRetryCsrf({
      method: "GET",
      attempt: 0,
      status: 403,
      message: "CSRF validation failed.",
    }),
    false,
  );
  assert.equal(
    shouldRetryCsrf({
      method: "POST",
      attempt: 1,
      status: 403,
      message: "CSRF validation failed.",
    }),
    false,
  );
  assert.equal(
    shouldRetryCsrf({
      method: "POST",
      attempt: 0,
      status: 403,
      message: "Forbidden.",
    }),
    false,
  );
});

test("401 auth-state notifications require a session-bound request", () => {
  assert.equal(
    shouldNotifyUnauthorized({
      status: 401,
      requiresSession: true,
      suppressAuthEvents: false,
    }),
    true,
  );
  assert.equal(
    shouldNotifyUnauthorized({
      status: 401,
      requiresSession: false,
      suppressAuthEvents: false,
    }),
    false,
  );
  assert.equal(
    shouldNotifyUnauthorized({
      status: 401,
      requiresSession: true,
      suppressAuthEvents: true,
    }),
    false,
  );
});

test("429 responses are centrally recognizable without changing auth state", () => {
  assert.equal(shouldNotifyRateLimited(429), true);
  assert.equal(shouldNotifyRateLimited(401), false);
});

test("session transitions distinguish unauthenticated from unexpected errors", () => {
  assert.equal(getSessionStatusFromHttp(200), "authenticated");
  assert.equal(getSessionStatusFromHttp(401), "unauthenticated");
  assert.equal(getSessionStatusFromHttp(500), "error");
});

test("logout state records whether server revocation was confirmed", () => {
  assert.deepEqual(getLogoutClientState(true), {
    status: "unauthenticated",
    serverRevocationConfirmed: true,
  });
  assert.deepEqual(getLogoutClientState(false), {
    status: "unauthenticated",
    serverRevocationConfirmed: false,
  });
});

test("redirect destinations remain internal", () => {
  assert.equal(getSafeInternalPath("/dashboard?tab=today"), "/dashboard?tab=today");
  assert.equal(getSafeInternalPath("https://example.com"), null);
  assert.equal(getSafeInternalPath("//example.com"), null);
  assert.equal(getSafeInternalPath(""), null);
});
