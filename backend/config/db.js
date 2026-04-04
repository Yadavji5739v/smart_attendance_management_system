const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

pool.connect()
    .then(() => console.log('✅ Supabase PostgreSQL connected'))
    .catch(err => console.error('❌ DB Error:', err.message));

module.exports = {
    query: (text, params) => pool.query(text, params)
};
