import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import planRoutes from './routes/planRoutes.js';

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

// Quick check that the API and database are up
app.get('/api/health', (req, res) => {
  res.json({
    service: 'Uplink API',
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    time: new Date().toISOString(),
  });
});

// Feature routes
app.use('/api/plans', planRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
