'use client';

import { BIOGRAPHY_FIELDS } from '@/lib/sections';
import type { Biography } from '@/lib/types';
import { cn, input, label } from '@/lib/ui';

interface Props {
  value: Biography;
  onChange: (value: Biography) => void;
}

export function BiographyForm({ value, onChange }: Props) {
  return (
    <div className="grid gap-4">
      {BIOGRAPHY_FIELDS.map((field) => {
        const id = `bio-${field.key}`;
        const v = value[field.key] ?? '';
        return (
          <div key={field.key}>
            <label htmlFor={id} className={label}>{field.label}</label>
            {field.type === 'textarea' ? (
              <textarea
                id={id}
                className={cn(input, 'min-h-24 resize-y')}
                value={v}
                placeholder={field.placeholder}
                onChange={(e) => onChange({ ...value, [field.key]: e.target.value })}
              />
            ) : (
              <input
                id={id}
                type="text"
                className={input}
                value={v}
                placeholder={field.placeholder}
                onChange={(e) => onChange({ ...value, [field.key]: e.target.value })}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
