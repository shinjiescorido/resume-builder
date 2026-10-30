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
  pin: `<svg viewBox="0 0 24 24" width="11" height="11"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="12" cy="10" r="3" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>`,
  mail: `<svg viewBox="0 0 24 24" width="11" height="11"><path d="M3 6h18v12H3z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M3 7l9 6 9-6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  phone: `<svg viewBox="0 0 24 24" width="11" height="11"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7 12.8 12.8 0 0 0 .7 2.8 2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4 12.8 12.8 0 0 0 2.8.7A2 2 0 0 1 22 16.9z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  web: `<svg viewBox="0 0 24 24" width="11" height="11"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>`,
  link: `<svg viewBox="0 0 24 24" width="11" height="11"><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
};

function renderEntries(items: SectionItemDto[]): string {
  return items
    .filter((it) => (it.details ?? '').trim() || (it.date ?? '').trim() || (it.notes ?? []).some((n) => n.trim()))
    .map((it) => {
      const details = (it.details ?? '').trim();
      const date = (it.date ?? '').trim();
      const notes = (it.notes ?? []).filter((n) => n.trim());
      return `
        <div class="entry">
          <div class="entry-head">
            ${details ? `<p class="entry-title">${escape(details)}</p>` : ''}
            ${date ? `<p class="entry-date">${escape(date)}</p>` : ''}
          </div>
          ${notes.map((n) => `<p class="entry-note">${lineBreaks(n)}</p>`).join('')}
        </div>
      `;
    })
    .join('');
}

function flattenSkills(items: SectionItemDto[]): string[] {
  const out: string[] = [];
  for (const it of items) {
    const details = (it.details ?? '').trim();
    const notes = (it.notes ?? []).filter((n) => n.trim());
    if (notes.length) for (const n of notes) out.push(n);
    else if (details) out.push(details);
  }
  return out;
}

function renderTwoColList(items: string[]): string {
  if (!items.length) return '';
  return `<ul class="two-col">${items.map((s) => `<li>${escape(s)}</li>`).join('')}</ul>`;
}

function renderReferences(items: ReferenceItemDto[]): string {
  return items
    .filter((r) =>
      (r.name ?? '').trim() ||
      (r.email ?? '').trim() ||
      (r.phone ?? '').trim() ||
      (r.company ?? '').trim() ||
      (r.position ?? '').trim(),
    )
    .map((r) => {
      const name = (r.name ?? '').trim();
      const role = [(r.position ?? '').trim(), (r.company ?? '').trim()].filter(Boolean).join(' · ');
      const phone = (r.phone ?? '').trim();
      const email = (r.email ?? '').trim();
      return `
        <div class="ref">
          ${name ? `<p class="ref-name">${escape(name)}</p>` : ''}
          ${role ? `<p class="ref-role">${escape(role)}</p>` : ''}
          ${phone ? `<p class="ref-line"><span class="ref-key">Phone:</span> ${escape(phone)}</p>` : ''}
          ${email ? `<p class="ref-line"><span class="ref-key">Email:</span> ${escape(email)}</p>` : ''}
        </div>
      `;
    })
    .join('');
}

function section(heading: string, body: string): string {
  if (!body.trim()) return '';
  return `
    <section>
      <h2><span class="caret"></span><span class="h-text">${escape(heading)}</span><span class="h-rule"></span></h2>
      <div class="body">${body}</div>
    </section>
  `;
}

export function renderEditorial(resume: ResumePayloadDto): string {
  const bio = resume.biography ?? {};
  const contacts = resume.contacts ?? {};
  const photo = resume.photo?.dataUrl;
  const summary = (resume.summary ?? '').trim();

  const fullName = (bio.name ?? '').trim() || resume.title || 'Your Name';
  const jobTitle = (resume.workExperience ?? []).find((w) => (w.details ?? '').trim())?.details ?? '';

  const contactItems: Array<{ icon: keyof typeof ICONS; text: string }> = [];
  if ((contacts.phone ?? '').trim())   contactItems.push({ icon: 'phone', text: contacts.phone!.trim() });
  if ((contacts.email ?? '').trim())   contactItems.push({ icon: 'mail',  text: contacts.email!.trim() });
  if ((bio.address ?? '').trim())      contactItems.push({ icon: 'pin',   text: bio.address!.trim() });
  if ((contacts.website ?? '').trim()) contactItems.push({ icon: 'web',   text: contacts.website!.trim() });
  if ((contacts.linkedin ?? '').trim()) contactItems.push({ icon: 'link', text: contacts.linkedin!.trim() });

  const aboutBlock = section(
    'About Me',
    summary ? `<p class="about">${lineBreaks(summary)}</p>` : '',
  );

  const contactBlock = section(
    'Contact',
    contactItems.length
      ? `<div class="contact-grid">${contactItems
          .map((c) => `<div class="contact-row"><span class="ci">${ICONS[c.icon]}</span><span class="ct">${escape(c.text)}</span></div>`)
          .join('')}</div>`
      : '',
  );

  const workBlock         = section('Work Experience', renderEntries(resume.workExperience ?? []));
  const educationBlock    = section('Education',       renderEntries(resume.education ?? []));
  const skillsBlock       = section('Key Skills',      renderTwoColList(flattenSkills(resume.skills ?? [])));
  const achievementsBlock = section('Awards',          renderEntries(resume.achievements ?? []));
  const languagesBlock    = section('Languages',       renderEntries(resume.languages ?? []));
  const hobbiesBlock      = section('Hobbies',         renderTwoColList(flattenSkills(resume.hobbies ?? [])));
  const referencesBlock   = section('Reference',       renderReferences(resume.references ?? []));

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
    font-family: 'Lato', 'Inter', 'DejaVu Sans', Helvetica, Arial, sans-serif;
    color: #2a2a2a;
    font-size: 10.5pt;
    line-height: 1.55;
    background-color: #ffffff;
    text-rendering: geometricPrecision;
    font-feature-settings: "kern" 1, "liga" 1, "tnum" 1;
  }

  .page { width: 210mm; min-height: 297mm; background: #ffffff; }

  .hero {
    background-color: #1f2937;
    color: #ffffff;
    padding: 24px 32px;
    display: flex;
    align-items: center;
    gap: 24px;
  }
  .hero .text { flex: 1; min-width: 0; }
  .hero h1 {
    margin: 0;
    font-family: 'Playfair Display', 'EB Garamond', Georgia, 'Times New Roman', serif;
    font-size: 32pt;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    line-height: 1.0;
    font-feature-settings: "kern" 1, "liga" 1;
  }
  .hero .subtitle {
    margin: 6px 0 0 0;
    font-family: 'Lato', 'Inter', sans-serif;
    font-size: 10pt;
    font-weight: 700;
    letter-spacing: 0.24em;
    color: #cbd5e1;
    text-transform: uppercase;
  }
  .hero .photo {
    flex: 0 0 92px;
    width: 92px;
    height: 92px;
    border-radius: 50%;
    overflow: hidden;
    background-color: #374151;
    border: 3px solid #ffffff;
  }
  .hero .photo img { width: 100%; height: 100%; object-fit: cover; display: block; }

  .body-wrap {
    padding: 22px 36px 36px 36px;
  }

  section { margin-top: 18px; page-break-inside: avoid; }
  section:first-child { margin-top: 0; }

  h2 {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 8px 0;
    font-family: 'Playfair Display', 'EB Garamond', Georgia, serif;
    font-size: 13pt;
    font-weight: 700;
    color: #1f2937;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .caret {
    width: 0;
    height: 0;
    border-top: 5px solid transparent;
    border-bottom: 5px solid transparent;
    border-left: 7px solid #1f2937;
    flex: 0 0 7px;
  }
  .h-text { white-space: nowrap; }
  .h-rule {
    flex: 1;
    height: 1.2px;
    background: #1f2937;
    margin-left: 6px;
  }

  .body { padding-left: 0; }

  /* About paragraph */
  .about { margin: 0; color: #3f3f3f; font-size: 10pt; line-height: 1.6; }

  /* Contact grid: 2 columns */
  .contact-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px 24px;
  }
  .contact-row { display: flex; align-items: center; gap: 8px; font-size: 10pt; color: #374151; word-break: break-word; }
  .ci { display: inline-flex; color: #1f2937; flex: 0 0 14px; }

  /* Generic entry (work, education, awards, languages) */
  .entry { margin-bottom: 12px; page-break-inside: avoid; }
  .entry-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 12px;
    margin-bottom: 2px;
  }
  .entry-title {
    margin: 0;
    font-weight: 700;
    color: #1f2937;
    font-size: 10.5pt;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .entry-date {
    margin: 0;
    color: #4b5563;
    font-size: 9.5pt;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    white-space: nowrap;
    font-feature-settings: "tnum" 1;
  }
  .entry-note { margin: 3px 0 0 0; font-size: 10pt; color: #4b5563; line-height: 1.6; }

  /* Two-column list (skills, hobbies) */
  ul.two-col {
    list-style: disc;
    margin: 0;
    padding-left: 18px;
    column-count: 2;
    column-gap: 28px;
  }
  ul.two-col li {
    font-size: 10pt;
    color: #374151;
    margin-bottom: 4px;
    break-inside: avoid;
  }

  /* References */
  .ref { margin-bottom: 8px; }
  .ref-name { margin: 0; font-weight: 700; color: #1f2937; font-size: 10.5pt; text-transform: uppercase; letter-spacing: 0.04em; }
  .ref-role { margin: 1px 0 2px 0; color: #6b7280; font-size: 10pt; font-style: italic; }
  .ref-line { margin: 1px 0 0 0; font-size: 10pt; color: #374151; }
  .ref-key { font-weight: 700; color: #1f2937; }

  @page { size: A4; margin: 0; }
</style>
</head>
<body>
  <div class="page">
    <header class="hero">
      <div class="text">
        <h1>${escape(fullName)}</h1>
        ${jobTitle ? `<p class="subtitle">${escape(jobTitle)}</p>` : ''}
      </div>
      <div class="photo">${photo ? `<img src="${photo}" alt="" />` : ''}</div>
    </header>
    <div class="body-wrap">
      ${aboutBlock}
      ${contactBlock}
      ${workBlock}
      ${educationBlock}
      ${skillsBlock}
      ${achievementsBlock}
      ${languagesBlock}
      ${hobbiesBlock}
      ${referencesBlock}
    </div>
  </div>
</body>
</html>`;
}
