const db = require('../config/db');

exports.studentSummary = async (req, res) => {
    try {
        // Admin sees all subjects, others see their branch only
        let query, params;

        if (req.user.role === 'admin') {
            query = `
                SELECT
                    sub.subject_name, sub.subject_code,
                    COUNT(CASE WHEN a.status='present' THEN 1 END) AS present_count,
                    sub.total_classes,
                    ROUND(COUNT(CASE WHEN a.status='present' THEN 1 END)
                        / NULLIF(sub.total_classes, 0) * 100, 2) AS attendance_pct,
                    b.branch_name
                FROM subjects sub
                JOIN branches b ON sub.branch_id = b.branch_id
                LEFT JOIN sessions ses ON sub.subject_id = ses.subject_id
                LEFT JOIN attendance a ON ses.session_id = a.session_id
                GROUP BY sub.subject_id
                ORDER BY sub.branch_id, sub.subject_name`;
            params = [];
        } else {
            const student_id = req.user.role === 'student'
                ? req.user.user_id
                : req.params.student_id;
            query = `
                SELECT
                    sub.subject_name, sub.subject_code,
                    COUNT(CASE WHEN a.status='present' THEN 1 END) AS present_count,
                    sub.total_classes,
                    ROUND(COUNT(CASE WHEN a.status='present' THEN 1 END)
                        / NULLIF(sub.total_classes, 0) * 100, 2) AS attendance_pct
                FROM subjects sub
                LEFT JOIN sessions ses ON sub.subject_id = ses.subject_id
                LEFT JOIN attendance a ON ses.session_id = a.session_id
                    AND a.student_id = ?
                WHERE sub.branch_id = (SELECT branch_id FROM users WHERE user_id = ?)
                GROUP BY sub.subject_id`;
            params = [student_id, student_id];
        }

        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error('SUMMARY ERROR:', err.message);
        res.status(500).json({ message: err.message });
    }
};

exports.defaulterList = async (req, res) => {
    const threshold = req.query.threshold || 75;
    try {
        const [rows] = await db.query(
            `SELECT
                u.user_id, u.name, b.branch_name,
                sub.subject_name, sub.subject_code,
                COUNT(CASE WHEN a.status='present' THEN 1 END) AS present,
                sub.total_classes,
                ROUND(COUNT(CASE WHEN a.status='present' THEN 1 END)
                    / NULLIF(sub.total_classes, 0) * 100, 2) AS pct
             FROM users u
             JOIN branches b   ON u.branch_id = b.branch_id
             JOIN subjects sub ON sub.branch_id = u.branch_id
             LEFT JOIN sessions ses ON ses.subject_id = sub.subject_id
             LEFT JOIN attendance a ON a.session_id = ses.session_id
                 AND a.student_id = u.user_id
             WHERE u.role = 'student'
             GROUP BY u.user_id, sub.subject_id
             HAVING pct < ? OR pct IS NULL
             ORDER BY pct ASC`,
            [threshold]
        );
        res.json(rows);
    } catch (err) {
        console.error('DEFAULTER ERROR:', err.message);
        res.status(500).json({ message: err.message });
    }
};

exports.branchAnalytics = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT
                b.branch_name,
                b.department,
                COUNT(DISTINCT u.user_id) AS total_students,
                ROUND(
                    SUM(CASE WHEN a.status='present' THEN 1 ELSE 0 END) /
                    NULLIF(COUNT(a.attendance_id), 0) * 100
                , 2) AS avg_attendance
             FROM branches b
             LEFT JOIN users u ON u.branch_id = b.branch_id AND u.role = 'student'
             LEFT JOIN attendance a ON a.student_id = u.user_id
             GROUP BY b.branch_id, b.branch_name, b.department`
        );
        res.json(rows);
    } catch (err) {
        console.error('BRANCH ERROR:', err.message);
        res.status(500).json({ message: err.message });
    }
};

exports.monthlyTrend = async (req, res) => {
    const { subject_id } = req.params;
    try {
        const [rows] = await db.query(
            `SELECT
                MONTHNAME(ses.start_time) AS month,
                COUNT(DISTINCT ses.session_id) AS total_sessions,
                COUNT(CASE WHEN a.status='present' THEN 1 END) AS present_count,
                ROUND(
                    COUNT(CASE WHEN a.status='present' THEN 1 END) /
                    NULLIF(COUNT(a.attendance_id), 0) * 100
                , 2) AS attendance_pct
             FROM sessions ses
             LEFT JOIN attendance a ON a.session_id = ses.session_id
             WHERE ses.subject_id = ?
             GROUP BY MONTH(ses.start_time)
             ORDER BY MONTH(ses.start_time)`,
            [subject_id]
        );
        res.json(rows);
    } catch (err) {
        console.error('MONTHLY ERROR:', err.message);
        res.status(500).json({ message: err.message });
    }
};