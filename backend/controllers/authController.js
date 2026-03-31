const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const db     = require('../config/db');

exports.login = async (req, res) => {
    const email    = req.body.email?.trim().toLowerCase();
    const password = req.body.password?.trim();

    try {
        const result = await db.query(
            'SELECT * FROM users WHERE email = $1', [email]
        );

        if (result.rows.length === 0)
            return res.status(401).json({ message: 'Invalid email or password' });

        const user = rows[0];
        const storedPassword = user.password || user.password_hash;
        const isMatch = await bcrypt.compare(password, storedPassword);

        if (!isMatch)
            return res.status(401).json({ message: 'Invalid email or password' });

        const token = jwt.sign(
            { user_id: user.user_id, role: user.role, branch_id: user.branch_id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.json({
            token,
            user: {
                user_id:   user.user_id,
                name:      user.name,
                email:     user.email,
                role:      user.role,
                branch_id: user.branch_id,
                semester:  user.semester
            }
        });
    } catch (err) {
        console.error('LOGIN ERROR:', err.message);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.register = async (req, res) => {
    const { name, email, password, role, branch_id, semester } = req.body;
    try {
        const hash = await bcrypt.hash(password, 12);
        await db.query(
            `INSERT INTO users (name, email, password, role, branch_id, semester)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [name, email, hash, role, branch_id, semester]
        );
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT user_id, name, email, role, branch_id, semester FROM users WHERE user_id = $1',
            [req.user.user_id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
