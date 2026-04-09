const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');
const { protect, authorizeRoles } = require('../middleware/auth');

router.use(protect);
router.use(authorizeRoles('admin'));

// @route   GET /api/admin/dashboard
// @desc    Get dashboard stats
// @access  Private (Admin)
router.get('/dashboard', async (req, res) => {
  try {
    const studentsCount = await db.query(`SELECT COUNT(*) FROM users WHERE role = 'student'`);
    const facultyCount = await db.query(`SELECT COUNT(*) FROM users WHERE role = 'faculty'`);
    const branchesCount = await db.query(`SELECT COUNT(*) FROM branches`);
    const subjectsCount = await db.query(`SELECT COUNT(*) FROM subjects`);
    const sessionsCount = await db.query(`SELECT COUNT(*) FROM sessions`);
    const attendanceCount = await db.query(`SELECT COUNT(*) FROM attendance`);

    res.json({
      totalStudents: parseInt(studentsCount.rows[0].count),
      totalFaculty: parseInt(facultyCount.rows[0].count),
      totalBranches: parseInt(branchesCount.rows[0].count),
      totalSubjects: parseInt(subjectsCount.rows[0].count),
      totalSessions: parseInt(sessionsCount.rows[0].count),
      totalAttendance: parseInt(attendanceCount.rows[0].count)
    });
  } catch (error) {
    console.error('Admin Dashboard Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Users CRUD
router.get('/users', async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT u.user_id, u.name, u.email, u.role, u.semester, b.branch_name 
      FROM users u LEFT JOIN branches b ON u.branch_id = b.branch_id
      ORDER BY u.user_id DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/users', async (req, res) => {
  const { name, email, password, role, branch_id, semester } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const { rows } = await db.query(
      `INSERT INTO users (name, email, password, role, branch_id, semester) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING user_id, name, email, role`,
      [name, email, hash, role, branch_id, semester]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Branches CRUD
router.get('/branches', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM branches ORDER BY branch_id');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/branches', async (req, res) => {
  const { branch_name, department } = req.body;
  try {
    const { rows } = await db.query(
      'INSERT INTO branches (branch_name, department) VALUES ($1, $2) RETURNING *',
      [branch_name, department]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Subjects CRUD
router.get('/subjects', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM subjects ORDER BY subject_id');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/subjects', async (req, res) => {
  const { subject_name, subject_code, uid, branch_id, total_classes, semester } = req.body;
  try {
    const { rows } = await db.query(
      `INSERT INTO subjects (subject_name, subject_code, uid, branch_id, total_classes, semester) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [subject_name, subject_code, uid, branch_id, total_classes, semester]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
