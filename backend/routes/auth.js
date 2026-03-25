// routes/auth.js
const express  = require('express');
const router   = express.Router();
const auth     = require('../controllers/authController');
const protect  = require('../middleware/authMiddleware');

router.post('/login',    auth.login);
router.post('/register', protect, auth.register);  // only logged-in admin can register
router.get('/profile',   protect, auth.getProfile);

module.exports = router;
