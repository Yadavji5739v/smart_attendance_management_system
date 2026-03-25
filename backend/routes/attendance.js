// routes/attendance.js
const express  = require('express');
const router   = express.Router();
const protect  = require('../middleware/authMiddleware');
const db       = require('../config/db');

// Get attendance for a subject (faculty view)
router.get('/subject/:subject_id', protect, async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT u.name, u.enrollment_no,
                    COUNT(CASE WHEN a.status='present' THEN 1 END) AS present,
                    sub.total_classes,
                    ROUND(COUNT(CASE WHEN a.status='present' THEN 1 END)
                        / NULLIF(sub.total_classes, 0) * 100, 2) AS pct
             FROM users u
             JOIN subjects sub ON sub.subject_id = ?
             LEFT JOIN sessions ses ON ses.subject_id = sub.subject_id
             LEFT JOIN attendance a ON a.session_id = ses.session_id AND a.student_id = u.user_id
             WHERE u.role = 'student' AND u.branch_id = sub.branch_id
             GROUP BY u.user_id`,
            [req.params.subject_id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
