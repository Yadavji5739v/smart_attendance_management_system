// config/db.js - MySQL Connection Pool
const mysql = require('mysql2/promise');
require('dotenv').config();

const db = mysql.createPool({
    host:     process.env.DB_HOST,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
});

// Test connection on startup
db.getConnection()
    .then(conn => { console.log('✅ MySQL connected'); conn.release(); })
    .catch(err => console.error('❌ DB Error:', err.message));

module.exports = db;
