import { Request, Response } from "express";
import Exam from "../models/Exam";
import CheatLog from "../models/CheatLog";
import Submission from "../models/Submission";

// @desc    Lấy danh sách tất cả đề thi
// @route   GET /api/exams
// @access  Public
export const getExams = async (req: Request, res: Response) => {
  try {
    const exams = await Exam.find({ isHidden: { $ne: true } });
    const mappedExams = exams.map((exam) => ({
      _id: exam._id,
      title: exam.title,
      level: exam.level,
      duration: exam.duration,
      questionCount: exam.questions ? exam.questions.length : 0,
    }));
    res.json(mappedExams);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Lấy chi tiết một đề thi bằng ID
// @route   GET /api/exams/:id
// @access  Private
export const getExamById = async (req: Request, res: Response) => {
  try {
    const exam = await Exam.findById(req.params.id).select(
      "-questions.correctAnswer",
    );
    if (!exam || (exam as any).isHidden) {
      return res.status(404).json({ message: "Exam not found" });
    }
    res.json(exam);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Ghi nhận log gian lận
// @route   POST /api/exams/cheat-log
// @access  Private
export const recordCheatLog = async (req: Request | any, res: Response) => {
  try {
    const { examId, warningCount, isTerminated, details } = req.body;

    if (!examId || warningCount === undefined) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    const log = await CheatLog.create({
      userId: req.user.id,
      examId,
      warningCount,
      isTerminated,
      details,
    });

    // Nếu người dùng bị chấm terminated do quá nhiều cảnh báo,
    // xóa tiến độ đang dở (status = 'in_progress') để không còn nằm trong mục lưu trữ.
    if (isTerminated) {
      try {
        await Submission.deleteOne({
          userId: req.user.id,
          examId,
          status: "in_progress",
        });
      } catch (delErr) {
        console.error(
          "Failed to remove in_progress submission after termination:",
          delErr,
        );
      }
    }

    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Lưu tiến độ bài làm (tạm dừng)
// @route   POST /api/exams/:id/save-progress
// @access  Private
export const saveProgress = async (req: Request | any, res: Response) => {
  try {
    const { answers, timeLeft, timeSpent } = req.body;
    const examId = req.params.id;
    const userId = req.user.id;

    if (!answers || timeLeft === undefined || timeSpent === undefined) {
      return res.status(400).json({ message: "Thiếu thông tin lưu tiến độ" });
    }

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Không tìm thấy đề thi" });
    }

    const totalQuestions = exam.questions.length;

    // Upsert: nếu đã có bản ghi in_progress thì cập nhật, không thì tạo mới
    const saved = await Submission.findOneAndUpdate(
      { userId, examId, status: "in_progress" },
      {
        answers,
        timeLeft,
        timeSpent,
        totalQuestions,
        status: "in_progress",
      },
      { upsert: true, new: true },
    );

    res.status(200).json({ message: "Đã lưu tiến độ", submission: saved });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Lấy tiến độ bài làm đang dở (nếu có)
// @route   GET /api/exams/:id/progress
// @access  Private
export const getProgress = async (req: Request | any, res: Response) => {
  try {
    const examId = req.params.id;
    const userId = req.user.id;

    const progress = await Submission.findOne({
      userId,
      examId,
      status: "in_progress",
    });
    if (!progress) {
      return res.status(404).json({ message: "Không có tiến độ đang dở" });
    }

    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Nộp bài thi và chấm điểm
// @route   POST /api/exams/:id/submit
// @access  Private
export const submitExam = async (req: Request | any, res: Response) => {
  try {
    const { answers, timeSpent } = req.body;
    const examId = req.params.id;
    const userId = req.user.id;

    if (!answers || timeSpent === undefined) {
      return res.status(400).json({ message: "Thiếu thông tin nộp bài" });
    }

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Không tìm thấy đề thi" });
    }

    const totalQuestions = exam.questions.length;
    const answeredCount = Object.keys(answers).length;

    // ✅ Validate: phải trả lời đủ tất cả câu hỏi
    if (answeredCount < totalQuestions) {
      return res.status(400).json({
        message: `Bạn còn ${totalQuestions - answeredCount} câu chưa trả lời. Vui lòng hoàn thành trước khi nộp bài.`,
        unansweredCount: totalQuestions - answeredCount,
        answeredCount,
        totalQuestions,
      });
    }

    let correctCount = 0;
    let incorrectCount = 0;

    const skillScores: Record<string, number> = {};
    const skillTotals: Record<string, number> = {};

    // Tính điểm
    exam.questions.forEach((question: any, index) => {
      const skill = question.skill || "vocab";
      if (!skillTotals[skill]) skillTotals[skill] = 0;
      if (!skillScores[skill]) skillScores[skill] = 0;

      skillTotals[skill]++;

      const selectedOptionIdx = answers[index];
      if (selectedOptionIdx !== undefined) {
        const selectedOptionText = question.options[selectedOptionIdx];
        if (selectedOptionText === question.correctAnswer) {
          correctCount++;
          skillScores[skill]++;
        } else {
          incorrectCount++;
        }
      } else {
        incorrectCount++;
      }
    });

    const score = (correctCount / totalQuestions) * 100;

    // Xoá bản ghi in_progress (nếu có) trước khi tạo completed
    await Submission.deleteOne({ userId, examId, status: "in_progress" });

    const submission = await Submission.create({
      userId,
      examId,
      answers,
      score,
      correctCount,
      incorrectCount,
      totalQuestions,
      timeSpent,
      timeLeft: 0,
      status: "completed",
      skillScores,
      skillTotals,
    });

    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Lấy kết quả chi tiết của một lần nộp bài
// @route   GET /api/exams/result/:submissionId
// @access  Private
export const getExamResult = async (req: Request | any, res: Response) => {
  try {
    const submissionId = req.params.submissionId;
    const submission = await Submission.findById(submissionId).populate(
      "examId",
      "title duration level",
    );

    if (!submission) {
      return res.status(404).json({ message: "Không tìm thấy kết quả" });
    }

    if (submission.userId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Không có quyền truy cập kết quả này" });
    }

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Lấy chi tiết bài làm kèm đáp án
// @route   GET /api/exams/review/:submissionId
// @access  Private
export const getExamReview = async (req: Request | any, res: Response) => {
  try {
    const submissionId = req.params.submissionId;
    const submission = await Submission.findById(submissionId);

    if (!submission) {
      return res.status(404).json({ message: "Không tìm thấy kết quả" });
    }

    if (submission.userId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Không có quyền truy cập kết quả này" });
    }

    const exam = await Exam.findById(submission.examId);
    if (!exam) {
      return res.status(404).json({ message: "Không tìm thấy đề thi" });
    }

    res.json({
      exam,
      submission,
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
