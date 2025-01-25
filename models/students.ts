import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent extends Document {
  name: string;
  email: string;
  department: string;
  password: string;
  tasks: mongoose.Types.ObjectId[]; // References Task IDs
}

const StudentSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  password: { type: String, required: true },
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task', default:[] }],
});

export const Student = mongoose.model<IStudent>('Student', StudentSchema);
