import mongoose from 'mongoose';
import { EmergencyAlert } from '../models/EmergencyAlert.js';
import { Patient } from '../models/Patient.js';
import { Doctor } from '../models/Doctor.js';
import { Hospital } from '../models/Hospital.js';
import { User } from '../models/User.js';

/**
 * Trigger / Create Emergency SOS Alert
 * Patient-only endpoint
 * POST /api/emergency/trigger OR POST /api/emergency
 */
export const createEmergencyAlert = async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Only registered patients can trigger Emergency SOS alerts.'
        }
      });
    }

    const {
      reason,
      triggerReason,
      alertType,
      vitalsAtAlert,
      vitalSeverity,
      location,
      latitude,
      longitude,
      address,
      patientId: requestedPatientId,
      hospitalId: requestedHospitalId,
      doctorId: requestedDoctorId
    } = req.body;

    // IDOR Protection: Patient cannot create alert for another user
    if (requestedPatientId && requestedPatientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: {
          code: 'IDOR_VIOLATION',
          message: 'Access denied: You cannot create an emergency alert on behalf of another patient.'
        }
      });
    }

    // Retrieve Patient profile
    const patientProfile = await Patient.findOne({ userId: req.user._id });

    // Validate coordinates if provided
    let locObj = {
      latitude: null,
      longitude: null,
      address: '',
      coordinatesText: ''
    };

    const lat = latitude !== undefined ? Number(latitude) : (location?.latitude !== undefined ? Number(location.latitude) : null);
    const lng = longitude !== undefined ? Number(longitude) : (location?.longitude !== undefined ? Number(location.longitude) : null);

    if (lat !== null && !isNaN(lat)) {
      if (lat < -90 || lat > 90) {
        return res.status(400).json({
          error: {
            code: 'INVALID_COORDINATES',
            message: 'Latitude must be a valid number between -90 and 90 degrees.'
          }
        });
      }
      locObj.latitude = lat;
    }

    if (lng !== null && !isNaN(lng)) {
      if (lng < -180 || lng > 180) {
        return res.status(400).json({
          error: {
            code: 'INVALID_COORDINATES',
            message: 'Longitude must be a valid number between -180 and 180 degrees.'
          }
        });
      }
      locObj.longitude = lng;
    }

    if (locObj.latitude !== null && locObj.longitude !== null) {
      locObj.coordinatesText = `${locObj.latitude.toFixed(4)}° N, ${locObj.longitude.toFixed(4)}° E`;
    }

    locObj.address = address || location?.address || (patientProfile?.address ? `${patientProfile.address.city || ''}, ${patientProfile.address.state || ''}` : '') || 'Location detected via device GPS';

    // Resolve hospital and doctor
    let targetHospitalId = requestedHospitalId || patientProfile?.hospitalId || req.user.hospitalId || null;
    let targetDoctorId = requestedDoctorId || patientProfile?.assignedDoctorId || null;

    if (!targetHospitalId) {
      const defaultHospital = await Hospital.findOne();
      if (defaultHospital) targetHospitalId = defaultHospital._id;
    }

    const alert = new EmergencyAlert({
      patientId: req.user._id,
      patientProfileId: patientProfile?._id || null,
      patientName: req.user.name,
      age: patientProfile?.age || null,
      gender: patientProfile?.gender || '',
      bloodGroup: patientProfile?.bloodGroup || '',
      phone: patientProfile?.contactPhone || patientProfile?.phone || '',
      doctorId: targetDoctorId,
      hospitalId: targetHospitalId,
      status: 'ACTIVE',
      alertType: alertType || 'Emergency SOS Distress Signal',
      triggerReason: reason || triggerReason || 'Acute Distress - Immediate Medical Attention Requested',
      vitalsAtAlert: vitalsAtAlert || 'Telemetry Alert at SOS',
      vitalSeverity: vitalSeverity || 'Critical High Risk',
      location: locObj
    });

    await alert.save();

    res.status(201).json({
      message: 'Emergency SOS broadcasted successfully',
      alert,
      sos: alert
    });
  } catch (error) {
    console.error('[EMERGENCY] Error creating emergency alert:', error);
    res.status(500).json({
      error: {
        code: 'EMERGENCY_CREATION_FAILED',
        message: 'Failed to broadcast Emergency SOS alert.',
        details: error.message
      }
    });
  }
};

/**
 * List Emergency Alerts
 * Role-scoped query
 * GET /api/emergency
 */
export const getEmergencyAlerts = async (req, res) => {
  try {
    const { role, _id: userId } = req.user;

    // Laboratory staff have no emergency operational privileges
    if (role === 'lab_admin') {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Laboratory staff are not authorized to view Emergency / SOS operational desks.'
        }
      });
    }

    let query = {};

    if (role === 'patient') {
      // Patient sees only own alerts
      query.patientId = userId;
    } else if (role === 'doctor') {
      // Doctor sees alerts assigned to them, or alerts affiliated with doctor's hospital, or unassigned active alerts
      const doctorProfile = await Doctor.findOne({ userId });
      const doctorId = doctorProfile?._id;
      const hospitalId = doctorProfile?.hospitalId || req.user.hospitalId;

      const orConditions = [];
      if (doctorId) orConditions.push({ doctorId });
      if (hospitalId) orConditions.push({ hospitalId });
      // Also unassigned active alerts in system
      orConditions.push({ doctorId: null, status: { $in: ['ACTIVE', 'IN_PROGRESS'] } });

      query.$or = orConditions;
    } else if (role === 'hospital_admin') {
      // Hospital Admin sees only alerts affiliated with their facility
      let hospitalId = req.user.hospitalId;
      if (!hospitalId) {
        const hospital = await Hospital.findOne({ userId });
        if (hospital) hospitalId = hospital._id;
      }

      if (!hospitalId) {
        return res.status(200).json([]);
      }

      query.hospitalId = hospitalId;
    }

    const alerts = await EmergencyAlert.find(query)
      .populate('patientId', 'name email phone')
      .populate('hospitalId', 'facilityName emergencyContact')
      .populate('doctorId', 'specialty qualification')
      .sort({ createdAt: -1 });

    res.status(200).json(alerts);
  } catch (error) {
    console.error('[EMERGENCY] Error retrieving emergency alerts:', error);
    res.status(500).json({
      error: {
        code: 'EMERGENCY_FETCH_FAILED',
        message: 'Error retrieving emergency alerts.',
        details: error.message
      }
    });
  }
};

/**
 * Get Emergency Alert By ID
 * GET /api/emergency/:id
 */
export const getEmergencyAlertById = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, _id: userId } = req.user;

    if (role === 'lab_admin') {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Laboratory staff are not authorized to view Emergency / SOS operational desks.'
        }
      });
    }

    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ _id: id }, { alertId: id }] }
      : { alertId: id };

    const alert = await EmergencyAlert.findOne(query)
      .populate('patientId', 'name email phone')
      .populate('hospitalId', 'facilityName emergencyContact')
      .populate('doctorId', 'specialty qualification');

    if (!alert) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Emergency alert not found.'
        }
      });
    }

    // Role-based IDOR checks
    if (role === 'patient' && alert.patientId?._id?.toString() !== userId.toString() && alert.patientId?.toString() !== userId.toString()) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied: You are not authorized to view another patient’s emergency alert.'
        }
      });
    }

    if (role === 'hospital_admin') {
      let hospitalId = req.user.hospitalId;
      if (!hospitalId) {
        const hospital = await Hospital.findOne({ userId });
        if (hospital) hospitalId = hospital._id;
      }
      if (hospitalId && alert.hospitalId && alert.hospitalId._id?.toString() !== hospitalId.toString() && alert.hospitalId.toString() !== hospitalId.toString()) {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied: You are not authorized to view an emergency alert for another facility.'
          }
        });
      }
    }

    res.status(200).json(alert);
  } catch (error) {
    console.error('[EMERGENCY] Error fetching alert by ID:', error);
    res.status(500).json({
      error: {
        code: 'EMERGENCY_FETCH_FAILED',
        message: 'Error fetching emergency alert.',
        details: error.message
      }
    });
  }
};

/**
 * Acknowledge Emergency Alert
 * POST /api/emergency/:id/ack OR PUT /api/emergency/:id/acknowledge OR DELETE /api/emergency/:id
 * Doctors & Hospital Admins
 */
export const acknowledgeEmergencyAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, _id: userId } = req.user;

    if (role === 'lab_admin' || role === 'patient') {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Only clinical doctors and hospital administrators can acknowledge emergency alerts.'
        }
      });
    }

    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ _id: id }, { alertId: id }] }
      : { alertId: id };

    const alert = await EmergencyAlert.findOne(query);
    if (!alert) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Emergency alert not found.'
        }
      });
    }

    // Hospital Admin isolation
    if (role === 'hospital_admin') {
      let hospitalId = req.user.hospitalId;
      if (!hospitalId) {
        const hospital = await Hospital.findOne({ userId });
        if (hospital) hospitalId = hospital._id;
      }
      if (hospitalId && alert.hospitalId && alert.hospitalId.toString() !== hospitalId.toString()) {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied: Cannot acknowledge alert belonging to another facility.'
          }
        });
      }
    }

    // State machine check: Cannot acknowledge an already resolved alert
    if (alert.status === 'RESOLVED') {
      return res.status(400).json({
        error: {
          code: 'INVALID_STATE_TRANSITION',
          message: 'Cannot acknowledge an alert that has already been resolved.'
        }
      });
    }

    alert.status = 'IN_PROGRESS';
    alert.acknowledgedAt = new Date();
    alert.acknowledgedBy = userId;

    if (req.body?.dispatchNotes || req.body?.notes) {
      alert.dispatch.dispatchNotes = req.body.dispatchNotes || req.body.notes;
    }
    if (req.body?.statusText) {
      alert.dispatch.statusText = req.body.statusText;
    }

    await alert.save();

    res.status(200).json({
      message: 'Emergency alert acknowledged successfully',
      alert,
      id: alert.alertId
    });
  } catch (error) {
    console.error('[EMERGENCY] Error acknowledging alert:', error);
    res.status(500).json({
      error: {
        code: 'EMERGENCY_ACK_FAILED',
        message: 'Error acknowledging emergency alert.',
        details: error.message
      }
    });
  }
};

/**
 * Dispatch Emergency Alert
 * PATCH /api/emergency/:id/dispatch
 * Doctors & Hospital Admins
 */
export const dispatchEmergencyAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, _id: userId } = req.user;

    if (role === 'lab_admin' || role === 'patient') {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Only clinical doctors and hospital administrators can dispatch emergency response.'
        }
      });
    }

    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ _id: id }, { alertId: id }] }
      : { alertId: id };

    const alert = await EmergencyAlert.findOne(query);
    if (!alert) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Emergency alert not found.'
        }
      });
    }

    if (alert.status === 'RESOLVED') {
      return res.status(400).json({
        error: {
          code: 'INVALID_STATE_TRANSITION',
          message: 'Cannot dispatch response for an already resolved emergency alert.'
        }
      });
    }

    const { statusText, dispatchNotes } = req.body;

    alert.status = 'IN_PROGRESS';
    alert.dispatch.dispatchedAt = new Date();
    alert.dispatch.dispatchedBy = userId;
    alert.dispatch.statusText = statusText || 'Rapid Response Squad Dispatched';
    if (dispatchNotes) alert.dispatch.dispatchNotes = dispatchNotes;

    await alert.save();

    res.status(200).json({
      message: 'Emergency response dispatched successfully',
      alert
    });
  } catch (error) {
    console.error('[EMERGENCY] Error dispatching alert:', error);
    res.status(500).json({
      error: {
        code: 'EMERGENCY_DISPATCH_FAILED',
        message: 'Error dispatching emergency response.',
        details: error.message
      }
    });
  }
};

/**
 * Resolve Emergency Alert
 * POST /api/emergency/:id/resolve
 * Doctor, Hospital Admin, or Patient (cancelling/resolving own alert)
 */
export const resolveEmergencyAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, _id: userId } = req.user;

    if (role === 'lab_admin') {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Laboratory staff are not authorized to resolve Emergency alerts.'
        }
      });
    }

    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ _id: id }, { alertId: id }] }
      : { alertId: id };

    const alert = await EmergencyAlert.findOne(query);
    if (!alert) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Emergency alert not found.'
        }
      });
    }

    // Ownership and isolation check
    if (role === 'patient' && alert.patientId.toString() !== userId.toString()) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied: You cannot resolve another patient’s emergency alert.'
        }
      });
    }

    if (role === 'hospital_admin') {
      let hospitalId = req.user.hospitalId;
      if (!hospitalId) {
        const hospital = await Hospital.findOne({ userId });
        if (hospital) hospitalId = hospital._id;
      }
      if (hospitalId && alert.hospitalId && alert.hospitalId.toString() !== hospitalId.toString()) {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied: Cannot resolve alert belonging to another facility.'
          }
        });
      }
    }

    // State machine check: Cannot re-resolve an already resolved alert
    if (alert.status === 'RESOLVED') {
      return res.status(400).json({
        error: {
          code: 'ALREADY_RESOLVED',
          message: 'Emergency alert is already resolved.'
        }
      });
    }

    const { resolutionNotes } = req.body;

    alert.status = 'RESOLVED';
    alert.resolvedAt = new Date();
    alert.resolvedBy = userId;
    alert.resolutionNotes = resolutionNotes || (role === 'patient' ? 'Cancelled by patient.' : 'Triage completed and clinical action documented.');

    await alert.save();

    res.status(200).json({
      message: 'Emergency alert marked as resolved',
      alert
    });
  } catch (error) {
    console.error('[EMERGENCY] Error resolving alert:', error);
    res.status(500).json({
      error: {
        code: 'EMERGENCY_RESOLVE_FAILED',
        message: 'Error resolving emergency alert.',
        details: error.message
      }
    });
  }
};

/**
 * Get Active Emergency Count
 * GET /api/emergency/stats/active-count
 */
export const getActiveSOSCount = async (req, res) => {
  try {
    const { role, _id: userId } = req.user;

    if (role === 'lab_admin') {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Laboratory staff are not authorized to view Emergency metrics.'
        }
      });
    }

    let query = { status: { $in: ['ACTIVE', 'IN_PROGRESS'] } };

    if (role === 'patient') {
      query.patientId = userId;
    } else if (role === 'hospital_admin') {
      let hospitalId = req.user.hospitalId;
      if (!hospitalId) {
        const hospital = await Hospital.findOne({ userId });
        if (hospital) hospitalId = hospital._id;
      }
      if (hospitalId) query.hospitalId = hospitalId;
    }

    const count = await EmergencyAlert.countDocuments(query);
    res.status(200).json({ activeCount: count });
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'COUNT_FAILED',
        message: 'Failed to retrieve active emergency count.',
        details: error.message
      }
    });
  }
};
