export const shorthands = undefined;

export const up = (pgm) => {
  pgm.sql(`
    CREATE TABLE edulearn.users (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

      full_name VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,

      avatar VARCHAR(50),
      email_verified_at TIMESTAMPTZ,

      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

      CONSTRAINT users_email_normalized
        CHECK (email = LOWER(BTRIM(email))),

      CONSTRAINT users_email_not_empty
        CHECK (BTRIM(email) <> ''),

      CONSTRAINT users_full_name_not_empty
        CHECK (BTRIM(full_name) <> '')
    );
  `);
};

export const down = (pgm) => {
  pgm.sql(`
    DROP TABLE edulearn.users;
  `);
};
