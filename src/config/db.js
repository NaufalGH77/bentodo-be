import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;
const TIMESTAMP_OID = 1114;

pkg.types.setTypeParser(TIMESTAMP_OID, (value) => {
  return new Date(`${value}Z`);
});

const isProduction = process.env.NODE_ENV === "production";

// Support either a single DATABASE_URL or separate DB_* env vars
const {
  DB_USERNAME,
  DB_PASSWORD,
  DB_HOST,
  DB_PORT,
  DB_DATABASE,
} = process.env;

const defaultHost = DB_HOST || "localhost";
const defaultPort = DB_PORT || "5432";

const connectionString =
  process.env.DATABASE_URL ||
  `postgres://${encodeURIComponent(DB_USERNAME || "postgres")}:${encodeURIComponent(
    DB_PASSWORD || "",
  )}@${defaultHost}:${defaultPort}/${DB_DATABASE || "postgres"}`;

const shouldUseSSL =
  process.env.DB_SSL === "true" ||
  (process.env.DB_SSL !== "false" && isProduction && !!process.env.DATABASE_URL);

export const db = new Pool({
  connectionString,
  ssl: shouldUseSSL
    ? {
        rejectUnauthorized: false,
      }
    : false,
  max: Number(process.env.DB_POOL_MAX) || 10,
  idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS) || 30000,
  connectionTimeoutMillis:
    Number(process.env.DB_CONNECTION_TIMEOUT_MS) || 10000,
});

db.on("error", (error) => {
  console.error("UNEXPECTED DATABASE POOL ERROR:", error.message);
});

export default db;
