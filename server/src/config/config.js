import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env if present
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const defaultJwtSecret = 'medx_jwt_secret_key_development_32chars_min';

const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  MONGODB_URI: process.env.MONGODB_URI || (process.env.NODE_ENV === 'test' ? 'mongodb://localhost:27017/medx_unified_test' : 'mongodb://localhost:27017/medx_unified'),
  
  // PostgreSQL Pool Configuration
  PGHOST: process.env.PGHOST || 'localhost',
  PGUSER: process.env.PGUSER || 'postgres',
  PGPASSWORD: process.env.PGPASSWORD || 'postgres',
  PGDATABASE: process.env.PGDATABASE || (process.env.NODE_ENV === 'test' ? 'medx_unified_test' : 'medx_unified'),
  PGPORT: parseInt(process.env.PGPORT || '5432', 10),
  DATABASE_URL: process.env.DATABASE_URL || process.env.POSTGRES_URI || process.env.PGURI || null,
  
  JWT_SECRET: process.env.JWT_SECRET || defaultJwtSecret,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  ML_SERVICE_URL: process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
  IOT_WS_PORT: parseInt(process.env.IOT_WS_PORT || '8080', 10)
};

// Validate mandatory configuration at startup
export function validateConfig() {
  const missing = [];
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
