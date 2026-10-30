'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { button, card, cn } from '@/lib/ui';
import type { ListSectionKey, Resume, SectionItem } from '@/lib/types';
import { BIOGRAPHY_FIELDS, CONTACTS_FIELDS, LIST_SECTIONS } from '@/lib/sections';
import { RequireAuth } from '@/components/RequireAuth';
import { AppHeader } from '@/components/AppHeader';
import { PhotoUpload } from '@/components/PhotoUpload';
import { DownloadButton } from '@/components/DownloadButton';
import { TemplatePicker } from '@/components/TemplatePicker';

function valueOrDash(v: string | undefined | null) {
  const trimmed = (v ?? '').toString().trim();
  return trimmed.length ? trimmed : null;
}

function ItemList({ items }: { items: SectionItem[] }) {
  if (items.length === 0) {
    return <p className="text-base text-[color:var(--color-muted)]">No entries.</p>;
  }
  return (
    <ul className="grid gap-3">
      {items.map((it) => (
        <li key={it.id} className="rounded-lg border border-[color:var(--color-line)] p-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-semibold">{valueOrDash(it.details) ?? <span className="text-[color:var(--color-muted)]">Untitled</span>}</p>
            {valueOrDash(it.date) ? (
              <p className="text-sm text-[color:var(--color-muted)]">{it.date}</p>
            ) : null}
          </div>
          {it.notes.length ? (
            <ul className="mt-2 list-disc pl-5 text-base">
              {it.notes
                .filter((n) => n.trim().length > 0)
                .map((n, i) => (
                  <li key={i} className="whitespace-pre-wrap break-words">{n}</li>
                ))}
            </ul>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function ReviewInner() {
  const params = useParams<{ id: string }>();
  const resumeId = params.id;
  const [resume, setResume] = useState<Resume | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await api<Resume>(`/resumes/${resumeId}`);
        if (cancelled) return;
        setResume(r);
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [resumeId]);

  if (error) {
    return (
      <div className="min-h-screen">
        <AppHeader />
        <main className="mx-auto max-w-3xl px-4 py-8">
          <p className="text-base text-red-600">{error}</p>
          <Link href="/dashboard" className="mt-4 inline-block text-[color:var(--color-brand-600)] hover:underline">
            Back to dashboard
          </Link>
        </main>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="min-h-screen">
        <AppHeader />
        <main className="mx-auto max-w-3xl px-4 py-8">
          <p className="text-base text-[color:var(--color-muted)]">Loading…</p>
        </main>
      </div>
    );
  }

  const listSections: Array<{ key: ListSectionKey; label: string }> = [
    { key: 'workExperience', label: 'Work experience' },
    { key: 'education',      label: 'Education' },
    { key: 'skills',         label: 'Skills' },
    { key: 'achievements',   label: 'Achievements' },
    { key: 'languages',      label: 'Languages' },
    { key: 'hobbies',        label: 'Hobbies' },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 pb-32">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">{resume.title}</h1>
            <p className="text-base text-[color:var(--color-muted)]">Review your details and download your PDF.</p>
          </div>
          <Link
            href={`/resumes/${resumeId}/questionnaire/1`}
            className={cn(button.base, button.secondary, 'text-sm px-3 py-2')}
          >
            Edit from start
          </Link>
        </div>

        <section className={cn(card, 'mb-6')}>
          <div className="mb-3">
            <h2 className="text-lg font-semibold">PDF template</h2>
            <p className="text-sm text-[color:var(--color-muted)]">Pick a layout for the generated PDF. Switch any time.</p>
          </div>
          <TemplatePicker resume={resume} onChange={setResume} />
        </section>

        <section className={cn(card, 'mb-6')}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Profile photo</h2>
            <Link
              href={`/resumes/${resumeId}/questionnaire/11`}
              className="text-sm text-[color:var(--color-brand-600)] hover:underline"
            >
              Change
            </Link>
          </div>
          <PhotoUpload
            resumeId={resumeId}
            photoPath={resume.photoPath}
            onUploaded={(photoPath) => setResume((r) => (r ? { ...r, photoPath } : r))}
          />
        </section>

        <section className={cn(card, 'mb-6')}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Biography</h2>
            <Link href={`/resumes/${resumeId}/questionnaire/1`} className="text-sm text-[color:var(--color-brand-600)] hover:underline">
              Edit
            </Link>
          </div>
          <dl className="grid gap-3 sm:grid-cols-2">
            {BIOGRAPHY_FIELDS.map((f) => (
              <div key={f.key}>
                <dt className="text-sm text-[color:var(--color-muted)]">{f.label}</dt>
                <dd className="whitespace-pre-wrap break-words text-base">
                  {valueOrDash(resume.biography[f.key]) ?? <span className="text-[color:var(--color-muted)]">—</span>}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className={cn(card, 'mb-6')}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Contacts</h2>
            <Link href={`/resumes/${resumeId}/questionnaire/2`} className="text-sm text-[color:var(--color-brand-600)] hover:underline">
              Edit
            </Link>
          </div>
          <dl className="grid gap-3 sm:grid-cols-2">
            {CONTACTS_FIELDS.map((f) => (
              <div key={f.key}>
                <dt className="text-sm text-[color:var(--color-muted)]">{f.label}</dt>
                <dd className="break-words text-base">
                  {valueOrDash(resume.contacts[f.key]) ?? <span className="text-[color:var(--color-muted)]">—</span>}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className={cn(card, 'mb-6')}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">About you</h2>
            <Link href={`/resumes/${resumeId}/questionnaire/3`} className="text-sm text-[color:var(--color-brand-600)] hover:underline">
              Edit
            </Link>
          </div>
          {valueOrDash(resume.summary) ? (
            <p className="whitespace-pre-wrap break-words text-base">{resume.summary}</p>
          ) : (
            <p className="text-base text-[color:var(--color-muted)]">No summary yet.</p>
          )}
        </section>

        {listSections.map(({ key, label }, idx) => (
          <section key={key} className={cn(card, 'mb-6')}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{label}</h2>
              <Link
                href={`/resumes/${resumeId}/questionnaire/${idx + 4}`}
                className="text-sm text-[color:var(--color-brand-600)] hover:underline"
              >
                Edit
              </Link>
            </div>
            <p className="mb-3 text-sm text-[color:var(--color-muted)]">
              {LIST_SECTIONS[key].detailsLabel}
            </p>
            <ItemList items={resume[key]} />
          </section>
        ))}

        <section className={cn(card, 'mb-6')}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">References</h2>
            <Link href={`/resumes/${resumeId}/questionnaire/10`} className="text-sm text-[color:var(--color-brand-600)] hover:underline">
              Edit
            </Link>
          </div>
          {(resume.references ?? []).length === 0 ? (
            <p className="text-base text-[color:var(--color-muted)]">No references yet.</p>
          ) : (
            <ul className="grid gap-3">
              {resume.references.map((r) => {
                const role = [r.position, r.company].filter((v) => v.trim()).join(' · ');
                const contact = [r.phone, r.email].filter((v) => v.trim()).join('  ·  ');
                return (
                  <li key={r.id} className="rounded-lg border border-[color:var(--color-line)] p-3">
                    <p className="font-semibold">
                      {r.name.trim() || <span className="text-[color:var(--color-muted)]">Unnamed reference</span>}
                    </p>
                    {role ? <p className="text-sm text-[color:var(--color-muted)]">{role}</p> : null}
                    {contact ? <p className="text-sm">{contact}</p> : null}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>

      <footer className="sticky bottom-0 border-t border-[color:var(--color-line)] bg-white">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/dashboard" className={cn(button.base, button.secondary)}>
            Back to dashboard
          </Link>
          <DownloadButton resume={resume} onChange={setResume} />
        </div>
      </footer>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <RequireAuth>
      <ReviewInner />
    </RequireAuth>
  );
}
