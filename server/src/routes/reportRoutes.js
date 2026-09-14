import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';
import {
  createManualReport,
  uploadPdfReport,
  getReports,
  getReportById,
  getBiomarkerTrends
} from '../controllers/reportController.js';

const router = Router();

// Multer in-memory storage to prevent temporary file writes to disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

// Middleware to normalize req.file from either 'file' or 'report' field
const handleFileUpload = (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err) return next(err);
    if (req.files && req.files.length > 0) {
      req.file = req.files.find(f => f.fieldname === 'report' || f.fieldname === 'file') || req.files[0];
    }
    next();
  });
};

const patientAuth = [requireAuth, requireRole(['patient'])];

// Ingestion endpoints
router.post('/', ...patientAuth, createManualReport);
router.post('/upload', ...patientAuth, handleFileUpload, uploadPdfReport);

// Query & Analytics endpoints
router.get('/', ...patientAuth, getReports);
router.get('/trends/analytics', ...patientAuth, getBiomarkerTrends);
router.get('/:id([0-9a-fA-F]{24})', ...patientAuth, getReportById);

// Reserved/unmigrated routes under /reports return 501 to preserve namespace boundaries
router.all('*', (req, res) => {
  res.status(501).json({
    error: {
      code: 'DOMAIN_RESERVED',
      domain: 'reports',
      message: `The reports domain endpoint '${req.originalUrl}' is reserved in the Phase 1D unified foundation. Domain features will be migrated in subsequent implementation phases.`
    }
  });
});

export default router;
