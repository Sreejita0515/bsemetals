import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all categories
router.get('/', authenticateToken, async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: 'desc' },
      include: { products: true }
    });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create Category (Admin only)
router.post('/', authenticateToken, requireRole('admin'), async (req, res) => {
  const { name, copperContentPct, makingChargePerKg, marginPct, unitRate } = req.body;

  if (!name || copperContentPct === undefined || makingChargePerKg === undefined || marginPct === undefined || unitRate === undefined) {
    return res.status(400).json({ error: 'All fields (name, copperContentPct, makingChargePerKg, marginPct, unitRate) are required' });
  }

  try {
    const category = await prisma.category.create({
      data: {
        name,
        copperContentPct: parseFloat(copperContentPct),
        makingChargePerKg: parseFloat(makingChargePerKg),
        marginPct: parseFloat(marginPct),
        unitRate: parseFloat(unitRate),
      },
    });
    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update Category (Admin only)
router.put('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  const { name, copperContentPct, makingChargePerKg, marginPct, unitRate } = req.body;

  try {
    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        copperContentPct: copperContentPct !== undefined ? parseFloat(copperContentPct) : undefined,
        makingChargePerKg: makingChargePerKg !== undefined ? parseFloat(makingChargePerKg) : undefined,
        marginPct: marginPct !== undefined ? parseFloat(marginPct) : undefined,
        unitRate: unitRate !== undefined ? parseFloat(unitRate) : undefined,
      },
    });
    res.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete Category (Admin only)
router.delete('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.category.delete({
      where: { id },
    });
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
