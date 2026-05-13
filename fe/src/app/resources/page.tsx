'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { getResources, uploadResource, checkEligibility, ResourceItem } from '@/services/resourceService';

export default function ResourcesPage() {
  const router = useRouter();
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'admin' | 'user'>('all');

  // Upload form
  const [title, setTitle] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileType, setFileType] = useState('pdf');
  const [uploadType, setUploadType] = useState<'link' | 'file'>('link');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState<ResourceItem | null>(null);
  
  // Notification state
  const [notification, setNotification] = useState<{show: boolean, title: string, message: string, type: 'success' | 'error' | 'warning'}>({
    show: false,
    title: '',
    message: '',
    type: 'success'
  });

  const showNotify = (title: string, message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setNotification({ show: true, title, message, type });
  };

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      router.push('/');
      setTimeout(() => {
        window.dispatchEvent(new Event('openAuthModal'));
      }, 100);
      return;
    }
    setUser(JSON.parse(userInfo));
    fetchResources();
  }, [router]);

  const fetchResources = async () => {
    try {
      const data = await getResources();
      setResources(data);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      
      if (uploadType === 'file' && file) {
        formData.append('file', file);
      } else if (uploadType === 'link') {
        formData.append('fileUrl', fileUrl);
        formData.append('fileType', fileType);
      } else {
        showNotify('Lưu ý', 'Vui lòng chọn tệp hoặc nhập link', 'warning');
        return;
      }

      await uploadResource(formData);
      
      // Fetch latest count to show in notification
      const { uploadedDocs } = await checkEligibility();
      const remaining = Math.max(0, 3 - (uploadedDocs || 0));
      
      let msg = 'Tài liệu của bạn đã được tải lên. Vui lòng chờ Admin phê duyệt.';
      if (remaining > 0) {
        msg += ` Bạn cần thêm ${remaining} tài liệu ĐÃ ĐƯỢC DUYỆT nữa để có thể tải các tài nguyên khác.`;
      } else {
        msg += ' Bạn đã đủ điều kiện để tải các tài nguyên khác!';
      }

      showNotify('Thành công!', msg, 'success');
      setShowUploadModal(false);
      setTitle('');
      setFileUrl('');
      setFile(null);
      fetchResources();
    } catch (error: any) {
      showNotify('Lỗi!', error.response?.data?.message || 'Có lỗi xảy ra trong quá trình tải lên.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = async (resource: ResourceItem) => {
    if (!user) {
      showNotify('Yêu cầu đăng nhập', 'Vui lòng đăng nhập để có thể tải tài nguyên.', 'warning');
      return;
    }

    try {
      const { canDownload, reason } = await checkEligibility();
      if (canDownload) {
        window.open(resource.fileUrl, '_blank');
      } else {
        showNotify('Chưa đủ điều kiện', reason || 'Bạn cần đóng góp thêm tài liệu để tải về.', 'warning');
      }
    } catch (error) {
      showNotify('Lỗi!', 'Có lỗi xảy ra khi kiểm tra quyền tải về.', 'error');
    }
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    // Xử lý link Google Drive
    if (url.includes('drive.google.com')) {
      const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (fileIdMatch && fileIdMatch[1]) {
        return `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
      }
    }
    return url;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Kho tài nguyên học tập</h1>
          <p className={styles.subtitle}>Tải xuống các tài liệu, đề thi PDF/DOC được chia sẻ bởi cộng đồng.</p>
        </div>
        <button 
          className={styles.btnUpload}
          onClick={() => {
            if (!user) alert('Vui lòng đăng nhập để đóng góp tài liệu');
            else setShowUploadModal(true);
          }}
        >
          📤 Đóng góp tài liệu
        </button>
      </div>

      <div className={styles.infoBox}>
        <strong>💡 Quy định tải tài nguyên:</strong> Để tải được các tài liệu trong kho, bạn cần đóng góp ít nhất <strong>3 tài liệu</strong> (PDF/DOC) của riêng mình. Nếu chưa đủ số lượng, bạn chỉ có thể xem trực tuyến.
      </div>

      <div className={styles.controls}>
        <div className={styles.searchBar}>
          <span className={styles.searchIcon}>🔍</span>
          <input 
            type="text" 
            placeholder="Tìm kiếm tài liệu (ví dụ: Đề thi N3, Kanji...)" 
            className={styles.searchInput}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className={styles.filterTabs}>
          <button 
            className={`${styles.filterBtn} ${activeFilter === 'all' ? styles.activeFilter : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            Tất cả
          </button>
          <button 
            className={`${styles.filterBtn} ${activeFilter === 'admin' ? styles.activeFilter : ''}`}
            onClick={() => setActiveFilter('admin')}
          >
            Hệ thống
          </button>
          <button 
            className={`${styles.filterBtn} ${activeFilter === 'user' ? styles.activeFilter : ''}`}
            onClick={() => setActiveFilter('user')}
          >
            Cộng đồng
          </button>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>Đang tải danh sách tài nguyên...</div>
      ) : (
        <div className={styles.resourceGrid}>
          {resources
            .filter(res => {
              const matchesSearch = res.title.toLowerCase().includes(searchTerm.toLowerCase());
              const matchesFilter = activeFilter === 'all' || res.role === activeFilter;
              return matchesSearch && matchesFilter;
            })
            .map(res => (
            <div key={res._id} className={styles.resourceCard}>
              <div className={styles.fileIcon}>
                {res.fileType === 'pdf' ? '📄' : '📝'}
              </div>
              <div className={styles.resourceInfo}>
                <div className={styles.titleWrapper}>
                  <h3 className={styles.resourceTitle}>{res.title}</h3>
                  <span className={`${styles.badge} ${res.role === 'admin' ? styles.adminBadge : styles.userBadge}`}>
                    {res.role === 'admin' ? 'Hệ thống' : 'Người dùng'}
                  </span>
                </div>
                <div className={styles.meta}>
                  <span>👤 {res.uploaderName}</span>
                  <span>📅 {new Date(res.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className={styles.cardActions}>
                <button 
                  className={styles.btnPreview} 
                  onClick={() => setSelectedPreview(res)}
                >
                  👁️ Xem
                </button>
                <button 
                  className={styles.btnDownload}
                  onClick={() => handleDownload(res)}
                >
                  📥 Tải về
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showUploadModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button className={styles.closeBtn} onClick={() => setShowUploadModal(false)}>×</button>
            <h2 className={styles.modalTitle}>Đóng góp tài liệu mới</h2>
            <form onSubmit={handleUpload}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Tiêu đề tài liệu</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  placeholder="Ví dụ: Đề thi N3 tháng 7/2023"
                  required 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Cách thức đóng góp</label>
                <div className={styles.uploadTypeTabs}>
                  <button 
                    type="button"
                    className={`${styles.typeBtn} ${uploadType === 'link' ? styles.activeType : ''}`}
                    onClick={() => setUploadType('link')}
                  >
                    🔗 Link Drive/Dropbox
                  </button>
                  <button 
                    type="button"
                    className={`${styles.typeBtn} ${uploadType === 'file' ? styles.activeType : ''}`}
                    onClick={() => setUploadType('file')}
                  >
                    📁 Tải tệp trực tiếp
                  </button>
                </div>
              </div>

              {uploadType === 'link' ? (
                <>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Link tài liệu (URL)</label>
                    <input 
                      type="url" 
                      className={styles.input} 
                      placeholder="Dán link Google Drive hoặc Dropbox của bạn"
                      required 
                      value={fileUrl} 
                      onChange={e => setFileUrl(e.target.value)} 
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Định dạng</label>
                    <select 
                      className={styles.input} 
                      value={fileType} 
                      onChange={e => setFileType(e.target.value)}
                    >
                      <option value="pdf">PDF</option>
                      <option value="doc">DOC</option>
                      <option value="docx">DOCX</option>
                    </select>
                  </div>
                </>
              ) : (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Chọn tệp (PDF/DOC/DOCX)</label>
                  <input 
                    type="file" 
                    className={styles.input} 
                    accept=".pdf,.doc,.docx"
                    required 
                    onChange={e => setFile(e.target.files?.[0] || null)} 
                  />
                </div>
              )}
              <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                {isSubmitting ? 'Đang tải lên...' : 'Tải lên ngay'}
              </button>
              
              <div className={styles.uploadWarning}>
                ⚠️ <strong>Cảnh báo:</strong> Nếu tài nguyên tải lên không phù hợp hoặc vi phạm bản quyền, tài khoản của bạn có thể bị Admin khóa hoặc xóa vĩnh viễn mà không cần báo trước.
              </div>
            </form>
          </div>
        </div>
      )}

      {notification.show && (
        <div className={`${styles.modalOverlay} ${styles.notificationOverlay}`}>
          <div className={styles.notifyContent}>
            <div className={`${styles.notifyIcon} ${styles[notification.type]}`}>
              {notification.type === 'success' ? '✅' : notification.type === 'error' ? '❌' : '⚠️'}
            </div>
            <h2 className={styles.notifyTitle}>{notification.title}</h2>
            <p className={styles.notifyMessage}>{notification.message}</p>
            <button 
              className={styles.notifyBtn} 
              onClick={() => setNotification({ ...notification, show: false })}
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}
      {selectedPreview && (
        <div className={styles.modalOverlay} onClick={() => setSelectedPreview(null)}>
          <div className={styles.previewModal} onClick={e => e.stopPropagation()}>
            <div className={styles.previewHeader}>
              <h3 className={styles.previewTitle}>{selectedPreview.title}</h3>
              <button className={styles.previewClose} onClick={() => setSelectedPreview(null)}>×</button>
            </div>
            <div className={styles.previewBody}>
              <iframe 
                src={getEmbedUrl(selectedPreview.fileUrl)} 
                className={styles.previewIframe}
                title="Resource Preview"
                allow="autoplay"
              />
            </div>
            <div className={styles.previewFooter}>
              <button className={styles.btnDownloadLarge} onClick={() => handleDownload(selectedPreview)}>
                📥 Tải tài liệu về máy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
