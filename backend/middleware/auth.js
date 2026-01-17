const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'force_super_secret_key';

const verifyToken = (req, res, next) => {
    try {
        let token = req.header('Authorization');

        if (!token) {
            return res.status(403).json({ error: 'Access Denied. No token provided.' });
        }

        if (token.startsWith('Bearer ')) {
            token = token.slice(7, token.length).trimLeft();
        }

        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid Token' });
    }
};

const verifyOwner = (req, res, next) => {
    if (!req.user || req.user.role !== 'OWNER') {
        return res.status(403).json({ error: 'Access Denied. Owner privileges required.' });
    }
    next();
};

const verifyOrganizer = (req, res, next) => {
    // Both OWNER and ORGANIZER can act as organizers
    if (!req.user || (req.user.role !== 'ORGANIZER' && req.user.role !== 'OWNER')) {
        return res.status(403).json({ error: 'Access Denied. Organizer privileges required.' });
    }
    next();
};

module.exports = { verifyToken, verifyOwner, verifyOrganizer };
