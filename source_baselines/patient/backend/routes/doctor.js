const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Report = require('../models/Report');
const Appointment = require('../models/Appointment');
const Message = require('../models/Message');
const EmergencySOS = require('../models/EmergencySOS');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');

// Helper to resolve Doctor entity for current user
const getDoctorForUser = async (user) => {
  if (user.profileId) {
    const doc = await Doctor.findById(user.profileId).populate('departmentId');
    if (doc) return doc;
  }
  return await Doctor.findOne({ userId: user.id }).populate('departmentId');
};

// GET /api/doctor/dashboard
router.get('/dashboard', verifyToken, requireRole('doctor'), async (req, res) => {
  try {
    const doctor = await getDoctorForUser(req.user);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor record not found for this user' });
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      assignedPatientsCount,
      todaysAppointmentsCount,
      unreadMessagesCount,
      openSOSCount,
      upcomingAppointments,
      activeSOS
    ] = await Promise.all([
      User.countDocuments({ assignedDoctorId: doctor._id }),
      Appointment.countDocuments({ doctorId: doctor._id, scheduledAt: { $gte: startOfToday } }),
      Message.countDocuments({ receiverId: req.user.id, readAt: null }),
      EmergencySOS.countDocuments({
        $or: [{ doctorId: doctor._id }, { hospitalId: doctor.hospitalId }],
        status: { $ne: 'resolved' }
      }),
      Appointment.find({ doctorId: doctor._id, scheduledAt: { $gte: startOfToday } })
        .populate('patientId', 'name email dob gender')
        .sort({ scheduledAt: 1 })
        .limit(5),
      EmergencySOS.find({
        $or: [{ doctorId: doctor._id }, { hospitalId: doctor.hospitalId }],
        status: { $ne: 'resolved' }
      })
        .populate('patientId', 'name email dob gender')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    res.status(200).json({
      kpis: {
        assignedPatients: assignedPatientsCount,
        todaysAppointments: todaysAppointmentsCount,
        unreadMessages: unreadMessagesCount,
        openSOS: openSOSCount
      },
      doctor,
      upcomingAppointments,
      activeSOS
    });
  } catch (error) {
    console.error('Doctor dashboard error:', error);
    res.status(500).json({ message: 'Error retrieving doctor dashboard', error: error.message });
  }
});

// GET /api/doctor/patients - Assigned patient list + risk status
router.get('/patients', verifyToken, requireRole('doctor'), async (req, res) => {
  try {
    const doctor = await getDoctorForUser(req.user);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    const search = req.query.search || '';
    const query = {
      $or: [{ assignedDoctorId: doctor._id }, { _id: { $in: doctor.assignedPatients || [] } }]
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

    const patients = await User.find(query).select('name email dob gender createdAt');
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
      latestReport: reportMap[p._id.toString()] || null
    }));

    res.status(200).json(enriched);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching assigned patients', error: error.message });
  }
});

// GET /api/doctor/patients/:id/records - Full report history for patient
router.get('/patients/:id/records', verifyToken, requireRole('doctor'), async (req, res) => {
  try {
    const patientId = req.params.id;
    const [patient, reports] = await Promise.all([
      User.findById(patientId).select('-passwordHash'),
      Report.find({ userId: patientId }).sort({ reportDate: -1 })
    ]);

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.status(200).json({ patient, reports });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving patient records', error: error.message });
  }
});

// GET /api/doctor/availability
router.get('/availability', verifyToken, requireRole('doctor'), async (req, res) => {
  try {
    const doctor = await getDoctorForUser(req.user);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.status(200).json(doctor.availability || []);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching availability', error: error.message });
  }
});

// PUT /api/doctor/availability
router.put('/availability', verifyToken, requireRole('doctor'), async (req, res) => {
  try {
    const doctor = await getDoctorForUser(req.user);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    doctor.availability = req.body.availability || [];
    await doctor.save();

    res.status(200).json({ message: 'Availability schedule updated', availability: doctor.availability });
  } catch (error) {
    res.status(500).json({ message: 'Error updating availability', error: error.message });
  }
});

// GET /api/doctor/profile
router.get('/profile', verifyToken, requireRole('doctor'), async (req, res) => {
  try {
    const doctor = await getDoctorForUser(req.user);
    const user = await User.findById(req.user.id).select('-passwordHash');
    res.status(200).json({ doctor, user });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching doctor profile', error: error.message });
  }
});

// PATCH /api/doctor/profile
router.patch('/profile', verifyToken, requireRole('doctor'), async (req, res) => {
  try {
    const doctor = await getDoctorForUser(req.user);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    const updated = await Doctor.findByIdAndUpdate(doctor._id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating doctor profile', error: error.message });
  }
});

module.exports = router;
