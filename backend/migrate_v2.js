const { Pool } = require('pg');
require('dotenv').config({ path: './.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const migrate = async () => {
  try {
    console.log('Connecting to database...');
    const client = await pool.connect();
    console.log('✅ Connected successfully!');
    
    console.log('Starting migration...');
    
    // Add columns to sessions if they don't exist
    await client.query(`
      ALTER TABLE sessions 
      ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
      ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);
    `);
    console.log('✅ Updated sessions table (lat/lng).');

    // Add columns to attendance if they don't exist
    await client.query(`
      ALTER TABLE attendance 
      ADD COLUMN IF NOT EXISTS device_id VARCHAR(255);
    `);
    console.log('✅ Updated attendance table (device_id).');

    client.release();
    console.log('🚀 Migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
};

migrate();
