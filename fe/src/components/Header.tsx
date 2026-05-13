'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import styles from './Header.module.css';
import api from '@/services/api';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [user, setUser] = useState<{name: string, role: string} | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }

    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }

    const handleOpenAuth = () => {
      setIsLoginMode(true);
      setShowAuthModal(true);
    };
    window.addEventListener('openAuthModal', handleOpenAuth);
    return () => window.removeEventListener('openAuthModal', handleOpenAuth);
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isLoginMode) {
        const { data } = await api.post('/auth/login', { email, password });
        localStorage.setItem('userInfo', JSON.stringify(data));
        setUser(data);
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
        window.dispatchEvent(new Event('userStatusChanged'));
      } else {
        const { data } = await api.post('/auth/register', { name, email, password });
        localStorage.setItem('userInfo', JSON.stringify(data));
        setUser(data);
        window.dispatchEvent(new Event('userStatusChanged'));
      }
      // Clear fields after success
      setPassword('');
      setError('');
      setShowAuthModal(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
    setEmail('');
    setPassword('');
    setName('');
    router.push('/');
  };

  const handleProtectedLink = (e: React.MouseEvent, href: string) => {
    if (!user) {
      e.preventDefault();
      setIsLoginMode(true);
      setShowAuthModal(true);
    }
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.logo} onClick={() => router.push('/')} style={{cursor: 'pointer'}}>
          ⛩️ ShikenAI
        </div>
        <nav className={styles.nav}>
          <Link href="/" className={`${styles.navLink} ${pathname === '/' ? styles.active : ''}`}>Trang chủ</Link>
          <Link href="/exams" className={`${styles.navLink} ${pathname === '/exams' ? styles.active : ''}`} onClick={(e) => handleProtectedLink(e, '/exams')}>Đề thi</Link>
          <Link href="/practice" className={`${styles.navLink} ${pathname === '/practice' ? styles.active : ''}`} onClick={(e) => handleProtectedLink(e, '/practice')}>Luyện tập</Link>
          <Link href="/resources" className={`${styles.navLink} ${pathname === '/resources' ? styles.active : ''}`} onClick={(e) => handleProtectedLink(e, '/resources')}>Tài nguyên</Link>
          <Link href="/about" className={`${styles.navLink} ${pathname === '/about' ? styles.active : ''}`}>Giới thiệu</Link>
          {user?.role === 'admin' && (
            <Link 
              href="/admin" 
              className={`${styles.navLink} ${pathname.startsWith('/admin') ? styles.activeAdmin : ''}`} 
              style={{color: '#ff4757', fontWeight: 'bold'}}
            >
              Quản trị
            </Link>
          )}
        </nav>
        <div className={styles.authButtons}>
          {user ? (
            <div className={styles.userSection}>
              <div
                className={styles.userInfo}
                onClick={() => router.push('/profile')}
                style={{cursor: 'pointer'}}
              >
                <div className={styles.avatar}>
                  {(user.name || 'U').charAt(0).toUpperCase()}
                </div>
                <span className={styles.userName}>{user.name}</span>
              </div>
              <button className={styles.btnLogout} onClick={logout}>Đăng xuất</button>
            </div>
          ) : (
            <>
              <button className={styles.btnLogin} onClick={() => { setIsLoginMode(true); setShowAuthModal(true); }}>
                Đăng nhập
              </button>
              <button className={styles.btnRegister} onClick={() => { setIsLoginMode(false); setShowAuthModal(true); }}>
                Đăng ký
              </button>
            </>
          )}
        </div>
      </header>

      {showAuthModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button className={styles.closeBtn} onClick={() => setShowAuthModal(false)}>×</button>
            <h2 className={styles.modalTitle}>{isLoginMode ? 'Đăng nhập' : 'Đăng ký tài khoản'}</h2>
            
            {error && <div style={{color: 'red', marginBottom: '15px', textAlign: 'center'}}>{error}</div>}

            <form onSubmit={handleAuth}>
              {!isLoginMode && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Họ tên</label>
                  <input type="text" className={styles.input} required value={name} onChange={e => setName(e.target.value)} />
                </div>
              )}
              <div className={styles.formGroup}>
                <label className={styles.label}>Email</label>
                <input type="email" className={styles.input} required value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Mật khẩu</label>
                <div className={styles.passwordWrapper}>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    className={styles.input} 
                    required 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                  />
                  <button 
                    type="button" 
                    className={styles.eyeBtn}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '👁️' : '🙈'}
                  </button>
                </div>
              </div>

              {isLoginMode && (
                <div className={styles.rememberGroup}>
                  <label className={styles.checkboxLabel}>
                    <input 
                      type="checkbox" 
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                    />
                    <span>Ghi nhớ tài khoản</span>
                  </label>
                </div>
              )}
              <button type="submit" className={styles.submitBtn}>
                {isLoginMode ? 'Đăng nhập' : 'Đăng ký'}
              </button>
            </form>

            <div className={styles.switchMode}>
              {isLoginMode ? (
                <>Chưa có tài khoản? <span onClick={() => {
                  setIsLoginMode(false);
                  setEmail('');
                  setPassword('');
                  setName('');
                  setError('');
                }}>Đăng ký ngay</span></>
              ) : (
                <>Đã có tài khoản? <span onClick={() => {
                  setIsLoginMode(true);
                  setEmail('');
                  setPassword('');
                  setName('');
                  setError('');
                }}>Đăng nhập</span></>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
