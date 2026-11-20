export const shorthands = undefined;

export const up = (pgm) => {
  pgm.sql(`
    CREATE TABLE edulearn.parent_report_snapshot_subjects (
      snapshot_id BIGINT NOT NULL,
      subject_id BIGINT NOT NULL,
      subject_name_snapshot VARCHAR(100) NOT NULL,

      CONSTRAINT parent_report_snapshot_subjects_snapshot_fkey
        FOREIGN KEY (snapshot_id)
        REFERENCES edulearn.parent_report_snapshots(id)
        ON DELETE RESTRICT,

      CONSTRAINT parent_report_snapshot_subjects_subject_fkey
        FOREIGN KEY (subject_id)
        REFERENCES edulearn.subjects(id)
        ON DELETE RESTRICT,

      CONSTRAINT parent_report_snapshot_subjects_name_not_empty
        CHECK (BTRIM(subject_name_snapshot) <> ''),

      CONSTRAINT parent_report_snapshot_subjects_pk
        PRIMARY KEY (snapshot_id, subject_id)
    );

    CREATE INDEX idx_parent_report_snapshot_subjects_subject_id
      ON edulearn.parent_report_snapshot_subjects(subject_id);
  `);
};

export const down = (pgm) => {
  pgm.sql(`
    DROP TABLE edulearn.parent_report_snapshot_subjects;
  `);
};

