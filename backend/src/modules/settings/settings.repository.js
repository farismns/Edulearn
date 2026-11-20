import { pool } from "../../config/database.js";

const mapSettings = (row) => ({
  id: String(row.id),
  fullName: row.full_name,
  email: row.email,
  avatar: row.avatar,
  whatsappNumber: row.public_whatsapp,
  theme: row.theme,
});

const selectSettings = `
  SELECT id, full_name, email, avatar, public_whatsapp, theme
  FROM edulearn.users`;

export const getSettings = async (userId) => {
  const result = await pool.query(`${selectSettings} WHERE id = $1`, [userId]);
  return result.rows[0] ? mapSettings(result.rows[0]) : null;
};

export const updateProfile = async (userId, { fullName, avatar }) => {
  const result = await pool.query(
    `UPDATE edulearn.users
     SET full_name = $1, avatar = $2, updated_at = CURRENT_TIMESTAMP
     WHERE id = $3
     RETURNING id, full_name, email, avatar, public_whatsapp, theme`,
    [fullName, avatar, userId],
  );
  return result.rows[0] ? mapSettings(result.rows[0]) : null;
};

export const updatePublicContact = async (userId, whatsappNumber) => {
  const result = await pool.query(
    `UPDATE edulearn.users
     SET public_whatsapp = NULLIF($1, ''), updated_at = CURRENT_TIMESTAMP
     WHERE id = $2
     RETURNING id, full_name, email, avatar, public_whatsapp, theme`,
    [whatsappNumber, userId],
  );
  return result.rows[0] ? mapSettings(result.rows[0]) : null;
};

export const updateAppearance = async (userId, theme) => {
  const result = await pool.query(
    `UPDATE edulearn.users
     SET theme = $1, updated_at = CURRENT_TIMESTAMP
     WHERE id = $2
     RETURNING id, full_name, email, avatar, public_whatsapp, theme`,
    [theme, userId],
  );
  return result.rows[0] ? mapSettings(result.rows[0]) : null;
};

