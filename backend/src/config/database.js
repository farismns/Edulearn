import "dotenv/config";
import { Pool } from "pg";

// Validate database configuration
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not configured.");
}

// Create PostgreSQL connection pool
export const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Check database connection
export const checkDatabaseConnection = async () => {
  const result = await pool.query(`
    SELECT
      current_database() AS database,
      current_user AS user,
      current_schema() AS schema
  `);

  return result.rows[0];
};

// Close database connection pool
export const closeDatabaseConnection = async () => {
  await pool.end();
};
