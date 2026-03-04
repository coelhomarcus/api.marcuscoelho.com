import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "./env";
import * as contactSchema from "../modules/contact/contact.schema";
import * as githubSchema from "../modules/github/github.schema";

const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

export const db = drizzle(pool, {
  schema: { ...contactSchema, ...githubSchema },
});
