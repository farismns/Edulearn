export const shorthands = undefined;

export const up = (pgm) => {
  pgm.sql(`
    CREATE TABLE edulearn.learning_records (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

      schedule_id BIGINT NOT NULL UNIQUE,

      learning_material TEXT NOT NULL,
      notes TEXT,

      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

      CONSTRAINT learning_records_schedule_id_fkey
        FOREIGN KEY (schedule_id)
        REFERENCES edulearn.schedules(id)
        ON DELETE RESTRICT,

      CONSTRAINT learning_records_material_not_empty
        CHECK (BTRIM(learning_material) <> '')
    );
  `);
};

export const down = (pgm) => {
  pgm.sql(`
    DROP TABLE edulearn.learning_records;
  `);
};
