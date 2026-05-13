import express from 'express';
import { getExams, getExamById, recordCheatLog, saveProgress, getProgress, submitExam, getExamResult, getExamReview } from '../controllers/examController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/', getExams);
router.get('/:id', protect, getExamById);
router.post('/cheat-log', protect, recordCheatLog);
router.get('/:id/progress', protect, getProgress);
router.post('/:id/save-progress', protect, saveProgress);
router.post('/:id/submit', protect, submitExam);
router.get('/result/:submissionId', protect, getExamResult);
router.get('/review/:submissionId', protect, getExamReview);

export default router;
