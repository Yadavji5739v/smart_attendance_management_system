// server.js - FINAL UPDATED VERSION

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const db = require('./config/db'); // ✅ import DB

const app = express();

/* =========================
   🔐 MIDDLEWARE
========================= */
app.use(helmet());

// ✅ Allow both local + deployed frontend
app.use(cors({
  origin: [
    "http://localhost:3000", // local frontend
    "https://smart-attendance-management-system-8vuhiy9te.vercel.app"
  ],
  credentials: true
}));

app.use(express.json());

/* =========================
   🔍 DB HEALTH CHECK
========================= */
app.get('/api/test-db', async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1");
    res.json({ success: true, message: "✅ DB Connected" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* =========================
   📦 ROUTES
========================= */
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
