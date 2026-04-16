const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../db');
const { protect, authorizeRoles } = require('../middleware/auth');

router.use(protect);
router.use(authorizeRoles('student'));

// @route   GET /api/student/dashboard
// @desc    Get attendance summary for the student per subject
router.get('/dashboard', async (req, res) => {
  const student_id = req.user.user_id;
  const branch_id = req.user.branch_id;

  try {
    // Get all subjects for student's branch
    const { rows: subjects } = await db.query('SELECT subject_id, subject_name, subject_code FROM subjects WHERE branch_id = $1', [branch_id]);
    
    const summary = [];
    
    for (let sub of subjects) {
      // Total sessions for this subject
      const totalRes = await db.query('SELECT COUNT(*) FROM sessions WHERE subject_id = $1', [sub.subject_id]);
      const total_sessions = parseInt(totalRes.rows[0].count);

      // Student's attended sessions for this subject
      const attendedRes = await db.query(`
        SELECT COUNT(*) FROM attendance a
        JOIN sessions s ON a.session_id = s.session_id
        WHERE s.subject_id = $1 AND a.student_id = $2 AND a.status = 'present'
      `, [sub.subject_id, student_id]);
      const attended = parseInt(attendedRes.rows[0].count);

      const percentage = total_sessions > 0 ? ((attended / total_sessions) * 100).toFixed(2) : 100.00; // If no sessions, assume 100%

      summary.push({
        subject_id: sub.subject_id,
        subject_name: sub.subject_name,
        subject_code: sub.subject_code,
        total_sessions,
        attended,
        percentage: parseFloat(percentage)
      });
    }

    res.json(summary);
  } catch (error) {
    console.error('Student Dashboard Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper to calculate distance in metres
function getDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
  const R = 6371e3; 
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; 
}

// @route   POST /api/student/scan
// @desc    Mark attendance via QR scan
router.post('/scan', async (req, res) => {
  const { session_id, token, latitude, longitude, device_id } = req.body;
  const student_id = req.user.user_id;

  try {
    const { rows } = await db.query('SELECT * FROM sessions WHERE session_id = $1 AND is_active = true', [session_id]);
    if (rows.length === 0) {
      return res.status(400).json({ message: 'Session not found or is closed' });
    }

    const session = rows[0];
    
    // 1. Verify Geofencing
    if (session.latitude && session.longitude) {
      if (!latitude || !longitude) {
        return res.status(403).json({ message: 'GPS coordinates required for verification.' });
      }

      const distance = getDistance(
        parseFloat(latitude), 
        parseFloat(longitude), 
        parseFloat(session.latitude), 
        parseFloat(session.longitude)
      );
      
      const threshold = 250; // Increased to 250 metres for indoor GPS drift
      if (distance > threshold) {
        return res.status(403).json({ 
          message: `Access denied. You are too far from the classroom (${Math.round(distance)}m). Distance limit is ${threshold}m.` 
        });
      }
    }

    // 2. TOKEN Validation
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    if (tokenHash !== session.qr_token_hash) {
      return res.status(400).json({ message: 'Invalid QR token' });
    }

    if (new Date() > new Date(session.expiry_time)) {
      return res.status(400).json({ message: 'QR code has expired' });
    }

    // 3. Device ID Check (Prevent multiple students from same device)
    if (device_id) {
       const deviceUsed = await db.query('SELECT * FROM attendance WHERE session_id = $1 AND device_id = $2 AND student_id != $3', [session_id, device_id, student_id]);
       if (deviceUsed.rows.length > 0) {
         return res.status(403).json({ message: 'This device has already been used to mark attendance for another student in this session.' });
       }
    }

    // 4. Mark Attendance
    const existing = await db.query('SELECT * FROM attendance WHERE session_id = $1 AND student_id = $2', [session_id, student_id]);
    if (existing.rows.length > 0 && existing.rows[0].status === 'present') {
      return res.status(400).json({ message: 'Attendance already marked for this session' });
    }

    await db.query(
      `INSERT INTO attendance (session_id, student_id, status, scan_time, device_id) 
       VALUES ($1, $2, 'present', NOW(), $3)
       ON CONFLICT (session_id, student_id) 
       DO UPDATE SET status = 'present', scan_time = NOW(), device_id = $3`,
      [session_id, student_id, device_id]
    );

    res.json({ message: 'Attendance marked successfully' });
  } catch (error) {
    console.error('Scan Error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
