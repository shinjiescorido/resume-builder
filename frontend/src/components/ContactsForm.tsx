'use client';

import { CONTACTS_FIELDS } from '@/lib/sections';
import type { Contacts } from '@/lib/types';
import { input, label } from '@/lib/ui';

interface Props {
  value: Contacts;
  onChange: (value: Contacts) => void;
}

export function ContactsForm({ value, onChange }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {CONTACTS_FIELDS.map((field) => {
        const id = `contact-${field.key}`;
        return (
          <div key={field.key}>
            <label htmlFor={id} className={label}>{field.label}</label>
            <input
              id={id}
              type={field.type === 'url' ? 'url' : field.type}
              className={input}
              value={value[field.key] ?? ''}
              placeholder={field.placeholder}
              onChange={(e) => onChange({ ...value, [field.key]: e.target.value })}
            />
          </div>
        );
      })}
    </div>
  );
}
