#!/usr/bin/env node
/**
 * Usage: node scripts/create-admin.js <email> <nombre> <password>
 * Creates an admin user in the TuPack users table with a bcrypt-hashed password.
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
const pool = new Pool({ connectionString, ssl: false });

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
