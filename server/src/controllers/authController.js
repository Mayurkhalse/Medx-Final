import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import { User, ROLES } from '../models/User.js';
import { Patient } from '../models/Patient.js';
import { Doctor } from '../models/Doctor.js';
import { Hospital } from '../models/Hospital.js';
import { Lab } from '../models/Lab.js';

// Helper to generate JWT
function generateToken(user, profile = {}) {
  const payload = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    name: user.name,
    patientId: user.role === 'patient' && profile._id ? profile._id.toString() : null,
    doctorId: user.role === 'doctor' && profile._id ? profile._id.toString() : null,
    hospitalId: user.role === 'hospital_admin' && profile._id ? profile._id.toString() : (profile.hospitalId ? profile.hospitalId.toString() : null)
  };

  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN
  });
}

// Helper to fetch profile for user
async function fetchUserProfile(user) {
  if (!user || !user._id) return null;
  switch (user.role) {
    case 'patient':
      return Patient.findOne({ userId: user._id });
    case 'doctor':
      return Doctor.findOne({ userId: user._id });
    case 'hospital_admin':
      return Hospital.findOne({ userId: user._id });
    case 'lab_admin':
      return Lab.findOne({ userId: user._id });
    default:
      return null;
  }
}

// Normalizes legacy roles from source repositories
function normalizeRole(role) {
  if (!role) return 'patient';
  const r = role.toLowerCase().trim();
  if (r === 'candidate') return 'patient';
  if (r === 'organization') return 'doctor';
  if (r === 'hospital') return 'hospital_admin';
  if (r === 'lab') return 'lab_admin';
  return r;
}

/**
 * Register a new user with canonical identity and role-specific profile
 */
export async function register(req, res, next) {
  try {
    const { name, email, password, role, phone, facilityName, labName, specialty } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: {
          code: 'MISSING_FIELDS',
          message: 'Name, email, and password are required for registration.'
        }
      });
    }

    const normalizedRole = normalizeRole(role);
    if (!ROLES.includes(normalizedRole)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_ROLE',
          message: `Invalid role specified. Supported roles are: ${ROLES.join(', ')}.`
        }
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({
        error: {
          code: 'EMAIL_ALREADY_EXISTS',
          message: 'An account with this email address already exists.'
        }
      });
    }

    // Create canonical User
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: normalizedRole,
      phone: phone || '',
      authProvider: 'local'
    });

    // Create linked profile based on role
    let profile = null;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);

    switch (normalizedRole) {
      case 'patient':
        profile = await Patient.create({
          userId: user._id,
          legacyId: `PAT-${randomSuffix}`
        });
        break;
      case 'doctor':
        profile = await Doctor.create({
          userId: user._id,
          legacyId: `DOC-${randomSuffix}`,
          specialty: specialty || 'General Physician'
        });
        break;
      case 'hospital_admin':
        profile = await Hospital.create({
          userId: user._id,
          legacyId: `HOSP-${randomSuffix}`,
          facilityName: facilityName || `${user.name} Medical Center`
        });
        break;
      case 'lab_admin':
        profile = await Lab.create({
          userId: user._id,
          legacyId: `LAB-${randomSuffix}`,
          labName: labName || `${user.name} Diagnostics`
        });
        break;
    }

    const token = generateToken(user, profile);

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      },
      profile
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Login user and issue JWT
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: {
          code: 'MISSING_CREDENTIALS',
          message: 'Email and password are required.'
        }
      });
    }

    // Fetch user with password field explicitly selected
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password.'
        }
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password.'
        }
      });
    }

    // Fetch linked profile
    const profile = await fetchUserProfile(user);
    const token = generateToken(user, profile);

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      },
      profile
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get current authenticated user profile
 */
export async function getMe(req, res, next) {
  try {
    const profile = await fetchUserProfile(req.user);

    return res.status(200).json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        phone: req.user.phone
      },
      profile
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Logout (stateless acknowledgment)
 */
export async function logout(req, res) {
  return res.status(200).json({
    message: 'Logged out successfully'
  });
}

/**
 * Google OAuth entrypoint boundary
 */
export async function googleAuth(req, res) {
  if (!config.GOOGLE_CLIENT_ID || !config.GOOGLE_CLIENT_SECRET) {
    return res.status(503).json({
      error: {
        code: 'OAUTH_NOT_CONFIGURED',
        message: 'Google OAuth is not configured in this environment. Please configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.'
      }
    });
  }

  // Placeholder redirect when OAuth is configured
  const redirectUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${config.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(config.GOOGLE_CALLBACK_URL)}&response_type=code&scope=profile%20email`;
  return res.redirect(redirectUrl);
}

/**
 * Google OAuth callback boundary
 */
export async function googleCallback(req, res) {
  if (!config.GOOGLE_CLIENT_ID || !config.GOOGLE_CLIENT_SECRET) {
    return res.status(503).json({
      error: {
        code: 'OAUTH_NOT_CONFIGURED',
        message: 'Google OAuth is not configured in this environment.'
      }
    });
  }

  return res.status(501).json({
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Google OAuth callback handler is configured as a boundary. Full OAuth token exchange requires valid GCP credentials.'
    }
  });
}

export default { register, login, getMe, logout, googleAuth, googleCallback };
