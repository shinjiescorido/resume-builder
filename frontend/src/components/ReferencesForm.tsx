'use client';

import type { Reference } from '@/lib/types';
import { button, card, cn, input, label } from '@/lib/ui';

interface Props {
  items: Reference[];
  onChange: (next: Reference[]) => void;
}

function makeRef(): Reference {
  const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return { id, name: '', phone: '', email: '', company: '', position: '' };
}

const FIELDS: Array<{ key: keyof Omit<Reference, 'id'>; label: string; type: string; placeholder: string }> = [
  { key: 'name',     label: 'Full name', type: 'text',  placeholder: 'John Smith' },
  { key: 'position', label: 'Position',  type: 'text',  placeholder: 'Engineering Manager' },
  { key: 'company',  label: 'Company',   type: 'text',  placeholder: 'Acme Corp' },
  { key: 'phone',    label: 'Phone',     type: 'tel',   placeholder: '+1 555 0100' },
  { key: 'email',    label: 'Email',     type: 'email', placeholder: 'john@acme.com' },
];

export function ReferencesForm({ items, onChange }: Props) {
  function patch(id: string, partial: Partial<Reference>) {
    onChange(items.map((r) => (r.id === id ? { ...r, ...partial } : r)));
  }
  function remove(id: string) {
    onChange(items.filter((r) => r.id !== id));
  }
  function add() {
    onChange([...items, makeRef()]);
  }

  return (
    <div className="grid gap-4">
      {items.length === 0 ? (
        <p className="text-base text-[color:var(--color-muted)]">
          No references yet — click "Add reference" to start.
        </p>
      ) : null}

      {items.map((ref, idx) => (
        <div key={ref.id} className={cn(card, 'p-4')}>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold">Reference {idx + 1}</h3>
            <button
              type="button"
              onClick={() => remove(ref.id)}
              className={cn(button.base, 'px-3 py-1.5 text-sm bg-white text-red-600 border border-red-200 hover:bg-red-50')}
            >
              Remove
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {FIELDS.map((f) => {
              const id = `ref-${ref.id}-${f.key}`;
              return (
                <div key={f.key} className={f.key === 'name' ? 'sm:col-span-2' : undefined}>
                  <label htmlFor={id} className={label}>{f.label}</label>
                  <input
                    id={id}
                    type={f.type}
                    className={input}
                    value={ref[f.key]}
                    placeholder={f.placeholder}
                    onChange={(e) => patch(ref.id, { [f.key]: e.target.value } as Partial<Reference>)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className={cn(button.base, button.secondary, 'self-start')}
      >
        + Add reference
      </button>
    </div>
  );
}
