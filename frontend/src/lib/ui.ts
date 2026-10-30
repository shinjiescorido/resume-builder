export const button = {
  base:
    'inline-flex items-center justify-center rounded-lg px-5 py-3 text-base font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60',
  primary:
    'bg-[color:var(--color-brand-600)] text-white hover:bg-[color:var(--color-brand-700)] focus-visible:bg-[color:var(--color-brand-700)]',
  secondary:
    'bg-white text-[color:var(--color-ink)] border border-[color:var(--color-line)] hover:bg-slate-50',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  large: 'min-h-12 min-w-32 text-base',
};

export const input =
  'w-full rounded-lg border border-[color:var(--color-line)] bg-white px-4 py-3 text-base text-[color:var(--color-ink)] placeholder:text-[color:var(--color-muted)] focus:border-[color:var(--color-brand-500)] focus:outline-none';

export const card =
  'rounded-xl border border-[color:var(--color-line)] bg-white p-6 shadow-sm';

export const label = 'block text-sm font-medium text-[color:var(--color-ink)] mb-2';

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}
