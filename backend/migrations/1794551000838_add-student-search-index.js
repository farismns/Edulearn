export const shorthands = undefined;

export const up = (pgm) => {
  pgm.sql(`
    CREATE INDEX idx_students_user_status_name_ci
      ON edulearn.students (user_id, status, LOWER(full_name), id);
  `);
};

export const down = (pgm) => {
  pgm.sql(`DROP INDEX edulearn.idx_students_user_status_name_ci;`);
};

