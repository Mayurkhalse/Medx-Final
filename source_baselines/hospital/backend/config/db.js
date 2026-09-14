import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/medx';
  try {
    // Attempt local/configured connection first with short timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[Database] Connected to MongoDB at: ${uri}`);
  } catch (err) {
    console.log('[Database] Local MongoDB not detected, launching in-memory MongoDB instance for Med-X...');
    mongod = await MongoMemoryServer.create({
      instance: {
        dbName: 'medx',
      },
    });
    const memoryUri = mongod.getUri();
    await mongoose.connect(memoryUri);
    console.log(`[Database] Connected to in-memory MongoDB at: ${memoryUri}`);
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }
  } catch (err) {
    console.error('Error disconnecting DB:', err);
  }
};
