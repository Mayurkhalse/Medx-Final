const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const { verifyToken } = require('../middleware/auth');

// GET /api/appointments - Scoped by role
router.get('/', verifyToken, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'patient') {
      query.patientId = req.user.id;
    } else if (req.user.role === 'doctor') {
      let doctorId = req.user.profileId;
      if (!doctorId) {
        const d = await Doctor.findOne({ userId: req.user.id });
        if (d) doctorId = d._id;
      }
      query.doctorId = doctorId;
    } else if (req.user.role === 'hospital_admin') {
      if (req.user.profileId) query.hospitalId = req.user.profileId;
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name email dob gender')
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email specialty' }
      })
      .populate('hospitalId', 'name')
      .sort({ scheduledAt: 1 });

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving appointments', error: error.message });
  }
});

// POST /api/appointments - Book appointment
router.post('/', verifyToken, async (req, res) => {
  const { doctorId, scheduledAt, reason, hospitalId } = req.body;

  try {
    if (!doctorId || !scheduledAt) {
      return res.status(400).json({ message: 'Doctor ID and scheduled date/time are required' });
    }

    let targetHospitalId = hospitalId;
    if (!targetHospitalId) {
      const doc = await Doctor.findById(doctorId);
      if (doc) targetHospitalId = doc.hospitalId;
    }

    const appointment = await Appointment.create({
      patientId: req.user.id,
      doctorId,
      hospitalId: targetHospitalId,
      scheduledAt: new Date(scheduledAt),
      reason: reason || 'Routine Consultation',
      status: 'requested'
    });

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Error booking appointment', error: error.message });
  }
});

// PATCH /api/appointments/:id - Update status / notes
router.patch('/:id', verifyToken, async (req, res) => {
  const { status, notes } = req.body;

  try {
    const updateData = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const appointment = await Appointment.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate('patientId', 'name email')
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email' }
      });

    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Error updating appointment', error: error.message });
  }
});

module.exports = router;
