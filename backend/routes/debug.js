const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/debug-db', async (req, res) => {
  res.json({
    database_url_set: !!process.env.DATABASE_URL,
    url_preview: process.env.DATABASE_URL ? process.env.DATABASE_URL.split('@')[1]?.split(':')[0]?.slice(0,10) + '...' : 'MISSING',
    node_env: process.env.NODE_ENV
  });
});

router.get('/db-error', async (req, res) => {
  try {
    const result = await db.query("SELECT 1 as test");
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ 
      error: err.message,
      code: err.code,
      detail: err.detail || 'N/A'
    });
  }
});

module.exports = router;
