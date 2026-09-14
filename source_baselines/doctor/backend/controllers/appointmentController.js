import Appointment from '../models/Appointment.js';

// GET /api/appointments
export const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointments', error: error.message });
  }
};

// POST /api/appointments
export const createAppointment = async (req, res) => {
  try {
    const apptData = req.body;
    if (!apptData.id) {
      apptData.id = `APT-${Math.floor(100 + Math.random() * 900)}`;
    }
    const newAppointment = new Appointment(apptData);
    await newAppointment.save();
    res.status(201).json(newAppointment);
  } catch (error) {
    res.status(500).json({ message: 'Error creating appointment', error: error.message });
  }
};

// PUT /api/appointments/:id
export const updateAppointment = async (req, res) => {
  try {
    const updated = await Appointment.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating appointment', error: error.message });
  }
};

// DELETE /api/appointments/:id
export const deleteAppointment = async (req, res) => {
  try {
    const deleted = await Appointment.findOneAndDelete({ id: req.params.id });
    if (!deleted) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json({ message: 'Appointment deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting appointment', error: error.message });
  }
};
