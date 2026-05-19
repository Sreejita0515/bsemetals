import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Create or Update User Profile
router.post('/profile', authenticateToken, async (req, res) => {
  const { name, email, phone, companyName, companyAddress, gstin } = req.body;
  const uid = req.user.uid;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required fields.' });
  }

  try {
    const profile = await prisma.userProfile.upsert({
      where: { uid },
      update: {
        name,
        email,
        phone,
        companyName,
        companyAddress,
        gstin
      },
      create: {
        uid,
        name,
        email,
        phone,
        companyName,
        companyAddress,
        gstin
      }
    });

    res.status(201).json(profile);
  } catch (error) {
    console.error('Error saving user profile:', error);
    res.status(500).json({ error: 'Failed to save user profile.' });
  }
});

// Fetch User Profile
router.get('/profile', authenticateToken, async (req, res) => {
  const uid = req.user.uid;
  try {
    const profile = await prisma.userProfile.findUnique({
      where: { uid }
    });
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
});

export default router;
