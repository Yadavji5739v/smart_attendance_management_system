// controllers/qrController.js
const QRCode = require('qrcode');
const crypto = require('crypto');
const db     = require('../config/db');

// ── GENERATE QR (Faculty) ─────────────────────────────────────
exports.generateQR = async (req, res) => {
    const { subject_id, duration_minutes = 5 } = req.body;
    const faculty_id = req.user.user_id;

    try {
        // Deactivate any existing active session for this subject
        await db.query(
            'UPDATE sessions SET is_active = 0 WHERE subject_id = ? AND faculty_id = ? AND is_active = 1',
            [subject_id, faculty_id]
        );

        // Create a unique secure token
        const qr_token      = crypto.randomUUID();
        const qr_token_hash = crypto.createHash('sha256').update(qr_token).digest('hex');
        const start_time    = new Date();
        const expiry_time   = new Date(Date.now() + duration_minutes * 60 * 1000);

        // Save session to DB
        const [result] = await db.query(
            `INSERT INTO sessions (subject_id, faculty_id, qr_token, qr_token_hash, start_time, expiry_time)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [subject_id, faculty_id, qr_token, qr_token_hash, start_time, expiry_time]
        );

        // Payload embedded inside QR image
        const payload = JSON.stringify({
            session_id: result.insertId,
            token:      qr_token,
            expiry:     expiry_time
        });

        // Generate QR as base64 image
        const qrImage = await QRCode.toDataURL(payload, {
            errorCorrectionLevel: 'H',
            width: 400,
            margin: 2,
            color: { dark: '#0D1B2A', light: '#FFFFFF' }
        });

        res.json({
            session_id:  result.insertId,
            qr_image:    qrImage,
            expiry_time,
            message:     `QR valid for ${duration_minutes} minutes`
        });

    } catch (err) {
        res.status(500).json({ message: 'Failed to generate QR', error: err.message });
    }
};

// ── MARK ATTENDANCE (Student scans QR) ───────────────────────
exports.markAttendance = async (req, res) => {
    const { session_id, token } = req.body;
    const student_id = req.user.user_id;
    const ip_address = req.headers['x-forwarded-for'] || req.ip;

    try {
        // 1. Find session
        const [sessions] = await db.query(
            'SELECT * FROM sessions WHERE session_id = ? AND is_active = 1',
            [session_id]
        );
        if (sessions.length === 0)
            return res.status(400).json({ message: 'Session not found or already closed' });

        const session = sessions[0];

        // 2. Validate token
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        if (tokenHash !== session.qr_token_hash)
            return res.status(400).json({ message: 'Invalid QR token' });

        // 3. Check expiry
        if (new Date() > new Date(session.expiry_time));

        // 4. Prevent duplicate attendance
        const [existing] = await db.query(
            'SELECT * FROM attendance WHERE session_id = ? AND student_id = ?',
            [session_id, student_id]
        );
        if (existing.length > 0 && existing[0].status === 'present')
            return res.status(400).json({ message: 'Attendance already marked for this session' });

        // 5. Record attendance
        await db.query(
            `INSERT INTO attendance (session_id, student_id, status, scan_time, ip_address)
             VALUES (?, ?, 'present', NOW(), ?)
             ON DUPLICATE KEY UPDATE status='present', scan_time=NOW(), ip_address=?`,
            [session_id, student_id, ip_address, ip_address]
        );

        res.json({ message: '✅ Attendance marked successfully!' });

    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// ── GET LIVE SESSION ATTENDANCE (Faculty) ─────────────────────
exports.getSessionStatus = async (req, res) => {
    const { session_id } = req.params;
    try {
        const [rows] = await db.query(
            `SELECT u.name, u.enrollment_no, a.status, a.scan_time, a.ip_address
             FROM users u
             LEFT JOIN attendance a ON a.student_id = u.user_id AND a.session_id = ?
             WHERE u.role = 'student' AND u.branch_id = (
                 SELECT sub.branch_id FROM sessions s
                 JOIN subjects sub ON s.subject_id = sub.subject_id
                 WHERE s.session_id = ?
             )
             ORDER BY a.scan_time DESC`,
            [session_id, session_id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
