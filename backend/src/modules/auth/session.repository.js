import { pool } from "../../config/database.js";

export const createSession = async ({
  userId,
  sessionTokenHash,
  expiresAt,
}) => {
  const query = `
    INSERT INTO edulearn.sessions (
      user_id,
      session_token_hash,
      expires_at
    )
    VALUES ($1, $2, $3)
    RETURNING
      id,
      user_id,
      created_at,
      last_activity_at,
      expires_at
  `;

  const values = [userId, sessionTokenHash, expiresAt];

  const result = await pool.query(query, values);

  return result.rows[0];
};

export const validateAndRefreshSession = async (sessionTokenHash) => {
  const query = `
    UPDATE edulearn.sessions
    SET last_activity_at = CURRENT_TIMESTAMP
    WHERE session_token_hash = $1
      AND revoked_at IS NULL
      AND expires_at > CURRENT_TIMESTAMP
      AND last_activity_at > CURRENT_TIMESTAMP - INTERVAL '45 minutes'
    RETURNING
      id,
      user_id,
      last_activity_at,
      expires_at
  `;

  const result = await pool.query(query, [sessionTokenHash]);

  return result.rows[0] || null;
};

export const revokeSession = async (sessionTokenHash) => {
  const query = `
    UPDATE edulearn.sessions
    SET revoked_at = CURRENT_TIMESTAMP
    WHERE session_token_hash = $1
      AND revoked_at IS NULL
    RETURNING id
  `;

  const result = await pool.query(query, [sessionTokenHash]);

  return result.rows[0] || null;
};

export const revokeAllUserSessions = async (userId, client = pool) => {
  const query = `
    UPDATE edulearn.sessions
    SET revoked_at = CURRENT_TIMESTAMP
    WHERE user_id = $1
      AND revoked_at IS NULL
    RETURNING id
  `;

  const result = await client.query(query, [userId]);

  return result.rows;
};
