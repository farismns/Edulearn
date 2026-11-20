export const shorthands = undefined;

export const up = (pgm) => {
  pgm.sql(`
    CREATE TABLE edulearn.subjects (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

      user_id BIGINT NOT NULL,

      name VARCHAR(100) NOT NULL,
      is_default BOOLEAN NOT NULL DEFAULT FALSE,
      status VARCHAR(20) NOT NULL DEFAULT 'Active',

      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

      CONSTRAINT subjects_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES edulearn.users(id)
        ON DELETE RESTRICT,

      CONSTRAINT subjects_name_not_empty
        CHECK (BTRIM(name) <> ''),

      CONSTRAINT subjects_name_trimmed
        CHECK (name = BTRIM(name)),

      CONSTRAINT subjects_status_valid
        CHECK (status IN ('Active', 'Inactive'))
    );

    CREATE UNIQUE INDEX uq_subjects_user_name_ci
      ON edulearn.subjects(user_id, LOWER(name));

    CREATE INDEX idx_subjects_user_status
      ON edulearn.subjects(user_id, status);
  `);
};

export const down = (pgm) => {
  pgm.sql(`
    DROP TABLE edulearn.subjects;
  `);
};
