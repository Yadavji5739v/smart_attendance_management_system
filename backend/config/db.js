// config/db.js - FINAL Supabase PostgreSQL Connection

const { Pool } = require('pg');
require('dotenv').config();

// Create connection pool using Supabase DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // required for Supabase
  }
});

// Test connection
pool.connect()
  .then(() => console.log('✅ Supabase PostgreSQL connected'))
  .catch(err => console.error('❌ DB Error:', err.message));

// Export query function (compatible with your existing code)
const db = {
  query: (text, params) => pool.query(text, params)
};

module.exports = db;
