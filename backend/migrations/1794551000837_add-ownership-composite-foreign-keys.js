export const shorthands = undefined;

export const up = (pgm) => {
  pgm.sql(`
    -- 1. Add composite unique constraints to parent tables

    ALTER TABLE edulearn.students
      ADD CONSTRAINT uq_students_user_id_id
      UNIQUE (user_id, id);

    ALTER TABLE edulearn.subjects
      ADD CONSTRAINT uq_subjects_user_id_id
      UNIQUE (user_id, id);


    -- 2. Add user_id to student_subjects

    ALTER TABLE edulearn.student_subjects
      ADD COLUMN user_id BIGINT;

    -- Populate user_id based on the student ownership

    UPDATE edulearn.student_subjects ss
    SET user_id = st.user_id
    FROM edulearn.students st
    WHERE st.id = ss.student_id;

    -- Make user_id mandatory

    ALTER TABLE edulearn.student_subjects
      ALTER COLUMN user_id SET NOT NULL;


    -- 3. Replace schedules foreign keys

    ALTER TABLE edulearn.schedules
      DROP CONSTRAINT schedules_student_id_fkey;

    ALTER TABLE edulearn.schedules
      DROP CONSTRAINT schedules_subject_id_fkey;

    -- Student must belong to the same tutor

    ALTER TABLE edulearn.schedules
      ADD CONSTRAINT schedules_user_student_fkey
      FOREIGN KEY (user_id, student_id)
      REFERENCES edulearn.students (user_id, id)
      ON DELETE RESTRICT;

    -- Subject must belong to the same tutor.
    -- When subject is deleted, only subject_id becomes NULL.

    ALTER TABLE edulearn.schedules
      ADD CONSTRAINT schedules_user_subject_fkey
      FOREIGN KEY (user_id, subject_id)
      REFERENCES edulearn.subjects (user_id, id)
      ON DELETE SET NULL (subject_id);


    -- 4. Replace student_subjects foreign keys

    ALTER TABLE edulearn.student_subjects
      DROP CONSTRAINT student_subjects_student_id_fkey;

    ALTER TABLE edulearn.student_subjects
      DROP CONSTRAINT student_subjects_subject_id_fkey;

    -- Student and subject must belong to the same tutor

    ALTER TABLE edulearn.student_subjects
      ADD CONSTRAINT student_subjects_user_student_fkey
      FOREIGN KEY (user_id, student_id)
      REFERENCES edulearn.students (user_id, id)
      ON DELETE RESTRICT;

    ALTER TABLE edulearn.student_subjects
      ADD CONSTRAINT student_subjects_user_subject_fkey
      FOREIGN KEY (user_id, subject_id)
      REFERENCES edulearn.subjects (user_id, id)
      ON DELETE RESTRICT;
  `);
};

export const down = (pgm) => {
  pgm.sql(`
    -- 1. Remove composite foreign keys from schedules

    ALTER TABLE edulearn.schedules
      DROP CONSTRAINT schedules_user_student_fkey;

    ALTER TABLE edulearn.schedules
      DROP CONSTRAINT schedules_user_subject_fkey;

    -- Restore original schedules foreign keys

    ALTER TABLE edulearn.schedules
      ADD CONSTRAINT schedules_student_id_fkey
      FOREIGN KEY (student_id)
      REFERENCES edulearn.students(id)
      ON DELETE RESTRICT;

    ALTER TABLE edulearn.schedules
      ADD CONSTRAINT schedules_subject_id_fkey
      FOREIGN KEY (subject_id)
      REFERENCES edulearn.subjects(id)
      ON DELETE SET NULL;


    -- 2. Remove composite foreign keys from student_subjects

    ALTER TABLE edulearn.student_subjects
      DROP CONSTRAINT student_subjects_user_student_fkey;

    ALTER TABLE edulearn.student_subjects
      DROP CONSTRAINT student_subjects_user_subject_fkey;

    -- Restore original foreign keys

    ALTER TABLE edulearn.student_subjects
      ADD CONSTRAINT student_subjects_student_id_fkey
      FOREIGN KEY (student_id)
      REFERENCES edulearn.students(id)
      ON DELETE RESTRICT;

    ALTER TABLE edulearn.student_subjects
      ADD CONSTRAINT student_subjects_subject_id_fkey
      FOREIGN KEY (subject_id)
      REFERENCES edulearn.subjects(id)
      ON DELETE RESTRICT;

    -- Remove additional ownership column

    ALTER TABLE edulearn.student_subjects
      DROP COLUMN user_id;


    -- 3. Remove additional unique constraints

    ALTER TABLE edulearn.students
      DROP CONSTRAINT uq_students_user_id_id;

    ALTER TABLE edulearn.subjects
      DROP CONSTRAINT uq_subjects_user_id_id;
  `);
};
