const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Hospital = require('../models/Hospital');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Report = require('../models/Report');
const Appointment = require('../models/Appointment');
const EmergencySOS = require('../models/EmergencySOS');
const CareQueueItem = require('../models/CareQueueItem');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');

// Helper to resolve Hospital document from hospital_admin
const getHospitalForUser = async (user) => {
  if (user.profileId) {
    const h = await Hospital.findById(user.profileId);
    if (h) return h;
  }
  return await Hospital.findOne({ adminUserId: user.id });
};

// GET /api/hospital/dashboard
router.get('/dashboard', verifyToken, requireRole('hospital_admin'), async (req, res) => {
  try {
    const hospital = await getHospitalForUser(req.user);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital entity not found for this account' });
    }

    const hospitalId = hospital._id;
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      doctorCount,
      patientCount,
      todaysAppointments,
      pendingReportsCount,
      criticalAlertsCount,
      criticalAlerts,
      careQueue
    ] = await Promise.all([
      Doctor.countDocuments({ hospitalId, active: true }),
      User.countDocuments({ hospitalId }),
      Appointment.countDocuments({ hospitalId, scheduledAt: { $gte: startOfToday } }),
      CareQueueItem.countDocuments({ hospitalId, status: 'pending' }),
      EmergencySOS.countDocuments({ hospitalId, status: { $ne: 'resolved' } }),
      EmergencySOS.find({ hospitalId, status: { $ne: 'resolved' } })
        .populate('patientId', 'name email dob gender')
        .sort({ createdAt: -1 })
        .limit(10),
      CareQueueItem.find({ hospitalId, status: 'pending' })
        .populate('patientId', 'name email')
        .populate('reportId')
        .sort({ createdAt: -1 })
        .limit(10)
    ]);

    res.status(200).json({
      kpis: {
        totalPatients: patientCount,
        activeDoctors: doctorCount,
        todaysAppointments,
        pendingReports: pendingReportsCount,
        criticalAlerts: criticalAlertsCount
      },
      criticalAlerts,
      careQueue,
      hospital: {
        id: hospital._id,
        name: hospital.name,
        contactEmail: hospital.contactEmail
      }
    });
  } catch (error) {
    console.error('Hospital dashboard error:', error);
    res.status(500).json({ message: 'Error loading hospital dashboard', error: error.message });
  }
});

// GET /api/hospital/patients - Searchable patient list
router.get('/patients', verifyToken, requireRole('hospital_admin'), async (req, res) => {
  try {
    const hospital = await getHospitalForUser(req.user);
    if (!hospital) return res.status(404).json({ message: 'Hospital not found' });

    const search = req.query.search || '';
    const query = {
      $or: [{ hospitalId: hospital._id }, { role: 'patient' }]
    };

    if (search) {
      query.$and = [
        {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ]
        }
      ];
    }

    const patients = await User.find(query)
      .select('name email dob gender assignedDoctorId createdAt')
      .populate('assignedDoctorId')
      .limit(50);

    // Fetch latest risk report for each patient
    const patientIds = patients.map((p) => p._id);
    const reports = await Report.aggregate([
      { $match: { userId: { $in: patientIds } } },
      { $sort: { reportDate: -1 } },
      {
        $group: {
          _id: '$userId',
          latestRiskTier: { $first: '$mlResult.riskTier' },
          latestRiskScore: { $first: '$mlResult.overallRiskScore' },
          latestReportDate: { $first: '$reportDate' }
        }
      }
    ]);

    const reportMap = {};
    reports.forEach((r) => { reportMap[r._id.toString()] = r; });

    const enriched = patients.map((p) => ({
      id: p._id,
      name: p.name,
      email: p.email,
      gender: p.gender,
      dob: p.dob,
      assignedDoctor: p.assignedDoctorId,
      latestReport: reportMap[p._id.toString()] || null
    }));

    res.status(200).json(enriched);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching patient directory', error: error.message });
  }
});

// GET /api/hospital/doctors - Doctor roster
router.get('/doctors', verifyToken, requireRole('hospital_admin'), async (req, res) => {
  try {
    const hospital = await getHospitalForUser(req.user);
    if (!hospital) return res.status(404).json({ message: 'Hospital not found' });

    const doctors = await Doctor.find({ hospitalId: hospital._id })
      .populate('userId', 'name email avatarUrl')
      .populate('departmentId', 'name');

    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching doctors roster', error: error.message });
  }
});

// POST /api/hospital/doctors - Invite/Create Doctor
router.post('/doctors', verifyToken, requireRole('hospital_admin'), async (req, res) => {
  const { name, email, specialty, departmentId, licenseNumber } = req.body;

  try {
    const hospital = await getHospitalForUser(req.user);
    if (!hospital) return res.status(404).json({ message: 'Hospital not found' });

    if (!name || !email) {
      return res.status(400).json({ message: 'Doctor name and email are required' });
    }

    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('DoctorPass123!', salt);

    user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: 'doctor',
      hospitalId: hospital._id
    });

    const doctor = await Doctor.create({
      userId: user._id,
      hospitalId: hospital._id,
      departmentId: departmentId || null,
      specialty: specialty || 'General Medicine',
      licenseNumber: licenseNumber || `MED-${Date.now()}`
    });

    user.profileId = doctor._id;
    user.profileModel = 'Doctor';
    await user.save();

    await Hospital.findByIdAndUpdate(hospital._id, { $inc: { doctorCount: 1 } });

    res.status(201).json({ message: 'Doctor successfully created', doctor, defaultPassword: 'DoctorPass123!' });
  } catch (error) {
    res.status(500).json({ message: 'Error onboarding doctor', error: error.message });
  }
});

// PATCH /api/hospital/doctors/:id
router.patch('/doctors/:id', verifyToken, requireRole('hospital_admin'), async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(doctor);
  } catch (error) {
    res.status(500).json({ message: 'Error updating doctor', error: error.message });
  }
});

// GET /api/hospital/analytics - Trend & Risk distribution
router.get('/analytics', verifyToken, requireRole('hospital_admin'), async (req, res) => {
  try {
    const hospital = await getHospitalForUser(req.user);
    if (!hospital) return res.status(404).json({ message: 'Hospital not found' });

    const riskDistribution = await Report.aggregate([
      {
        $group: {
          _id: '$mlResult.riskTier',
          count: { $sum: 1 }
        }
      }
    ]);

    const activityTrends = [
      { day: 'Mon', admitted: 12, completedReports: 28, criticalAlerts: 1 },
      { day: 'Tue', admitted: 18, completedReports: 34, criticalAlerts: 2 },
      { day: 'Wed', admitted: 14, completedReports: 30, criticalAlerts: 0 },
      { day: 'Thu', admitted: 22, completedReports: 42, criticalAlerts: 4 },
      { day: 'Fri', admitted: 19, completedReports: 38, criticalAlerts: 1 },
      { day: 'Sat', admitted: 9, completedReports: 18, criticalAlerts: 0 },
      { day: 'Sun', admitted: 7, completedReports: 14, criticalAlerts: 1 }
    ];

    res.status(200).json({ riskDistribution, activityTrends });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving analytics', error: error.message });
  }
});

// GET /api/hospital/profile
router.get('/profile', verifyToken, requireRole('hospital_admin'), async (req, res) => {
  try {
    const hospital = await getHospitalForUser(req.user);
    res.status(200).json(hospital);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});

// PATCH /api/hospital/profile
router.patch('/profile', verifyToken, requireRole('hospital_admin'), async (req, res) => {
  try {
    const hospital = await getHospitalForUser(req.user);
    if (!hospital) return res.status(404).json({ message: 'Hospital not found' });

    const updated = await Hospital.findByIdAndUpdate(hospital._id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating hospital profile', error: error.message });
  }
});

module.exports = router;
