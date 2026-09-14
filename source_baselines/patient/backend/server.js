require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Route imports
const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');
const whatifRoutes = require('./routes/whatif');
const hospitalRoutes = require('./routes/hospital');
const doctorRoutes = require('./routes/doctor');
const departmentRoutes = require('./routes/departments');
const appointmentRoutes = require('./routes/appointments');
const messageRoutes = require('./routes/messages');
const emergencyRoutes = require('./routes/emergency');

const { PORT = 5000 } = process.env;

const app = express();

// Database initialization
connectDB();

// Core middlewares
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Route namespaces
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/whatif', whatifRoutes);
app.use('/api/hospital', hospitalRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/emergency', emergencyRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'medx-backend',
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.stack);
  res.status(500).json({
    message: 'Internal Server Error',
    error: err.message
  });
});

app.listen(PORT, () => {
  console.log(`MedX Express Backend Server running on port ${PORT}`);
});
