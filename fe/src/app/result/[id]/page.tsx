'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import api from '@/services/api';

export default function ResultPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id: submissionId } = params;
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const { data } = await api.get(`/exams/result/${submissionId}`);
        setResult(data);
      } catch (error) {
        console.error(error);
        alert('Không tìm thấy kết quả hoặc bạn không có quyền truy cập');
        router.push('/');
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [submissionId, router]);

  if (loading) {
    return <div style={{textAlign: 'center', marginTop: '50px'}}>Đang tải kết quả...</div>;
  }

  if (!result) return null;

  const isPassed = result.score >= 50; // Giả sử >= 50 là Đạt
  const totalQuestions = result.totalQuestions;
  const correctCount = result.correctCount;
  const incorrectCount = result.incorrectCount;
  const correctPercentage = Math.round((correctCount / totalQuestions) * 100) || 0;
  const incorrectPercentage = Math.round((incorrectCount / totalQuestions) * 100) || 0;

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Sử dụng dữ liệu kỹ năng thật từ Backend nếu có
  const skills = result.skillScores && result.skillTotals ? Object.keys(result.skillTotals).map(key => {
    const nameMap: Record<string, string> = {
      'vocab': 'Từ vựng',
      'grammar': 'Ngữ pháp',
      'reading': 'Đọc hiểu',
      'listening': 'Nghe hiểu'
    };
    return {
      name: nameMap[key] || key,
      score: result.skillScores[key] || 0,
      total: result.skillTotals[key] || 0
    };
  }) : [
    { name: 'Từ vựng', score: 0, total: 0 },
    { name: 'Ngữ pháp', score: 0, total: 0 },
    { name: 'Đọc hiểu', score: 0, total: 0 },
    { name: 'Nghe hiểu', score: 0, total: 0 },
  ];

  return (
    <div className={styles.container}>
      <h1 className={styles.headerTitle}>TRANG KẾT QUẢ</h1>
      
      <div className={styles.grid}>
        {/* Cột trái: Thông tin điểm */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Kết quả bài thi</h2>
          
          <div className={styles.scoreSection}>
            <div className={styles.scoreBig}>
              <span className={styles.scoreValue} style={{color: isPassed ? 'var(--color-primary)' : '#ef4444'}}>
                {Math.round(result.score)}
              </span>
              <span className={styles.scoreTotal}>/ 100</span>
            </div>
            <div className={styles.status} style={{color: isPassed ? 'var(--color-primary)' : '#ef4444'}}>
              {isPassed ? 'Đạt' : 'Không đạt'}
            </div>
            <p className={styles.statusText}>
              {isPassed ? 'Bạn đã vượt qua kỳ thi này!' : 'Cố gắng lên nhé!'}
            </p>
          </div>

          <div className={styles.statsList}>
            <div className={styles.statItem}>
              <span>Thời gian làm bài</span>
              <strong>{formatTime(result.timeSpent)}</strong>
            </div>
            <div className={styles.statItem}>
              <span>Số câu đúng</span>
              <strong>{correctCount} / {totalQuestions}</strong>
            </div>
            <div className={styles.statItem}>
              <span>Số câu sai</span>
              <strong>{incorrectCount} / {totalQuestions}</strong>
            </div>
            <div className={styles.statItem}>
              <span>Điểm trung bình</span>
              <strong style={{color: '#ef4444'}}>{(result.score / 10).toFixed(1)} / 10</strong>
            </div>
          </div>

          <div className={styles.actions}>
            <button className={styles.btnPrimary} onClick={() => router.push(`/review/${submissionId}`)}>Xem đáp án</button>
            <button className={styles.btnSecondary} onClick={() => router.push('/')}>Về trang chủ</button>
          </div>
        </div>

        {/* Cột phải: Biểu đồ & Kỹ năng */}
        <div className={styles.rightCol}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Biểu đồ kết quả</h2>
            
            <div className={styles.chartArea}>
              <div 
                className={styles.doughnut} 
                style={{
                  background: `conic-gradient(var(--color-primary) ${correctPercentage}%, #ef4444 ${correctPercentage}% 100%)`
                }}
              >
                <div className={styles.doughnutInner}></div>
              </div>
              
              <div className={styles.chartLegend}>
                <div className={styles.legendItem}>
                  <div className={styles.dot} style={{backgroundColor: 'var(--color-primary)'}}></div>
                  <span>Đúng: {correctCount} ({correctPercentage}%)</span>
                </div>
                <div className={styles.legendItem}>
                  <div className={styles.dot} style={{backgroundColor: '#ef4444'}}></div>
                  <span>Sai: {incorrectCount} ({incorrectPercentage}%)</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Kỹ năng</h2>
            <div className={styles.skillsList}>
              {skills.map(skill => (
                <div key={skill.name} className={styles.skillItem}>
                  <div className={styles.skillHeader}>
                    <span>{skill.name}</span>
                    <span>{skill.score} / {skill.total}</span>
                  </div>
                  <div className={styles.skillBarBg}>
                    <div 
                      className={styles.skillBarFill} 
                      style={{width: `${(skill.score / skill.total) * 100}%`}}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
