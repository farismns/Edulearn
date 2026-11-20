export const shorthands = undefined;

export const up = (pgm) => {
  pgm.sql(`
    CREATE TABLE edulearn.students (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

      user_id BIGINT NOT NULL,

      full_name VARCHAR(150) NOT NULL,
      education_level VARCHAR(30) NOT NULL,

      student_contact VARCHAR(30),
      guardian_name VARCHAR(150),
      guardian_whatsapp VARCHAR(20),

      avatar VARCHAR(50) NOT NULL,

      status VARCHAR(20) NOT NULL DEFAULT 'Active',
      archived_at TIMESTAMPTZ,

      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

      CONSTRAINT students_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES edulearn.users(id)
        ON DELETE RESTRICT,

      CONSTRAINT students_full_name_not_empty
        CHECK (BTRIM(full_name) <> ''),

      CONSTRAINT students_education_level_valid
        CHECK (
          education_level IN (
            'Elementary School',
            'Junior High School'
          )
        ),

      CONSTRAINT students_status_valid
        CHECK (status IN ('Active', 'Archived'))
    );

    CREATE INDEX idx_students_user_status
      ON edulearn.students(user_id, status);
  `);
};

export const down = (pgm) => {
  pgm.sql(`
    DROP TABLE edulearn.students;
  `);
};
