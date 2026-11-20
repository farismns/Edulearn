export const shorthands = undefined;

export const up = (pgm) => {
  pgm.sql(`
    CREATE TABLE edulearn.password_reset_tokens (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      user_id BIGINT NOT NULL,
      token_hash VARCHAR(64) NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

      CONSTRAINT password_reset_tokens_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES edulearn.users(id)
        ON DELETE RESTRICT,

      CONSTRAINT password_reset_tokens_hash_format
        CHECK (token_hash ~ '^[a-f0-9]{64}$'),

      CONSTRAINT password_reset_tokens_expiry
        CHECK (expires_at > created_at),

      CONSTRAINT password_reset_tokens_used_at
        CHECK (used_at IS NULL OR used_at >= created_at)
    );

    CREATE INDEX password_reset_tokens_user_id_idx
      ON edulearn.password_reset_tokens(user_id);
  `);
};

export const down = (pgm) => {
  pgm.sql(`
    DROP TABLE edulearn.password_reset_tokens;
  `);
};
