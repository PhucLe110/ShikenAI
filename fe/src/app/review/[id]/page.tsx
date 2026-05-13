'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import api from '@/services/api';

export default function ReviewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id: submissionId } = params;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const res = await api.get(`/exams/review/${submissionId}`);
        setData(res.data);
      } catch (error) {
        console.error(error);
        alert('Không tìm thấy kết quả hoặc bạn không có quyền truy cập');
        router.push('/');
      } finally {
        setLoading(false);
      }
    };
    fetchReview();
  }, [submissionId, router]);

  if (loading) {
    return <div style={{textAlign: 'center', marginTop: '50px'}}>Đang tải dữ liệu...</div>;
  }

  if (!data) return null;

  const { exam, submission } = data;
  const { answers } = submission;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Chi tiết bài làm: {exam.title}</h1>
          <button className={styles.btnBack} onClick={() => router.push(`/result/${submissionId}`)}>
            ← Quay lại trang Kết quả
          </button>
        </div>
        <div className={styles.score}>
          Điểm: <span className={submission.score >= 50 ? styles.passed : styles.failed}>{Math.round(submission.score)} / 100</span>
        </div>
      </div>

      <div className={styles.content}>
        {exam.questions.map((q: any, idx: number) => {
          const userSelectedIdx = answers ? answers[idx] : undefined;
          const userSelectedText = userSelectedIdx !== undefined ? q.options[userSelectedIdx] : null;
          const isCorrect = userSelectedText === q.correctAnswer;

          return (
            <div key={idx} className={styles.questionCard}>
              <div className={styles.questionHeader}>
                <span className={styles.questionNumber}>Câu {idx + 1}</span>
                <span className={isCorrect ? styles.statusCorrect : styles.statusIncorrect}>
                  {isCorrect ? '✓ Đúng' : '✗ Sai'}
                </span>
              </div>
              <div className={styles.questionText}>
                {q.text.split('\n').map((line: string, i: number) => <p key={i}>{line}</p>)}
              </div>
              
              <div className={styles.options}>
                {q.options.map((opt: string, optIdx: number) => {
                  let optionClass = styles.option;
                  
                  if (opt === q.correctAnswer) {
                    optionClass = `${styles.option} ${styles.optionCorrect}`;
                  } else if (userSelectedIdx === optIdx && !isCorrect) {
                    optionClass = `${styles.option} ${styles.optionSelectedWrong}`;
                  }

                  return (
                    <div key={optIdx} className={optionClass}>
                      <span style={{fontWeight: 'bold', width: '20px'}}>{optIdx + 1}.</span> 
                      <span>{opt}</span>
                      {opt === q.correctAnswer && <span style={{marginLeft: 'auto'}}>✅ Đáp án đúng</span>}
                      {userSelectedIdx === optIdx && !isCorrect && <span style={{marginLeft: 'auto'}}>❌ Bạn đã chọn</span>}
                      {userSelectedIdx === optIdx && isCorrect && <span style={{marginLeft: 'auto'}}>⭐ Bạn đã chọn</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
