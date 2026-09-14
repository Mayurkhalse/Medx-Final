import Patient from '../models/Patient.js';

// GET /api/patients
export const getPatients = async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching patients', error: error.message });
  }
};

// GET /api/patients/:id
export const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findOne({ id: req.params.id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching patient', error: error.message });
  }
};

// POST /api/patients
export const createPatient = async (req, res) => {
  try {
    const patientData = req.body;
    if (!patientData.id) {
      patientData.id = `PX-${Math.floor(10000 + Math.random() * 90000)}`;
    }
    const newPatient = new Patient(patientData);
    await newPatient.save();
    res.status(201).json(newPatient);
  } catch (error) {
    res.status(500).json({ message: 'Error creating patient', error: error.message });
  }
};

// PUT /api/patients/:id
export const updatePatient = async (req, res) => {
  try {
    const updated = await Patient.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating patient', error: error.message });
  }
};

// DELETE /api/patients/:id
export const deletePatient = async (req, res) => {
  try {
    const deleted = await Patient.findOneAndDelete({ id: req.params.id });
    if (!deleted) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json({ message: 'Patient deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting patient', error: error.message });
  }
};

// POST /api/patients/:id/prescriptions
export const addPrescription = async (req, res) => {
  try {
    const { rxData } = req.body;
    const patient = await Patient.findOne({ id: req.params.id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const updatedPrescriptions = [rxData, ...(patient.prescriptions || [])];
    const newMedList = (rxData.medicines || []).map((m, idx) => ({
      id: `MED-NEW-${Date.now()}-${idx}`,
      name: m.name,
      dosage: m.dosage,
      frequency: m.frequency,
      route: 'Oral',
      startDate: rxData.date,
      endDate: 'Ongoing',
      prescribingDoctor: rxData.doctor,
      instructions: m.instructions
    }));

    patient.prescriptions = updatedPrescriptions;
    patient.currentMedications = [...newMedList, ...(patient.currentMedications || [])];

    await patient.save();
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: 'Error adding prescription', error: error.message });
  }
};

// POST /api/patients/:id/notes
export const addClinicalNote = async (req, res) => {
  try {
    const { noteData } = req.body;
    const patient = await Patient.findOne({ id: req.params.id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    patient.clinicalNotes = [noteData, ...(patient.clinicalNotes || [])];
    await patient.save();
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: 'Error adding clinical note', error: error.message });
  }
};

// POST /api/patients/:id/followups
export const addFollowup = async (req, res) => {
  try {
    const { followupData } = req.body;
    const patient = await Patient.findOne({ id: req.params.id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    patient.followupPlan = [followupData, ...(patient.followupPlan || [])];
    await patient.save();
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: 'Error adding followup', error: error.message });
  }
};
