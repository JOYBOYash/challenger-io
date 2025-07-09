'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isChallengePage = pathname.startsWith('/challenge');
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');

  return (
    <>
      {!isChallengePage && !isAuthPage && <Navbar />}
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      {!isChallengePage && !isAuthPage && <Footer />}
    </>
  );
}
