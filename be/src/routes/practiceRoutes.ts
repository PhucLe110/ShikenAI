import express from 'express';
import { getPractices, getPracticeStats } from '../controllers/practiceController';

const router = express.Router();

router.get('/', getPractices);
router.get('/stats', getPracticeStats);

export default router;
