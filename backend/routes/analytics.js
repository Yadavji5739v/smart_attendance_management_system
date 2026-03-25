// routes/analytics.js
const express    = require('express');
const router     = express.Router();
const analytics  = require('../controllers/analyticsController');
const protect    = require('../middleware/authMiddleware');

router.get('/student-summary',        protect, analytics.studentSummary);
router.get('/student/:student_id',    protect, analytics.studentSummary);
router.get('/defaulters',             protect, analytics.defaulterList);
router.get('/branch',                 protect, analytics.branchAnalytics);
router.get('/monthly/:subject_id',    protect, analytics.monthlyTrend);

module.exports = router;

// Add this line
router.get('/branches', protect, async (req, res) => {
    const db = require('../config/db');
    const [rows] = await db.query('SELECT branch_id, branch_name FROM branches');
    res.json(rows);
});