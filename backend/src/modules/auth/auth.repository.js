import { pool } from "../../config/database.js";
import { revokeAllUserSessions } from "./session.repository.js";

const PASSWORD_RESET_TOKEN_EXPIRY_MINUTES = 15;

export const findUserByEmail = async (email) => {
  const query = `
    SELECT
      id,
      full_name,
      email,
      password_hash,
      email_verified_at,
      created_at,
      updated_at
    FROM edulearn.users
    WHERE email = $1
    LIMIT 1
  `;

  const result = await pool.query(query, [email]);

  return result.rows[0] || null;
};

export const createUserWithVerificationToken = async ({
  fullName,
  email,
  passwordHash,
  tokenHash,
  expiresAt,
  enforceSingleAccount = false,
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    if (enforceSingleAccount) {
      // Serialize initial account registration in Production.
      await client.query(`
        SELECT pg_advisory_xact_lock(741852963)
      `);

      const existingUser = await client.query(`
        SELECT id
        FROM edulearn.users
        LIMIT 1
      `);

      if (existingUser.rowCount > 0) {
        await client.query("ROLLBACK");
        return null;
      }
    }

    const userQuery = `
      INSERT INTO edulearn.users (
        full_name,
        email,
        password_hash
      )
      VALUES ($1, $2, $3)
      RETURNING
        id,
        full_name,
        email,
        email_verified_at,
        created_at
    `;

    const userResult = await client.query(userQuery, [
      fullName,
      email,
      passwordHash,
    ]);

    const user = userResult.rows[0];

    const tokenQuery = `
      INSERT INTO edulearn.email_verification_tokens (
        user_id,
        token_hash,
        expires_at
      )
      VALUES ($1, $2, $3)
      RETURNING id, expires_at
    `;

    const tokenResult = await client.query(tokenQuery, [
      user.id,
      tokenHash,
      expiresAt,
    ]);

    await client.query("COMMIT");

    return {
      user,
      verificationToken: tokenResult.rows[0],
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const verifyEmailToken = async (tokenHash) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Find and lock a valid verification token.
    const tokenQuery = `
      SELECT id, user_id
      FROM edulearn.email_verification_tokens
      WHERE token_hash = $1
        AND used_at IS NULL
        AND expires_at > CURRENT_TIMESTAMP
      FOR UPDATE
    `;

    const tokenResult = await client.query(tokenQuery, [tokenHash]);

    if (tokenResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    const token = tokenResult.rows[0];

    // 2. Activate the user account.
    const userQuery = `
      UPDATE edulearn.users
      SET
        email_verified_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
        AND email_verified_at IS NULL
      RETURNING
        id,
        full_name,
        email,
        email_verified_at
    `;

    const userResult = await client.query(userQuery, [token.user_id]);

    if (userResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    // 3. Mark the verification token as used.
    await client.query(
      `
        UPDATE edulearn.email_verification_tokens
        SET used_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `,
      [token.id],
    );

    await client.query("COMMIT");

    return userResult.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const createResendVerificationToken = async ({
  email,
  tokenHash,
  expiresAt,
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Find and lock the user account.
    const userQuery = `
      SELECT
        id,
        full_name,
        email,
        email_verified_at
      FROM edulearn.users
      WHERE email = $1
      FOR UPDATE
    `;

    const userResult = await client.query(userQuery, [email]);

    if (userResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    const user = userResult.rows[0];

    // 2. Only allow unverified accounts.
    if (user.email_verified_at) {
      await client.query("ROLLBACK");
      return null;
    }

    // 3. Invalidate previous verification tokens.
    await client.query(
      `
        UPDATE edulearn.email_verification_tokens
        SET used_at = CURRENT_TIMESTAMP
        WHERE user_id = $1
          AND used_at IS NULL
      `,
      [user.id],
    );

    // 4. Create a new verification token.
    const tokenQuery = `
      INSERT INTO edulearn.email_verification_tokens (
        user_id,
        token_hash,
        expires_at
      )
      VALUES ($1, $2, $3)
      RETURNING id, expires_at
    `;

    const tokenResult = await client.query(tokenQuery, [
      user.id,
      tokenHash,
      expiresAt,
    ]);

    await client.query("COMMIT");

    return {
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
      },
      verificationTokenExpiresAt: tokenResult.rows[0].expires_at,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const findUserById = async (userId) => {
  const query = `
    SELECT
      id,
      full_name,
      email,
      email_verified_at
    FROM edulearn.users
    WHERE id = $1
    LIMIT 1
  `;

  const result = await pool.query(query, [userId]);

  return result.rows[0] || null;
};

export const findUserPasswordById = async (userId) => {
  const result = await pool.query(
    `
      SELECT id, password_hash
      FROM edulearn.users
      WHERE id = $1
      LIMIT 1
    `,
    [userId],
  );

  return result.rows[0] || null;
};

export const createPasswordResetToken = async ({ email, tokenHash }) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const userResult = await client.query(
      `
        SELECT id, full_name, email
        FROM edulearn.users
        WHERE email = $1
          AND email_verified_at IS NOT NULL
        FOR UPDATE
      `,
      [email],
    );

    if (userResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    const user = userResult.rows[0];

    // A newer reset request invalidates any outstanding reset links.
    await client.query(
      `
        UPDATE edulearn.password_reset_tokens
        SET used_at = CURRENT_TIMESTAMP
        WHERE user_id = $1
          AND used_at IS NULL
      `,
      [user.id],
    );

    await client.query(
      `
        INSERT INTO edulearn.password_reset_tokens (
          user_id,
          token_hash,
          expires_at
        )
        VALUES (
          $1,
          $2,
          clock_timestamp() + ($3 * INTERVAL '1 minute')
        )
      `,
      [user.id, tokenHash, PASSWORD_RESET_TOKEN_EXPIRY_MINUTES],
    );

    await client.query("COMMIT");

    return user;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const findValidPasswordResetToken = async (tokenHash) => {
  const result = await pool.query(
    `
      SELECT id, user_id
      FROM edulearn.password_reset_tokens
      WHERE token_hash = $1
        AND used_at IS NULL
        AND expires_at > clock_timestamp()
      LIMIT 1
    `,
    [tokenHash],
  );

  return result.rows[0] || null;
};

export const resetPasswordWithToken = async ({ tokenHash, passwordHash }) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Resolve ownership without locking the token, so every writer locks
    // rows in the same order: user first, then reset token.
    const tokenResult = await client.query(
      `
        SELECT user_id
        FROM edulearn.password_reset_tokens
        WHERE token_hash = $1
        LIMIT 1
      `,
      [tokenHash],
    );

    if (tokenResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    const userId = tokenResult.rows[0].user_id;

    const userLockResult = await client.query(
      `
        SELECT id
        FROM edulearn.users
        WHERE id = $1
        FOR UPDATE
      `,
      [userId],
    );

    if (userLockResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    // Revalidate and lock only after acquiring the user row lock.
    const lockedTokenResult = await client.query(
      `
        SELECT id, user_id
        FROM edulearn.password_reset_tokens
        WHERE token_hash = $1
          AND user_id = $2
          AND used_at IS NULL
          AND expires_at > clock_timestamp()
        FOR UPDATE
      `,
      [tokenHash, userId],
    );

    if (lockedTokenResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    const token = lockedTokenResult.rows[0];

    const consumeResult = await client.query(
      `
        UPDATE edulearn.password_reset_tokens
        SET used_at = CURRENT_TIMESTAMP
        WHERE id = $1
          AND used_at IS NULL
          AND expires_at > clock_timestamp()
        RETURNING user_id
      `,
      [token.id],
    );

    if (consumeResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    const userResult = await client.query(
      `
        UPDATE edulearn.users
        SET password_hash = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id
      `,
      [passwordHash, token.user_id],
    );

    if (userResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    await revokeAllUserSessions(token.user_id, client);
    await client.query("COMMIT");

    return { userId: token.user_id };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const updatePasswordAndRevokeSessions = async ({
  userId,
  passwordHash,
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const userResult = await client.query(
      `
        UPDATE edulearn.users
        SET password_hash = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id
      `,
      [passwordHash, userId],
    );

    if (userResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    await revokeAllUserSessions(userId, client);
    await client.query("COMMIT");

    return { userId };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
