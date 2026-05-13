import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User';

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/shikenai');
    console.log('Connected to MongoDB...');

    const adminEmail = 'admin@shikenai.com';
    
    // Xóa admin cũ nếu có để đảm bảo mật khẩu mới được áp dụng
    await User.deleteOne({ email: adminEmail });
    console.log('Cleaned up existing admin if any...');

    const admin = new User({
      name: 'Admin ShikenAI',
      email: adminEmail,
      password: 'adminpassword123',
      role: 'admin'
    });

    await admin.save();
    console.log('Default Admin account created successfully!');
    console.log('Email: admin@shikenai.com');
    console.log('Password: adminpassword123');
    
    process.exit();
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
