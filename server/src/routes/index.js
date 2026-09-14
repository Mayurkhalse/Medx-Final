import { Router } from 'express';
import authRoutes from './authRoutes.js';
import reportRoutes from './reportRoutes.js';
import whatIfRoutes from './whatIfRoutes.js';
import doctorRoutes from './doctorRoutes.js';
import hospitalRoutes from './hospitalRoutes.js';
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

router.use('/lab', createReservedDomainRouter('lab'));
router.use('/appointments', createReservedDomainRouter('appointments'));
router.use('/triage', createReservedDomainRouter('triage'));

export default router;

