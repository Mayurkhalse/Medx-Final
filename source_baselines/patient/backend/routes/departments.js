const express = require('express');
const router = express.Router();
const Department = require('../models/Department');
const Hospital = require('../models/Hospital');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');

// GET /api/departments - List departments
router.get('/', verifyToken, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'hospital_admin' && req.user.profileId) {
      filter.hospitalId = req.user.profileId;
    }
    const departments = await Department.find(filter).populate('headDoctorId');
    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving departments', error: error.message });
  }
});

// POST /api/departments - Create department
router.post('/', verifyToken, requireRole('hospital_admin'), async (req, res) => {
  const { name, capacity, headDoctorId } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ message: 'Department name is required' });
    }

    let hospitalId = req.user.profileId;
    if (!hospitalId) {
      const h = await Hospital.findOne({ adminUserId: req.user.id });
      if (h) hospitalId = h._id;
    }

    if (!hospitalId) {
      return res.status(400).json({ message: 'Hospital ID not associated with current admin' });
    }

    const department = await Department.create({
      hospitalId,
      name,
      capacity: capacity || 10,
      headDoctorId: headDoctorId || null
    });

    await Hospital.findByIdAndUpdate(hospitalId, {
      $push: { departments: department._id }
    });

    res.status(201).json(department);
  } catch (error) {
    res.status(500).json({ message: 'Error creating department', error: error.message });
  }
});

// PATCH /api/departments/:id
router.patch('/:id', verifyToken, requireRole('hospital_admin'), async (req, res) => {
  try {
    const updated = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating department', error: error.message });
  }
});

// DELETE /api/departments/:id
router.delete('/:id', verifyToken, requireRole('hospital_admin'), async (req, res) => {
  try {
    await Department.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Department removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing department', error: error.message });
  }
});

module.exports = router;
