'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './page.module.css';
import api from '@/services/api';

function ExamsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    // Set active tab from query param if exists
    const levelParam = searchParams.get('level');
    if (levelParam && ['N1', 'N2', 'N3', 'N4', 'N5'].includes(levelParam)) {
      setActiveTab(levelParam);
    }

    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      router.push('/');
      setTimeout(() => {
        window.dispatchEvent(new Event('openAuthModal'));
      }, 100);
      return;
    }

    const fetchExams = async () => {
      try {
        const { data } = await api.get('/exams');
        setExams(data);
      } catch (error) {
        console.error('Failed to fetch exams:', error);
        // Mock data fallback if API fails
        setExams([
          { _id: '1', title: 'Đề thi thử N3 - Tháng 12/2023', level: 'N3', duration: 105, questionCount: 60 },
          { _id: '2', title: 'Đề thi thử N3 - Tháng 7/2023', level: 'N3', duration: 105, questionCount: 60 },
          { _id: '3', title: 'Đề thi thử N2 - Tổng hợp', level: 'N2', duration: 145, questionCount: 75 },
          { _id: '4', title: 'Đề thi N4 - Đọc hiểu', level: 'N4', duration: 60, questionCount: 35 },
          { _id: '5', title: 'Đề thi N5 - Từ vựng', level: 'N5', duration: 25, questionCount: 30 },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  const filteredExams = activeTab === 'All' ? exams : exams.filter(e => e.level === activeTab);
  const levels = ['All', 'N5', 'N4', 'N3', 'N2', 'N1'];

  const handleStartExam = (id: string) => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      alert('Vui lòng đăng nhập để làm bài!');
      window.dispatchEvent(new Event('openAuthModal'));
      return;
    }
    router.push(`/exam/${id}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Ngân hàng đề thi JLPT</h1>
        <p className={styles.subtitle}>
          Lựa chọn đề thi phù hợp với trình độ của bạn và bắt đầu làm bài ngay. 
          Hệ thống sẽ tự động tính điểm và đánh giá năng lực của bạn.
        </p>
      </div>

      <div className={styles.tabs}>
        {levels.map(level => (
          <button 
            key={level}
            className={`${styles.tabBtn} ${activeTab === level ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(level)}
          >
            {level === 'All' ? 'Tất cả' : level}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.loading}>Đang tải danh sách đề thi...</div>
      ) : (
        <div className={styles.grid}>
          {filteredExams.length > 0 ? (
            filteredExams.map((exam) => (
              <div key={exam._id} className={styles.examCard}>
                <div className={styles.examLevel}>{exam.level}</div>
                <h3 className={styles.examTitle}>{exam.title}</h3>
                <div className={styles.examInfo}>
                   <span>⏱️ {exam.duration || 60} phút</span>
                   <span>📝 {exam.questions?.length || exam.questionCount || 40} câu</span>
                </div>
                <button className={styles.btnStart} onClick={() => handleStartExam(exam._id)}>
                  Bắt đầu thi
                </button>
              </div>
            ))
          ) : (
            <div className={styles.empty}>Không có đề thi nào cho cấp độ này.</div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ExamsPage() {
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <ExamsContent />
    </Suspense>
  );
}
