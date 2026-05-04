#!/usr/bin/env node
/**
 * Creates or updates an admin user in the TuPack users table.
 *
 * Usage:
 *   node scripts/create-admin.js <email> <nombre> <password>
 *
 * Example (initial setup):
 *   node scripts/create-admin.js admintupack@mail.com Admin tupack@2026
 *
 * Requires: TUPACK_DATABASE_URL (or DATABASE_URL) set in the environment.
 */

import bcrypt from "bcryptjs";
import pg from "pg";

const [, , email, nombre, password] = process.argv;

if (!email || !nombre || !password) {
  console.error("Usage: node scripts/create-admin.js <email> <nombre> <password>");
  process.exit(1);
}

const connectionString = process.env.TUPACK_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error("TUPACK_DATABASE_URL or DATABASE_URL environment variable is required.");
  process.exit(1);
}

const { Pool } = pg;
const pool = new Pool({ connectionString });

async function main() {
  const hash = await bcrypt.hash(password, 10);
  const { rows } = await pool.query(
    "INSERT INTO users (email, password, nombre, activo, created_at) VALUES ($1, $2, $3, true, NOW()) ON CONFLICT (email) DO UPDATE SET password = $2, nombre = $3, activo = true RETURNING id, email, nombre",
    [email, hash, nombre]
  );
  const user = rows[0];
  console.log(`Admin user ready: id=${user.id} email=${user.email} nombre=${user.nombre}`);
  await pool.end();
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
