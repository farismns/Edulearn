export const shorthands = undefined;

export const up = (pgm) => {
  pgm.sql(`
    CREATE TABLE edulearn.student_subjects (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

      student_id BIGINT NOT NULL,
      subject_id BIGINT NOT NULL,

      assigned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

      CONSTRAINT student_subjects_student_id_fkey
        FOREIGN KEY (student_id)
        REFERENCES edulearn.students(id)
        ON DELETE RESTRICT,

      CONSTRAINT student_subjects_subject_id_fkey
        FOREIGN KEY (subject_id)
        REFERENCES edulearn.subjects(id)
        ON DELETE RESTRICT,

      CONSTRAINT uq_student_subjects_student_subject
        UNIQUE (student_id, subject_id)
    );

    CREATE INDEX idx_student_subjects_subject_id
      ON edulearn.student_subjects(subject_id);
  `);
};

export const down = (pgm) => {
  pgm.sql(`
    DROP TABLE edulearn.student_subjects;
  `);
};
