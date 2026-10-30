import type { ListSectionKey } from './types';

export type StepKind = 'biography' | 'contacts' | 'summary' | 'list' | 'references' | 'photo';

export interface BiographyField {
  key: 'name' | 'address' | 'height' | 'weight';
  label: string;
  type: 'text' | 'textarea';
  placeholder?: string;
}

export interface ContactsField {
  key: 'email' | 'phone' | 'website' | 'linkedin';
  label: string;
  type: 'email' | 'text' | 'url';
  placeholder?: string;
}

export interface ListSectionMeta {
  key: ListSectionKey;
  detailsLabel: string;
  detailsPlaceholder: string;
  datePlaceholder: string;
  notePlaceholder: string;
}

export interface Step {
  index: number;
  kind: StepKind;
  label: string;
  helper: string;
  listKey?: ListSectionKey;
}

export const BIOGRAPHY_FIELDS: BiographyField[] = [
  { key: 'name',    label: 'Full name', type: 'text',     placeholder: 'Jane Doe' },
  { key: 'address', label: 'Address',   type: 'textarea', placeholder: '123 Main St, City, Country' },
  { key: 'height',  label: 'Height',    type: 'text',     placeholder: '180 cm' },
  { key: 'weight',  label: 'Weight',    type: 'text',     placeholder: '75 kg' },
];

export const CONTACTS_FIELDS: ContactsField[] = [
  { key: 'email',    label: 'Email',    type: 'email', placeholder: 'jane@example.com' },
  { key: 'phone',    label: 'Phone',    type: 'text',  placeholder: '+1 555 0100' },
  { key: 'website',  label: 'Website',  type: 'url',   placeholder: 'https://janedoe.dev' },
  { key: 'linkedin', label: 'LinkedIn', type: 'url',   placeholder: 'https://linkedin.com/in/jane' },
];

export const LIST_SECTIONS: Record<ListSectionKey, ListSectionMeta> = {
  workExperience: {
    key: 'workExperience',
    detailsLabel: 'Role & company',
    detailsPlaceholder: 'Senior Engineer · Acme Corp',
    datePlaceholder: 'Jan 2022 – Present',
    notePlaceholder: 'What did you build, ship, or improve?',
  },
  education: {
    key: 'education',
    detailsLabel: 'Degree & institution',
    detailsPlaceholder: 'BSc Computer Science · UC Berkeley',
    datePlaceholder: '2018 – 2022',
    notePlaceholder: 'Honors, GPA, relevant coursework…',
  },
  skills: {
    key: 'skills',
    detailsLabel: 'Skill area',
    detailsPlaceholder: 'Backend engineering',
    datePlaceholder: 'Years of experience (optional)',
    notePlaceholder: 'TypeScript, Node.js, PostgreSQL…',
  },
  achievements: {
    key: 'achievements',
    detailsLabel: 'Achievement',
    detailsPlaceholder: 'AWS Certified Solutions Architect',
    datePlaceholder: '2024',
    notePlaceholder: 'Context or supporting detail',
  },
  languages: {
    key: 'languages',
    detailsLabel: 'Language',
    detailsPlaceholder: 'English',
    datePlaceholder: 'Native, Fluent, Conversational…',
    notePlaceholder: 'Optional context (certifications, region…)',
  },
  hobbies: {
    key: 'hobbies',
    detailsLabel: 'Hobby',
    detailsPlaceholder: 'Photography',
    datePlaceholder: '',
    notePlaceholder: 'Add detail or extra hobbies (one per note)',
  },
};

export const STEPS: Step[] = [
  { index: 1, kind: 'biography', label: 'Biography',       helper: 'Who you are.' },
  { index: 2, kind: 'contacts',  label: 'Contacts',        helper: 'How to reach you.' },
  { index: 3, kind: 'summary',   label: 'About you',       helper: 'A short professional summary that opens your resume. 2–4 sentences works well.' },
  { index: 4, kind: 'list',      label: 'Work experience', helper: 'Add a card per role. Notes show as bullets in the PDF.', listKey: 'workExperience' },
  { index: 5, kind: 'list',      label: 'Education',       helper: 'Schools, degrees, courses.', listKey: 'education' },
  { index: 6, kind: 'list',      label: 'Skills',          helper: 'Group skills however you like — each card becomes a section in the PDF.', listKey: 'skills' },
  { index: 7, kind: 'list',      label: 'Achievements',    helper: 'Awards, certifications, milestones.', listKey: 'achievements' },
  { index: 8, kind: 'list',      label: 'Languages',       helper: 'One entry per language. Use the "Date" field for proficiency (Native, Fluent, etc.).', listKey: 'languages' },
  { index: 9, kind: 'list',      label: 'Hobbies',         helper: 'Each note becomes a bullet in the PDF — feel free to use one entry with many notes.', listKey: 'hobbies' },
  { index: 10, kind: 'references', label: 'References',    helper: 'People who can speak to your work — name, role and how to reach them.' },
  { index: 11, kind: 'photo',    label: 'Profile photo',   helper: 'Optional. JPEG, PNG, or WebP, up to 5 MB.' },
];

export function getStep(stepNumber: number): Step | undefined {
  return STEPS.find((s) => s.index === stepNumber);
}

export const TOTAL_STEPS = STEPS.length;
