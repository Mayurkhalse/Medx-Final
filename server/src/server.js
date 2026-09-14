import app from './app.js';
import config from './config/config.js';
import { connectDB } from './config/db.js';

async function startServer() {
  try {
    console.log('====================================================');
    console.log('  MED-X UNIFIED SYSTEM — INITIALIZING FOUNDATION');
    console.log(`  Environment: ${config.NODE_ENV}`);
    console.log('====================================================');

    // Establish persistent MongoDB connection
    await connectDB();

    // Start HTTP Server
    const server = app.listen(config.PORT, () => {
      console.log(`[SERVER] Med-X Unified Express API running on port ${config.PORT}`);
      console.log(`[SERVER] Base API URL: http://localhost:${config.PORT}/api`);
      console.log(`[SERVER] ML Service Boundary configured at: ${config.ML_SERVICE_URL}`);
      console.log('====================================================');
    });

    // Graceful Shutdown Handlers
    const shutdown = async (signal) => {
      console.log(`\n[SERVER] Received ${signal}. Gracefully shutting down...`);
      server.close(async () => {
        console.log('[SERVER] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    console.error(`[FATAL STARTUP ERROR] Failed to start Med-X Unified Server: ${error.message}`);
    process.exit(1);
  }
}

startServer();
