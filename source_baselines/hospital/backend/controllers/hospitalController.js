import { Hospital } from '../models/Hospital.js';
import { Patient } from '../models/Patient.js';
import { Doctor } from '../models/Doctor.js';
import { Department } from '../models/Department.js';
import { Lab } from '../models/Lab.js';
import { MedicalReport } from '../models/MedicalReport.js';
import { HealthAlert } from '../models/HealthAlert.js';
import { DoctorAssignment } from '../models/DoctorAssignment.js';
import { Appointment } from '../models/Appointment.js';
import { CareTask } from '../models/CareTask.js';
import { Notification } from '../models/Notification.js';

// ==========================================
// 1. DASHBOARD
// ==========================================
export const getDashboard = async (req, res) => {
  try {
    const hospital = await Hospital.findOne();
    const hospitalId = hospital ? hospital._id : null;

    // Counts
    const totalPatientsCount = await Patient.countDocuments();
    const doctorsCount = await Doctor.countDocuments();
    const todayAppointmentsCount = await Appointment.countDocuments({ status: { $in: ['Today', 'Upcoming'] } });
    const pendingReportsCount = await MedicalReport.countDocuments({
      reviewStatus: { $in: ['Pending Review', 'Requires Review'] },
    });
    const criticalAlertsCount = await HealthAlert.countDocuments({
      severity: { $in: ['Critical', 'High'] },
      status: { $ne: 'Resolved' },
    });

    // Time series for Patient Activity chart based on query param
    const timeframe = req.query.timeframe || '7days';
    let activityData = [];
    if (timeframe === 'today') {
      activityData = [
        { time: '08:00', patients: 12, outpatient: 8, emergency: 4 },
        { time: '10:00', patients: 28, outpatient: 22, emergency: 6 },
        { time: '12:00', patients: 45, outpatient: 35, emergency: 10 },
        { time: '14:00', patients: 38, outpatient: 30, emergency: 8 },
        { time: '16:00', patients: 52, outpatient: 41, emergency: 11 },
        { time: '18:00', patients: 34, outpatient: 26, emergency: 8 },
        { time: '20:00', patients: 19, outpatient: 12, emergency: 7 },
      ];
    } else if (timeframe === '30days') {
      activityData = [
        { date: 'Week 1', patients: 280, outpatient: 210, emergency: 70 },
        { date: 'Week 2', patients: 340, outpatient: 260, emergency: 80 },
        { date: 'Week 3', patients: 310, outpatient: 235, emergency: 75 },
        { date: 'Week 4', patients: 395, outpatient: 305, emergency: 90 },
      ];
    } else if (timeframe === '3months') {
      activityData = [
        { month: 'Jun', patients: 1150, outpatient: 890, emergency: 260 },
        { month: 'Jul', patients: 1280, outpatient: 980, emergency: 300 },
        { month: 'Aug', patients: 1420, outpatient: 1090, emergency: 330 },
      ];
    } else {
      // 7 days default
      activityData = [
        { day: 'Mon', patients: 54, outpatient: 42, emergency: 12 },
        { day: 'Tue', patients: 68, outpatient: 51, emergency: 17 },
        { day: 'Wed', patients: 72, outpatient: 58, emergency: 14 },
        { day: 'Thu', patients: 61, outpatient: 46, emergency: 15 },
        { day: 'Fri', patients: 84, outpatient: 66, emergency: 18 },
        { day: 'Sat', patients: 59, outpatient: 45, emergency: 14 },
        { day: 'Sun', patients: 38, outpatient: 25, emergency: 13 },
      ];
    }

    // Health Report Overview distribution
    const normalReports = await MedicalReport.countDocuments({ reviewStatus: 'Reviewed' });
    const abnormalReports = await MedicalReport.countDocuments({
      reviewStatus: 'Requires Review',
    });
    const criticalReports = await HealthAlert.countDocuments({ severity: 'Critical', status: { $ne: 'Resolved' } });
    const pendingReviewReports = await MedicalReport.countDocuments({ reviewStatus: 'Pending Review' });

    const reportOverview = [
      { name: 'Normal', value: normalReports || 42, color: '#52c41a' },
      { name: 'Abnormal', value: abnormalReports || 18, color: '#fa8c16' },
      { name: 'Critical', value: criticalReports || 7, color: '#f5222d' },
      { name: 'Pending Review', value: pendingReviewReports || 24, color: '#1890ff' },
    ];

    // Prominent Critical Health Alerts
    const criticalAlerts = await HealthAlert.find({ status: { $ne: 'Resolved' } })
      .populate('patientId', 'name patientId age gender bloodGroup')
      .populate('assignedDoctorId', 'name specialization')
      .sort({ severity: 1, createdAt: -1 })
      .limit(6);

    // Recent Lab Reports
    const recentReports = await MedicalReport.find()
      .populate('patientId', 'name patientId')
      .populate('reviewedByDoctorId', 'name specialization')
      .sort({ createdAt: -1 })
      .limit(6);

    // Doctor Workload
    const doctors = await Doctor.find()
      .populate('departmentId', 'name')
      .sort({ todayPatientsCount: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      stats: {
        totalPatients: 1248, // Display standard hospital scale / formatted metric
        totalPatientsLive: totalPatientsCount,
        patientsMonthTrend: '+8.4% this month',
        doctors: doctorsCount || 32,
        todayAppointments: todayAppointmentsCount || 86,
        pendingReports: pendingReportsCount || 147,
        criticalAlerts: criticalAlertsCount || 12,
      },
      activityChart: activityData,
      reportOverview,
      criticalAlerts,
      recentReports,
      doctorsWorkload: doctors,
      hospital,
    });
  } catch (error) {
    console.error('Error in getDashboard:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 2. PATIENTS
// ==========================================
export const getPatients = async (req, res) => {
  try {
    const {
      search,
      patientId,
      departmentId,
      doctorId,
      alertStatus,
      reportStatus,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { patientId: { $regex: search, $options: 'i' } },
        { contact: { $regex: search, $options: 'i' } },
      ];
    }

    if (patientId) {
      query.patientId = { $regex: patientId, $options: 'i' };
    }

    if (departmentId && departmentId !== 'all') {
      query.departmentId = departmentId;
    }

    if (doctorId && doctorId !== 'all') {
      query.assignedDoctorId = doctorId;
    }

    if (alertStatus && alertStatus !== 'all') {
      query.alertStatus = alertStatus;
    }

    if (reportStatus && reportStatus !== 'all') {
      query.reportStatus = reportStatus;
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj = { [sortBy]: sortOrder };

    const total = await Patient.countDocuments(query);
    const patients = await Patient.find(query)
      .populate('assignedDoctorId', 'name specialization availabilityStatus avatar')
      .populate('departmentId', 'name code')
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      patients,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    let patient = await Patient.findById(id)
      .populate('assignedDoctorId', 'name specialization email phone roomNumber avatar availabilityStatus')
      .populate('departmentId', 'name code headDoctorName floor');

    if (!patient) {
      // Try searching by patientId string (e.g. PT-1001)
      patient = await Patient.findOne({ patientId: id })
        .populate('assignedDoctorId', 'name specialization email phone roomNumber avatar availabilityStatus')
        .populate('departmentId', 'name code headDoctorName floor');
    }

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    // Associated records
    const reports = await MedicalReport.find({ patientId: patient._id })
      .populate('labId', 'name code')
      .populate('reviewedByDoctorId', 'name specialization')
      .sort({ createdAt: -1 });

    const alerts = await HealthAlert.find({ patientId: patient._id })
      .populate('assignedDoctorId', 'name specialization')
      .sort({ createdAt: -1 });

    const appointments = await Appointment.find({ patientId: patient._id })
      .populate('doctorId', 'name specialization')
      .populate('departmentId', 'name')
      .sort({ date: -1 });

    const careTasks = await CareTask.find({ patientId: patient._id })
      .populate('assignedDoctorId', 'name specialization')
      .sort({ createdAt: -1 });

    // Historical health trend points
    const healthTrends = [
      { date: '2026-05-15', fastingGlucose: 108, postPrandial: 145, systolicBP: 124, diastolicBP: 82, hemoglobin: 13.5 },
      { date: '2026-06-20', fastingGlucose: 122, postPrandial: 165, systolicBP: 130, diastolicBP: 85, hemoglobin: 13.1 },
      { date: '2026-07-18', fastingGlucose: 148, postPrandial: 195, systolicBP: 136, diastolicBP: 88, hemoglobin: 12.8 },
      { date: '2026-08-10', fastingGlucose: 210, postPrandial: 280, systolicBP: 142, diastolicBP: 92, hemoglobin: 11.2 },
    ];

    // Care Timeline
    const careTimeline = [
      {
        title: 'Laboratory Report Uploaded',
        description: 'Complete Blood Count & Comprehensive Metabolic Panel submitted by Med-X Central Lab.',
        time: 'Today, 08:30 AM',
        status: 'completed',
        category: 'Report Uploaded',
      },
      {
        title: 'AI Analysis Completed',
        description: 'Parameters extracted. Abnormal values flagged for clinical decision support.',
        time: 'Today, 08:32 AM',
        status: 'completed',
        category: 'AI Analysis Completed',
      },
      {
        title: 'Critical Health Alert Generated',
        description: 'Elevated parameter requiring timely clinical review flagged to hospital queue.',
        time: 'Today, 08:35 AM',
        status: 'completed',
        category: 'Alert Generated',
      },
      {
        title: 'Doctor Assigned',
        description: patient.assignedDoctorId
          ? `Patient case routed to ${patient.assignedDoctorId.name} (${patient.assignedDoctorId.specialization}).`
          : 'Pending doctor allocation by hospital admin.',
        time: 'Today, 09:15 AM',
        status: patient.assignedDoctorId ? 'completed' : 'in-progress',
        category: 'Doctor Assigned',
      },
      {
        title: 'Doctor Clinical Review',
        description: 'Attending physician evaluation and diagnostic reconciliation.',
        time: 'Scheduled / In Progress',
        status: reports.some((r) => r.reviewStatus === 'Reviewed') ? 'completed' : 'pending',
        category: 'Doctor Reviewed',
      },
      {
        title: 'Follow-up Consultation',
        description: 'Treatment response check and scheduled follow-up consultation.',
        time: 'Upcoming within 7 days',
        status: 'pending',
        category: 'Follow-up Scheduled',
      },
    ];

    return res.status(200).json({
      success: true,
      patient,
      reports,
      alerts,
      appointments,
      careTasks,
      healthTrends,
      careTimeline,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 3. LAB REPORTS
// ==========================================
export const getReports = async (req, res) => {
  try {
    const { search, labId, reportType, reviewStatus, extractionStatus, page = 1, limit = 10 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { reportId: { $regex: search, $options: 'i' } },
        { reportName: { $regex: search, $options: 'i' } },
      ];
    }

    if (labId && labId !== 'all') {
      query.labId = labId;
    }

    if (reportType && reportType !== 'all') {
      query.reportType = reportType;
    }

    if (reviewStatus && reviewStatus !== 'all') {
      query.reviewStatus = reviewStatus;
    }

    if (extractionStatus && extractionStatus !== 'all') {
      query.extractionStatus = extractionStatus;
    }

    const total = await MedicalReport.countDocuments(query);
    const reports = await MedicalReport.find(query)
      .populate('patientId', 'name patientId age gender bloodGroup')
      .populate('labId', 'name code')
      .populate('reviewedByDoctorId', 'name specialization')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      reports,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    let report = await MedicalReport.findById(id)
      .populate('patientId', 'name patientId age gender bloodGroup contact conditions allergies')
      .populate('labId', 'name code contact accreditation')
      .populate('reviewedByDoctorId', 'name specialization email avatar');

    if (!report) {
      report = await MedicalReport.findOne({ reportId: id })
        .populate('patientId', 'name patientId age gender bloodGroup contact conditions allergies')
        .populate('labId', 'name code contact accreditation')
        .populate('reviewedByDoctorId', 'name specialization email avatar');
    }

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    return res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const reviewReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewNotes, doctorId, reviewStatus = 'Reviewed' } = req.body;

    const report = await MedicalReport.findById(id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    report.reviewStatus = reviewStatus;
    report.reviewNotes = reviewNotes || report.reviewNotes;
    if (doctorId) {
      report.reviewedByDoctorId = doctorId;
    }
    report.reviewedAt = new Date();
    await report.save();

    // Update patient reportStatus
    await Patient.findByIdAndUpdate(report.patientId, { reportStatus: 'Reviewed' });

    return res.status(200).json({
      success: true,
      message: 'Report review status updated successfully.',
      report,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 4. CRITICAL HEALTH ALERTS
// ==========================================
export const getAlerts = async (req, res) => {
  try {
    const { severity, status } = req.query;
    const query = {};

    if (severity && severity !== 'all') {
      query.severity = severity;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const alerts = await HealthAlert.find(query)
      .populate('patientId', 'name patientId age gender bloodGroup contact')
      .populate('reportId', 'reportId reportName reportType uploadedAt')
      .populate('assignedDoctorId', 'name specialization avatar availabilityStatus')
      .sort({ createdAt: -1 });

    const counts = {
      all: await HealthAlert.countDocuments(),
      critical: await HealthAlert.countDocuments({ severity: 'Critical', status: { $ne: 'Resolved' } }),
      high: await HealthAlert.countDocuments({ severity: 'High', status: { $ne: 'Resolved' } }),
      medium: await HealthAlert.countDocuments({ severity: 'Medium', status: { $ne: 'Resolved' } }),
      resolved: await HealthAlert.countDocuments({ status: 'Resolved' }),
    };

    return res.status(200).json({
      success: true,
      alerts,
      counts,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, hospitalNote, assignedDoctorId, resolvedBy } = req.body;

    const alert = await HealthAlert.findById(id);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found.' });
    }

    if (status) alert.status = status;
    if (hospitalNote) alert.hospitalNote = hospitalNote;
    if (assignedDoctorId) alert.assignedDoctorId = assignedDoctorId;
    if (status === 'Resolved') {
      alert.resolvedAt = new Date();
      alert.resolvedBy = resolvedBy || req.user?.name || 'Hospital Admin';
    }

    await alert.save();

    return res.status(200).json({
      success: true,
      message: 'Alert updated successfully.',
      alert,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 5. DOCTORS & DOCTOR ASSIGNMENT
// ==========================================
export const getDoctors = async (req, res) => {
  try {
    const { departmentId, availability } = req.query;
    const query = {};

    if (departmentId && departmentId !== 'all') {
      query.departmentId = departmentId;
    }

    if (availability && availability !== 'all') {
      query.availabilityStatus = availability;
    }

    const doctors = await Doctor.find(query)
      .populate('departmentId', 'name code headDoctorName')
      .sort({ availabilityStatus: 1, name: 1 });

    return res.status(200).json({
      success: true,
      doctors,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const assignDoctor = async (req, res) => {
  try {
    const { patientId, doctorId, departmentId, alertId, reportId, priority = 'High', hospitalNote } = req.body;

    if (!patientId || !doctorId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both patientId and doctorId.',
      });
    }

    const doctor = await Doctor.findById(doctorId);
    const patient = await Patient.findById(patientId);

    if (!doctor || !patient) {
      return res.status(404).json({
        success: false,
        message: 'Doctor or Patient record not found.',
      });
    }

    const hospital = await Hospital.findOne();

    // 1. Create Assignment record
    const assignment = new DoctorAssignment({
      patientId,
      doctorId,
      departmentId: departmentId || doctor.departmentId,
      hospitalId: hospital ? hospital._id : null,
      alertId,
      reportId,
      priority,
      hospitalNote,
      status: 'Pending',
      assignedBy: req.user ? req.user.name : 'Hospital Admin',
    });
    await assignment.save();

    // 2. Update Patient record
    patient.assignedDoctorId = doctorId;
    if (departmentId) patient.departmentId = departmentId;
    await patient.save();

    // 3. Update Doctor workload counter
    doctor.todayPatientsCount = (doctor.todayPatientsCount || 0) + 1;
    doctor.pendingReviewsCount = (doctor.pendingReviewsCount || 0) + 1;
    await doctor.save();

    // 4. Update Alert if referenced
    if (alertId) {
      await HealthAlert.findByIdAndUpdate(alertId, {
        status: 'Assigned',
        assignedDoctorId: doctorId,
        hospitalNote: hospitalNote || 'Doctor assigned by Hospital Admin.',
      });
    }

    // 5. Create Notification
    await Notification.create({
      hospitalId: hospital ? hospital._id : null,
      title: 'Doctor Assigned',
      message: `Patient ${patient.name} (${patient.patientId}) has been assigned to ${doctor.name}.`,
      type: 'assignment',
      severity: priority === 'Urgent' ? 'high' : 'info',
      link: `/hospital/patients/${patient._id}`,
    });

    // 6. Update or Create CareTask
    await CareTask.create({
      hospitalId: hospital ? hospital._id : null,
      patientId: patient._id,
      category: 'Doctor Assignment Pending',
      title: `Consultation & Review for ${patient.name}`,
      reason: hospitalNote || 'Doctor assigned for clinical review.',
      priority,
      assignedDoctorId: doctor._id,
      status: 'In Progress',
      time: 'Just now',
    });

    return res.status(201).json({
      success: true,
      message: `Successfully assigned ${patient.name} to ${doctor.name}.`,
      assignment,
      doctor,
      patient,
    });
  } catch (error) {
    console.error('Error assigning doctor:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 6. CARE QUEUE
// ==========================================
export const getCareQueue = async (req, res) => {
  try {
    const tasks = await CareTask.find()
      .populate('patientId', 'name patientId age gender bloodGroup contact alertStatus')
      .populate('assignedDoctorId', 'name specialization avatar availabilityStatus')
      .populate('relatedReportId', 'reportId reportName reportType')
      .populate('relatedAlertId', 'parameter value severity')
      .sort({ priority: 1, createdAt: -1 });

    const categories = [
      'New Patients',
      'Reports Pending Review',
      'Critical Alerts',
      'Doctor Assignment Pending',
      'Follow-up Required',
      'Completed',
    ];

    const grouped = {};
    categories.forEach((cat) => {
      grouped[cat] = tasks.filter((t) => t.category === cat);
    });

    return res.status(200).json({
      success: true,
      tasks,
      grouped,
      totalCount: tasks.length,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCareTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, status, actionTaken, assignedDoctorId } = req.body;

    const task = await CareTask.findById(id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Care task not found.' });
    }

    if (category) task.category = category;
    if (status) task.status = status;
    if (actionTaken) task.actionTaken = actionTaken;
    if (assignedDoctorId) task.assignedDoctorId = assignedDoctorId;

    await task.save();

    return res.status(200).json({
      success: true,
      message: 'Care task updated successfully.',
      task,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 7. APPOINTMENTS
// ==========================================
export const getAppointments = async (req, res) => {
  try {
    const { doctorId, departmentId, date, status, page = 1, limit = 10 } = req.query;
    const query = {};

    if (doctorId && doctorId !== 'all') {
      query.doctorId = doctorId;
    }

    if (departmentId && departmentId !== 'all') {
      query.departmentId = departmentId;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const total = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .populate('patientId', 'name patientId age gender contact')
      .populate('doctorId', 'name specialization roomNumber')
      .populate('departmentId', 'name code')
      .sort({ date: 1, timeSlot: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const statusCounts = {
      today: await Appointment.countDocuments({ status: 'Today' }),
      upcoming: await Appointment.countDocuments({ status: 'Upcoming' }),
      completed: await Appointment.countDocuments({ status: 'Completed' }),
      cancelled: await Appointment.countDocuments({ status: 'Cancelled' }),
    };

    return res.status(200).json({
      success: true,
      appointments,
      statusCounts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, date, timeSlot, doctorId, hospitalNotes } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    if (status) appointment.status = status;
    if (date) appointment.date = new Date(date);
    if (timeSlot) appointment.timeSlot = timeSlot;
    if (doctorId) appointment.doctorId = doctorId;
    if (hospitalNotes) appointment.hospitalNotes = hospitalNotes;

    await appointment.save();

    return res.status(200).json({
      success: true,
      message: 'Appointment updated successfully.',
      appointment,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 8. DEPARTMENTS
// ==========================================
export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });

    const departmentStats = await Promise.all(
      departments.map(async (dept) => {
        const doctorsCount = await Doctor.countDocuments({ departmentId: dept._id });
        const patientsCount = await Patient.countDocuments({ departmentId: dept._id });
        const pendingReports = await MedicalReport.countDocuments({
          reviewStatus: { $in: ['Pending Review', 'Requires Review'] },
        });
        const criticalAlerts = await HealthAlert.countDocuments({
          severity: 'Critical',
          status: { $ne: 'Resolved' },
        });
        const appointmentsCount = await Appointment.countDocuments({
          departmentId: dept._id,
          status: { $in: ['Today', 'Upcoming'] },
        });

        return {
          ...dept.toObject(),
          doctorsCount,
          patientsCount,
          pendingReportsCount: Math.round(pendingReports / (departments.length || 1)),
          criticalAlertsCount: Math.round(criticalAlerts / (departments.length || 1)),
          appointmentsCount,
        };
      })
    );

    return res.status(200).json({
      success: true,
      departments: departmentStats,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 9. ANALYTICS
// ==========================================
export const getAnalytics = async (req, res) => {
  try {
    const { range = '30days' } = req.query;

    const patientVisitsOverTime = [
      { date: 'Day 1', visits: 42, admissions: 12, discharges: 10 },
      { date: 'Day 5', visits: 58, admissions: 16, discharges: 14 },
      { date: 'Day 10', visits: 64, admissions: 18, discharges: 15 },
      { date: 'Day 15', visits: 72, admissions: 22, discharges: 19 },
      { date: 'Day 20', visits: 68, admissions: 19, discharges: 18 },
      { date: 'Day 25', visits: 85, admissions: 25, discharges: 21 },
      { date: 'Day 30', visits: 94, admissions: 28, discharges: 24 },
    ];

    const reportStatusDistribution = [
      { name: 'Normal', value: 48, fill: '#52c41a' },
      { name: 'Abnormal', value: 26, fill: '#fa8c16' },
      { name: 'Critical', value: 12, fill: '#f5222d' },
      { name: 'Pending Review', value: 14, fill: '#1890ff' },
    ];

    const alertSeverityDistribution = [
      { name: 'Critical', count: 12, fill: '#cf1322' },
      { name: 'High', count: 28, fill: '#fa541c' },
      { name: 'Medium', count: 45, fill: '#faad14' },
      { name: 'Resolved', count: 110, fill: '#52c41a' },
    ];

    const departmentWorkload = [
      { department: 'Gen. Medicine', patients: 320, consultations: 280, critical: 12 },
      { department: 'Cardiology', patients: 240, consultations: 210, critical: 18 },
      { department: 'Diabetology', patients: 190, consultations: 175, critical: 9 },
      { department: 'Pathology', patients: 450, consultations: 410, critical: 22 },
      { department: 'Emergency', patients: 160, consultations: 160, critical: 35 },
      { department: 'Neurology', patients: 110, consultations: 95, critical: 8 },
    ];

    const doctorWorkload = [
      { name: 'Dr. Sonali', department: 'Gen. Medicine', patients: 18, reviews: 5 },
      { name: 'Dr. Priyanka', department: 'Cardiology', patients: 14, reviews: 2 },
      { name: 'Dr. Rahul', department: 'Diabetology', patients: 16, reviews: 4 },
      { name: 'Dr. Arvind', department: 'Pathology', patients: 22, reviews: 8 },
      { name: 'Dr. Meera', department: 'Emergency', patients: 20, reviews: 3 },
    ];

    const followUpCompletion = [
      { stage: 'Scheduled', value: 85 },
      { stage: 'Consulted', value: 72 },
      { stage: 'Report Reviewed', value: 68 },
      { stage: 'Completed', value: 62 },
    ];

    return res.status(200).json({
      success: true,
      metrics: {
        totalPatients: '1,248',
        newPatientsMonth: '184',
        patientVisits: '3,420',
        reportsProcessed: '892',
        abnormalReports: '146',
        criticalAlerts: '12',
        doctorConsultations: '1,180',
        followUpCompletionRate: '86.4%',
      },
      charts: {
        patientVisitsOverTime,
        reportStatusDistribution,
        alertSeverityDistribution,
        departmentWorkload,
        doctorWorkload,
        followUpCompletion,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 10. HOSPITAL PROFILE
// ==========================================
export const getProfile = async (req, res) => {
  try {
    let hospital = await Hospital.findOne();
    if (!hospital) {
      hospital = await Hospital.create({
        name: 'Med-X City Multispecialty Hospital',
        code: 'MEDX-HOSP-01',
        phone: '+91 22 2456 7890',
        email: 'admin@medx-hospital.org',
        emergencyContact: '+91 22 2456 0911',
        address: {
          street: '104 Healthcare Boulevard, Bandra West',
          city: 'Mumbai',
          state: 'Maharashtra',
          zip: '400050',
          country: 'India',
        },
        operatingHours: '24/7 Emergency & Inpatient, OPD: 08:00 AM - 08:00 PM',
      });
    }

    const departmentsCount = await Department.countDocuments();
    const doctorsCount = await Doctor.countDocuments();

    return res.status(200).json({
      success: true,
      hospital,
      stats: {
        departmentsCount,
        doctorsCount,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone, email, emergencyContact, operatingHours, address, bedCapacity } = req.body;

    let hospital = await Hospital.findOne();
    if (!hospital) {
      hospital = new Hospital({ name, code: 'MEDX-HOSP-01', phone, email, emergencyContact });
    }

    if (name) hospital.name = name;
    if (phone) hospital.phone = phone;
    if (email) hospital.email = email;
    if (emergencyContact) hospital.emergencyContact = emergencyContact;
    if (operatingHours) hospital.operatingHours = operatingHours;
    if (address) hospital.address = { ...hospital.address, ...address };
    if (bedCapacity) hospital.bedCapacity = { ...hospital.bedCapacity, ...bedCapacity };

    await hospital.save();

    return res.status(200).json({
      success: true,
      message: 'Hospital profile updated successfully.',
      hospital,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 11. NOTIFICATIONS
// ==========================================
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(20);
    const unreadCount = await Notification.countDocuments({ read: false });

    return res.status(200).json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
    return res.status(200).json({ success: true, notification });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany({ read: false }, { read: true });
    return res.status(200).json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
