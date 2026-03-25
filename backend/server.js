// server.js - Main Express Server
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

// Routes
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/qr',         require('./routes/qr'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/analytics',  require('./routes/analytics'));

// Health check
app.get('/', (req, res) => res.json({ message: 'Smart Attendance API running' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
