'use client';

import React, { useState, useEffect } from 'react';
import styles from './LockedOverlay.module.css';
import api from '@/services/api';
import { useRouter } from 'next/navigation';

export default function LockedOverlay() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [unlockMessage, setUnlockMessage] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkStatus = async () => {
      const userInfo = localStorage.getItem('userInfo');
      if (!userInfo) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get('/users/profile');
        setUser(data);
        // Update local storage to keep it in sync
        const currentLocal = JSON.parse(userInfo);
        localStorage.setItem('userInfo', JSON.stringify({ ...currentLocal, isLocked: data.isLocked }));
      } catch (error) {
        console.error('Failed to check lock status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
    
    window.addEventListener('userStatusChanged', checkStatus);
    
    // Check every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    return () => {
      clearInterval(interval);
      window.removeEventListener('userStatusChanged', checkStatus);
    };
  }, []);

  const handleUnlockRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('message', unlockMessage);
      if (proofFile) {
        formData.append('file', proofFile);
      } else if (proofUrl) {
        formData.append('proofUrl', proofUrl);
      }

      await api.post('/users/request-unlock', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setShowSuccess(true);
      // Refresh user data after a delay to show the pending status
      setTimeout(async () => {
        const { data } = await api.get('/users/profile');
        setUser(data);
        setShowSuccess(false);
      }, 3000);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    window.location.href = '/';
  };

  if (loading || !user?.isLocked) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.icon}>⚠️</div>
        <h2 className={styles.title}>Tài khoản của bạn tạm thời bị khóa</h2>
        <p className={styles.reason}>
          <strong>Lý do:</strong> {user.lockReason || 'Vi phạm điều khoản hệ thống hoặc phát hiện gian lận.'}
        </p>
        
        <div className={styles.unlockSection}>
          {showSuccess ? (
            <div className={styles.successBox}>
              <div className={styles.successIcon}>✅</div>
              <h4>Gửi kháng nghị thành công!</h4>
              <p>Yêu cầu của bạn đã được chuyển đến Admin. Vui lòng đợi kết quả phê duyệt.</p>
            </div>
          ) : user.unlockRequest?.status === 'pending' ? (
            <div className={styles.pendingBox}>
              ⏱ Yêu cầu mở khóa của bạn đang chờ Admin phê duyệt.
            </div>
          ) : (
            <form onSubmit={handleUnlockRequest} className={styles.form}>
              <p className={styles.hint}>Nếu đây là nhầm lẫn, vui lòng gửi kháng nghị kèm minh chứng:</p>
              <textarea 
                placeholder="Lý do kháng nghị..." 
                required 
                value={unlockMessage}
                onChange={e => setUnlockMessage(e.target.value)}
              />
              
              <div className={styles.uploadOptions}>
                <div className={styles.uploadField}>
                  <label>📸 Tải tệp lên (Ảnh/Video)</label>
                  <input 
                    type="file" 
                    onChange={e => setProofFile(e.target.files?.[0] || null)}
                    className={styles.fileInput}
                  />
                </div>
                <div className={styles.divider}>Hoặc</div>
                <input 
                  type="url" 
                  placeholder="Link minh chứng (Drive/Youtube...)" 
                  value={proofUrl}
                  onChange={e => setProofUrl(e.target.value)}
                  disabled={!!proofFile}
                />
              </div>

              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu kháng nghị'}
              </button>
            </form>
          )}
        </div>

        <button className={styles.btnLogout} onClick={logout}>Đăng xuất</button>
      </div>
    </div>
  );
}
