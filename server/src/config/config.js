import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env if present
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  MONGODB_URI: process.env.MONGODB_URI || (process.env.NODE_ENV === 'test' ? 'mongodb://localhost:27017/medx_unified_test' : 'mongodb://localhost:27017/medx_unified'),
  JWT_SECRET: process.env.JWT_SECRET || (process.env.NODE_ENV === 'test' ? 'test_jwt_secret_key_for_testing_only_32chars' : undefined),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  ML_SERVICE_URL: process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback'
};

// Validate mandatory configuration at startup
export function validateConfig() {
  const missing = [];
  if (!config.MONGODB_URI) {
    missing.push('MONGODB_URI');
  }
  if (!config.JWT_SECRET) {
    missing.push('JWT_SECRET');
  }

  if (missing.length > 0) {
    const errorMsg = `[FATAL CONFIG ERROR] Missing required environment variable(s): ${missing.join(', ')}. Please define them in your .env file.`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
}

export default config;
