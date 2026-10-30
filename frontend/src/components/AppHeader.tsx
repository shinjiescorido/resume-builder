'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { button, cn } from '@/lib/ui';

export function AppHeader() {
  const { user, logout } = useAuth();
  return (
    <header className="border-b border-[color:var(--color-line)] bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="text-lg font-bold text-[color:var(--color-ink)]">
          Resume Maker
        </Link>
        {user ? (
          <div className="flex items-center gap-3">
            <span className="hidden text-base text-[color:var(--color-muted)] sm:inline">
              @{user.username}
            </span>
            <button
              type="button"
              onClick={logout}
              className={cn(button.base, button.secondary, 'px-3 py-2 text-sm')}
            >
              Log out
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
