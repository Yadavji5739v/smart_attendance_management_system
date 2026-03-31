const QRCode = require('qrcode');
const crypto = require('crypto');
const db     = require('../config/db');

exports.generateQR = async (req, res) => {
    const { subject_id, duration_minutes = 5 } = req.body;
    const faculty_id = req.user.user_id;

    try {
        await db.query(
            'UPDATE sessions SET is_active = false WHERE subject_id = $1 AND faculty_id = $2 AND is_active = true',
            [subject_id, faculty_id]
        );

        const qr_token      = crypto.randomUUID();
        const qr_token_hash = crypto.createHash('sha256').update(qr_token).digest('hex');
        const start_time    = new Date();
        const expiry_time   = new Date(Date.now() + duration_minutes * 60 * 1000);

        const result = await db.query(
            `INSERT INTO sessions (subject_id, faculty_id, qr_token, qr_token_hash, start_time, expiry_time)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING session_id`,
            [subject_id, faculty_id, qr_token, qr_token_hash, start_time, expiry_time]
        );

        const session_id = result.rows[0].session_id;
        const payload    = JSON.stringify({ session_id, token: qr_token, expiry: expiry_time });
        const qrImage    = await QRCode.toDataURL(payload, {
            errorCorrectionLevel: 'H', width: 400, margin: 2
        });

        res.json({ session_id, qr_image: qrImage, expiry_time,
            message: `QR valid for ${duration_minutes} minutes` });

    } catch (err) {
        res.status(500).json({ message: 'Failed to generate QR', error: err.message });
    }
};

exports.markAttendance = async (req, res) => {
    const { session_id, token } = req.body;
    const student_id = req.user.user_id;
    const ip_address = req.headers['x-forwarded-for'] || req.ip;

    try {
        const sessResult = await db.query(
            'SELECT * FROM sessions WHERE session_id = $1 AND is_active = true',
            [session_id]
        );

        if (sessResult.rows.length === 0)
            return res.status(400).json({ message: 'Session not found or closed' });

        const session   = sessResult.rows[0];
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        if (tokenHash !== session.qr_token_hash)
            return res.status(400).json({ message: 'Invalid QR token' });

        if (new Date() > new Date(session.expiry_time))
            return res.status(400).json({ message: 'QR code has expired' });

        const existing = await db.query(
            'SELECT * FROM attendance WHERE session_id = $1 AND student_id = $2',
            [session_id, student_id]
        );

        if (existing.rows.length > 0 && existing.rows[0].status === 'present')
            return res.status(400).json({ message: 'Attendance already marked' });

        await db.query(
            `INSERT INTO attendance (session_id, student_id, status, scan_time)
             VALUES ($1, $2, 'present', NOW())
             ON CONFLICT (session_id, student_id)
             DO UPDATE SET status='present', scan_time=NOW()`,
            [session_id, student_id]
        );

        res.json({ message: '✅ Attendance marked successfully!' });

    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.getSessionStatus = async (req, res) => {
    const { session_id } = req.params;
    try {
        const result = await db.query(
            `SELECT u.name, u.email, a.status, a.scan_time
             FROM users u
             LEFT JOIN attendance a ON a.student_id = u.user_id
                 AND a.session_id = $1
             WHERE u.role = 'student'
             AND u.branch_id = (
                 SELECT sub.branch_id FROM sessions s
                 JOIN subjects sub ON s.subject_id = sub.subject_id
                 WHERE s.session_id = $1
             )
             ORDER BY a.scan_time DESC`,
            [session_id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
