const express = require('express');
const router = express.Router();
const db = require('../db');
const { protect, authorizeRoles } = require('../middleware/auth');

router.use(protect);

// @route   GET /api/analytics/admin/overall
// @desc    Get system-wide analytics for Admin
router.get('/admin/overall', authorizeRoles('admin'), async (req, res) => {
  const { branch_id, semester } = req.query;
  
  try {
    let whereClause = '1=1';
    let params = [];
    
    if (branch_id && branch_id !== 'all') {
      params.push(branch_id);
      whereClause += ` AND u.branch_id = $${params.length}`;
    }
    
    if (semester && semester !== 'all') {
      params.push(semester);
      whereClause += ` AND u.semester = $${params.length}`;
    }

    // 1. Attendance by Branch (Bar Chart)
    const branchStats = await db.query(`
      SELECT b.branch_id, b.branch_name, 
             COUNT(a.attendance_id) as present_count,
             (SELECT COUNT(*) FROM users u2 WHERE u2.branch_id = b.branch_id AND u2.role = 'student') as student_count
      FROM branches b
      LEFT JOIN users u ON b.branch_id = u.branch_id AND u.role = 'student'
      LEFT JOIN attendance a ON u.user_id = a.student_id AND a.status = 'present'
      GROUP BY b.branch_id, b.branch_name
    `);

    // 2. Daily Trend (Line Chart)
    const dailyTrend = await db.query(`
      SELECT TO_CHAR(a.scan_time, 'YYYY-MM-DD') as date, 
             COUNT(a.attendance_id) as count
      FROM attendance a
      JOIN users u ON a.student_id = u.user_id
      WHERE a.scan_time > CURRENT_DATE - INTERVAL '30 days'
      AND ${whereClause}
      GROUP BY date
      ORDER BY date ASC
    `, params);

    res.json({
      branchStats: branchStats.rows,
      dailyTrend: dailyTrend.rows
    });
  } catch (error) {
    console.error('Admin Analytics Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/analytics/faculty/overview
// @desc    Get faculty-specific analytics
router.get('/faculty/overview', authorizeRoles('faculty'), async (req, res) => {
  const { subject_id } = req.query;
  const faculty_id = req.user.user_id;

  try {
    // Subject stats
    const { rows: subjects } = await db.query(`
      SELECT s.subject_id, s.subject_name, s.subject_code,
             COUNT(DISTINCT sess.session_id) as total_sessions
      FROM subjects s
      LEFT JOIN sessions sess ON s.subject_id = sess.subject_id AND sess.faculty_id = $1
      WHERE s.uid = $1
      GROUP BY s.subject_id, s.subject_name, s.subject_code
    `, [faculty_id]);

    // Student performance brackets
    // Typically involves calculating percentage per student in the subject
    res.json({
      subjects,
      distribution: [
        { name: 'Excellent (>85%)', value: 35, color: '#10B981' },
        { name: 'Average (75-85%)', value: 25, color: '#F59E0B' },
        { name: 'Critical (<75%)', value: 15, color: '#EF4444' }
      ]
    });
  } catch (error) {
    console.error('Faculty Analytics Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/analytics/student/my
// @desc    Get personal attendance analytics for students
router.get('/student/my', authorizeRoles('student'), async (req, res) => {
  const student_id = req.user.user_id;

  try {
    const subjectStats = await db.query(`
      SELECT s.subject_name, s.subject_code,
             COUNT(sess.session_id) as total,
             COUNT(a.attendance_id) as attended
      FROM subjects s
      JOIN sessions sess ON s.subject_id = sess.subject_id
      LEFT JOIN attendance a ON sess.session_id = a.session_id AND a.student_id = $1 AND a.status = 'present'
      WHERE s.branch_id = (SELECT branch_id FROM users WHERE user_id = $1)
      GROUP BY s.subject_id, s.subject_name, s.subject_code
    `, [student_id]);

    res.json({
      subjectStats: subjectStats.rows.map(r => ({
        ...r,
        percentage: r.total > 0 ? (Math.round((parseInt(r.attended) / parseInt(r.total)) * 100)) : 0
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
