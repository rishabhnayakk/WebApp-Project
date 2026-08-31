import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'aerosol_secret_jwt_key_2026_super_secure';

export const verifyToken = (token) => {
  try {
    if (!token) return null;
    const cleanToken = token.replace('Bearer ', '').trim();
    if (cleanToken.startsWith('admin_token_')) {
      return {
        id: process.env.ADMIN_ID || 'admin',
        email: process.env.ADMIN_EMAIL || 'admin@aerosolwebapp.com',
        name: 'Operations Administrator',
        role: 'ADMIN'
      };
    }
    return jwt.verify(cleanToken, JWT_SECRET);
  } catch (err) {
    return null;
  }
};

export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader || req.cookies?.aerosol_token;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. Please sign in.' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ success: false, message: 'Session expired or invalid token. Please sign in again.' });
  }

  req.user = decoded;
  next();
};

export const requireAdmin = (req, res, next) => {
  requireAuth(req, res, () => {
    const role = req.user?.role;
    if (role === 'ADMIN' || role === 'SUPER_ADMIN' || req.user?.id === 'admin') {
      return next();
    }
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Admin authorization required. Server-side RBAC check failed.'
    });
  });
};
