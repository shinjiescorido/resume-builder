'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { TEMPLATES } from '@/lib/templates';
import { cn } from '@/lib/ui';
import type { Resume } from '@/lib/types';

interface Props {
  resume: Resume;
  onChange: (resume: Resume) => void;
}

export function TemplatePicker({ resume, onChange }: Props) {
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function pick(key: string) {
    if (key === resume.template) return;
    setBusyKey(key);
    setError(null);
    try {
      const updated = await api<Resume>(`/resumes/${resume._id}`, {
        method: 'PATCH',
        body: { template: key },
      });
      onChange(updated);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        {TEMPLATES.map((t) => {
          const active = t.key === resume.template;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => pick(t.key)}
              disabled={busyKey === t.key}
              className={cn(
                'flex flex-col items-start gap-2 rounded-xl border bg-white p-4 text-left transition-colors',
                active
                  ? 'border-[color:var(--color-brand-600)] ring-2 ring-[color:var(--color-brand-100)]'
                  : 'border-[color:var(--color-line)] hover:border-slate-400',
              )}
              aria-pressed={active}
            >
              <div className="flex w-full items-center gap-2">
                <span
                  className="h-5 w-5 rounded-full border border-[color:var(--color-line)]"
                  style={{ backgroundColor: t.swatch }}
                  aria-hidden="true"
                />
                <span className="text-base font-semibold">{t.name}</span>
                {active ? (
                  <span className="ml-auto rounded-full bg-[color:var(--color-brand-50)] px-2 py-0.5 text-xs font-medium text-[color:var(--color-brand-700)]">
                    Selected
                  </span>
                ) : null}
              </div>
              <p className="text-sm text-[color:var(--color-muted)]">{t.description}</p>
              <p className="text-xs uppercase tracking-wider text-[color:var(--color-muted)]">{t.preview}</p>
            </button>
          );
        })}
      </div>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
