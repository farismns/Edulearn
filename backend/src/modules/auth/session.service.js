import { generateSessionToken, hashSessionToken } from "../../utils/session.js";

import {
  createSession as createSessionRecord,
  validateAndRefreshSession,
  revokeSession,
} from "./session.repository.js";

const IDLE_TIMEOUT_MINUTES = 45;
const ABSOLUTE_TIMEOUT_HOURS = 12;

export const createUserSession = async (userId) => {
  const sessionToken = generateSessionToken();

  const sessionTokenHash = hashSessionToken(sessionToken);

  const now = Date.now();

  const expiresAt = new Date(now + ABSOLUTE_TIMEOUT_HOURS * 60 * 60 * 1000);

  const session = await createSessionRecord({
    userId,
    sessionTokenHash,
    expiresAt,
  });

  return {
    sessionToken,
    sessionId: session.id,
    expiresAt: session.expires_at,
  };
};

export const validateUserSession = async (sessionToken) => {
  if (!sessionToken) {
    return null;
  }

  const sessionTokenHash = hashSessionToken(sessionToken);

  const session = await validateAndRefreshSession(sessionTokenHash);

  return session;
};

export const revokeUserSession = async (sessionToken) => {
  if (!sessionToken) return null;

  const sessionTokenHash = hashSessionToken(sessionToken);

  return revokeSession(sessionTokenHash);
};
