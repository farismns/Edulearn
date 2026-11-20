export const shorthands = undefined;

export const up = (pgm) => {
  pgm.sql(`
    CREATE TABLE edulearn.parent_report_snapshots (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      parent_report_id BIGINT NOT NULL,
      version INTEGER NOT NULL,
      tutor_message TEXT NOT NULL,
      snapshot_data JSONB NOT NULL,
      pdf_object_key VARCHAR(500),
      file_name VARCHAR(255),
      content_type VARCHAR(100),
      file_size BIGINT,
      generated_at TIMESTAMPTZ NOT NULL,

      CONSTRAINT parent_report_snapshots_report_id_fkey
        FOREIGN KEY (parent_report_id)
        REFERENCES edulearn.parent_reports(id)
        ON DELETE RESTRICT,

      CONSTRAINT parent_report_snapshots_version_positive
        CHECK (version > 0),

      CONSTRAINT parent_report_snapshots_message_not_empty
        CHECK (BTRIM(tutor_message) <> ''),

      CONSTRAINT parent_report_snapshots_data_object
        CHECK (JSONB_TYPEOF(snapshot_data) = 'object'),

      CONSTRAINT parent_report_snapshots_file_size_non_negative
        CHECK (file_size IS NULL OR file_size >= 0),

      CONSTRAINT parent_report_snapshots_report_version_unique
        UNIQUE (parent_report_id, version)
    );
  `);
};

export const down = (pgm) => {
  pgm.sql(`
    DROP TABLE edulearn.parent_report_snapshots;
  `);
};
