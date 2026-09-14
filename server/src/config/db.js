import mongoose from 'mongoose';
import config from './config.js';

let isConnected = false;

export async function connectDB(options = {}) {
  const uri = options.uri || config.MONGODB_URI;

  if (!uri) {
    const msg = '[DATABASE FATAL] MONGODB_URI is not defined. No database connection possible.';
    console.error(msg);
    throw new Error(msg);
  }

  // Prevent duplicate connections in tests or reloads
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    console.log(`[DATABASE] Connecting to MongoDB at: ${uri.replace(/\/\/.*@/, '//<credentials>@')}`);
    
    // Mongoose 8 recommended options
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true
    });

    isConnected = true;
    console.log(`[DATABASE] Connected successfully to MongoDB: ${conn.connection.name} (host: ${conn.connection.host})`);
    
    return conn.connection;
  } catch (error) {
    isConnected = false;
    console.error(`[DATABASE FATAL] Failed to connect to MongoDB: ${error.message}`);
    console.error(`[DATABASE FATAL] Med-X mandates a persistent MongoDB database. In-memory/mock fallback is strictly prohibited.`);
    
    if (config.NODE_ENV !== 'test' && !options.throwOnly) {
      process.exit(1);
    }
    throw error;
  }
}

export async function disconnectDB() {
  if (isConnected || mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('[DATABASE] Disconnected from MongoDB');
  }
}

export default { connectDB, disconnectDB };
