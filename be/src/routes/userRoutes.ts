import express from 'express';
import { getUserSubmissions, getUserProfile, requestUnlock } from '../controllers/userController';
import { protect } from '../middleware/auth';
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

const router = express.Router();

router.get('/profile', protect, getUserProfile);
router.get('/submissions', protect, getUserSubmissions);
router.post('/request-unlock', protect, upload.single('file'), requestUnlock);

export default router;
