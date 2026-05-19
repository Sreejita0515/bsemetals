import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth.js';
import ratesRouter from './routes/rates.js';
import categoriesRouter from './routes/categories.js';
import productsRouter from './routes/products.js';
import quotesRouter from './routes/quotes.js';
import usersRouter from './routes/users.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend development
app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json());

// Logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Mount Routes
app.use('/api/auth', authRouter);
app.use('/api/rates', ratesRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/products', productsRouter);
app.use('/api/quotes', quotesRouter);
app.use('/api/users', usersRouter);

// Health/Welcome Route
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'BSEMetals Copper pricing pricing-engine API',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    mode: (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL) ? 'Production (Firebase Auth)' : 'Developer Mock Auth Mode'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🚀 BSEMetals Copper pricing engine active on port ${PORT}`);
  console.log(`📊 Mode: ${(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL) ? 'Production (Firebase Real Auth)' : 'Developer Mock Mode'}`);
  console.log(`===================================================`);
});
