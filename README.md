# ShikenAI - Nền tảng luyện thi JLPT thông minh 🚀

**ShikenAI** là một hệ thống hỗ trợ học tập và luyện thi JLPT (Japanese Language Proficiency Test) toàn diện, tích hợp các công nghệ hiện đại giúp người dùng tối ưu hóa lộ trình ôn luyện từ trình độ N5 đến N1.

## ✨ Tính năng nổi bật

- **📑 Kho đề thi đa dạng**: Hệ thống đề thi thử JLPT sát với thực tế, bao gồm đầy đủ các cấp độ từ N5 đến N1.
- **🕒 Trải nghiệm thi thực tế**: Chế độ làm bài thi có bấm giờ, giao diện trực quan giúp người dùng làm quen với áp lực phòng thi.
- **💾 Lưu trữ tiến độ**: Tính năng tạm dừng và tiếp tục bài thi, giúp bạn linh hoạt thời gian học tập.
- **📊 Phân tích kết quả**: Xem lại bài làm, đáp án chi tiết và thống kê điểm số sau mỗi kỳ thi.
- **📚 Thư viện tài liệu**: Hệ thống quản lý tài liệu học tập, cho phép người dùng đóng góp và tải xuống các tài nguyên hữu ích.
- **🛡️ Chống gian lận**: Tích hợp các cơ chế cơ bản để đảm bảo tính trung thực trong quá trình làm bài kiểm tra.
- **📱 Giao diện hiện đại**: Thiết kế Responsive, tối ưu trải nghiệm trên cả máy tính và thiết bị di động.
- **🛠️ Bảng điều khiển Admin**: Công cụ quản lý người dùng, duyệt tài liệu và xử lý khiếu nại chuyên nghiệp.

## 🛠️ Công nghệ sử dụng

### Frontend
- **Next.js 14**: Framework React mạnh mẽ hỗ trợ Server Components và tối ưu SEO.
- **TypeScript**: Đảm bảo tính an toàn về kiểu dữ liệu và nâng cao khả năng bảo trì.
- **CSS Modules**: Quản lý phong cách giao diện linh hoạt và tránh xung đột.
- **Axios**: Xử lý các yêu cầu API hiệu quả.

### Backend
- **Node.js & Express**: Môi trường thực thi và Framework web tốc độ cao.
- **MongoDB & Mongoose**: Cơ sở dữ liệu NoSQL linh hoạt cho việc lưu trữ đề thi và dữ liệu người dùng.
- **JWT & BcryptJS**: Đảm bảo bảo mật tài khoản và xác thực người dùng.
- **Multer**: Xử lý tải lên các tệp tài liệu.

### Crawler
- **Puppeteer/Scraper**: Tự động hóa việc thu thập dữ liệu từ các nguồn JLPT uy tín để làm phong phú kho đề thi.

## 🚀 Cài đặt và Chạy ứng dụng

### Yêu cầu hệ thống
- Node.js (phiên bản 18 trở lên)
- MongoDB (local hoặc Atlas)

### Các bước cài đặt

1. **Clone repository:**
   ```bash
   git clone https://github.com/your-username/ShikenAI.git
   cd ShikenAI
   ```

2. **Cấu hình Backend:**
   - Di chuyển vào thư mục `be`: `cd be`
   - Cài đặt dependencies: `npm install`
   - Tạo file `.env` và cấu hình các biến môi trường:
     ```env
     PORT=5000
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_secret_key
     ```
   - Chạy backend: `npm run dev`

3. **Cấu hình Frontend:**
   - Di chuyển vào thư mục `fe`: `cd ../fe`
   - Cài đặt dependencies: `npm install`
   - Chạy frontend: `npm run dev`

4. **Truy cập:** Mở trình duyệt và truy cập `http://localhost:3000`

## 📁 Cấu trúc thư mục

```text
ShikenAI/
├── be/             # Backend API (Express + TypeScript)
├── fe/             # Frontend Application (Next.js + TypeScript)
├── crawler/        # Bộ công cụ thu thập dữ liệu đề thi
└── README.md       # Tài liệu dự án
```

## 🤝 Đóng góp

Mọi ý đóng góp đều được trân trọng! Nếu bạn tìm thấy lỗi hoặc có ý tưởng mới, vui lòng mở một **Issue** hoặc tạo **Pull Request**.

---
*Phát triển bởi [Phúc Lê + Nhi Nguyễn]* 🇯🇵✨
