// import { defineConfig } from "drizzle-kit";

// if (!process.env.DATABASE_URL) {
//   throw new Error("DATABASE_URL must be set. Please check your .env file.");
// }

// export default defineConfig({
//   out: "./migrations",
//   schema: "./shared/schema.ts",
//   dialect: "mysql",
//   dbCredentials: {
//     url: process.env.DATABASE_URL!,
//   },
// });


import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "mysql",
  dbCredentials: {
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT!),
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
  },
});

