import mongoose from 'mongoose';

const cheatLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
    },
    warningCount: {
      type: Number,
      required: true,
    },
    isTerminated: {
      type: Boolean,
      required: true,
      default: false,
    },
    details: {
      type: String, // Ví dụ: "Chuyển tab lần 3"
    }
  },
  {
    timestamps: true,
  }
);

const CheatLog = mongoose.model('CheatLog', cheatLogSchema);

export default CheatLog;
