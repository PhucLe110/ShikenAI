'use client';

import React, { useState, useEffect } from 'react';
import styles from './page.module.css';
import { 
  getUsers, lockUser, unlockUser, handleUnlockRequest,
  getPendingResources, updateResourceStatus, deleteResource,
  getExamDetail, updateExam, deleteExam, toggleExamVisibility 
} from '@/services/adminService';
import { getExams } from '@/services/examService'; // Need this to list exams
import { getResources } from '@/services/resourceService';
import { AdminModal } from '@/components/admin/AdminModal';

type AdminTab = 'users' | 'resources' | 'exams';
type ModalState = {
  show: boolean;
  type: 'lock' | 'unlock' | 'deleteResource' | 'deleteExam' | 'previewExam' | 'previewResource' | 'viewAppeal';
  data: any;
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [pendingResources, setPendingResources] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [modal, setModal] = useState<ModalState>({ show: false, type: 'lock', data: null });
  const [lockReason, setLockReason] = useState('');
  const [editingData, setEditingData] = useState<any>({ title: '', duration: 0, isHidden: false });
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const data = await getUsers();
        setUsers(data);
      } else if (activeTab === 'resources') {
        const [all, pending] = await Promise.all([getResources(), getPendingResources()]);
        setResources(all);
        setPendingResources(pending);
      } else if (activeTab === 'exams') {
        const data = await getExams();
        setExams(data);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers ---
  const handleLock = (user: any) => {
    setModal({ show: true, type: 'lock', data: user });
    setLockReason('');
  };

  const confirmLock = async () => {
    if (lockReason) {
      await lockUser(modal.data._id, lockReason);
      setModal({ ...modal, show: false });
      fetchData();
    }
  };

  const handleUnlock = (user: any) => {
    setModal({ show: true, type: 'unlock', data: user });
  };

  const confirmUnlock = async () => {
    await unlockUser(modal.data._id);
    setModal({ ...modal, show: false });
    fetchData();
  };

  const handleResourceStatus = async (resourceId: string, status: 'approved' | 'rejected') => {
    await updateResourceStatus(resourceId, status);
    fetchData();
  };

  const onHandleUnlockRequest = async (userId: string, status: 'approved' | 'rejected') => {
    await handleUnlockRequest(userId, status);
    fetchData();
  };

  const handleDeleteResource = (resource: any) => {
    setModal({ show: true, type: 'deleteResource', data: resource });
  };

  const confirmDeleteResource = async () => {
    await deleteResource(modal.data._id);
    setModal({ ...modal, show: false });
    fetchData();
  };

  const handleToggleExam = async (examId: string) => {
    await toggleExamVisibility(examId);
    fetchData();
  };

  const handleDeleteExam = (exam: any) => {
    setModal({ show: true, type: 'deleteExam', data: exam });
  };

  const confirmDeleteExam = async () => {
    await deleteExam(modal.data._id);
    setModal({ ...modal, show: false });
    fetchData();
  };

  const handlePreviewExam = async (exam: any) => {
    // Fetch full details for preview (including all questions)
    try {
      const fullDetail = await getExamDetail(exam._id);
      setModal({ show: true, type: 'previewExam', data: fullDetail });
      setEditingData({ 
        title: fullDetail.title, 
        duration: fullDetail.duration,
        isHidden: fullDetail.isHidden 
      });
    } catch (error) {
      console.error('Error fetching exam details:', error);
    }
  };

  const handleSaveExam = async () => {
    try {
      await updateExam(modal.data._id, editingData);
      setModal({ ...modal, show: false });
      fetchData();
    } catch (error) {
      console.error('Error updating exam:', error);
    }
  };

  const handlePreviewResource = (resource: any) => {
    setModal({ show: true, type: 'previewResource', data: resource });
  };

  const handleViewAppeal = (user: any) => {
    setModal({ show: true, type: 'viewAppeal', data: user });
  };

  const groupedExams = ['N5', 'N4', 'N3', 'N2', 'N1'].reduce((acc, level) => {
    acc[level] = exams.filter(e => e.level === level);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Bảng điều khiển Quản trị</h1>
      
      <div className={styles.tabs}>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'users' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Người dùng
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'resources' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('resources')}
        >
          📂 Tài nguyên
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'exams' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('exams')}
        >
          📝 Đề thi
        </button>
      </div>

      <div className={styles.content}>
        {loading ? (
          <div className={styles.loading}>Đang tải dữ liệu...</div>
        ) : (
          <>
            {activeTab === 'users' && (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Tên</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Trạng thái</th>
                    <th>Yêu cầu mở khóa</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.role}</td>
                      <td>
                        {u.isLocked ? (
                          <span className={styles.lockedLabel}>Bị khóa</span>
                        ) : (
                          <span className={styles.activeLabel}>Hoạt động</span>
                        )}
                      </td>
                      <td>
                        {u.unlockRequest?.status === 'pending' && (
                          <div className={styles.requestCell}>
                            <button onClick={() => handleViewAppeal(u)} className={styles.btnViewSmall}>
                              📄 Xem kháng nghị
                            </button>
                          </div>
                        )}
                      </td>
                      <td>
                        {u.role !== 'admin' && (
                          u.isLocked ? (
                            <button onClick={() => handleUnlock(u)} className={styles.btnUnlock}>Mở khóa</button>
                          ) : (
                            <button onClick={() => handleLock(u)} className={styles.btnLock}>Khóa</button>
                          )
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'resources' && (
              <div>
                <h3>Yêu cầu phê duyệt ({pendingResources.length})</h3>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Tiêu đề</th>
                      <th>Người đăng</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingResources.map(r => (
                      <tr key={r._id}>
                        <td>{r.title}</td>
                        <td>{r.uploaderName}</td>
                        <td>
                          <button onClick={() => handlePreviewResource(r)} className={styles.btnPreview}>
                            🔍 Xem & Phê duyệt
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <h3 style={{marginTop: '40px'}}>Tất cả tài nguyên ({resources.length})</h3>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Tiêu đề</th>
                      <th>Trạng thái</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resources.map(r => (
                      <tr key={r._id}>
                        <td>{r.title}</td>
                        <td>{r.status}</td>
                        <td>
                          <button onClick={() => handlePreviewResource(r)} className={styles.btnPreview}>Xem</button>
                          <button onClick={() => handleDeleteResource(r)} className={styles.btnDelete}>Xóa</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'exams' && (
              <div className={styles.examsList}>
                {['N5', 'N4', 'N3', 'N2', 'N1'].map(level => (
                  <section key={level} className={styles.levelSection}>
                    <div className={styles.levelHeaderBox}>
                      <h3 className={styles.levelHeader}>{level}</h3>
                      <span className={styles.levelCount}>{groupedExams[level]?.length || 0} đề thi</span>
                    </div>
                    <div className={styles.examGrid}>
                      {groupedExams[level]?.map(e => (
                        <div key={e._id} className={styles.examCard}>
                          <div className={styles.examHeader}>
                            <div className={styles.examMainInfo}>
                              <div className={styles.examTitle}>{e.title}</div>
                              <div className={styles.examMeta}>
                                <span>⏱ {e.duration}p</span>
                                <span>📝 {e.questionCount || 0} câu</span>
                              </div>
                            </div>
                            <div className={styles.examBadge}>
                              {e.isHidden ? (
                                <span className={styles.badgeHidden}>Đang ẩn</span>
                              ) : (
                                <span className={styles.badgeVisible}>Đang hiện</span>
                              )}
                            </div>
                          </div>
                          
                            <button 
                              className={styles.btnManage}
                              onClick={() => handlePreviewExam(e)}
                            >
                              ⚙️ Quản lý
                            </button>
                        </div>
                      ))}
                      {groupedExams[level]?.length === 0 && (
                        <div className={styles.emptyState}>Chưa có đề thi nào cho trình độ {level}.</div>
                      )}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* --- Modals --- */}
      <AdminModal
        key="modal-lock"
        show={modal.show && modal.type === 'lock'}
        onClose={() => setModal({ ...modal, show: false })}
        onConfirm={confirmLock}
        title="Khóa người dùng"
        type="danger"
        confirmText="Khóa ngay"
      >
        <p>Xác nhận khóa tài khoản <strong>{modal.data?.name}</strong>?</p>
        <textarea 
          className={styles.modalTextarea}
          placeholder="Nhập lý do khóa..."
          value={lockReason}
          onChange={e => setLockReason(e.target.value)}
        />
      </AdminModal>

      <AdminModal
        key="modal-unlock"
        show={modal.show && modal.type === 'unlock'}
        onClose={() => setModal({ ...modal, show: false })}
        onConfirm={confirmUnlock}
        title="Mở khóa người dùng"
        type="success"
        confirmText="Mở khóa"
      >
        <p>Xác nhận mở khóa cho tài khoản <strong>{modal.data?.name}</strong>?</p>
      </AdminModal>

      <AdminModal
        key="modal-delete-resource"
        show={modal.show && modal.type === 'deleteResource'}
        onClose={() => setModal({ ...modal, show: false })}
        onConfirm={confirmDeleteResource}
        title="Xóa tài nguyên"
        type="danger"
        confirmText="Xóa vĩnh viễn"
      >
        <p>Bạn có chắc chắn muốn xóa tài nguyên <strong>{modal.data?.title}</strong>? Thao tác này không thể hoàn tác.</p>
      </AdminModal>

      <AdminModal
        key="modal-delete-exam"
        show={modal.show && modal.type === 'deleteExam'}
        onClose={() => setModal({ ...modal, show: false })}
        onConfirm={confirmDeleteExam}
        title="Xóa đề thi"
        type="danger"
        confirmText="Xóa vĩnh viễn"
      >
        <p>Bạn có chắc chắn muốn xóa đề thi <strong>{modal.data?.title}</strong>? Tất cả dữ liệu bài làm liên quan cũng sẽ bị ảnh hưởng.</p>
      </AdminModal>

      <AdminModal
        key="modal-preview-exam"
        show={modal.show && modal.type === 'previewExam'}
        onClose={() => setModal({ ...modal, show: false })}
        onConfirm={handleSaveExam}
        title="Chi tiết & Chỉnh sửa đề thi"
        confirmText="Lưu thay đổi"
        size="large"
      >
        <div className={styles.editLayout}>
          <div className={styles.editSidebar}>
            <h4>Thông tin chung</h4>
            <div className={styles.inputGroup}>
              <label>Tên đề thi</label>
              <input 
                type="text" 
                value={editingData.title}
                onChange={e => setEditingData({ ...editingData, title: e.target.value })}
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Thời gian (phút)</label>
              <input 
                type="number" 
                value={editingData.duration}
                onChange={e => setEditingData({ ...editingData, duration: parseInt(e.target.value) })}
              />
            </div>
            <div className={styles.examStats}>
              <div>Cấp độ: <strong>{modal.data?.level}</strong></div>
              <div>Số câu: <strong>{modal.data?.questions?.length || 0}</strong></div>
            </div>

            <div className={styles.sideActions}>
              <h4>Trạng thái hiển thị</h4>
              <div className={styles.statusRow}>
                {editingData.isHidden ? (
                  <span className={styles.badgeHidden}>Hệ thống đang ẩn</span>
                ) : (
                  <span className={styles.badgeVisible}>Đang hiển thị</span>
                )}
                <button 
                  onClick={() => setEditingData({ ...editingData, isHidden: !editingData.isHidden })}
                  className={`${styles.toggleBtn} ${editingData.isHidden ? styles.toggleBtnVisible : styles.toggleBtnHidden}`}
                >
                  {editingData.isHidden ? '👁️ Hiện đề' : '🚫 Ẩn đề'}
                </button>
              </div>

              <h4 style={{marginTop: '25px'}}>Gỡ bỏ dữ liệu</h4>
              <button 
                onClick={() => handleDeleteExam(modal.data)}
                className={styles.sideBtnDelete}
              >
                🗑️ Xóa vĩnh viễn đề thi
              </button>
            </div>
          </div>
          
          <div className={styles.editMain}>
            <h4>Danh sách câu hỏi</h4>
            <div className={styles.previewQuestions}>
              {modal.data?.questions?.map((q: any, i: number) => (
                <div key={i} className={styles.previewQ}>
                  <p><strong>Câu {i+1}:</strong> {q.text}</p>
                  <div className={styles.previewOptions}>
                    {q.options?.map((opt: string, j: number) => (
                      <div key={j} className={q.correctAnswer === opt ? styles.correctOpt : ''}>
                        - {opt} {q.correctAnswer === opt && '✅'}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AdminModal>

      <AdminModal
        key="modal-preview-resource"
        show={modal.show && modal.type === 'previewResource'}
        onClose={() => setModal({ ...modal, show: false })}
        onConfirm={() => setModal({ ...modal, show: false })}
        title="Xem trước tài nguyên"
        confirmText="Đóng"
        size="large"
      >
        <div className={styles.previewBox}>
          <div className={styles.resourceHeader}>
            <div className={styles.resourceIcon}>
              {modal.data?.fileType === 'pdf' ? '📕' : '📘'}
            </div>
            <div className={styles.resourceMainInfo}>
              <h3>{modal.data?.title}</h3>
              <p className={styles.resourceUploader}>Người đăng: <strong>{modal.data?.uploaderName}</strong></p>
            </div>
          </div>

          <div className={styles.resourceViewer}>
            {modal.data?.fileUrl ? (() => {
              let previewUrl = modal.data.fileUrl;
              
              // Handle Google Drive links
              if (previewUrl.includes('drive.google.com')) {
                previewUrl = previewUrl.replace(/\/view(\?.*)?$/, '/preview');
                if (!previewUrl.endsWith('/preview')) {
                  // Handle cases where ID might be followed by other params
                  const match = previewUrl.match(/\/d\/([^\/]+)/);
                  if (match) {
                    previewUrl = `https://drive.google.com/file/d/${match[1]}/preview`;
                  }
                }
              } else if (modal.data.fileType !== 'pdf') {
                // Use Google Docs viewer for non-PDFs
                previewUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(previewUrl)}&embedded=true`;
              } else {
                // PDF direct link
                previewUrl = `${previewUrl}#toolbar=0`;
              }

              return (
                <div style={{height: '100%', position: 'relative'}}>
                  <iframe 
                    src={previewUrl} 
                    className={styles.docIframe}
                    title="Resource Preview"
                  />
                  <div className={styles.viewerOverlay}>
                    <a href={modal.data.fileUrl} target="_blank" rel="noreferrer" className={styles.openDirectBtn}>
                      ↗️ Mở trong tab mới
                    </a>
                  </div>
                </div>
              );
            })() : (
              <div className={styles.noFile}>Không tìm thấy tệp tin</div>
            )}
          </div>

          <div className={styles.resourceDetails}>
            <div className={styles.detailRow}>
              <span>Loại tệp:</span>
              <span className={styles.fileBadge}>{modal.data?.fileType?.toUpperCase()}</span>
            </div>
            <div className={styles.detailRow}>
              <span>Trạng thái:</span>
              <span className={`${styles.statusBadge} ${styles[modal.data?.status]}`}>
                {modal.data?.status === 'pending' ? '⏳ Chờ duyệt' : 
                 modal.data?.status === 'approved' ? '✅ Đã duyệt' : '❌ Đã từ chối'}
              </span>
            </div>
          </div>

          {modal.data?.status === 'pending' && (
            <div className={styles.appealFooter} style={{marginTop: '30px'}}>
              <button 
                onClick={() => {
                  handleResourceStatus(modal.data._id, 'approved');
                  setModal({ ...modal, show: false });
                }} 
                className={styles.btnApproveLarge}
              >
                ✅ Phê duyệt tài liệu
              </button>
              <button 
                onClick={() => {
                  handleResourceStatus(modal.data._id, 'rejected');
                  setModal({ ...modal, show: false });
                }} 
                className={styles.btnRejectLarge}
              >
                ❌ Từ chối / Xóa
              </button>
            </div>
          )}
        </div>
      </AdminModal>

      <AdminModal
        key="modal-view-appeal"
        show={modal.show && modal.type === 'viewAppeal'}
        onClose={() => setModal({ ...modal, show: false })}
        onConfirm={() => setModal({ ...modal, show: false })}
        title="Chi tiết kháng nghị"
        confirmText="Đóng"
        size="medium"
      >
        <div className={styles.appealDetail}>
          <div className={styles.appealSection}>
            <h4>Lý do kháng nghị:</h4>
            <p className={styles.appealMsg}>{modal.data?.unlockRequest?.message}</p>
          </div>
          
          {modal.data?.unlockRequest?.proofUrl && (
            <div className={styles.appealSection}>
              <h4>Minh chứng kèm theo:</h4>
              <div className={styles.proofBox}>
                {modal.data.unlockRequest.proofUrl.match(/\.(jpeg|jpg|gif|png)$/) ? (
                  <img src={modal.data.unlockRequest.proofUrl} alt="Minh chứng" className={styles.proofImg} />
                ) : modal.data.unlockRequest.proofUrl.match(/\.(mp4|webm|ogg)$/) ? (
                  <video controls className={styles.proofVideo}>
                    <source src={modal.data.unlockRequest.proofUrl} />
                  </video>
                ) : (
                  <div className={styles.proofLinkBox}>
                    <p>Tệp tin hoặc đường dẫn:</p>
                    <a href={modal.data.unlockRequest.proofUrl} target="_blank" rel="noreferrer" className={styles.proofLink}>
                      🔗 {modal.data.unlockRequest.proofUrl}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className={styles.appealFooter}>
            <button 
              onClick={() => {
                onHandleUnlockRequest(modal.data._id, 'approved');
                setModal({ ...modal, show: false });
              }} 
              className={styles.btnApproveLarge}
            >
              ✅ Duyệt mở khóa
            </button>
            <button 
              onClick={() => {
                onHandleUnlockRequest(modal.data._id, 'rejected');
                setModal({ ...modal, show: false });
              }} 
              className={styles.btnRejectLarge}
            >
              ❌ Từ chối
            </button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
