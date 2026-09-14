const express = require('express');
const router = express.Router();
const EmergencySOS = require('../models/EmergencySOS');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');
const { verifyToken } = require('../middleware/auth');

// GET /api/emergency - List SOS records
router.get('/', verifyToken, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'doctor') {
      let doctorId = req.user.profileId;
      if (!doctorId) {
        const d = await Doctor.findOne({ userId: req.user.id });
        if (d) doctorId = d._id;
      }
      query.$or = [{ doctorId }, { hospitalId: req.user.hospitalId }];
    } else if (req.user.role === 'hospital_admin') {
      if (req.user.profileId) query.hospitalId = req.user.profileId;
    } else if (req.user.role === 'patient') {
      query.patientId = req.user.id;
    }

    const sosList = await EmergencySOS.find(query)
      .populate('patientId', 'name email dob gender')
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email specialty' }
      })
      .populate('hospitalId', 'name contactPhone')
      .sort({ createdAt: -1 });

    res.status(200).json(sosList);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving SOS alerts', error: error.message });
  }
});

// POST /api/emergency/trigger - Trigger Emergency SOS
router.post('/trigger', verifyToken, async (req, res) => {
  const { reason, hospitalId, doctorId } = req.body;

  try {
    const user = await User.findById(req.user.id);
    let targetHospitalId = hospitalId || user?.hospitalId;
    let targetDoctorId = doctorId || user?.assignedDoctorId;

    if (!targetHospitalId) {
      const defaultHospital = await Hospital.findOne();
      if (defaultHospital) targetHospitalId = defaultHospital._id;
    }

    const sos = await EmergencySOS.create({
      patientId: req.user.id,
      hospitalId: targetHospitalId,
      doctorId: targetDoctorId || null,
      triggerReason: reason || 'Acute Distress - Immediate Medical Attention Requested',
      status: 'open'
    });

    res.status(201).json({ message: 'Emergency SOS broadcasted successfully', sos });
  } catch (error) {
    res.status(500).json({ message: 'Failed to broadcast Emergency SOS', error: error.message });
  }
});

// POST /api/emergency/:id/ack - Acknowledge SOS
router.post('/:id/ack', verifyToken, async (req, res) => {
  try {
    const sos = await EmergencySOS.findByIdAndUpdate(
      req.params.id,
      {
        status: 'acknowledged',
        acknowledgedAt: new Date()
      },
      { new: true }
    );
    res.status(200).json(sos);
  } catch (error) {
    res.status(500).json({ message: 'Error acknowledging SOS', error: error.message });
  }
});

// POST /api/emergency/:id/resolve - Resolve SOS
router.post('/:id/resolve', verifyToken, async (req, res) => {
  const { resolutionNotes } = req.body;

  try {
    const sos = await EmergencySOS.findByIdAndUpdate(
      req.params.id,
      {
        status: 'resolved',
        resolvedAt: new Date(),
        resolutionNotes: resolutionNotes || 'Triage completed and clinical action documented.'
      },
      { new: true }
    );
    res.status(200).json(sos);
  } catch (error) {
    res.status(500).json({ message: 'Error resolving SOS alert', error: error.message });
  }
});

module.exports = router;
