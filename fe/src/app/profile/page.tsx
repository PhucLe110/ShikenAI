'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import api from '@/services/api';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'completed' | 'in_progress'>('completed');

  // Unlock request form
  const [unlockMessage, setUnlockMessage] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [{ data: userData }, { data: submissionsData }] = await Promise.all([
          api.get('/users/profile'),
          api.get('/users/submissions')
        ]);
        setUser(userData);
        setSubmissions(submissionsData);
      } catch (error) {
        console.error('Failed to fetch profile data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  const handleUnlockRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/users/request-unlock', { message: unlockMessage, proofUrl });
      alert('Yêu cầu của bạn đã được gửi. Admin sẽ xem xét sớm nhất có thể.');
      // Refresh user data
      const { data } = await api.get('/users/profile');
      setUser(data);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}p ${s}s`;
  };

  const formatTimeLeft = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const completed = submissions.filter(s => s.status === 'completed' || !s.status);
  const inProgress = submissions.filter(s => s.status === 'in_progress');

  const totalExams = completed.length;
  const avgScore = totalExams > 0
    ? Math.round(completed.reduce((a, s) => a + s.score, 0) / totalExams)
    : 0;
  const passedCount = completed.filter(s => s.score >= 50).length;

  if (loading) return <div className={styles.loading}>Đang tải hồ sơ...</div>;

  if (user?.isLocked) {
    return (
      <div className={styles.lockedContainer}>
        <div className={styles.lockedCard}>
          <div className={styles.lockedIcon}>🔒</div>
          <h1 className={styles.lockedTitle}>Tài khoản đã bị khóa</h1>
          <p className={styles.lockedReason}><strong>Lý do:</strong> {user.lockReason || 'Vi phạm điều khoản cộng đồng'}</p>
          
          <div className={styles.unlockSection}>
            <h3>Gửi yêu cầu mở khóa</h3>
            {user.unlockRequest?.status === 'pending' ? (
              <div className={styles.pendingBox}>
                ⏱ Yêu cầu của bạn đang chờ phê duyệt. Vui lòng quay lại sau.
              </div>
            ) : (
              <form onSubmit={handleUnlockRequest} className={styles.unlockForm}>
                <textarea 
                  className={styles.textarea}
                  placeholder="Trình bày lý do hoặc cung cấp minh chứng để Admin xem xét..."
                  required
                  value={unlockMessage}
                  onChange={e => setUnlockMessage(e.target.value)}
                />
                <input 
                  type="url"
                  className={styles.input}
                  placeholder="Link ảnh/video minh chứng (nếu có)"
                  value={proofUrl}
                  onChange={e => setProofUrl(e.target.value)}
                />
                <button type="submit" className={styles.btnSubmit} disabled={isSubmitting}>
                  {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
                </button>
              </form>
            )}
            {user.unlockRequest?.status === 'rejected' && (
              <div className={styles.rejectedBox}>
                ❌ Yêu cầu trước đó đã bị từ chối. Bạn có thể gửi lại yêu cầu mới nếu có thêm bằng chứng.
              </div>
            )}
          </div>
          <button className={styles.btnHome} onClick={() => router.push('/')}>Quay về Trang chủ</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* ── Header: User info ── */}
      <div className={styles.header}>
        <div className={styles.avatar}>
          {user?.name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <div className={styles.userInfo}>
          <h1>{user?.name || 'Người dùng'}</h1>
          <p>{user?.email || ''}</p>
        </div>
      </div>

      {/* ── Stats cards ── */}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{totalExams}</span>
          <span className={styles.statLabel}>Bài đã nộp</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{avgScore}</span>
          <span className={styles.statLabel}>Điểm TB / 100</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{passedCount}</span>
          <span className={styles.statLabel}>Bài đạt (≥50đ)</span>
        </div>
        <div className={`${styles.statCard} ${styles.statCardInProgress}`}>
          <span className={`${styles.statValue} ${styles.statValueInProgress}`}>{inProgress.length}</span>
          <span className={styles.statLabel}>Đang làm dở</span>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className={styles.tabs}>
        <button
          id="tab-completed"
          className={`${styles.tab} ${activeTab === 'completed' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          ✅ Đã hoàn thành
          <span className={styles.tabBadge}>{completed.length}</span>
        </button>
        <button
          id="tab-in-progress"
          className={`${styles.tab} ${activeTab === 'in_progress' ? styles.tabActive : ''} ${inProgress.length > 0 ? styles.tabInProgressHasItems : ''}`}
          onClick={() => setActiveTab('in_progress')}
        >
          ⏸ Chưa hoàn thành
          {inProgress.length > 0 && (
            <span className={`${styles.tabBadge} ${styles.tabBadgeOrange}`}>{inProgress.length}</span>
          )}
        </button>
      </div>

      {/* ── Tab: Đã hoàn thành ── */}
      {activeTab === 'completed' && (
        <>
          {completed.length === 0 ? (
            <div className={styles.empty}>
              <p style={{ fontSize: '3rem' }}>📝</p>
              <p>Bạn chưa hoàn thành bài thi nào.</p>
              <button className={styles.btnStart} onClick={() => router.push('/exams')}>
                Bắt đầu thi ngay
              </button>
            </div>
          ) : (
            <div className={styles.historyList}>
              {completed.map((sub) => (
                <div key={sub._id} className={styles.historyCard}>
                  <div className={styles.levelBadge}>{sub.examId?.level || 'N?'}</div>
                  <div className={styles.historyInfo}>
                    <div className={styles.historyTitle}>{sub.examId?.title || 'Đề thi'}</div>
                    <div className={styles.historyMeta}>
                      🕒 {formatDate(sub.createdAt)} &nbsp;·&nbsp;
                      ⏱ {formatTime(sub.timeSpent)} &nbsp;·&nbsp;
                      ✅ {sub.correctCount}/{sub.totalQuestions} câu đúng
                    </div>
                  </div>
                  <span className={`${styles.scoreChip} ${sub.score >= 50 ? styles.passed : styles.failed}`}>
                    {Math.round(sub.score)}đ
                  </span>
                  <button
                    className={styles.btnReview}
                    onClick={() => router.push(`/review/${sub._id}`)}
                  >
                    Xem lại
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Tab: Chưa hoàn thành ── */}
      {activeTab === 'in_progress' && (
        <>
          {inProgress.length === 0 ? (
            <div className={styles.empty}>
              <p style={{ fontSize: '3rem' }}>⏸</p>
              <p>Bạn không có bài thi nào đang làm dở.</p>
              <button className={styles.btnStart} onClick={() => router.push('/exams')}>
                Bắt đầu thi ngay
              </button>
            </div>
          ) : (
            <div className={styles.historyList}>
              {inProgress.map((sub) => {
                const answeredCount = Object.keys(sub.answers ?? {}).length;
                const progressPct = sub.totalQuestions > 0
                  ? Math.round((answeredCount / sub.totalQuestions) * 100)
                  : 0;
                return (
                  <div key={sub._id} className={`${styles.historyCard} ${styles.historyCardInProgress}`}>
                    <div className={`${styles.levelBadge} ${styles.levelBadgeInProgress}`}>
                      {sub.examId?.level || 'N?'}
                    </div>
                    <div className={styles.historyInfo}>
                      <div className={styles.historyTitle}>{sub.examId?.title || 'Đề thi'}</div>
                      <div className={styles.historyMeta}>
                        🕒 Lưu lúc: {formatDate(sub.updatedAt)} &nbsp;·&nbsp;
                        ⏳ Còn lại: {formatTimeLeft(sub.timeLeft ?? 0)}
                      </div>
                      {/* Progress bar */}
                      <div className={styles.inProgressBar}>
                        <div
                          className={styles.inProgressFill}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <span className={styles.inProgressText}>
                        {answeredCount}/{sub.totalQuestions} câu đã trả lời ({progressPct}%)
                      </span>
                    </div>
                    <button
                      className={styles.btnContinue}
                      onClick={() => router.push(`/exam/${sub.examId?._id}`)}
                    >
                      ▶ Tiếp tục
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
