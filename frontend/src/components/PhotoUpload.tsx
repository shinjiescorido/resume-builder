'use client';

import { useRef, useState, type ChangeEvent } from 'react';
import { api, apiUrl } from '@/lib/api';
import { button, cn } from '@/lib/ui';

interface Props {
  resumeId: string;
  photoPath: string | null;
  onUploaded: (photoPath: string) => void;
}

export function PhotoUpload({ resumeId, photoPath, onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('photo', file);
      const result = await api<{ photoPath: string }>(`/resumes/${resumeId}/photo`, {
        method: 'POST',
        body: fd,
      });
      onUploaded(result.photoPath);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  const previewUrl = photoPath ? `${apiUrl}${photoPath}` : null;

  return (
    <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
      <div
        className="h-24 w-24 overflow-hidden rounded-full border border-[color:var(--color-line)] bg-slate-100"
        aria-hidden={!previewUrl}
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="Profile photo preview" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-[color:var(--color-muted)]">
            No photo
          </div>
        )}
      </div>
      <div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className={cn(button.base, button.secondary)}
        >
          {busy ? 'Uploading…' : photoPath ? 'Replace photo' : 'Upload photo'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleChange}
        />
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        <p className="mt-2 text-sm text-[color:var(--color-muted)]">JPEG, PNG, or WebP. Max 5 MB.</p>
      </div>
    </div>
  );
}
