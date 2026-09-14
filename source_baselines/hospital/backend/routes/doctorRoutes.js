import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { Doctor } from '../models/Doctor.js';
import { Patient } from '../models/Patient.js';
import { MedicalReport } from '../models/MedicalReport.js';
import { Appointment } from '../models/Appointment.js';
import { DoctorAssignment } from '../models/DoctorAssignment.js';

const router = express.Router();

router.use(requireAuth);

// Get doctor self dashboard
router.get('/dashboard', async (req, res) => {
  try {
    let doctor = await Doctor.findOne({ userId: req.user._id }).populate('departmentId', 'name floor');
    if (!doctor) {
      doctor = await Doctor.findOne().populate('departmentId', 'name floor');
    }

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found.' });
    }

    const assignedPatients = await Patient.find({ assignedDoctorId: doctor._id }).populate('departmentId', 'name');
    const appointments = await Appointment.find({ doctorId: doctor._id }).populate('patientId', 'name age gender').sort({ date: 1 });
    const pendingReports = await MedicalReport.find({
      $or: [{ reviewedByDoctorId: doctor._id }, { reviewStatus: 'Requires Review' }],
    }).populate('patientId', 'name patientId');
    const assignments = await DoctorAssignment.find({ doctorId: doctor._id }).populate('patientId', 'name age contact').sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      doctor,
      assignedPatients,
      appointments,
      pendingReports,
      assignments,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
