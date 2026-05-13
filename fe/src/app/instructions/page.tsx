'use client';

import React from 'react';
import styles from './page.module.css';

const steps = [
  {
    title: "Đăng ký & Đăng nhập",
    desc: "Bắt đầu bằng cách tạo một tài khoản ShikenAI. Bạn có thể chọn 'Ghi nhớ tài khoản' để thuận tiện cho những lần sau. Sau khi đăng nhập, bạn sẽ có quyền truy cập vào tất cả các tính năng cốt lõi.",
    icon: "🔐"
  },
  {
    title: "Luyện tập kỹ năng",
    desc: "Truy cập mục 'Luyện tập' để rèn luyện Kanji, Từ vựng, Ngữ pháp thông qua các trò chơi tương tác như Flashcard và Nối từ. Đây là cách tốt nhất để xây dựng nền tảng trước khi thi.",
    icon: "🎮"
  },
  {
    title: "Tham gia kỳ thi JLPT",
    desc: "Chọn một đề thi phù hợp với trình độ (N5-N1). Trong khi thi, hãy lưu ý: hệ thống sẽ giám sát hành vi của bạn. Tuyệt đối không chuyển tab hoặc thoát trình duyệt để tránh bị khóa bài thi.",
    icon: "📝"
  },
  {
    title: "Xem kết quả & Review",
    desc: "Sau khi nộp bài, bạn sẽ nhận được điểm số ngay lập tức. Hãy sử dụng tính năng 'Review' để xem lại chi tiết từng câu sai, giải thích đáp án và rút kinh nghiệm cho lần sau.",
    icon: "📊"
  },
  {
    title: "Đóng góp & Tải tài nguyên",
    desc: "Để tải các tài liệu PDF/DOC, bạn cần đóng góp 3 tài liệu của mình. Hãy vào mục 'Kho tài nguyên', chọn 'Đóng góp' và tải lên tệp của bạn. Sau khi Admin duyệt, bạn sẽ mở khóa quyền tải về vĩnh viễn.",
    icon: "📤"
  },
  {
    title: "Quản lý cá nhân",
    desc: "Theo dõi tiến độ học tập và lịch sử thi của mình trong trang Cá nhân. Bạn có thể xem lại bất kỳ bài thi nào đã làm trong quá khứ để ôn tập lại.",
    icon: "👤"
  }
];

export default function InstructionsPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Hướng dẫn sử dụng</h1>
      <div className={styles.content}>
        <p style={{textAlign: 'center', marginBottom: '40px', fontSize: '1.2rem'}}>
          Chào mừng bạn đến với <strong>ShikenAI</strong>! Hãy làm theo các bước dưới đây để tối ưu hóa việc học tập của mình.
        </p>

        {steps.map((step, index) => (
          <div key={index} className={styles.step}>
            <div className={styles.stepNumber}>{index + 1}</div>
            <div className={styles.stepContent}>
              <h3>{step.icon} {step.title}</h3>
              <p>{step.desc}</p>
            </div>
          </div>
        ))}

        <div style={{marginTop: '40px', padding: '25px', background: '#fff5f5', borderRadius: '20px', border: '1px solid #feb2b2'}}>
          <h3 style={{color: '#c53030', marginBottom: '10px'}}>⚠️ Lưu ý quan trọng về bảo mật:</h3>
          <p style={{color: '#9b2c2c', fontSize: '0.95rem'}}>
            Hệ thống ShikenAI áp dụng công nghệ AI để giám sát tính công bằng. Nếu tài khoản của bạn bị khóa do vi phạm quy định, hãy chuẩn bị minh chứng (hình ảnh/video) và gửi kháng nghị tại bảng thông báo hiện ra khi đăng nhập.
          </p>
        </div>
      </div>
    </div>
  );
}
