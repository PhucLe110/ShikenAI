import { Request, Response } from 'express';
import Submission from '../models/Submission';

// @desc    Lấy lịch sử làm bài của User
// @route   GET /api/users/submissions
// @access  Private
export const getUserSubmissions = async (req: Request | any, res: Response) => {
  try {
    const submissions = await Submission.find({ userId: req.user.id })
      .populate('examId', 'title level duration')
      .sort({ createdAt: -1 });
      
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getUserProfile = async (req: any, res: Response) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const requestUnlock = async (req: any, res: Response) => {
  try {
    const { message, proofUrl } = req.body;
    const user = req.user;
    
    let finalProofUrl = proofUrl;
    if (req.file) {
      finalProofUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    }

    user.unlockRequest = {
      status: 'pending',
      message,
      proofUrl: finalProofUrl,
      requestDate: new Date()
    };
    
    await user.save();
    res.json({ message: 'Unlock request submitted' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
