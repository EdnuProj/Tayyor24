import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn("DATABASE_URL not set, using in-memory storage");
}

let db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!connectionString) {
    return null;
  }

  if (!db) {
    const sql = postgres(connectionString);
    db = drizzle(sql, { schema });
  }

  return db;
}

export { schema };
