import express from 'express';
import {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  addPrescription,
  addClinicalNote,
  addFollowup
} from '../controllers/patientController.js';

const router = express.Router();

router.get('/', getPatients);
router.get('/:id', getPatientById);
router.post('/', createPatient);
router.put('/:id', updatePatient);
router.delete('/:id', deletePatient);
router.post('/:id/prescriptions', addPrescription);
router.post('/:id/notes', addClinicalNote);
router.post('/:id/followups', addFollowup);

export default router;
