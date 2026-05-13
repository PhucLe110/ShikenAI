import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
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
    answers: {
      type: Map,
      of: Number, // key is questionIndex (0, 1...), value is optionIndex (0, 1...)
      default: {},
    },
    score: {
      type: Number,
      default: 0,
    },
    correctCount: {
      type: Number,
      default: 0,
    },
    incorrectCount: {
      type: Number,
      default: 0,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    timeSpent: {
      type: Number, // In seconds — thời gian đã dùng khi nộp/tạm dừng
      default: 0,
    },
    timeLeft: {
      type: Number, // In seconds — thời gian còn lại (dùng khi tạm dừng để restore)
      default: 0,
    },
    status: {
      type: String,
      enum: ['in_progress', 'completed'],
      default: 'completed',
    },
    skillScores: {
      type: Map,
      of: Number, // key is skill name (vocab, grammar...), value is score (number of correct answers)
      default: {},
    },
    skillTotals: {
      type: Map,
      of: Number, // key is skill name, value is total questions for that skill
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const Submission = mongoose.model('Submission', submissionSchema);

export default Submission;
