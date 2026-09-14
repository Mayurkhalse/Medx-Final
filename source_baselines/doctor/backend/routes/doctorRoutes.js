import express from 'express';
import {
  getDoctorProfile,
  updateDoctorProfile,
  updateAvailability
} from '../controllers/doctorController.js';

const router = express.Router();

router.get('/', getDoctorProfile);
router.put('/', updateDoctorProfile);
router.put('/availability', updateAvailability);

export default router;
