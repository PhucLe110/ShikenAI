import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import User from '../models/User';
import Exam from '../models/Exam';
import CheatLog from '../models/CheatLog';
import connectDB from '../config/db';

dotenv.config();

const importData = async () => {
  try {
    await connectDB();

    await User.deleteMany();
    await Exam.deleteMany();
    await CheatLog.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);

    await User.insertMany([
      { name: 'Admin User', email: 'admin@shikenai.com', password: hashedPassword, role: 'admin' },
      { name: 'Học sinh A', email: 'student@shikenai.com', password: hashedPassword, role: 'user' }
    ]);
    console.log('Users imported successfully!');

    // Ưu tiên dữ liệu cào thật từ crawler/data/jlpt247_data.json
    // Nếu chưa có thì dùng sample_exam.json
    const crawledDataPath = path.join(__dirname, '../../../crawler/data/jlpt247_data.json');
    const sampleDataPath  = path.join(__dirname, '../../data/sample_exam.json');

    let rawData: any[];

    if (fs.existsSync(crawledDataPath)) {
      console.log('📂 Đang dùng dữ liệu cào thật từ crawler/data/jlpt247_data.json...');
      rawData = JSON.parse(fs.readFileSync(crawledDataPath, 'utf-8'));
    } else if (fs.existsSync(sampleDataPath)) {
      console.log('📂 Không tìm thấy dữ liệu cào. Dùng sample_exam.json...');
      rawData = JSON.parse(fs.readFileSync(sampleDataPath, 'utf-8'));
    } else {
      throw new Error('Không tìm thấy file dữ liệu! Hãy chạy crawler trước hoặc tạo sample_exam.json.');
    }

    // Đặt thời gian làm bài mặc định là 60 phút cho tất cả các đề
    const processedData = rawData.map(exam => ({
      ...exam,
      duration: 60
    }));

    await Exam.insertMany(processedData);
    console.log(`✅ Đã import ${processedData.length} đề thi vào database với thời gian 60 phút!`);
    process.exit();
  } catch (error) {
    console.error(`❌ Lỗi: ${(error as Error).message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();
    await User.deleteMany();
    await Exam.deleteMany();
    await CheatLog.deleteMany();
    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
