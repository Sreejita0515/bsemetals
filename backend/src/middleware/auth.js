import { verifyIdToken } from '../firebase.js';

export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token is required. Authorization header should be: Bearer <token>' });
  }

  try {
    const user = await verifyIdToken(token);
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: error.message || 'Unauthorized' });
  }
}

export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'User is not authenticated' });
    }
    
    if (req.user.role !== role) {
      return res.status(403).json({ error: `Forbidden: Requires ${role} privileges` });
    }

    next();
  };
}
