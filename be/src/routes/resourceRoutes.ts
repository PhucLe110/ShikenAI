import express from 'express';
import { getResources, uploadResource, checkDownloadEligibility } from '../controllers/resourceController';
import { protect } from '../middleware/auth';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

router.get('/', getResources);
router.post('/upload', protect, upload.single('file'), uploadResource);
router.get('/check-eligibility', protect, checkDownloadEligibility);

export default router;
