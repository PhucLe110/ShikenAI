'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import LockedOverlay from './LockedOverlay';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Không hiển thị Header và Footer chung ở trang làm bài thi
  const isExamPage = pathname.startsWith('/exam/');

  return (
    <>
      {!isExamPage && <Header />}
      <LockedOverlay />
      <main style={{ minHeight: 'calc(100vh - 200px)' }}>
        {children}
      </main>
      {!isExamPage && <Footer />}
    </>
  );
}
