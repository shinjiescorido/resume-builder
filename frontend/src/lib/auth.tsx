'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { api, setAccessToken } from './api';
import type { AuthResponse } from './types';

interface AuthState {
  user: { userId: string; username: string } | null;
  ready: boolean;
  signup: (username: string, password: string) => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthState['user']>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api<{ accessToken: string }>('/auth/refresh', { method: 'POST', body: {} });
        if (cancelled) return;
        setAccessToken(res.accessToken);
        const claims = decodeJwt(res.accessToken);
        if (claims) setUser({ userId: claims.sub, username: claims.username });
      } catch {
        /* not signed in */
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const signup = useCallback(async (username: string, password: string) => {
    const res = await api<AuthResponse>('/auth/signup', { method: 'POST', body: { username, password } });
    setAccessToken(res.accessToken);
    setUser({ userId: res.userId, username: res.username });
    router.replace('/dashboard');
  }, [router]);

  const login = useCallback(async (username: string, password: string) => {
    const res = await api<AuthResponse>('/auth/login', { method: 'POST', body: { username, password } });
    setAccessToken(res.accessToken);
    setUser({ userId: res.userId, username: res.username });
    router.replace('/dashboard');
  }, [router]);

  const logout = useCallback(async () => {
    try {
      await api('/auth/logout', { method: 'POST' });
    } catch {
      /* ignore */
    }
    setAccessToken(null);
    setUser(null);
    router.replace('/login');
  }, [router]);

  const value = useMemo(() => ({ user, ready, signup, login, logout }), [user, ready, signup, login, logout]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

function decodeJwt(token: string): { sub: string; username: string } | null {
  try {
    const part = token.split('.')[1];
    const json = atob(part.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(json) as { sub?: string; username?: string };
    if (!payload.sub || !payload.username) return null;
    return { sub: payload.sub, username: payload.username };
  } catch {
    return null;
  }
}
