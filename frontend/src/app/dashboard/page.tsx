'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { button, card, cn, input } from '@/lib/ui';
import type { Resume } from '@/lib/types';
import { getTemplateInfo } from '@/lib/templates';
import { RequireAuth } from '@/components/RequireAuth';
import { AppHeader } from '@/components/AppHeader';

function DashboardInner() {
  const [resumes, setResumes] = useState<Resume[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const refresh = useCallback(async () => {
    try {
      const list = await api<Resume[]>('/resumes');
      setResumes(list);
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function createResume() {
    const trimmed = title.trim() || 'Untitled resume';
    setCreating(true);
    setError(null);
    try {
      const created = await api<Resume>('/resumes', { method: 'POST', body: { title: trimmed } });
      router.push(`/resumes/${created._id}/questionnaire/1`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCreating(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this resume? This cannot be undone.')) return;
    try {
      await api(`/resumes/${id}`, { method: 'DELETE' });
      setResumes((current) => current?.filter((r) => r._id !== id) ?? null);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className={cn(card, 'mb-6')}>
          <h1 className="text-2xl font-bold mb-2">Your resumes</h1>
          <p className="text-base text-[color:var(--color-muted)] mb-4">
            Create a new resume or pick up where you left off.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              className={input}
              placeholder="Title (e.g. Frontend Engineer)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <button
              type="button"
              onClick={createResume}
              disabled={creating}
              className={cn(button.base, button.primary, 'sm:min-w-44')}
            >
              {creating ? 'Creating…' : 'New resume'}
            </button>
          </div>
          {error ? <p className="mt-3 text-base text-red-600">{error}</p> : null}
        </div>

        {resumes === null ? (
          <p className="text-base text-[color:var(--color-muted)]">Loading…</p>
        ) : resumes.length === 0 ? (
          <p className="text-base text-[color:var(--color-muted)]">
            No resumes yet — create your first one above.
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {resumes.map((r) => (
              <li key={r._id} className={card}>
                <div className="mb-1 flex items-start justify-between gap-2">
                  <h2 className="text-lg font-semibold">{r.title}</h2>
                  <span
                    className="inline-flex items-center gap-1 rounded-full border border-[color:var(--color-line)] bg-white px-2 py-0.5 text-xs text-[color:var(--color-muted)]"
                    title={`Template: ${getTemplateInfo(r.template).name}`}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: getTemplateInfo(r.template).swatch }}
                      aria-hidden="true"
                    />
                    {getTemplateInfo(r.template).name}
                  </span>
                </div>
                <p className="text-sm text-[color:var(--color-muted)] mb-4">
                  Updated {new Date(r.updatedAt).toLocaleString()}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/resumes/${r._id}/review`}
                    className={cn(button.base, button.primary, 'px-3 py-2 text-sm')}
                  >
                    Open
                  </Link>
                  <Link
                    href={`/resumes/${r._id}/questionnaire/1`}
                    className={cn(button.base, button.secondary, 'px-3 py-2 text-sm')}
                  >
                    Edit answers
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(r._id)}
                    className={cn(button.base, 'px-3 py-2 text-sm bg-white text-red-600 border border-red-200 hover:bg-red-50')}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardInner />
    </RequireAuth>
  );
}
