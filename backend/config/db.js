// config/db.js - PostgreSQL connection for Supabase
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host:     process.env.DB_HOST,
    port:     process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl:      { rejectUnauthorized: false }  // Required for Supabase
});

pool.connect()
    .then(() => console.log('✅ Supabase PostgreSQL connected'))
    .catch(err => console.error('❌ DB Error:', err.message));

// Make it work like mysql2 (same query syntax)
const db = {
    query: (text, params) => pool.query(text, params)
};

module.exports = db;
