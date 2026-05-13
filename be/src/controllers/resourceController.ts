import { Request, Response } from 'express';
import Resource from '../models/Resource';
import User from '../models/User';

export const getResources = async (req: Request, res: Response) => {
  try {
    const resources = await Resource.find({ status: 'approved' }).sort({ createdAt: -1 });
    res.json(resources);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadResource = async (req: any, res: Response) => {
  try {
    const { title, fileUrl, fileType } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'Bạn cần đăng nhập để tải tài liệu lên' });
    }

    let finalFileUrl = fileUrl;
    let finalFileType = fileType;

    // Handle direct file upload
    if (req.file) {
      finalFileUrl = `http://localhost:5000/uploads/${req.file.filename}`;
      finalFileType = req.file.originalname.split('.').pop();
    }

    if (!finalFileUrl) {
      return res.status(400).json({ message: 'Vui lòng cung cấp link hoặc tải tệp trực tiếp' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    const newResource = new Resource({
      title,
      fileUrl: finalFileUrl,
      fileType: finalFileType,
      uploader: userId,
      uploaderName: user.name,
      role: user.role,
      status: user.role === 'admin' ? 'approved' : 'pending'
    });

    await newResource.save();

    // Increase user's upload count
    user.uploadedDocs = (user.uploadedDocs || 0) + 1;
    await user.save();

    res.status(201).json(newResource);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const checkDownloadEligibility = async (req: any, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.json({ canDownload: false, reason: 'Chưa đăng nhập' });

    const user = await User.findById(userId);
    if (!user) return res.json({ canDownload: false, reason: 'Người dùng không tồn tại' });

    // Đếm số lượng tài liệu đã được duyệt của user này
    const approvedCount = await Resource.countDocuments({ uploader: userId, status: 'approved' });

    if (user.role === 'admin' || approvedCount >= 3) {
      res.json({ canDownload: true });
    } else {
      res.json({ 
        canDownload: false, 
        uploadedDocs: approvedCount,
        reason: `Bạn cần ít nhất 3 tài liệu ĐÃ ĐƯỢC DUYỆT để được phép tải về (Hiện tại: ${approvedCount}/3)` 
      });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
