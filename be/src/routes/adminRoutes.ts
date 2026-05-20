import express from "express";
import {
  getUsers,
  lockUser,
  unlockUser,
  handleUnlockRequest,
  getPendingResources,
  updateResourceStatus,
  deleteResource,
  getAllExams,
  getExamDetail,
  updateExam,
  deleteExam,
  toggleExamVisibility,
} from "../controllers/adminController";
import { protect, admin } from "../middleware/auth";

const router = express.Router();

router.use(protect);
router.use(admin);

// Users
router.get("/users", getUsers);
router.post("/users/lock", lockUser);
router.post("/users/unlock/:userId", unlockUser);
router.post("/users/unlock-request", handleUnlockRequest);

// Resources
router.get("/resources/pending", getPendingResources);
router.post("/resources/status", updateResourceStatus);
router.delete("/resources/:resourceId", deleteResource);

// Exams
router.get("/exams", getAllExams);
router.get("/exams/:examId", getExamDetail);
router.put("/exams/:examId", updateExam);
router.delete("/exams/:examId", deleteExam);
router.post("/exams/toggle-visibility/:examId", toggleExamVisibility);

export default router;
