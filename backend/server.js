
const db = require('./config/db'); // ✅ import DB
// server.js - FINAL UPDATED VERSION

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();



const app = express();

/* =========================
   🔐 MIDDLEWARE
========================= */
// Manual CORS headers first (ensures OPTIONS/preflight always has the right headers,
// even behind some hosting/proxy setups).
app.use((req, res, next) => {
  const origin = req.headers.origin;
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') return res.sendStatus(204);
  return next();
});

app.use(helmet());

// ✅ Allow both local + deployed frontend
// ✅ CORS (needed for Vercel frontend -> Backend API calls)
const corsOptions = {
  origin: true, // reflect request origin
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  // JWT is stored in localStorage (no cookies), so don't enable credentials.
  credentials: false,
  allowedHeaders: ["Content-Type", "Authorization"]
};
app.use(cors(corsOptions));

app.use(express.json());

/* =========================
   🔍 DB HEALTH CHECK
========================= */
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await db.query("SELECT 1");
    res.json({ success: true, message: "✅ DB Connected", rows: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* =========================
   📦 ROUTES
========================= */
app.options('*', cors(corsOptions));
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/qr',         require('./routes/qr'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/analytics',  require('./routes/analytics'));

/* =========================
   ❤️ API HEALTH
========================= */
app.get('/', (req, res) => {
  res.json({ message: 'Smart Attendance API running 🚀' });
});

/* =========================
   ❌ GLOBAL ERROR HANDLER
========================= */
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong",
    error: err.message
  });
});

/* =========================
   🚀 START SERVER
========================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
