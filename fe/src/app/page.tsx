'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function HomePage() {
  const router = useRouter();

  const startExam = (level: string) => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      window.dispatchEvent(new Event('openAuthModal'));
      return;
    }
    router.push(`/exams?level=${level}`);
  };

  const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];

  return (
    <div className={styles.container}>
      <main>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Luyện thi JLPT<br/>hiệu quả – Thi thật công bằng</h1>
            <p className={styles.heroSubtitle}>
              Hệ thống đề thi đa dạng từ N5 đến N1, tích hợp công nghệ phát hiện gian lận, mang đến môi trường thi công bằng và minh bạch.
            </p>
            <button className={styles.btnPrimary} onClick={() => startExam('N3')}>
              Bắt đầu ngay
            </button>
          </div>
          <div className={styles.heroImage}>
            <img 
              src="https://i.pinimg.com/736x/fd/5f/2f/fd5f2fceff07c72a66d0f30838c5c5ab.jpg" 
              alt="Mt Fuji and Chureito Pagoda" 
              className={styles.heroImg}
            />
          </div>
        </section>

        <section className={styles.levelsSection}>
          <h2 className={styles.sectionTitle}>ĐỀ THI THEO CẤP ĐỘ</h2>
          <div className={styles.levelsGrid}>
            {levels.map((level) => (
              <div key={level} className={styles.levelCard} onClick={() => startExam(level)}>
                <div className={styles.levelTitle}>{level}</div>
                <div className={styles.levelDesc}>
                  {level === 'N5' || level === 'N3' ? '120+' : level === 'N4' ? '150+' : level === 'N2' ? '100+' : '80+'} đề thi
                </div>
                <button className={styles.btnStart}>Luyện ngay</button>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.featuresSection}>
          <h2 className={styles.sectionTitle} style={{textAlign: 'left'}}>TÍNH NĂNG NỔI BẬT</h2>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon} style={{color: '#3b82f6', backgroundColor: '#eff6ff'}}>📋</div>
              <div>
                <h3 className={styles.featureTitle}>Ngân hàng câu hỏi đa dạng</h3>
                <p className={styles.featureDesc}>Cập nhật liên tục, đúng cấu trúc JLPT</p>
              </div>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon} style={{color: '#22c55e', backgroundColor: '#f0fdf4'}}>🎯</div>
              <div>
                <h3 className={styles.featureTitle}>Thi thử như thi thật</h3>
                <p className={styles.featureDesc}>Giao diện thân thiện, đếm giờ, chấm điểm tự động</p>
              </div>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon} style={{color: '#ef4444', backgroundColor: '#fef2f2'}}>⚠️</div>
              <div>
                <h3 className={styles.featureTitle}>Phát hiện gian lận</h3>
                <p className={styles.featureDesc}>Cảnh báo khi rời màn hình, bảo vệ tính công bằng</p>
              </div>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon} style={{color: '#06b6d4', backgroundColor: '#ecfeff'}}>📊</div>
              <div>
                <h3 className={styles.featureTitle}>Thống kê chi tiết</h3>
                <p className={styles.featureDesc}>Theo dõi tiến độ, đánh giá năng lực</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
