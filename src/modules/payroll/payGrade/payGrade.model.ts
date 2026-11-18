import mongoose, { Schema, model } from 'mongoose';
import { IPayGradeDocument } from '../payroll.types';

const payGradeSchema = new Schema<IPayGradeDocument>(
  {
    gradeCode: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    gradeName: { type: String, required: true, trim: true, index: true },
    minSalary: { type: Number, required: true, min: 0 },
    maxSalary: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD', uppercase: true },
    allowances: [
      {
        name: { type: String, required: true },
        amount: { type: Number, required: true },
        type: { type: String, enum: ['fixed', 'percentage'], default: 'fixed' },
      },
    ],
    description: { type: String },
    assignedEmployees: [
      {
        employeeId: { type: String, required: true },
        employeeName: { type: String, required: true },
        department: { type: String, required: true },
        currentSalary: { type: Number, required: true },
        assignedDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
      },
    ],
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active', index: true },
  },
  { timestamps: true }
);

export const PayGradeModel =
  (mongoose.models.PayrollPayGrade as mongoose.Model<IPayGradeDocument>) ||
  model<IPayGradeDocument>('PayrollPayGrade', payGradeSchema);
