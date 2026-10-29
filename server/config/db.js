import mongoose from 'mongoose';

// Opens the MongoDB connection. The server should not start without a database.
export async function connectDB(uri) {
  if (!uri) throw new Error('MONGODB_URI is not set. Copy .env.example to .env first.');
  const conn = await mongoose.connect(uri);
  console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
}
