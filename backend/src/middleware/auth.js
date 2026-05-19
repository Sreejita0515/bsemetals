import { verifyIdToken } from '../firebase.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token is required. Authorization header should be: Bearer <token>' });
  }

  try {
    const user = await verifyIdToken(token);
    
    // DB is the source of truth for roles
    try {
      const dbProfile = await prisma.userProfile.findUnique({
        where: { uid: user.uid },
        select: { role: true }
      });
      if (dbProfile && dbProfile.role) {
        user.role = dbProfile.role;
      }
    } catch (dbErr) {
      console.warn("Could not fetch role from DB for auth middleware, falling back to token claims", dbErr.message);
    }

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
