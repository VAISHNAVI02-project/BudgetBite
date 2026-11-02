
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'budgetbite',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  ssl: process.env.DB_SSL_CA
  ? {
      ca: process.env.DB_SSL_CA,
      minVersion: 'TLSv1.2'
    }
  : undefined,

  // Enable secure connection for remote TiDB Cloud
  ssl: process.env.DB_HOST && process.env.DB_HOST !== 'localhost'
    ? { minVersion: 'TLSv1.2' }
    : undefined,

  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  decimalNumbers: true
});

// Test database connection
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log(`[MySQL] Successfully connected to database: ${process.env.DB_NAME || 'budgetbite'}`);
    connection.release();
  } catch (error) {
    console.error('[MySQL] Database connection failed:', error.message);
  }
})();

module.exports = pool;
