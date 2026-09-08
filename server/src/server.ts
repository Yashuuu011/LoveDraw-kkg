import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import authRoutes from './routes/authRoutes';
import messageRoutes from './routes/messageRoutes';
import drawRoutes from './routes/drawRoutes';
import paymentRoutes from './routes/paymentRoutes';
import winnerRoutes from './routes/winnerRoutes';
import memoryRoutes from './routes/memoryRoutes';
import adminRoutes from './routes/adminRoutes';
import { errorHandler } from './middleware/errorHandler';
import { initDatabase } from './utils/initDb';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((url) => url.trim().replace(/\/$/, ''))
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(null, true); // Allow cross-origin requests for deployment flexibility
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'LoveDraw API',
    version: '1.0.0',
    paymentMode: process.env.PAYMENT_MODE || 'demo',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/draws', drawRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/winners', winnerRoutes);
app.use('/api/memories', memoryRoutes);
app.use('/api/admin', adminRoutes);

// Serve Frontend Client Static Dist in Unified Railway/Monorepo Deployment
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.resolve(clientDistPath, 'index.html'));
  });
} else {
  // 404 Route Handler when backend is deployed as a standalone API
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: 'Endpoint not found. Love is everywhere, but not at this URL. 💕'
    });
  });
}

// Central Error Handler
app.use(errorHandler);

if (!process.env.VERCEL) {
  app.listen(PORT, async () => {
    console.log(`
    ======================================================
    ❤️  LoveDraw Backend API Server Running  ❤️
    ------------------------------------------------------
    📡 Port: ${PORT}
    🌍 Environment: ${process.env.NODE_ENV || 'development'}
    💳 Payment Mode: ${process.env.PAYMENT_MODE || 'demo'} (MOCK/DEMO ONLY)
    ======================================================
    `);
    await initDatabase();
  });
} else {
  // Initialize database lazily on serverless runtimes
  initDatabase().catch((err) => console.error('Database initialization warning on serverless:', err));
}

export default app;
