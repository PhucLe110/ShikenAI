'use client';

import React from 'react';
import styles from './AdminModal.module.css';

interface AdminModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'info' | 'success';
  size?: 'small' | 'medium' | 'large';
  children?: React.ReactNode;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  show, onClose, onConfirm, title, message, 
  confirmText = 'Xác nhận', cancelText = 'Hủy', 
  type = 'info', size = 'medium', children
}) => {
  if (!show) return null;

  return (
    <div className={styles.overlay}>
      <div className={`${styles.modal} ${styles[size]}`}>
        <div className={styles.header}>
          <h3>{title}</h3>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>
        <div className={styles.body}>
          {message && <p>{message}</p>}
          {children}
        </div>
        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>{cancelText}</button>
          <button 
            className={`${styles.confirmBtn} ${styles[type]}`} 
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
