import DoctorProfile from '../models/DoctorProfile.js';

// GET /api/doctor
export const getDoctorProfile = async (req, res) => {
  try {
    let profile = await DoctorProfile.findOne();
    if (!profile) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching doctor profile', error: error.message });
  }
};

// PUT /api/doctor
export const updateDoctorProfile = async (req, res) => {
  try {
    const updatedData = req.body;
    let profile = await DoctorProfile.findOne();
    if (!profile) {
      profile = new DoctorProfile(updatedData);
    } else {
      Object.assign(profile, updatedData);
    }
    await profile.save();
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Error updating doctor profile', error: error.message });
  }
};

// PUT /api/doctor/availability
export const updateAvailability = async (req, res) => {
  try {
    const newAvailability = req.body;
    let profile = await DoctorProfile.findOne();
    if (!profile) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }
    profile.availability = newAvailability;
    await profile.save();
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Error updating availability', error: error.message });
  }
};
