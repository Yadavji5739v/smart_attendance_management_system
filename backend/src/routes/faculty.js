const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../db');
const { protect, authorizeRoles } = require('../middleware/auth');

router.use(protect);
router.use(authorizeRoles('faculty'));

// @route   GET /api/faculty/subjects
// @desc    Get subjects assigned to the logged-in faculty
// @access  Private (Faculty)
    // Fetch subjects specifically allotted to this faculty member (resilient to ID type)
    const faculty_id = parseInt(req.user.user_id);
    const { rows } = await db.query('SELECT * FROM subjects WHERE uid = $1', [faculty_id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/faculty/sessions
// @desc    Create a new attendance session and return QR info
router.post('/sessions', async (req, res) => {
  const { subject_id, duration_minutes = 5 } = req.body;
  const faculty_id = req.user.user_id;

  try {
    // End any active sessions for this subject by this faculty
    await db.query(
      'UPDATE sessions SET is_active = false WHERE subject_id = $1 AND faculty_id = $2 AND is_active = true',
      [subject_id, faculty_id]
    );

    const qr_token = crypto.randomUUID();
    const qr_token_hash = crypto.createHash('sha256').update(qr_token).digest('hex');
    const start_time = new Date();
    const expiry_time = new Date(Date.now() + duration_minutes * 60 * 1000);

    const { rows } = await db.query(
      `INSERT INTO sessions (subject_id, faculty_id, qr_token, qr_token_hash, start_time, expiry_time, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, true) RETURNING session_id`,
      [subject_id, faculty_id, qr_token, qr_token_hash, start_time, expiry_time]
    );

    const session_id = rows[0].session_id;

    res.status(201).json({
      session_id,
      qr_token,
      start_time,
      expiry_time,
      is_active: true
    });
  } catch (error) {
    console.error('Session creation error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/faculty/sessions/:id/live
// @desc    Get live attendance for active session
router.get('/sessions/:id/live', async (req, res) => {
  const session_id = req.params.id;
  try {
    const { rows } = await db.query(
      `SELECT u.name, u.email, a.status, a.scan_time
       FROM attendance a
       JOIN users u ON a.student_id = u.user_id
       WHERE a.session_id = $1
       ORDER BY a.scan_time DESC`,
      [session_id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/faculty/sessions/:id/end
// @desc    End a session manually
router.put('/sessions/:id/end', async (req, res) => {
  const session_id = req.params.id;
  try {
    await db.query('UPDATE sessions SET is_active = false WHERE session_id = $1 AND faculty_id = $2', [session_id, req.user.user_id]);
    res.json({ message: 'Session ended successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/faculty/reports/:subject_id
// @desc    Get subject attendance report
router.get('/reports/:subject_id', async (req, res) => {
  const subject_id = req.params.subject_id;
  try {
    // Total sessions for this subject
    const sessionsRes = await db.query('SELECT session_id FROM sessions WHERE subject_id = $1', [subject_id]);
    const total_sessions = sessionsRes.rows.length;

    // Attendance per student for this subject
    const { rows: studentStats } = await db.query(`
      SELECT u.user_id, u.name, COUNT(a.attendance_id) as attended
      FROM users u
      LEFT JOIN attendance a ON u.user_id = a.student_id 
        AND a.session_id IN (SELECT session_id FROM sessions WHERE subject_id = $1)
        AND a.status = 'present'
      WHERE u.role = 'student' AND u.branch_id = (SELECT branch_id FROM subjects WHERE subject_id = $1)
      GROUP BY u.user_id, u.name
    `, [subject_id]);

    const report = studentStats.map(student => {
      const attended = parseInt(student.attended);
      const percentage = total_sessions > 0 ? ((attended / total_sessions) * 100).toFixed(2) : 0;
      return {
        ...student,
        total_sessions,
        attended,
        percentage: parseFloat(percentage)
      };
    });

    res.json(report);
  } catch (error) {
    console.error('Reports logic error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
