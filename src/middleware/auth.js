import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'livsstil24-secret-key-change-in-production';

export function authMiddleware(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: 'Ingen åtkomst' });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Ogiltig token' });
  }
}

export function optionalAuth(req, res, next) {
  const token = req.cookies?.token;
  if (token) {
    try { req.user = jwt.verify(token, SECRET); } catch {}
  }
  next();
}

export function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Kräver admin-behörighet' });
  next();
}

export const SECRET_KEY = SECRET;
