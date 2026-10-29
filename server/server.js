import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5050;

try {
  await connectDB(process.env.MONGODB_URI);
  app.listen(PORT, () => console.log(`Uplink API running on http://localhost:${PORT}`));
} catch (err) {
  console.error('Failed to start server:', err.message);
  process.exit(1);
}
