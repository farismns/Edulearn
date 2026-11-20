export const shorthands = undefined;

export const up = (pgm) => {
  pgm.sql(`
    CREATE TABLE edulearn.sessions (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

      user_id BIGINT NOT NULL,
      session_token_hash VARCHAR(64) NOT NULL UNIQUE,

      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_activity_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMPTZ NOT NULL,
      revoked_at TIMESTAMPTZ,

      CONSTRAINT sessions_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES edulearn.users(id)
        ON DELETE RESTRICT,

      CONSTRAINT sessions_token_hash_format
        CHECK (session_token_hash ~ '^[a-f0-9]{64}$'),

      CONSTRAINT sessions_expiration_valid
        CHECK (expires_at > created_at),

      CONSTRAINT sessions_revocation_valid
        CHECK (revoked_at IS NULL OR revoked_at >= created_at)
    );

    CREATE INDEX idx_sessions_user_revoked
      ON edulearn.sessions(user_id, revoked_at);

    CREATE INDEX idx_sessions_expires_at
      ON edulearn.sessions(expires_at);
  `);
};

export const down = (pgm) => {
  pgm.sql(`
    DROP TABLE edulearn.sessions;
  `);
};
