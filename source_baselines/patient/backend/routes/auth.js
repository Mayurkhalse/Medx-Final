const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');
const { verifyToken } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtsecretkey123!';
const JWT_EXPIRES_IN = '24h';

const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const {
    name,
    email,
    password,
    role = 'patient',
    dob,
    gender,
    hospitalName,
    specialty,
    licenseNumber,
    departmentId,
    hospitalId
  } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    let newUser = new User({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
      dob: dob ? new Date(dob) : null,
      gender: gender || '',
      authProvider: 'local'
    });

    if (role === 'hospital_admin') {
      // Create hospital entity
      const hospital = await Hospital.create({
        name: hospitalName || `${name}'s Health Facility`,
        adminUserId: newUser._id,
        contactEmail: email.toLowerCase()
      });
      newUser.profileId = hospital._id;
      newUser.profileModel = 'Hospital';
    } else if (role === 'doctor') {
      // Find or create default hospital if not supplied
      let targetHospitalId = hospitalId;
      if (!targetHospitalId) {
        let defaultHospital = await Hospital.findOne();
        if (!defaultHospital) {
          defaultHospital = await Hospital.create({
            name: 'General Medical Center',
            adminUserId: newUser._id
          });
        }
        targetHospitalId = defaultHospital._id;
      }

      const doctor = await Doctor.create({
        userId: newUser._id,
        hospitalId: targetHospitalId,
        specialty: specialty || 'General Medicine',
        licenseNumber: licenseNumber || '',
        departmentId: departmentId || null
      });

      await Hospital.findByIdAndUpdate(targetHospitalId, { $inc: { doctorCount: 1 } });
      newUser.profileId = doctor._id;
      newUser.profileModel = 'Doctor';
    }

    await newUser.save();

    const token = generateToken({
      id: newUser._id,
      email: newUser.email,
      role: newUser.role,
      profileId: newUser.profileId
    });

    res.cookie('accessToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        profileId: newUser.profileId,
        dob: newUser.dob,
        gender: newUser.gender
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    let user = await User.findOne({ email: email.toLowerCase() });
    
    // If demo account requested but database not yet populated, auto-seed on demand
    if (!user && ['patient@medx.com', 'hospital@medx.com', 'doctor@medx.com'].includes(email.toLowerCase())) {
      try {
        const { seed } = require('../seed');
        await seed(false);
        user = await User.findOne({ email: email.toLowerCase() });
      } catch (e) {
        console.warn('On-demand demo seeding failed:', e.message);
      }
    }

    if (!user || !user.passwordHash) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    let doctorProfile = null;
    let hospitalProfile = null;

    if (user.role === 'doctor' && user.profileId) {
      doctorProfile = await Doctor.findById(user.profileId).populate('departmentId');
    } else if (user.role === 'hospital_admin' && user.profileId) {
      hospitalProfile = await Hospital.findById(user.profileId);
    }

    const token = generateToken({
      id: user._id,
      email: user.email,
      role: user.role,
      profileId: user.profileId
    });

    res.cookie('accessToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileId: user.profileId,
        dob: user.dob,
        gender: user.gender,
        doctorProfile,
        hospitalProfile
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});

// GET /api/auth/me
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let doctorProfile = null;
    let hospitalProfile = null;

    if (user.role === 'doctor' && user.profileId) {
      doctorProfile = await Doctor.findById(user.profileId).populate('departmentId');
    } else if (user.role === 'hospital_admin' && user.profileId) {
      hospitalProfile = await Hospital.findById(user.profileId);
    }

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileId: user.profileId,
        dob: user.dob,
        gender: user.gender,
        assignedDoctorId: user.assignedDoctorId,
        hospitalId: user.hospitalId,
        doctorProfile,
        hospitalProfile
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('accessToken');
  res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router;
