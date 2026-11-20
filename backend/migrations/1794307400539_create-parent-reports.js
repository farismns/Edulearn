export const shorthands = undefined;

export const up = (pgm) => {
  pgm.sql(`
    CREATE TABLE edulearn.parent_reports (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      student_id BIGINT NOT NULL,
      reporting_month DATE NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

      CONSTRAINT parent_reports_student_id_fkey
        FOREIGN KEY (student_id)
        REFERENCES edulearn.students(id)
        ON DELETE RESTRICT,

      CONSTRAINT parent_reports_month_first_day
        CHECK (EXTRACT(DAY FROM reporting_month) = 1),

      CONSTRAINT parent_reports_student_month_unique
        UNIQUE (student_id, reporting_month)
    );
  `);
};

export const down = (pgm) => {
  pgm.sql(`
    DROP TABLE edulearn.parent_reports;
  `);
};
