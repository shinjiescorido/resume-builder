'use client';

import type { ListSectionMeta } from '@/lib/sections';
import type { SectionItem } from '@/lib/types';
import { button, card, cn, input, label } from '@/lib/ui';

interface Props {
  meta: ListSectionMeta;
  items: SectionItem[];
  onChange: (next: SectionItem[]) => void;
}

function makeItem(): SectionItem {
  const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return { id, details: '', date: '', notes: [''] };
}

export function SectionItemsForm({ meta, items, onChange }: Props) {
  function patch(itemId: string, partial: Partial<SectionItem>) {
    onChange(items.map((it) => (it.id === itemId ? { ...it, ...partial } : it)));
  }

  function removeItem(itemId: string) {
    onChange(items.filter((it) => it.id !== itemId));
  }

  function addItem() {
    onChange([...items, makeItem()]);
  }

  function setNote(itemId: string, idx: number, value: string) {
    onChange(items.map((it) => {
      if (it.id !== itemId) return it;
      const notes = it.notes.slice();
      notes[idx] = value;
      return { ...it, notes };
    }));
  }

  function addNote(itemId: string) {
    onChange(items.map((it) => (it.id === itemId ? { ...it, notes: [...it.notes, ''] } : it)));
  }

  function removeNote(itemId: string, idx: number) {
    onChange(items.map((it) => (it.id === itemId
      ? { ...it, notes: it.notes.filter((_, i) => i !== idx) }
      : it)));
  }

  return (
    <div className="grid gap-4">
      {items.length === 0 ? (
        <p className="text-base text-[color:var(--color-muted)]">
          No entries yet — click "Add entry" to start.
        </p>
      ) : null}

      {items.map((item, entryIdx) => (
        <div key={item.id} className={cn(card, 'p-4')}>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold">Entry {entryIdx + 1}</h3>
            <button
              type="button"
              onClick={() => removeItem(item.id)}
              className={cn(button.base, 'px-3 py-1.5 text-sm bg-white text-red-600 border border-red-200 hover:bg-red-50')}
            >
              Remove
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label htmlFor={`details-${item.id}`} className={label}>{meta.detailsLabel}</label>
              <input
                id={`details-${item.id}`}
                className={input}
                value={item.details}
                placeholder={meta.detailsPlaceholder}
                onChange={(e) => patch(item.id, { details: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor={`date-${item.id}`} className={label}>Date</label>
              <input
                id={`date-${item.id}`}
                className={input}
                value={item.date}
                placeholder={meta.datePlaceholder}
                onChange={(e) => patch(item.id, { date: e.target.value })}
              />
            </div>
          </div>

          <div className="mt-4">
            <p className={label}>Notes (each becomes a bullet in the PDF)</p>
            <div className="grid gap-2">
              {item.notes.map((note, noteIdx) => (
                <div key={`${item.id}-${noteIdx}`} className="flex gap-2">
                  <input
                    className={input}
                    value={note}
                    placeholder={meta.notePlaceholder}
                    onChange={(e) => setNote(item.id, noteIdx, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeNote(item.id, noteIdx)}
                    aria-label="Remove note"
                    className={cn(button.base, button.secondary, 'shrink-0 px-3 py-2 text-sm')}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => addNote(item.id)}
              className={cn(button.base, button.secondary, 'mt-2 px-3 py-2 text-sm')}
            >
              + Add note
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addItem}
        className={cn(button.base, button.secondary, 'self-start')}
      >
        + Add entry
      </button>
    </div>
  );
}
