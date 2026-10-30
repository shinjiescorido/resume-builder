'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !user) router.replace('/login');
  }, [ready, user, router]);

  if (!ready || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-base text-[color:var(--color-muted)]">Loading…</p>
      </main>
    );
  }
  return <>{children}</>;
}
