const { auth } = require('../config/auth');
const { fromNodeHeaders } = require('better-auth/node');

const verifyJWT = async (req, res, next) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    
    if (!session || !session.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized: No session' });
    }

    req.user = session.user; // Contains email, name, role, etc.
    
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid session' });
  }
};

const verifyRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
};

module.exports = { verifyJWT, verifyRole };
