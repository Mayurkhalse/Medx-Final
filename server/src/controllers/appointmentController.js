import mongoose from 'mongoose';
import { Appointment } from '../models/Appointment.js';
import { Doctor } from '../models/Doctor.js';
import { Patient } from '../models/Patient.js';
import { User } from '../models/User.js';
import { Hospital } from '../models/Hospital.js';

/**
 * Helper to ensure a patient profile exists for a patient user
 */
async function getOrCreatePatient(userId, userName) {
  let patient = await Patient.findOne({ userId });
  if (!patient) {
    patient = await Patient.create({
      userId,
      legacyId: `PAT-${Math.floor(1000 + Math.random() * 9000)}`
    });
  }
  return patient;
}

/**
 * Helper to ensure a doctor profile exists for a doctor user
 */
async function getOrCreateDoctor(userId, userName) {
  let doctor = await Doctor.findOne({ userId });
  if (!doctor) {
    doctor = await Doctor.create({
      userId,
      legacyId: `DOC-${Math.floor(100 + Math.random() * 900)}`,
      specialty: 'Diagnostic Medicine & Cardiology',
      qualification: 'MBBS, MD',
      department: 'Cardiology'
    });
  }
  return doctor;
}

/**
 * Helper to format an appointment document for client consumption
 */
function formatAppointment(apt) {
  if (!apt) return null;
  const patientDoc = apt.patientId || {};
  const doctorDoc = apt.doctorId || {};
  const hospitalDoc = apt.hospitalId || {};

  const patientUser = (patientDoc && typeof patientDoc === 'object' && patientDoc.userId) || {};
  const doctorUser = (doctorDoc && typeof doctorDoc === 'object' && doctorDoc.userId) || {};

  const rawDoctorName = typeof doctorUser.name === 'string'
    ? doctorUser.name
    : (typeof doctorDoc.name === 'string' ? doctorDoc.name : 'Attending Physician');
  const cleanDoctorName = rawDoctorName.startsWith('Dr.') ? rawDoctorName : `Dr. ${rawDoctorName}`;

  const rawPatientName = typeof patientUser.name === 'string'
    ? patientUser.name
    : (typeof patientDoc.name === 'string' ? patientDoc.name : 'Patient');

  const aptId = apt.legacyId || (apt._id ? `APT-${apt._id.toString().slice(-6).toUpperCase()}` : 'APT-0000');

  return {
    _id: apt._id,
    id: aptId,
    legacyId: apt.legacyId,
    appointmentDate: apt.appointmentDate,
    timeSlot: apt.timeSlot || '10:00 AM',
    status: apt.status || 'Scheduled',
    type: apt.type || 'In-Person',
    reason: apt.reason || 'Clinical Consultation',
    notes: apt.notes || '',
    queueToken: apt.queueToken || null,
    arrivedAt: apt.arrivedAt || null,
    consultationStartedAt: apt.consultationStartedAt || null,
    consultationEndedAt: apt.consultationEndedAt || null,
    createdAt: apt.createdAt,
    updatedAt: apt.updatedAt,
    // Patient Details
    patientId: patientDoc?._id || apt.patientId,
    patientVitalSigns: patientDoc?.vitalSigns || {},
    patientCondition: patientDoc?.currentCondition || '',
    patientName: rawPatientName,
    patientEmail: patientUser.email || '',
    patientPhone: patientUser.phone || '',
    patientGender: patientDoc?.gender || 'Unspecified',
    patientAge: patientDoc?.dateOfBirth && !isNaN(new Date(patientDoc.dateOfBirth).getTime())
      ? Math.floor((Date.now() - new Date(patientDoc.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000))
      : 35,
    patientBloodGroup: patientDoc?.bloodGroup || 'O+',
    patientAvatar: patientUser.avatar || '',
    // Doctor Details
    doctorId: doctorDoc?._id || apt.doctorId,
    doctorName: cleanDoctorName,
    doctorEmail: doctorUser.email || '',
    doctorPhone: doctorUser.phone || '',
    doctorSpecialty: doctorDoc?.specialty || 'General Medicine',
    doctorQualification: doctorDoc?.qualification || 'MBBS, MD',
    doctorDepartment: doctorDoc?.department || 'Outpatient Clinic',
    doctorAvatar: doctorUser.avatar || '',
    doctorAvailabilityStatus: doctorDoc?.availabilityStatus || 'Available',
    // Hospital Details
    hospitalId: hospitalDoc?._id || apt.hospitalId,
    hospitalName: hospitalDoc?.facilityName || 'Med-X Metro Super Specialty Teaching Hospital'
  };
}

/**
 * Get appointments filtered by the authenticated user's role
 * GET /api/appointments
 */
export async function getAppointments(req, res, next) {
  try {
    const { role } = req.user;
    const { status, type } = req.query;

    let query = {};

    if (role === 'patient') {
      const patient = await getOrCreatePatient(req.user._id, req.user.name);
      query.patientId = patient._id;
    } else if (role === 'doctor') {
      const doctor = await getOrCreateDoctor(req.user._id, req.user.name);
      query.doctorId = doctor._id;
    } else if (role === 'hospital_admin') {
      const hospital = await Hospital.findOne({ userId: req.user._id });
      if (hospital) {
        query.hospitalId = hospital._id;
      }
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (type && type !== 'All') {
      query.type = type;
    }

    const appointments = await Appointment.find(query)
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email phone avatar' }
      })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email phone avatar' }
      })
      .populate('hospitalId', 'facilityName address')
      .sort({ appointmentDate: -1, createdAt: -1 });

    const formatted = appointments.map(formatAppointment);
    return res.status(200).json(formatted);
  } catch (error) {
    next(error);
  }
}

/**
 * Get list of available doctors for appointment scheduling
 * GET /api/appointments/doctors
 */
export async function getAvailableDoctors(req, res, next) {
  try {
    let doctors = await Doctor.find()
      .populate('userId', 'name email phone avatar')
      .populate('hospitalId', 'facilityName');

    // Auto-discover doctor users if doctor profiles don't exist yet
    if (doctors.length === 0) {
      const doctorUsers = await User.find({ role: 'doctor' });
      for (const dUser of doctorUsers) {
        await Doctor.findOneAndUpdate(
          { userId: dUser._id },
          {
            $setOnInsert: {
              legacyId: `DOC-${Math.floor(100 + Math.random() * 900)}`,
              specialty: 'Diagnostic Medicine & Cardiology',
              qualification: 'MBBS, MD',
              department: 'Cardiology',
              availabilityStatus: 'Available'
            }
          },
          { upsert: true, new: true }
        );
      }
      doctors = await Doctor.find()
        .populate('userId', 'name email phone avatar')
        .populate('hospitalId', 'facilityName');
    }

    const formatted = doctors.map(doc => ({
      _id: doc._id,
      id: doc.legacyId || doc._id,
      name: doc.userId?.name ? `Dr. ${doc.userId.name.replace(/^Dr\.\s*/i, '')}` : 'Dr. Specialist',
      email: doc.userId?.email || '',
      phone: doc.userId?.phone || '+91 98112 34567',
      avatar: doc.userId?.avatar || '',
      specialty: doc.specialty || 'General Medicine',
      qualification: doc.qualification || 'MBBS, MD',
      department: doc.department || 'Outpatient Department',
      experienceYears: doc.experienceYears || 8,
      consultationFee: doc.consultationFee || 50,
      availabilityStatus: doc.availabilityStatus || 'Available',
      hospitalName: doc.hospitalId?.facilityName || 'Med-X Central Teaching Hospital'
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new appointment
 * POST /api/appointments
 */
export async function createAppointment(req, res, next) {
  try {
    const { role } = req.user;
    const {
      doctorId,
      patientId,
      appointmentDate,
      timeSlot,
      type = 'In-Person',
      reason = 'Routine Clinical Consultation',
      notes = ''
    } = req.body;

    if (!appointmentDate) {
      return res.status(400).json({
        error: { code: 'MISSING_DATE', message: 'Appointment date is required.' }
      });
    }

    let targetPatientId = null;
    let targetDoctorId = null;
    let targetHospitalId = null;

    if (role === 'patient') {
      const patient = await getOrCreatePatient(req.user._id, req.user.name);
      targetPatientId = patient._id;

      if (!doctorId) {
        return res.status(400).json({
          error: { code: 'MISSING_DOCTOR', message: 'Doctor selection is required.' }
        });
      }

      // Check doctor exists
      const doc = await Doctor.findById(doctorId);
      if (!doc) {
        return res.status(404).json({
          error: { code: 'DOCTOR_NOT_FOUND', message: 'Selected doctor not found.' }
        });
      }
      targetDoctorId = doc._id;
      targetHospitalId = doc.hospitalId || patient.hospitalId || null;

    } else if (role === 'doctor') {
      const doctor = await getOrCreateDoctor(req.user._id, req.user.name);
      targetDoctorId = doctor._id;
      targetHospitalId = doctor.hospitalId || null;

      if (!patientId) {
        return res.status(400).json({
          error: { code: 'MISSING_PATIENT', message: 'Patient selection is required.' }
        });
      }

      let patient = null;
      if (mongoose.Types.ObjectId.isValid(patientId)) {
        patient = await Patient.findById(patientId);
      }
      if (!patient) {
        patient = await Patient.findOne({ legacyId: patientId });
      }
      if (!patient) {
        return res.status(404).json({
          error: { code: 'PATIENT_NOT_FOUND', message: 'Specified patient not found.' }
        });
      }
      targetPatientId = patient._id;

    } else if (role === 'hospital_admin') {
      if (!doctorId || !patientId) {
        return res.status(400).json({
          error: { code: 'MISSING_FIELDS', message: 'Both Doctor and Patient are required.' }
        });
      }
      targetDoctorId = doctorId;
      targetPatientId = patientId;
      const hospital = await Hospital.findOne({ userId: req.user._id });
      targetHospitalId = hospital?._id || null;
    }

    // Normalize type string
    let normalizedType = 'In-Person';
    if (type.toLowerCase().includes('video') || type.toLowerCase().includes('tele')) {
      normalizedType = 'Video';
    } else if (type.toLowerCase().includes('follow')) {
      normalizedType = 'Follow-up';
    }

    const appointment = await Appointment.create({
      patientId: targetPatientId,
      doctorId: targetDoctorId,
      hospitalId: targetHospitalId,
      appointmentDate: new Date(appointmentDate),
      timeSlot: timeSlot || '10:00 AM',
      type: normalizedType,
      status: role === 'doctor' ? 'Confirmed' : 'Scheduled',
      reason: reason.trim() || 'Routine Clinical Consultation',
      notes: notes.trim()
    });

    const populated = await Appointment.findById(appointment._id)
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email phone avatar' }
      })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email phone avatar' }
      })
      .populate('hospitalId', 'facilityName address');

    return res.status(201).json({
      message: 'Appointment successfully scheduled.',
      appointment: formatAppointment(populated)
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update an appointment (Accept, Reschedule, Cancel, Complete)
 * PATCH /api/appointments/:id
 */
export async function updateAppointment(req, res, next) {
  try {
    const { id } = req.params;
    const { status, appointmentDate, timeSlot, notes, type } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: { code: 'INVALID_ID', message: 'Invalid appointment ID format.' }
      });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        error: { code: 'APPOINTMENT_NOT_FOUND', message: 'Appointment not found.' }
      });
    }

    // Role-based authorization
    const { role } = req.user;
    if (role === 'patient') {
      const patient = await Patient.findOne({ userId: req.user._id });
      const aptPatId = String(appointment.patientId?._id || appointment.patientId || '');
      if (!patient || aptPatId !== String(patient._id)) {
        return res.status(403).json({
          error: { code: 'FORBIDDEN', message: 'You can only manage your own appointments.' }
        });
      }
    } else if (role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      const aptDocId = String(appointment.doctorId?._id || appointment.doctorId || '');
      if (!doctor || aptDocId !== String(doctor._id)) {
        return res.status(403).json({
          error: { code: 'FORBIDDEN', message: 'You can only manage appointments assigned to you.' }
        });
      }
    }

    // Apply updates
    if (status) {
      appointment.status = status;
      if (status === 'Waiting') {
        if (!appointment.arrivedAt) appointment.arrivedAt = new Date();
        if (!appointment.queueToken) {
          const maxTokenApt = await Appointment.findOne({ doctorId: appointment.doctorId }).sort({ queueToken: -1 });
          appointment.queueToken = (maxTokenApt?.queueToken || 0) + 1;
        }
        await Patient.findByIdAndUpdate(appointment.patientId, { status: 'Waiting' });
      } else if (status === 'In-Consultation' || status === 'In Consultation') {
        appointment.status = 'In-Consultation';
        appointment.consultationStartedAt = new Date();
        await Patient.findByIdAndUpdate(appointment.patientId, { status: 'In Consultation' });
      } else if (status === 'Completed') {
        appointment.consultationEndedAt = new Date();
        await Patient.findByIdAndUpdate(appointment.patientId, { status: 'Active' });
      }
    }
    if (appointmentDate) {
      appointment.appointmentDate = new Date(appointmentDate);
    }
    if (timeSlot) {
      appointment.timeSlot = timeSlot;
    }
    if (notes !== undefined) {
      appointment.notes = notes;
    }
    if (type) {
      appointment.type = type;
    }

    await appointment.save();

    const populated = await Appointment.findById(appointment._id)
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email phone avatar' }
      })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email phone avatar' }
      })
      .populate('hospitalId', 'facilityName address');

    return res.status(200).json({
      message: 'Appointment successfully updated.',
      appointment: formatAppointment(populated)
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get appointment by ID
 * GET /api/appointments/:id
 */
export async function getAppointmentById(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: { code: 'INVALID_ID', message: 'Invalid appointment ID.' } });
    }

    const appointment = await Appointment.findById(id)
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email phone avatar' }
      })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email phone avatar' }
      })
      .populate('hospitalId', 'facilityName address');

    if (!appointment) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Appointment not found.' } });
    }

    return res.status(200).json(formatAppointment(appointment));
  } catch (error) {
    next(error);
  }
}

/**
 * Patient Self Check-In via QR Code / Appointment ID
 * POST /api/appointments/check-in
 */
export async function checkInAppointment(req, res, next) {
  try {
    const rawCode = req.body.appointmentCode || req.body.appointmentId;
    if (!rawCode || typeof rawCode !== 'string') {
      return res.status(400).json({
        error: { code: 'INVALID_INPUT', message: 'Please provide a valid Appointment ID.' }
      });
    }

    const trimmedCode = rawCode.trim();

    let query = {};
    if (mongoose.Types.ObjectId.isValid(trimmedCode)) {
      query = { $or: [{ _id: trimmedCode }, { legacyId: trimmedCode }] };
    } else {
      query = { legacyId: { $regex: new RegExp(`^${trimmedCode}$`, 'i') } };
    }

    const appointment = await Appointment.findOne(query)
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email phone avatar' }
      })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email phone avatar' }
      })
      .populate('hospitalId', 'facilityName address');

    if (!appointment) {
      return res.status(404).json({
        error: {
          code: 'APPOINTMENT_NOT_FOUND',
          message: `No appointment found matching ID "${trimmedCode}". Please verify your appointment reference code.`
        }
      });
    }

    // Role verification (if patient, must belong to patient profile)
    const { role } = req.user;
    if (role === 'patient') {
      const patient = await Patient.findOne({ userId: req.user._id });
      const aptPatientIdStr = String(appointment.patientId?._id || appointment.patientId || '');
      if (patient && aptPatientIdStr && aptPatientIdStr !== String(patient._id)) {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'This appointment does not belong to your logged-in patient profile.'
          }
        });
      }
    }

    if (appointment.status === 'Cancelled') {
      return res.status(400).json({
        error: { code: 'APPOINTMENT_CANCELLED', message: 'This appointment was cancelled and cannot be checked in.' }
      });
    }

    // Transition to Waiting if not already In-Consultation or Completed
    if (appointment.status !== 'In-Consultation' && appointment.status !== 'Completed') {
      appointment.status = 'Waiting';
      if (!appointment.arrivedAt) appointment.arrivedAt = new Date();
      if (!appointment.queueToken) {
        const doctorIdRef = appointment.doctorId?._id || appointment.doctorId;
        const maxTokenApt = await Appointment.findOne({ doctorId: doctorIdRef }).sort({ queueToken: -1 });
        appointment.queueToken = (maxTokenApt?.queueToken || 0) + 1;
      }
      await Appointment.findByIdAndUpdate(appointment._id, {
        status: 'Waiting',
        arrivedAt: appointment.arrivedAt,
        queueToken: appointment.queueToken
      });
      const patIdToUpdate = appointment.patientId?._id || appointment.patientId;
      if (patIdToUpdate) {
        await Patient.findByIdAndUpdate(patIdToUpdate, { status: 'Waiting' });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Successfully checked in to outpatient queue.',
      appointment: formatAppointment(appointment)
    });
  } catch (error) {
    console.error('[checkInAppointment Error]:', error);
    return res.status(500).json({
      error: {
        code: 'CHECK_IN_ERROR',
        message: error.message || 'Failed to process appointment check-in.'
      }
    });
  }
}

/**
 * Get live waiting room queue tracking data for a specific appointment
 * GET /api/appointments/:id/live-queue
 */
export async function getLiveQueueForAppointment(req, res, next) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: { code: 'INVALID_ID', message: 'Appointment ID is required.' } });
    }

    let query = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { $or: [{ _id: id }, { legacyId: id }] };
    } else {
      query = { legacyId: { $regex: new RegExp(`^${id}$`, 'i') } };
    }

    const appointment = await Appointment.findOne(query)
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email phone avatar' }
      })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email phone avatar' }
      })
      .populate('hospitalId', 'facilityName address');

    if (!appointment) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: `Appointment "${id}" not found.` }
      });
    }

    const currentAptIdStr = String(appointment._id);
    const doctorId = appointment.doctorId?._id || appointment.doctorId;

    let doctorApts = [];
    if (doctorId) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      doctorApts = await Appointment.find({
        doctorId,
        $or: [
          { status: { $in: ['Waiting', 'In-Consultation'] } },
          { appointmentDate: { $gte: startOfDay, $lte: endOfDay }, status: { $in: ['Scheduled', 'Confirmed', 'Completed'] } }
        ]
      })
        .populate({
          path: 'patientId',
          populate: { path: 'userId', select: 'name email phone avatar' }
        })
        .sort({ queueToken: 1, arrivedAt: 1, createdAt: 1 });
    }

    const inCabin = doctorApts.find(a => a.status === 'In-Consultation');
    const waitingList = doctorApts.filter(a => a.status === 'Waiting');

    let positionAhead = 0;
    if (appointment.status === 'Waiting') {
      const myToken = appointment.queueToken || 999;
      if (inCabin && String(inCabin._id) !== currentAptIdStr) {
        positionAhead++;
      }
      const aheadInWaiting = waitingList.filter(a =>
        String(a._id) !== currentAptIdStr && (a.queueToken || 0) < myToken
      );
      positionAhead += aheadInWaiting.length;
    }

    const estimatedWaitMinutes = appointment.status === 'In-Consultation'
      ? 0
      : (positionAhead > 0 ? positionAhead * 15 : (appointment.status === 'Waiting' ? 5 : 20));

    const queueBoard = doctorApts
      .filter(a => a.status === 'In-Consultation' || a.status === 'Waiting')
      .map(a => {
        const isYou = String(a._id) === currentAptIdStr;
        const patientDoc = a.patientId || {};
        const rawName = (typeof patientDoc.userId?.name === 'string' && patientDoc.userId.name.trim())
          ? patientDoc.userId.name
          : (typeof patientDoc.name === 'string' && patientDoc.name.trim() ? patientDoc.name : 'Patient');

        const parts = rawName.trim().split(/\s+/).filter(Boolean);
        const anonymizedName = isYou
          ? `${rawName} (You)`
          : (parts.length > 1 && parts[1] ? `${parts[0]} ${parts[1][0]}.` : rawName);

        return {
          id: a._id,
          tokenNumber: a.queueToken || '—',
          status: a.status,
          displayName: anonymizedName,
          isYou,
          timeSlot: a.timeSlot || '10:00 AM',
          arrivedAt: a.arrivedAt || null
        };
      });

    const docUser = appointment.doctorId?.userId || {};
    const rawDocName = (typeof docUser.name === 'string' && docUser.name.trim())
      ? docUser.name
      : (typeof appointment.doctorId?.name === 'string' && appointment.doctorId.name.trim()
        ? appointment.doctorId.name
        : 'Attending Physician');
    const cleanDocName = rawDocName.startsWith('Dr.') ? rawDocName : `Dr. ${rawDocName}`;

    return res.status(200).json({
      appointment: formatAppointment(appointment),
      doctorName: cleanDocName,
      doctorSpecialty: appointment.doctorId?.specialty || 'General Medicine',
      doctorDepartment: appointment.doctorId?.department || 'Outpatient Clinic',
      hospitalName: appointment.hospitalId?.facilityName || 'Med-X Metro Super Specialty Teaching Hospital',
      inCabinPatient: inCabin ? {
        tokenNumber: inCabin.queueToken || 1,
        isYou: String(inCabin._id) === currentAptIdStr
      } : null,
      yourToken: appointment.queueToken || null,
      yourStatus: appointment.status,
      patientsAhead: positionAhead,
      estimatedWaitMinutes,
      estimatedWaitTimeText: appointment.status === 'In-Consultation'
        ? 'Inside Cabin Now'
        : (positionAhead === 0 ? 'Next Up (Ready to enter)' : `~${estimatedWaitMinutes} mins (${positionAhead} ahead)`),
      queueBoard
    });
  } catch (error) {
    console.error('[getLiveQueueForAppointment Error]:', error);
    return res.status(500).json({
      error: {
        code: 'LIVE_QUEUE_ERROR',
        message: error.message || 'Failed to retrieve live queue data.'
      }
    });
  }
}

export default {
  getAppointments,
  getAvailableDoctors,
  createAppointment,
  updateAppointment,
  getAppointmentById,
  checkInAppointment,
  getLiveQueueForAppointment
};
