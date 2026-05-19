import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get Quote Requests
// - Admins see all quote requests
// - Customers see only their own quote requests
router.get('/', authenticateToken, async (req, res) => {
  try {
    let quotes;

    if (req.user.role === 'admin') {
      quotes = await prisma.quoteRequest.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          userProfile: true,
          items: {
            include: {
              product: {
                include: { category: true }
              }
            }
          }
        }
      });
    } else {
      quotes = await prisma.quoteRequest.findMany({
        where: { customerUid: req.user.uid },
        orderBy: { createdAt: 'desc' },
        include: {
          userProfile: true,
          items: {
            include: {
              product: {
                include: { category: true }
              }
            }
          }
        }
      });
    }

    res.json(quotes);
  } catch (error) {
    console.error('Error fetching quotes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit a new Quote Request (Customer only)
router.post('/', authenticateToken, requireRole('customer'), async (req, res) => {
  const { customerName, company, phone, email, items } = req.body;

  if (!customerName || !company || !phone || !email || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Missing required field(s). Contact info and an items array are required.' });
  }

  try {
    // 1. We now use Category unitRate directly, so no global LME rate is required.
    
    // 2. Map and calculate rate snapshot for each item in transaction
    const dbItems = [];

    for (const item of items) {
      const { productId, quantity } = item;
      
      if (!productId || quantity === undefined || isNaN(parseFloat(quantity)) || parseFloat(quantity) <= 0) {
        return res.status(400).json({ error: 'Each item must have a valid productId and a positive quantity.' });
      }

      // Fetch the product and its category parameters
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { category: true }
      });

      if (!product) {
        return res.status(404).json({ error: `Product with ID ${productId} not found` });
      }

      const cat = product.category;
      
      // Calculate ratePerKg = category unitRate manually set by admin
      const ratePerKg = cat.unitRate || 0;

      const qty = parseFloat(quantity);
      const subtotal = Math.round((ratePerKg * qty) * 100) / 100;

      dbItems.push({
        productId,
        rateSnapshot: ratePerKg,
        quantity: qty,
        subtotal
      });
    }

    // 3. Create the QuoteRequest and related QuoteItems in a transaction
    const newQuote = await prisma.quoteRequest.create({
      data: {
        customerUid: req.user.uid,
        customerName,
        company,
        phone,
        email,
        status: 'PENDING',
        items: {
          create: dbItems
        }
      },
      include: {
        items: true
      }
    });

    res.status(201).json({
      message: 'Quote request submitted successfully',
      quote: newQuote
    });

  } catch (error) {
    console.error('Error submitting quote request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update Quote Request Status (Admin only)
router.put('/:id/status', authenticateToken, requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['PENDING', 'SENT', 'ACCEPTED'].includes(status)) {
    return res.status(400).json({ error: 'Valid status (PENDING, SENT, ACCEPTED) is required' });
  }

  try {
    const updatedQuote = await prisma.quoteRequest.update({
      where: { id },
      data: { status },
      include: {
        userProfile: true,
        items: {
          include: {
            product: {
              include: { category: true }
            }
          }
        }
      }
    });

    res.json({
      message: 'Quote request status updated successfully',
      quote: updatedQuote
    });
  } catch (error) {
    console.error('Error updating quote status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
