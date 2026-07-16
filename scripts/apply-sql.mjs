import "dotenv/config";
import { createClient } from "@libsql/client";
import { readFileSync } from "node:fs";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/apply-sql.mjs <path-to-sql-file>");
  process.exit(1);
}

const sql = readFileSync(file, "utf8");

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

await client.executeMultiple(sql);
console.log(`Applied ${file} to ${process.env.TURSO_DATABASE_URL}`);
client.close();
