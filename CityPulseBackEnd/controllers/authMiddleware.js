const jwt = require('jsonwebtoken');
const User = require('../models/Users');

const protectKey = async (req, res, next) => { // <-- ضيفنا next هنا
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token and get user from token
            const decode = jwt.verify(token, process.env.JWT_SECRET);

            // Attach user to request object
            req.user = await User.findById(decode.id).select('-password');

            return next();
        } catch (error) {
            console.error('Error verifying token:', error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        console.error('No token provided'); 
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const adminOnly = (req, res, next) => { 
    if (req.user && req.user.role === 'admin') {
        return next();
    } else {
        console.error('Access denied: Admins only');
        return res.status(403).json({ message: 'Forbidden, admin only' });
    }
};


module.exports = { protectKey, adminOnly };