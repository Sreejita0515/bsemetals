import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all products (with their categories)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
      },
    });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create Product (Admin only)
router.post('/', authenticateToken, requireRole('admin'), async (req, res) => {
  const { name, categoryId, unit, unitRate } = req.body;

  if (!name || !categoryId) {
    return res.status(400).json({ error: 'name and categoryId are required' });
  }

  try {
    // Check if category exists
    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!categoryExists) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        categoryId,
        unit: unit || 'kg',
        unitRate: parseFloat(unitRate) || 0,
      },
      include: {
        category: true,
      },
    });
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update Product (Admin only)
router.put('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  const { name, categoryId, unit, unitRate } = req.body;

  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        categoryId,
        unit,
        ...(unitRate !== undefined && { unitRate: parseFloat(unitRate) || 0 }),
      },
      include: {
        category: true,
      },
    });
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete Product (Admin only)
router.delete('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.product.delete({
      where: { id },
    });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
