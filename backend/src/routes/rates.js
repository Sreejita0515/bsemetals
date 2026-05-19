import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get today's rate and rate history
router.get('/', authenticateToken, async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    // Fetch all historical rates sorted by date ascending
    const history = await prisma.lMERate.findMany({
      orderBy: { date: 'asc' },
    });

    // Today's rate
    const todayRate = history.find(r => r.date === todayStr) || history[history.length - 1] || null;

    res.json({
      todayRate,
      history,
    });
  } catch (error) {
    console.error('Error fetching LME rates:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Set or override today's LME rate (Admin only)
router.post('/', authenticateToken, requireRole('admin'), async (req, res) => {
  const { ratePerKg } = req.body;

  if (ratePerKg === undefined || isNaN(parseFloat(ratePerKg)) || parseFloat(ratePerKg) <= 0) {
    return res.status(400).json({ error: 'Valid positive ratePerKg is required' });
  }

  const numericRate = parseFloat(ratePerKg);
  const todayStr = new Date().toISOString().split('T')[0];

  try {
    const rate = await prisma.lMERate.upsert({
      where: { date: todayStr },
      update: {
        ratePerKg: numericRate,
        createdBy: req.user.uid,
      },
      create: {
        date: todayStr,
        ratePerKg: numericRate,
        createdBy: req.user.uid,
      },
    });

    res.json({ message: 'LME Rate set successfully', rate });
  } catch (error) {
    console.error('Error setting LME rate:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
