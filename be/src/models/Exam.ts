import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  text: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
  skill: { 
    type: String, 
    enum: ['vocab', 'grammar', 'reading', 'listening'],
    default: 'vocab' // Mặc định là vocab nếu không có
  }
});

const examSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    level: {
      type: String, // N1, N2, N3, N4, N5
      required: true,
    },
    duration: {
      type: Number, // Số phút làm bài
      required: true,
      default: 105, 
    },
    questions: [questionSchema],
    isHidden: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Exam = mongoose.model('Exam', examSchema);

export default Exam;
