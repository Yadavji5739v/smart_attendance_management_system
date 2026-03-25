// middleware/roleMiddleware.js
// Usage: roleMiddleware('faculty')  or  roleMiddleware('admin', 'faculty')

module.exports = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role))
        return res.status(403).json({ message: `Access denied. Required role: ${roles.join(' or ')}` });
    next();
};
