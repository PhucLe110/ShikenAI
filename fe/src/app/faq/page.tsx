'use client';

import React from 'react';
import styles from './page.module.css';

const faqs = [
  {
    q: "Làm thế nào để tải tài nguyên?",
    a: "Để tải tài nguyên, bạn cần đóng góp ít nhất 3 tài liệu ĐÃ ĐƯỢC DUYỆT cho cộng đồng. Sau khi đủ điều kiện, nút tải về sẽ được kích hoạt."
  },
  {
    q: "Tại sao tài khoản của tôi bị khóa?",
    a: "Tài khoản có thể bị khóa nếu hệ thống phát hiện hành vi gian lận trong lúc thi hoặc tài liệu bạn tải lên vi phạm quy định. Bạn có thể gửi kháng nghị kèm minh chứng để Admin xem xét."
  },
  {
    q: "Làm bài thi thử có mất phí không?",
    a: "Hiện tại, ShikenAI cung cấp hầu hết các đề thi JLPT hoàn toàn miễn phí cho cộng đồng người học tiếng Nhật."
  },
  {
    q: "Tôi có thể sử dụng ShikenAI trên điện thoại không?",
    a: "Có, website được thiết kế tương thích hoàn toàn với các thiết bị di động và máy tính bảng."
  },
  {
    q: "Làm sao để biết tài liệu của tôi đã được duyệt chưa?",
    a: "Sau khi tải lên, tài liệu sẽ ở trạng thái 'Chờ duyệt'. Khi Admin phê duyệt, bạn sẽ thấy nó xuất hiện công khai và nhận được thông báo thành công khi kiểm tra lại trạng thái tải lên."
  }
];

export default function FAQPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Câu hỏi thường gặp (FAQ)</h1>
      <div className={styles.content}>
        {faqs.map((item, index) => (
          <div key={index} className={styles.faqItem}>
            <h3 className={styles.question}>❓ {item.q}</h3>
            <p className={styles.answer}>{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
