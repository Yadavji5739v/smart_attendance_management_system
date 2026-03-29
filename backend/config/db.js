// config/db.js - MySQL Connection Pool (FINAL)

const mysql = require('mysql2/promise');
require('dotenv').config();

const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'smart_attendance',
    port: process.env.DB_PORT || 3306,

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Test connection
(async () => {
    try {
        const conn = await db.getConnection();
        console.log("✅ MySQL connected successfully");
        conn.release();
    } catch (err) {
        console.error("❌ DB Connection Failed:", err.message);
    }
})();

module.exports = db;
