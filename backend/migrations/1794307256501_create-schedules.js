export const shorthands = undefined;

export const up = (pgm) => {
  pgm.sql(`
    CREATE TABLE edulearn.schedules (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

      user_id BIGINT NOT NULL,
      student_id BIGINT NOT NULL,
      subject_id BIGINT,

      subject_name_snapshot VARCHAR(100) NOT NULL,

      scheduled_date DATE NOT NULL,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,

      notes TEXT,

      status VARCHAR(20) NOT NULL DEFAULT 'Scheduled',

      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

      CONSTRAINT schedules_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES edulearn.users(id)
        ON DELETE RESTRICT,

      CONSTRAINT schedules_student_id_fkey
        FOREIGN KEY (student_id)
        REFERENCES edulearn.students(id)
        ON DELETE RESTRICT,

      CONSTRAINT schedules_subject_id_fkey
        FOREIGN KEY (subject_id)
        REFERENCES edulearn.subjects(id)
        ON DELETE SET NULL,

      CONSTRAINT schedules_subject_name_not_empty
        CHECK (BTRIM(subject_name_snapshot) <> ''),

      CONSTRAINT schedules_end_time_after_start_time
        CHECK (end_time > start_time),

      CONSTRAINT schedules_status_valid
        CHECK (status IN ('Scheduled', 'Completed', 'Cancelled'))
    );

    CREATE INDEX idx_schedules_user_date
      ON edulearn.schedules(user_id, scheduled_date);

    CREATE INDEX idx_schedules_student_date
      ON edulearn.schedules(student_id, scheduled_date);

    CREATE INDEX idx_schedules_status
      ON edulearn.schedules(status);
  `);
};

export const down = (pgm) => {
  pgm.sql(`
    DROP TABLE edulearn.schedules;
  `);
};
