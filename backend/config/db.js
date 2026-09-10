import dotenv from "dotenv";
import mysql from "mysql2/promise";
dotenv.config();

// Creating connection pool (reusable connections)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});

//Using this function everywhere in controllers
export const query = async (sql, params) => {
  const [rows] = await pool.query(sql, params);
  return [rows];
};

export default pool;
