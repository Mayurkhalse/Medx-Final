import mongoose from 'mongoose';
import config from './config.js';
import { connectPgPool, disconnectPgPool } from './pgPool.js';

let isMongoConnected = false;

export async function connectDB(options = {}) {
  // Always initialize PostgreSQL Pool
  console.log('[DATABASE] Initializing PostgreSQL Pool connection...');
  await connectPgPool();

  // Attempt MongoDB connection if configured
  const uri = options.uri || config.MONGODB_URI;
  if (uri && (isMongoConnected && mongoose.connection.readyState === 1)) {
    return mongoose.connection;
  }

  if (uri) {
    try {
      console.log(`[DATABASE] Connecting to MongoDB at: ${uri.replace(/\/\/.*@/, '//<credentials>@')}`);
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        autoIndex: true
      });
      isMongoConnected = true;
      console.log(`[DATABASE] Connected successfully to MongoDB: ${conn.connection.name} (host: ${conn.connection.host})`);
      return conn.connection;
    } catch (error) {
      isMongoConnected = false;
      console.warn(`[DATABASE NOTICE] MongoDB connection attempt notice: ${error.message}. Proceeding with PostgreSQL primary relational data pool.`);
    }
  }

  return null;
}

export async function disconnectDB() {
  await disconnectPgPool();
  if (isMongoConnected || mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isMongoConnected = false;
    console.log('[DATABASE] Disconnected from MongoDB');
  }
}

export default { connectDB, disconnectDB };
