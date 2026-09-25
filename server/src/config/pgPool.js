import pg from 'pg';
import config from './config.js';

const { Pool } = pg;

let pool = null;
let isPgConnected = false;
let lastPgCheckTime = 0;

export function getPgPool() {
  if (!pool) {
    const poolConfig = config.DATABASE_URL
      ? { connectionString: config.DATABASE_URL, connectionTimeoutMillis: 1000 }
      : {
          host: config.PGHOST,
          user: config.PGUSER,
          password: config.PGPASSWORD,
          database: config.PGDATABASE,
          port: config.PGPORT,
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 1000
        };

    pool = new Pool(poolConfig);

    pool.on('error', (err) => {
      console.error('[POSTGRES POOL ERROR] Unexpected error on idle client:', err.message);
      isPgConnected = false;
    });
  }
  return pool;
}

/**
 * Execute a SQL query using the connection pool
 */
export async function query(text, params) {
  // Fast-fail immediately if PostgreSQL is known to be offline (prevents 5s-15s hanging queries)
  if (!isPgConnected && lastPgCheckTime > 0 && (Date.now() - lastPgCheckTime < 60000)) {
    throw new Error('PostgreSQL pool is offline; defaulting to fast local state');
  }

  const currentPool = getPgPool();
  const start = Date.now();
  try {
    const res = await currentPool.query(text, params);
    const duration = Date.now() - start;
    isPgConnected = true;
    lastPgCheckTime = Date.now();
    if (config.NODE_ENV === 'development') {
      console.log(`[PG QUERY] Executed query in ${duration}ms: ${text.substring(0, 60)}...`);
    }
    return res;
  } catch (err) {
    isPgConnected = false;
    lastPgCheckTime = Date.now();
    console.error(`[PG QUERY ERROR] Query failed: ${err.message}`);
    throw err;
  }
}

/**
 * Auto-initialize relational tables schema if PostgreSQL is reachable
 */
export async function initPgSchema() {
  const schemaSql = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'patient',
      phone VARCHAR(50),
      is_deactivated BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS doctors (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255),
      phone VARCHAR(50),
      specialty VARCHAR(100) DEFAULT 'General Medicine',
      department VARCHAR(100) DEFAULT 'Outpatient',
      hospital_name VARCHAR(255) DEFAULT 'Med-X General Hospital',
      availability_status VARCHAR(50) DEFAULT 'available',
      working_hours VARCHAR(100) DEFAULT '09:00 AM - 05:00 PM',
      license_number VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS patients (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255),
      phone VARCHAR(50),
      date_of_birth DATE,
      gender VARCHAR(20),
      blood_group VARCHAR(10),
      age INTEGER,
      address TEXT,
      emergency_contact VARCHAR(100),
      symptoms TEXT,
      medical_history TEXT,
      risk_tier VARCHAR(50) DEFAULT 'LOW',
      clinical_risk_score NUMERIC DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS clinics (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      address TEXT,
      phone VARCHAR(50),
      department VARCHAR(100) DEFAULT 'General',
      total_beds INTEGER DEFAULT 50,
      available_beds INTEGER DEFAULT 30,
      icu_beds INTEGER DEFAULT 10,
      icu_available INTEGER DEFAULT 5,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id SERIAL PRIMARY KEY,
      patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
      doctor_id INTEGER REFERENCES doctors(id) ON DELETE SET NULL,
      clinic_id INTEGER REFERENCES clinics(id) ON DELETE SET NULL,
      appointment_date DATE DEFAULT CURRENT_DATE,
      time_slot VARCHAR(50) DEFAULT '10:00 AM',
      status VARCHAR(50) DEFAULT 'scheduled',
      type VARCHAR(50) DEFAULT 'consultation',
      triage_stage VARCHAR(50) DEFAULT 'TRIAGE',
      symptoms TEXT,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS medical_records (
      id SERIAL PRIMARY KEY,
      patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
      doctor_id INTEGER REFERENCES doctors(id) ON DELETE SET NULL,
      report_type VARCHAR(100) DEFAULT 'General Assessment',
      summary TEXT,
      symptoms TEXT,
      findings TEXT,
      prescription TEXT,
      lab_results JSONB,
      status VARCHAR(50) DEFAULT 'draft',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await query(schemaSql);
    console.log('[POSTGRES DB] Relational schema initialized successfully (users, doctors, patients, clinics, appointments, medical_records).');
    isPgConnected = true;
    return true;
  } catch (err) {
    console.warn(`[POSTGRES DB WARNING] Could not auto-initialize relational schema: ${err.message}`);
    return false;
  }
}

/**
 * Test pool connection
 */
export async function connectPgPool() {
  try {
    const currentPool = getPgPool();
    const res = await currentPool.query('SELECT NOW()');
    console.log(`[POSTGRES DB] PostgreSQL pool connected successfully. Host: ${config.DATABASE_URL ? 'URL' : config.PGHOST}:${config.PGPORT}, DB: ${config.PGDATABASE}. Server time: ${res.rows[0].now}`);
    isPgConnected = true;
    await initPgSchema();
    return true;
  } catch (err) {
    console.warn(`[POSTGRES DB NOTICE] PostgreSQL pool connection test notice: ${err.message}`);
    console.warn(`[POSTGRES DB NOTICE] Server configured with PostgreSQL connection pool (host: ${config.PGHOST}:${config.PGPORT}, DB: ${config.PGDATABASE}).`);
    isPgConnected = false;
    return false;
  }
}

export async function disconnectPgPool() {
  if (pool) {
    await pool.end();
    pool = null;
    isPgConnected = false;
    console.log('[POSTGRES DB] PostgreSQL connection pool closed.');
  }
}

export default {
  getPgPool,
  query,
  initPgSchema,
  connectPgPool,
  disconnectPgPool
};
