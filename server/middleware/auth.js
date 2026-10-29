const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  // Case-insensitive header check (Authorization / authorization)
  const authHeader = req.headers.authorization || req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token required' });
  }

  const token = authHeader.replace('Bearer ', '').trim();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    
    // Normalize user ID taaki controller me req.user.id aur req.user._id dono hamesha valid rahein
    req.user = {
      ...decoded,
      id: decoded.id || decoded._id || decoded.userId,
      _id: decoded._id || decoded.id || decoded.userId
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token', error: err.message });
  }
};

const authorize = (roles = []) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  // Agar roles array string pass ho ya single role
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  if (allowedRoles.length && !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied: insufficient permissions' });
  }

  next();
};

module.exports = { authenticate, authorize };