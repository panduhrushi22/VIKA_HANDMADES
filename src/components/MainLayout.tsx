'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, searchParams]);

  const isAdminPage = pathname?.startsWith('/admin');

  if (isAdminPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <div style={{ minHeight: 'calc(100vh - 400px)' }}>
        {children}
      </div>
      <Footer />
    </>
  );
}
