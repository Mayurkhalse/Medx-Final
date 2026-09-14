const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/medx';
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Auto-seed if database is clean/empty
    try {
      const User = require('../models/User');
      const { seed } = require('../seed');
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('No records found in database. Automatically seeding MedX clinical demo data...');
        await seed(false);
        console.log('MedX clinical demo database auto-seeded successfully!');
      }
    } catch (seedErr) {
      console.warn('Auto-seed check non-fatal notice:', seedErr.message);
    }
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Do not crash server in dev if Mongo is not running locally yet; allow API to start
  }
};

module.exports = connectDB;
