import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { Patient } from '../models/Patient.js';
import { MedicalReport } from '../models/MedicalReport.js';
import { Appointment } from '../models/Appointment.js';
import { HealthAlert } from '../models/HealthAlert.js';

const router = express.Router();

router.use(requireAuth);

// Get patient self profile & dashboard
router.get('/dashboard', async (req, res) => {
  try {
    let patient = await Patient.findOne({ userId: req.user._id })
      .populate('assignedDoctorId', 'name specialization phone email avatar')
      .populate('departmentId', 'name floor');

    if (!patient) {
      // Find first demo patient if linked userId is missing
      patient = await Patient.findOne()
        .populate('assignedDoctorId', 'name specialization phone email avatar')
        .populate('departmentId', 'name floor');
    }

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found.' });
    }

    const reports = await MedicalReport.find({ patientId: patient._id }).sort({ createdAt: -1 });
    const appointments = await Appointment.find({ patientId: patient._id }).populate('doctorId', 'name specialization').sort({ date: -1 });
    const alerts = await HealthAlert.find({ patientId: patient._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      patient,
      reports,
      appointments,
      alerts,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
