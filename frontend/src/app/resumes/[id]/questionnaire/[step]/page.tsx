'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { button, card, cn, input } from '@/lib/ui';
import type { Biography, Contacts, ListSectionKey, Reference, Resume, SectionItem } from '@/lib/types';
import { LIST_SECTIONS, STEPS, TOTAL_STEPS, getStep } from '@/lib/sections';
import { RequireAuth } from '@/components/RequireAuth';
import { AppHeader } from '@/components/AppHeader';
import { BiographyForm } from '@/components/BiographyForm';
import { ContactsForm } from '@/components/ContactsForm';
import { SectionItemsForm } from '@/components/SectionItemsForm';
import { ReferencesForm } from '@/components/ReferencesForm';
import { PhotoUpload } from '@/components/PhotoUpload';

function QuestionnaireInner() {
  const params = useParams<{ id: string; step: string }>();
  const router = useRouter();
  const resumeId = params.id;
  const stepNumber = Math.max(1, Math.min(TOTAL_STEPS, Number(params.step) || 1));
  const step = getStep(stepNumber);

  const [resume, setResume] = useState<Resume | null>(null);
  const [biographyDraft, setBiographyDraft] = useState<Biography | null>(null);
  const [contactsDraft, setContactsDraft] = useState<Contacts | null>(null);
  const [summaryDraft, setSummaryDraft] = useState<string | null>(null);
  const [listDraft, setListDraft] = useState<SectionItem[] | null>(null);
  const [referencesDraft, setReferencesDraft] = useState<Reference[] | null>(null);
  const [saving, setSaving] = useState(false);
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

  useEffect(() => {
    if (!resume || !step) return;
    if (step.kind === 'biography') setBiographyDraft({ ...resume.biography });
    if (step.kind === 'contacts')  setContactsDraft({ ...resume.contacts });
    if (step.kind === 'summary')   setSummaryDraft(resume.summary ?? '');
    if (step.kind === 'list' && step.listKey) setListDraft([...resume[step.listKey]]);
    if (step.kind === 'references') setReferencesDraft([...(resume.references ?? [])]);
  }, [resume, step]);

  const persistStep = useCallback(async (): Promise<Resume | null> => {
    if (!step || !resume) return resume;
    let body: Record<string, unknown> | null = null;
    if (step.kind === 'biography' && biographyDraft) body = { biography: biographyDraft };
    else if (step.kind === 'contacts' && contactsDraft) body = { contacts: contactsDraft };
    else if (step.kind === 'summary' && summaryDraft !== null) body = { summary: summaryDraft };
    else if (step.kind === 'list' && step.listKey && listDraft) {
      const cleaned = listDraft.map((it) => ({
        id: it.id,
        details: it.details,
        date: it.date,
        notes: it.notes.filter((n) => n.trim().length > 0),
      }));
      body = { [step.listKey]: cleaned };
    }
    else if (step.kind === 'references' && referencesDraft) {
      body = { references: referencesDraft };
    }
    if (!body) return resume;
    const updated = await api<Resume>(`/resumes/${resumeId}`, { method: 'PATCH', body });
    setResume(updated);
    return updated;
  }, [step, resume, biographyDraft, contactsDraft, summaryDraft, listDraft, referencesDraft, resumeId]);

  async function navigate(target: number | 'review') {
    if (!step) return;
    setSaving(true);
    setError(null);
    try {
      await persistStep();
      if (target === 'review') router.push(`/resumes/${resumeId}/review`);
      else router.push(`/resumes/${resumeId}/questionnaire/${target}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  function goBack() {
    if (!step) return;
    if (step.index <= 1) router.push('/dashboard');
    else navigate(step.index - 1);
  }

  function goNext() {
    if (!step) return;
    if (step.index >= TOTAL_STEPS) navigate('review');
    else navigate(step.index + 1);
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <AppHeader />
        <main className="mx-auto max-w-2xl px-4 py-8">
          <p className="text-base text-red-600">{error}</p>
          <Link href="/dashboard" className="mt-4 inline-block text-[color:var(--color-brand-600)] hover:underline">
            Back to dashboard
          </Link>
        </main>
      </div>
    );
  }

  if (!step || !resume) {
    return (
      <div className="min-h-screen">
        <AppHeader />
        <main className="mx-auto max-w-2xl px-4 py-8">
          <p className="text-base text-[color:var(--color-muted)]">Loading…</p>
        </main>
      </div>
    );
  }

  const progress = Math.round((stepNumber / TOTAL_STEPS) * 100);

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 pb-32">
        <div className="mb-2 flex items-center gap-2 overflow-x-auto text-sm text-[color:var(--color-muted)]">
          {STEPS.map((s) => (
            <span
              key={s.index}
              className={cn(
                'whitespace-nowrap rounded-full border px-2 py-1',
                s.index === stepNumber
                  ? 'border-[color:var(--color-brand-600)] bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)]'
                  : 'border-[color:var(--color-line)] bg-white',
              )}
            >
              {s.index}. {s.label}
            </span>
          ))}
        </div>

        <div className="mb-6 mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div className="h-full bg-[color:var(--color-brand-600)] transition-all" style={{ width: `${progress}%` }} />
        </div>

        <div className={card}>
          <h1 className="text-2xl font-bold">{step.label}</h1>
          <p className="mb-5 text-base text-[color:var(--color-muted)]">{step.helper}</p>

          {step.kind === 'biography' && biographyDraft ? (
            <BiographyForm value={biographyDraft} onChange={setBiographyDraft} />
          ) : null}
          {step.kind === 'contacts' && contactsDraft ? (
            <ContactsForm value={contactsDraft} onChange={setContactsDraft} />
          ) : null}
          {step.kind === 'summary' && summaryDraft !== null ? (
            <textarea
              className={cn(input, 'min-h-48 resize-y')}
              value={summaryDraft}
              placeholder="A few sentences about who you are and what you're great at."
              onChange={(e) => setSummaryDraft(e.target.value)}
            />
          ) : null}
          {step.kind === 'list' && step.listKey && listDraft ? (
            <SectionItemsForm
              meta={LIST_SECTIONS[step.listKey as ListSectionKey]}
              items={listDraft}
              onChange={setListDraft}
            />
          ) : null}
          {step.kind === 'references' && referencesDraft ? (
            <ReferencesForm items={referencesDraft} onChange={setReferencesDraft} />
          ) : null}
          {step.kind === 'photo' ? (
            <PhotoUpload
              resumeId={resumeId}
              photoPath={resume.photoPath}
              onUploaded={(photoPath) => setResume((r) => (r ? { ...r, photoPath } : r))}
            />
          ) : null}
        </div>
      </main>

      <footer className="sticky bottom-0 border-t border-[color:var(--color-line)] bg-white">
        <div className="mx-auto flex max-w-3xl gap-3 px-4 py-4">
          <button
            type="button"
            onClick={goBack}
            disabled={saving}
            className={cn(button.base, button.secondary, button.large, 'flex-1')}
          >
            Back
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={saving}
            className={cn(button.base, button.primary, button.large, 'flex-1')}
          >
            {step.index >= TOTAL_STEPS ? 'Review' : 'Next'}
          </button>
        </div>
      </footer>
    </div>
  );
}

export default function QuestionnairePage() {
  return (
    <RequireAuth>
      <QuestionnaireInner />
    </RequireAuth>
  );
}
