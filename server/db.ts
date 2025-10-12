// import mysql from "mysql2/promise";
// import { drizzle } from "drizzle-orm/mysql2";
// import * as schema from "@shared/schema";

// if (!process.env.DATABASE_URL) {
//   throw new Error("DATABASE_URL must be set for MySQL connection.");
// }

// // Example: mysql://user:password@localhost:3306/dbname
// const connection = await mysql.createConnection(process.env.DATABASE_URL);

// export const db = drizzle(connection, { schema });




import { createPool } from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "@shared/schema";


import dotenv from 'dotenv';
dotenv.config();


// create MySQL pool
const pool = createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});



export const db = drizzle(pool, { schema, mode: "default" });
