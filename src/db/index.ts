import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

function createDb(pool: Pool) {
  return drizzle(pool);
}

type Database = ReturnType<typeof createDb>;

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
  __arenaNextJsDb?: Database;
};

// اتصال فقط هنگام اولین استفاده ساخته می‌شود، نه هنگام import.
// بنابراین build بدون DATABASE_URL هم انجام می‌شود و خطا فقط در زمان اجرا رخ می‌دهد.
function getDb(): Database {
  if (globalForDb.__arenaNextJsDb) return globalForDb.__arenaNextJsDb;

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  const pool =
    globalForDb.__arenaNextJsPostgresqlPool ??
    new Pool({ connectionString: databaseUrl });

  globalForDb.__arenaNextJsPostgresqlPool = pool;
  globalForDb.__arenaNextJsDb = createDb(pool);

  return globalForDb.__arenaNextJsDb;
}

export const db = new Proxy({} as Database, {
  get(_target, property) {
    const real = getDb();
    const value = Reflect.get(real, property, real);
    return typeof value === "function" ? value.bind(real) : value;
  },
});
