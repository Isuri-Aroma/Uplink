import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import planRoutes from './routes/planRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import { protect } from './middleware/auth.js';
import { plainQuery } from './middleware/validate.js';

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use(plainQuery);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    service: 'Uplink API',
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    time: new Date().toISOString(),
  });
});

// Open routes first, the rest need a token
app.use('/api/auth', authRoutes);
app.use('/api/plans', protect, planRoutes);
app.use('/api/customers', protect, customerRoutes);
app.use('/api/subscriptions', protect, subscriptionRoutes);
app.use('/api/tickets', protect, ticketRoutes);
app.use('/api/users', protect, userRoutes);
app.use('/api/dashboard', protect, dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
