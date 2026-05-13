import { Request, Response } from 'express';
import Practice from '../models/Practice';

export const getPractices = async (req: Request, res: Response) => {
  try {
    const { type, level, limit = 20, random = 'false' } = req.query;
    
    const query: any = {};
    if (type) query.type = type;
    if (level) query.level = level;

    let practices;
    if (random === 'true') {
      practices = await Practice.aggregate([
        { $match: query },
        { $sample: { size: Number(limit) } }
      ]);
    } else {
      practices = await Practice.find(query).limit(Number(limit));
    }

    res.json(practices);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getPracticeStats = async (req: Request, res: Response) => {
  try {
    const stats = await Practice.aggregate([
      {
        $group: {
          _id: { type: '$type', level: '$level' },
          count: { $sum: 1 }
        }
      }
    ]);
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
