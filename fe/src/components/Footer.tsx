import React from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.col}>
            <div className={styles.logo}>⛩️ ShikenAI</div>
            <p className={styles.desc}>
              Nền tảng luyện thi JLPT thông minh hàng đầu với công nghệ phát hiện gian lận tiên tiến, mang lại môi trường thi công bằng cho mọi người.
            </p>
          </div>
          <div className={styles.col}>
            <h3 className={styles.title}>Tính năng</h3>
            <ul className={styles.links}>
              <li><Link href="/exams">Ngân hàng đề thi</Link></li>
              <li><Link href="/practice">Luyện tập kỹ năng</Link></li>
              <li><Link href="/resources">Tìm kiếm tài nguyên</Link></li>
            </ul>
          </div>
          <div className={styles.col}>
            <h3 className={styles.title}>Hỗ trợ</h3>
            <ul className={styles.links}>
              <li><Link href="/instructions">Hướng dẫn sử dụng</Link></li>
              <li><Link href="/terms">Điều khoản dịch vụ</Link></li>
              <li><Link href="/privacy">Chính sách bảo mật</Link></li>
              <li><Link href="/faq">Câu hỏi thường gặp</Link></li>
            </ul>
          </div>
          <div className={styles.col}>
            <h3 className={styles.title}>Liên hệ</h3>
            <ul className={styles.links}>
              <li>Email: pttkpm@gmail.com</li>
              <li>Địa chỉ: UIT, HCM, Việt Nam</li>
            </ul>
          <div className={styles.socials}>
            <a href="#" className={styles.socialIcon} aria-label="Facebook">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
            <a href="#" className={styles.socialIcon} aria-label="YouTube">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
            </a>
            <a href="#" className={styles.socialIcon} aria-label="Instagram">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
          </div>
        </div>
      </div>
      <div className={styles.bottom}>
        <p>&copy; {new Date().getFullYear()} ShikenAI. All rights reserved.</p>
      </div>
      </div>
    </footer>
  );
}
