export const shorthands = undefined;

export const up = (pgm) => {
  pgm.sql(`
    INSERT INTO edulearn.subjects (user_id, name, is_default)
    SELECT u.id, defaults.name, TRUE
    FROM edulearn.users u
    CROSS JOIN (VALUES ('Mathematics'), ('English')) AS defaults(name)
    WHERE NOT EXISTS (
      SELECT 1 FROM edulearn.subjects s
      WHERE s.user_id = u.id AND LOWER(s.name) = LOWER(defaults.name)
    );

    CREATE OR REPLACE FUNCTION edulearn.seed_default_subjects_for_user()
    RETURNS TRIGGER LANGUAGE plpgsql AS $$
    BEGIN
      INSERT INTO edulearn.subjects (user_id, name, is_default)
      VALUES (NEW.id, 'Mathematics', TRUE), (NEW.id, 'English', TRUE);
      RETURN NEW;
    END;
    $$;

    CREATE TRIGGER users_seed_default_subjects
      AFTER INSERT ON edulearn.users
      FOR EACH ROW EXECUTE FUNCTION edulearn.seed_default_subjects_for_user();
  `);
};

export const down = (pgm) => {
  pgm.sql(`
    DROP TRIGGER users_seed_default_subjects ON edulearn.users;
    DROP FUNCTION edulearn.seed_default_subjects_for_user();
  `);
};

