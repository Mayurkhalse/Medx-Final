import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      uppercase: true,
    },
    description: {
      type: String,
      default: '',
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
    },
    headDoctorName: {
      type: String,
      default: '',
    },
    headDoctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
    },
    icon: {
      type: String,
      default: 'MedicineBoxOutlined',
    },
    color: {
      type: String,
      default: '#1890ff',
    },
    floor: {
      type: String,
      default: 'Floor 1, Wing A',
    },
  },
  { timestamps: true }
);

export const Department = mongoose.model('Department', departmentSchema);
