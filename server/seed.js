import { seedDatabase } from './src/seed.js';

seedDatabase()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('[FATAL SEED ERROR]', err);
    process.exit(1);
  });
