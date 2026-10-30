import { ReferenceItemDto, ResumePayloadDto, SectionItemDto } from '../job.types';

function escape(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function lineBreaks(value: string): string {
  return escape(value).replace(/\n/g, '<br/>');
}

const ICONS: Record<string, string> = {
  mail: `<svg viewBox="0 0 24 24" width="11" height="11"><path d="M3 6h18v12H3z" fill="none" stroke="white" stroke-width="2"/><path d="M3 7l9 6 9-6" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  phone: `<svg viewBox="0 0 24 24" width="11" height="11"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7 12.8 12.8 0 0 0 .7 2.8 2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4 12.8 12.8 0 0 0 2.8.7A2 2 0 0 1 22 16.9z" fill="none" stroke="white" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  pin: `<svg viewBox="0 0 24 24" width="11" height="11"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill="none" stroke="white" stroke-width="1.7" stroke-linejoin="round"/><circle cx="12" cy="10" r="3" fill="none" stroke="white" stroke-width="1.7"/></svg>`,
  web: `<svg viewBox="0 0 24 24" width="11" height="11"><circle cx="12" cy="12" r="10" fill="none" stroke="white" stroke-width="1.7"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" fill="none" stroke="white" stroke-width="1.5"/></svg>`,
  link: `<svg viewBox="0 0 24 24" width="11" height="11"><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" fill="none" stroke="white" stroke-width="1.7" stroke-linecap="round"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" fill="none" stroke="white" stroke-width="1.7" stroke-linecap="round"/></svg>`,
};

function iconBubble(kind: keyof typeof ICONS): string {
  return `<span class="icon">${ICONS[kind]}</span>`;
}

function splitName(full: string): { top: string; bottom: string } {
  const parts = full.trim().split(/\s+/);
  if (parts.length <= 1) return { top: parts[0] ?? '', bottom: '' };
  return { top: parts[0], bottom: parts.slice(1).join(' ') };
}

function flattenSkills(items: SectionItemDto[]): string[] {
  const out: string[] = [];
  for (const it of items) {
    const details = (it.details ?? '').trim();
    const notes = (it.notes ?? []).filter((n) => n.trim());
    if (notes.length) {
      for (const n of notes) out.push(n);
    } else if (details) {
      out.push(details);
    }
  }
  return out;
}

function renderLanguages(items: SectionItemDto[]): string {
  return items
    .filter((it) => (it.details ?? '').trim() || (it.date ?? '').trim())
    .map((it) => {
      const name = (it.details ?? '').trim();
      const level = (it.date ?? '').trim();
      const both = [name, level].filter(Boolean).join(' — ');
      return `<p class="lang-line">${escape(both)}</p>`;
    })
    .join('');
}

function renderEducation(items: SectionItemDto[]): string {
  return items
    .filter((it) => (it.details ?? '').trim() || (it.date ?? '').trim() || (it.notes ?? []).some((n) => n.trim()))
    .map((it) => {
      const details = (it.details ?? '').trim();
      const date = (it.date ?? '').trim();
      const notes = (it.notes ?? []).filter((n) => n.trim());
      return `
        <div class="entry sidebar-entry">
          ${details ? `<p class="title">${escape(details)}</p>` : ''}
          ${date ? `<p class="meta">${escape(date)}</p>` : ''}
          ${notes.length ? notes.map((n) => `<p class="italic">${lineBreaks(n)}</p>`).join('') : ''}
        </div>
      `;
    })
    .join('');
}

function renderReferences(items: ReferenceItemDto[]): string {
  return items
    .filter((r) =>
      (r.name ?? '').trim() ||
      (r.company ?? '').trim() ||
      (r.position ?? '').trim() ||
      (r.email ?? '').trim() ||
      (r.phone ?? '').trim(),
    )
    .map((r) => {
      const name = (r.name ?? '').trim();
      const company = (r.company ?? '').trim();
      const position = (r.position ?? '').trim();
      const email = (r.email ?? '').trim();
      const phone = (r.phone ?? '').trim();
      const role = [position, company].filter(Boolean).join(' · ');
      const contact = [phone, email].filter(Boolean).join('  ·  ');
      return `
        <div class="entry reference">
          ${name ? `<p class="title">${escape(name)}</p>` : ''}
          ${role ? `<p class="meta">${escape(role)}</p>` : ''}
          ${contact ? `<p class="ref-contact">${escape(contact)}</p>` : ''}
        </div>
      `;
    })
    .join('');
}

function renderEntries(items: SectionItemDto[]): string {
  return items
    .filter((it) => (it.details ?? '').trim() || (it.date ?? '').trim() || (it.notes ?? []).some((n) => n.trim()))
    .map((it) => {
      const details = (it.details ?? '').trim();
      const date = (it.date ?? '').trim();
      const notes = (it.notes ?? []).filter((n) => n.trim());
      return `
        <div class="entry">
          ${details ? `<p class="title">${escape(details)}</p>` : ''}
          ${date ? `<p class="meta">${escape(date)}</p>` : ''}
          ${notes.length ? `<ul class="bullets">${notes.map((n) => `<li>${lineBreaks(n)}</li>`).join('')}</ul>` : ''}
        </div>
      `;
    })
    .join('');
}

function block(heading: string, body: string, sidebar = false): string {
  if (!body.trim()) return '';
  return `<section class="block ${sidebar ? 'sidebar-block' : ''}"><h2>${escape(heading)}</h2>${body}</section>`;
}

export function renderClassic(resume: ResumePayloadDto): string {
  const bio = resume.biography ?? {};
  const contacts = resume.contacts ?? {};
  const photo = resume.photo?.dataUrl;
  const summary = (resume.summary ?? '').trim();

  const fullName = (bio.name ?? '').trim() || resume.title || 'Untitled';
  const { top, bottom } = splitName(fullName);

  const contactLines: string[] = [];
  if ((contacts.email ?? '').trim()) {
    contactLines.push(`<li>${iconBubble('mail')}<span>${escape(contacts.email!.trim())}</span></li>`);
  }
  if ((contacts.phone ?? '').trim()) {
    contactLines.push(`<li>${iconBubble('phone')}<span>${escape(contacts.phone!.trim())}</span></li>`);
  }
  if ((bio.address ?? '').trim()) {
    contactLines.push(`<li>${iconBubble('pin')}<span>${lineBreaks(bio.address!.trim())}</span></li>`);
  }
  if ((contacts.website ?? '').trim()) {
    contactLines.push(`<li>${iconBubble('web')}<span>${escape(contacts.website!.trim())}</span></li>`);
  }
  if ((contacts.linkedin ?? '').trim()) {
    contactLines.push(`<li>${iconBubble('link')}<span>${escape(contacts.linkedin!.trim())}</span></li>`);
  }

  const measureBits: string[] = [];
  if ((bio.height ?? '').trim()) measureBits.push(`Height ${escape(bio.height!.trim())}`);
  if ((bio.weight ?? '').trim()) measureBits.push(`Weight ${escape(bio.weight!.trim())}`);

  const skills = flattenSkills(resume.skills ?? []);
  const skillsBlock = block(
    'Skills',
    skills.length ? `<ul class="bullets">${skills.map((s) => `<li>${lineBreaks(s)}</li>`).join('')}</ul>` : '',
    true,
  );

  const educationBlock = block('Education', renderEducation(resume.education ?? []), true);

  const languagesBlock = block('Languages', renderLanguages(resume.languages ?? []), true);

  const hobbies = flattenSkills(resume.hobbies ?? []);
  const hobbiesBlock = block(
    'Hobbies',
    hobbies.length ? `<ul class="bullets">${hobbies.map((h) => `<li>${lineBreaks(h)}</li>`).join('')}</ul>` : '',
    true,
  );

  const summaryBlock = block(
    'Professional Summary',
    summary ? `<p class="summary">${lineBreaks(summary)}</p>` : '',
  );
  const workBlock = block('Work History', renderEntries(resume.workExperience ?? []));
  const achievementsBlock = block('Achievements', renderEntries(resume.achievements ?? []));
  const referencesBlock = block('References', renderReferences(resume.references ?? []));

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${escape(fullName)}</title>
<style>
  *, *::before, *::after {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: 'EB Garamond', 'Liberation Serif', Georgia, 'Times New Roman', serif;
    color: #2a2a2a;
    font-size: 11pt;
    line-height: 1.55;
    background-color: #f1dccc;
    text-rendering: geometricPrecision;
    -webkit-font-feature-settings: "kern" 1, "liga" 1, "onum" 1;
    font-feature-settings: "kern" 1, "liga" 1, "onum" 1;
  }
  .page {
    display: flex;
    align-items: stretch;
    width: 210mm;
    min-height: 297mm;
    background-color: #f1dccc;
  }
  .left {
    width: 38%;
    padding: 36px 26px 36px 32px;
    background-color: #f1dccc;
  }
  .right {
    flex: 1;
    padding: 36px 32px 36px 32px;
    background-color: #ffffff;
  }

  .photo {
    width: 86px; height: 86px; border-radius: 50%; overflow: hidden;
    margin: 0 0 14px 0;
    border: 2px solid #ffffff;
  }
  .photo img { width: 100%; height: 100%; object-fit: cover; display: block; }

  h1.name {
    font-family: 'Solide Mirage', 'EB Garamond', 'Liberation Serif', Georgia, 'Times New Roman', serif;
    font-size: 32pt;
    font-weight: 700;
    letter-spacing: 0.025em;
    line-height: 1.02;
    margin: 0;
    color: #1f1f1f;
    text-transform: uppercase;
  }
  .rule {
    width: 44px; height: 2px; background: #b07e72;
    margin: 12px 0 20px 0;
  }

  ul.contacts { list-style: none; padding: 0; margin: 14px 0 0 0; }
  ul.contacts li {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 9px; font-size: 10pt; color: #3f3f3f; word-break: break-word;
  }
  .icon {
    width: 22px; height: 22px; border-radius: 50%;
    background: #c78b7e;
    display: inline-flex; align-items: center; justify-content: center;
    flex: 0 0 22px;
  }
  .icon svg { display: block; }

  .measures {
    margin-top: 6px; font-size: 9.5pt; color: #6a6a6a;
  }
  .measures span + span::before { content: ' · '; }

  section.block { margin-top: 22px; }
  section.block:first-child { margin-top: 0; }
  section.block h2 {
    font-family: 'Solide Mirage', 'EB Garamond', 'Liberation Serif', Georgia, serif;
    font-size: 11.5pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    color: #1f1f1f;
    margin: 0 0 10px 0;
  }
  section.sidebar-block h2 { color: #2a2a2a; }

  ul.bullets { list-style: disc; padding-left: 18px; margin: 0; }
  ul.bullets li { margin-bottom: 4px; font-size: 10pt; color: #3f3f3f; }
  .right ul.bullets li { color: #4a4a4a; }

  .entry { margin-bottom: 14px; page-break-inside: avoid; }
  .entry .title { font-weight: 700; color: #1a1a1a; font-size: 11pt; margin: 0 0 2px 0; letter-spacing: 0.005em; }
  .entry .meta { font-style: italic; color: #7a6a64; font-size: 10pt; margin: 0 0 4px 0; }
  .entry .italic { font-style: italic; color: #555; font-size: 10pt; margin: 2px 0; }
  .entry ul.bullets { margin-top: 4px; }

  .summary { margin: 0; line-height: 1.6; color: #3f3f3f; font-size: 10.5pt; }

  .reference { margin-bottom: 10px; }
  .ref-contact { margin: 2px 0 0 0; color: #555; font-size: 9.5pt; }

  .lang-line { margin: 0 0 4px 0; font-size: 9.5pt; color: #3f3f3f; }

  @page { size: A4; margin: 0; }
</style>
</head>
<body>
  <div class="page">
    <aside class="left">
      ${photo ? `<div class="photo"><img src="${photo}" alt="" /></div>` : ''}
      <h1 class="name">
        ${escape(top)}${bottom ? `<br/>${escape(bottom)}` : ''}
      </h1>
      <div class="rule"></div>
      ${contactLines.length ? `<ul class="contacts">${contactLines.join('')}</ul>` : ''}
      ${measureBits.length ? `<div class="measures">${measureBits.map((m) => `<span>${m}</span>`).join('')}</div>` : ''}
      ${skillsBlock}
      ${languagesBlock}
      ${educationBlock}
      ${hobbiesBlock}
    </aside>
    <main class="right">
      ${summaryBlock}
      ${workBlock}
      ${achievementsBlock}
      ${referencesBlock}
    </main>
  </div>
</body>
</html>`;
}
