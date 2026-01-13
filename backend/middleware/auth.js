const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error("FATAL: JWT_SECRET is not defined in environment variables.");
            return res.status(500).json({ error: 'Internal server error.' });
        }

        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        next();
    } catch (error) {
        // console.error("Token verification failed:", error.message);
        res.status(401).json({ error: 'Invalid token.' });
    }
};

module.exports = verifyToken;
