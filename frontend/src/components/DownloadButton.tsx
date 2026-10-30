'use client';

import { useEffect, useRef, useState } from 'react';
import { api, apiUrl, getAccessToken } from '@/lib/api';
import { button, cn } from '@/lib/ui';
import type { Resume } from '@/lib/types';

interface Props {
  resume: Resume;
  onChange: (resume: Resume) => void;
}

export function DownloadButton({ resume, onChange }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const polling = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(
    () => () => {
      if (polling.current) clearInterval(polling.current);
    },
    [],
  );

  function startPolling() {
    if (polling.current) return;
    polling.current = setInterval(async () => {
      try {
        const fresh = await api<Resume>(`/resumes/${resume._id}`);
        onChange(fresh);
        if (fresh.pdfStatus === 'ready' || fresh.pdfStatus === 'failed') {
          if (polling.current) clearInterval(polling.current);
          polling.current = null;
        }
      } catch (err) {
        setError((err as Error).message);
        if (polling.current) clearInterval(polling.current);
        polling.current = null;
      }
    }, 2000);
  }

  async function generate() {
    setError(null);
    try {
      const result = await api<{ jobId: string; pdfStatus: 'pending' }>(
        `/resumes/${resume._id}/generate-pdf`,
        { method: 'POST' },
      );
      onChange({ ...resume, pdfStatus: result.pdfStatus, pdfJobId: result.jobId, pdfError: null });
      startPolling();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function download() {
    setDownloading(true);
    setError(null);
    try {
      const token = getAccessToken();
      const res = await fetch(`${apiUrl}/resumes/${resume._id}/pdf`, {
        credentials: 'include',
        headers: token ? { authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error(`Download failed (${res.status})`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${resume.title || 'resume'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setDownloading(false);
    }
  }

  const pending = resume.pdfStatus === 'pending';
  const ready = resume.pdfStatus === 'ready';
  const failed = resume.pdfStatus === 'failed';

  return (
    <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
      {ready ? (
        <>
          <button
            type="button"
            onClick={download}
            disabled={downloading}
            className={cn(button.base, button.primary, button.large)}
          >
            {downloading ? 'Downloading…' : 'Download PDF'}
          </button>
          <button
            type="button"
            onClick={generate}
            className={cn(button.base, button.secondary)}
          >
            Regenerate
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={generate}
          disabled={pending}
          className={cn(button.base, button.primary, button.large)}
        >
          {pending ? 'Generating…' : 'Download Resume'}
        </button>
      )}
      {failed ? (
        <p className="text-base text-red-600">
          PDF generation failed{resume.pdfError ? `: ${resume.pdfError}` : ''}
        </p>
      ) : null}
      {error ? <p className="text-base text-red-600">{error}</p> : null}
    </div>
  );
}
