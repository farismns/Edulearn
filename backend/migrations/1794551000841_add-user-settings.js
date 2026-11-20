export const shorthands = undefined;

export const up = (pgm) => {
  pgm.sql(`
    ALTER TABLE edulearn.users
      ADD COLUMN public_whatsapp VARCHAR(20),
      ADD COLUMN theme VARCHAR(10) NOT NULL DEFAULT 'System';

    ALTER TABLE edulearn.users
      ADD CONSTRAINT users_public_whatsapp_format
      CHECK (public_whatsapp IS NULL OR public_whatsapp ~ '^[1-9][0-9]{7,14}$'),
      ADD CONSTRAINT users_theme_valid
      CHECK (theme IN ('Light', 'Dark', 'System'));
  `);
};

export const down = (pgm) => {
  pgm.sql(`
    ALTER TABLE edulearn.users
      DROP CONSTRAINT users_public_whatsapp_format,
      DROP CONSTRAINT users_theme_valid,
      DROP COLUMN public_whatsapp,
      DROP COLUMN theme;
  `);
};

