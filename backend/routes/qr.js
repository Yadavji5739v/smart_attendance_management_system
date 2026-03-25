// routes/qr.js
const express  = require('express');
const router   = express.Router();
const qr       = require('../controllers/qrController');
const protect  = require('../middleware/authMiddleware');
const role     = require('../middleware/roleMiddleware');

router.post('/generate',           protect, role('faculty', 'admin'), qr.generateQR);
router.post('/mark-attendance',    protect, role('student'),          qr.markAttendance);
router.get('/session/:session_id', protect,                           qr.getSessionStatus);

module.exports = router;
