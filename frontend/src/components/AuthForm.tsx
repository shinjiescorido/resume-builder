'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { button, card, cn, input, label } from '@/lib/ui';

interface Props {
  mode: 'login' | 'signup';
  onSubmit: (username: string, password: string) => Promise<void>;
}

export function AuthForm({ mode, onSubmit }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await onSubmit(username.trim(), password);
    } catch (err) {
      setError((err as Error).message ?? 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  const title = mode === 'login' ? 'Welcome back' : 'Create your account';
  const cta = mode === 'login' ? 'Log in' : 'Sign up';
  const altHref = mode === 'login' ? '/signup' : '/login';
  const altText = mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Log in';

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10">
      <form onSubmit={submit} className={cn(card, 'w-full max-w-md')}>
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        <p className="text-base text-[color:var(--color-muted)] mb-6">
          {mode === 'login' ? 'Sign in to continue building your resume.' : 'Just a username and password to get started.'}
        </p>

        <div className="mb-4">
          <label htmlFor="username" className={label}>Username</label>
          <input
            id="username"
            className={input}
            value={username}
            autoComplete="username"
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="password" className={label}>Password</label>
          <input
            id="password"
            type="password"
            className={input}
            value={password}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>

        {error ? <p className="mb-4 text-base text-red-600">{error}</p> : null}

        <button type="submit" disabled={busy} className={cn(button.base, button.primary, 'w-full')}>
          {busy ? 'Please wait…' : cta}
        </button>

        <p className="mt-6 text-center text-base">
          <Link href={altHref} className="text-[color:var(--color-brand-600)] hover:underline">
            {altText}
          </Link>
        </p>
      </form>
    </main>
  );
}
