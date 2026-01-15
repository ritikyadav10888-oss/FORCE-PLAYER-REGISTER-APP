const jwt = require('jsonwebtoken');
require('dotenv').config();

if (!process.env.JWT_SECRET) {
    throw new Error('FATAL: JWT_SECRET is not defined in environment variables.');
}
const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // { id: '...', role: '...' }
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token.' });
    }
};

const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                error: 'Access denied. You do not have permission to perform this action.'
            });
        }
        next();
    };
};

module.exports = { verifyToken, authorizeRoles };
