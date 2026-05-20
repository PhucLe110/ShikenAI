import { Request, Response } from "express";
import User from "../models/User";
import Resource from "../models/Resource";
import Exam from "../models/Exam";

// --- User Management ---
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const lockUser = async (req: Request, res: Response) => {
  try {
    const { userId, reason } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isLocked = true;
    user.lockReason = reason;
    await user.save();
    res.json({ message: "User locked successfully", user });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const unlockUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isLocked = false;
    user.lockReason = "";
    user.unlockRequest = { ...user.unlockRequest, status: "approved" };
    await user.save();
    res.json({ message: "User unlocked successfully", user });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const handleUnlockRequest = async (req: Request, res: Response) => {
  try {
    const { userId, status } = req.body; // 'approved' or 'rejected'
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (status === "approved") {
      user.isLocked = false;
      user.unlockRequest.status = "approved";
    } else {
      user.unlockRequest.status = "rejected";
    }
    await user.save();
    res.json({ message: `Unlock request ${status}`, user });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// --- Resource Management ---
export const getPendingResources = async (req: Request, res: Response) => {
  try {
    const resources = await Resource.find({ status: "pending" });
    res.json(resources);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateResourceStatus = async (req: Request, res: Response) => {
  try {
    const { resourceId, status } = req.body; // 'approved' or 'rejected'
    const resource = await Resource.findById(resourceId);
    if (!resource)
      return res.status(404).json({ message: "Resource not found" });

    resource.status = status;
    await resource.save();
    res.json({ message: `Resource ${status}`, resource });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteResource = async (req: Request, res: Response) => {
  try {
    const { resourceId } = req.params;
    await Resource.findByIdAndDelete(resourceId);
    res.json({ message: "Resource deleted" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// --- Exam Management ---
export const deleteExam = async (req: Request, res: Response) => {
  try {
    const { examId } = req.params;
    await Exam.findByIdAndDelete(examId);
    res.json({ message: "Exam deleted" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllExams = async (req: Request, res: Response) => {
  try {
    const exams = await Exam.find();
    const mappedExams = exams.map((exam) => ({
      _id: exam._id,
      title: exam.title,
      level: exam.level,
      duration: exam.duration,
      questionCount: exam.questions ? exam.questions.length : 0,
      isHidden: (exam as any).isHidden || false,
    }));
    res.json(mappedExams);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleExamVisibility = async (req: Request, res: Response) => {
  try {
    const { examId } = req.params;
    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    exam.isHidden = !exam.isHidden;
    await exam.save();
    res.json({
      message: `Exam is now ${exam.isHidden ? "hidden" : "visible"}`,
      exam,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getExamDetail = async (req: Request, res: Response) => {
  try {
    const { examId } = req.params;
    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: "Exam not found" });
    res.json(exam);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateExam = async (req: Request, res: Response) => {
  try {
    const { examId } = req.params;
    const { title, duration, isHidden } = req.body;

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    if (title !== undefined) exam.title = title;
    if (duration !== undefined) exam.duration = duration;
    if (isHidden !== undefined) (exam as any).isHidden = isHidden;

    await exam.save();
    res.json({ message: "Exam updated successfully", exam });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
