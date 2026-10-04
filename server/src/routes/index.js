import { Router } from 'express';
import authRoutes from './authRoutes.js';
import reportRoutes from './reportRoutes.js';
import whatIfRoutes from './whatIfRoutes.js';
import doctorRoutes from './doctorRoutes.js';
import hospitalRoutes from './hospitalRoutes.js';
import labRoutes from './labRoutes.js';
import emergencyRoutes from './emergencyRoutes.js';
import appointmentRoutes from './appointmentRoutes.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';

const router = Router();

// Health Check Endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'medx-unified-api',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Database Seeding Endpoint
router.post('/seed', async (req, res, next) => {
  try {
    const { seedDatabase } = await import('../seed.js');
    await seedDatabase();
    res.status(200).json({
      success: true,
      message: 'Database successfully seeded with authentic clinical records across all roles.',
      credentials: [
        { role: 'Patient', email: 'patient@medx.org', password: 'Password123!' },
        { role: 'Patient 2', email: 'emma.watson@medx.org', password: 'Password123!' },
        { role: 'Doctor', email: 'doctor@medx.org', password: 'Password123!' },
        { role: 'Hospital Admin', email: 'hospital@medx.org', password: 'Password123!' },
        { role: 'Lab Admin', email: 'lab@medx.org', password: 'Password123!' }
      ]
    });
  } catch (error) {
    next(error);
  }
});

// Authentication Domain (IAM)
router.use('/auth', authRoutes);

// Foundation RBAC Verification Route (Used to verify role enforcement)
router.get('/foundation/rbac-test/:targetRole', requireAuth, (req, res, next) => {
  const { targetRole } = req.params;
  requireRole(targetRole)(req, res, () => {
    res.status(200).json({
      message: `Access granted: User ${req.user.name} (${req.user.email}) successfully authorized for role '${targetRole}'.`,
      role: req.user.role,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email
      }
    });
  });
});

// Helper to create domain reservation router
function createReservedDomainRouter(domainName) {
  const domainRouter = Router();
  domainRouter.all('*', (req, res) => {
    res.status(501).json({
      error: {
        code: 'DOMAIN_RESERVED',
        domain: domainName,
        message: `The ${domainName} domain endpoint '${req.originalUrl}' is reserved in the Phase 1D unified foundation. Domain features will be migrated in subsequent implementation phases.`
      }
    });
  });
  return domainRouter;
}

// Patient Domain Routes (Migrated in Phase 1E)
const patientRouter = Router();
patientRouter.use('/reports', reportRoutes);
patientRouter.use('/whatif', whatIfRoutes);
patientRouter.use('/appointments', appointmentRoutes);
patientRouter.get('/', requireAuth, requireRole(['patient']), (req, res) => {
  res.status(200).json({
    message: 'Med-X Unified Patient Workspace API',
    user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role }
  });
});
patientRouter.all('*', (req, res) => {
  res.status(501).json({
    error: {
      code: 'DOMAIN_RESERVED',
      domain: 'patient',
      message: `The patient domain endpoint '${req.originalUrl}' is reserved in the Phase 1D unified foundation. Domain features will be migrated in subsequent implementation phases.`
    }
  });
});

router.use('/patient', patientRouter);
router.use('/reports', reportRoutes);

// Doctor Domain Routes (Migrated in Phase 1F)
router.use('/doctor', doctorRoutes);

// Hospital Domain Routes (Migrated in Phase 1G)
router.use('/hospital', hospitalRoutes);

// Laboratory Domain Routes (Migrated in Phase 1H)
router.use('/lab', labRoutes);

// Emergency Domain Routes (Migrated in Phase 1I)
router.use('/emergency', emergencyRoutes);

// Unified Appointments Domain
router.use('/appointments', appointmentRoutes);
router.use('/triage', createReservedDomainRouter('triage'));

export default router;

