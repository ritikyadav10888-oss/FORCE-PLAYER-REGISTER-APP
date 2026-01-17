const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

    try {
        const verified = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET || 'force_super_secret_key');
        req.user = verified;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

const verifyOwner = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.role === 'OWNER') {
            next();
        } else {
            res.status(403).json({ error: 'Access denied. Owners only.' });
        }
    });
};

const verifyUserOrOwner = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.id === req.params.id || req.user.role === 'OWNER') {
            next();
        } else {
            res.status(403).json({ error: 'Access denied. You can only update your own account.' });
        }
    });
};

module.exports = { verifyToken, verifyOwner, verifyUserOrOwner };
