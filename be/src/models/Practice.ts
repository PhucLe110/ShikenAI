import mongoose, { Schema, Document } from 'mongoose';

export interface IPractice extends Document {
  type: 'grammar' | 'vocab';
  title: string;
  level?: string;
  meaning: {
    jp?: string;
    en?: string;
    vn: string;
  };
  structure?: string;
  examples?: Array<{
    jp: string;
    en?: string;
    vn: string;
  }>;
  category?: string;
}

const PracticeSchema: Schema = new Schema({
  type: { type: String, required: true, enum: ['grammar', 'vocab', 'kanji', 'alphabet'] },
  title: { type: String, required: true },
  level: { type: String },
  meaning: {
    jp: { type: String },
    en: { type: String },
    vn: { type: String, required: true }
  },
  reading: { type: String },
  hanviet: { type: String },
  structure: { type: String },
  examples: [{
    jp: { type: String, required: true },
    en: { type: String },
    vn: { type: String, required: true }
  }],
  category: { type: String }
}, { timestamps: true });

export default mongoose.model<IPractice>('Practice', PracticeSchema);
