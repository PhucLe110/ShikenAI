import mongoose, { Schema, Document } from 'mongoose';

export interface IResource extends Document {
  title: string;
  fileUrl: string;
  fileType: 'pdf' | 'doc' | 'docx';
  uploader: mongoose.Types.ObjectId;
  uploaderName: string;
  role: 'user' | 'admin';
  downloads: number;
  createdAt: Date;
}

const resourceSchema: Schema = new Schema({
  title: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileType: { type: String, enum: ['pdf', 'doc', 'docx'], required: true },
  uploader: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  uploaderName: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  downloads: { type: Number, default: 0 },
}, { timestamps: true });

const Resource = mongoose.model<IResource>('Resource', resourceSchema);

export default Resource;
