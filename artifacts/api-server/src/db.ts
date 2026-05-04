import pg from "pg";

const { Pool } = pg;

// Use the dedicated TuPack external database URL
const connectionString = process.env.TUPACK_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("TUPACK_DATABASE_URL or DATABASE_URL must be set.");
}

export const pool = new Pool({
  connectionString,
  ssl: false,
});
