import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Hospital } from '../models/Hospital.js';
import { Doctor } from '../models/Doctor.js';
import { Patient } from '../models/Patient.js';
import { JWT_SECRET } from '../middleware/auth.js';

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });
};

// @desc Login user
// @route POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() })
      .populate('hospitalId')
      .populate('doctorId')
      .populate('patientId');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please check your email and password.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please check your email and password.',
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        hospital: user.hospitalId,
        doctor: user.doctorId,
        patient: user.patientId,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Register user
// @route POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, role = 'patient', phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields.',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // Link default hospital if none specified
    const defaultHospital = await Hospital.findOne();

    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      role,
      phone,
      hospitalId: defaultHospital ? defaultHospital._id : null,
    });

    await user.save();

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Registration successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        hospital: defaultHospital,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get current authenticated user
// @route GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('hospitalId')
      .populate('doctorId')
      .populate('patientId');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        hospital: user.hospitalId,
        doctor: user.doctorId,
        patient: user.patientId,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
