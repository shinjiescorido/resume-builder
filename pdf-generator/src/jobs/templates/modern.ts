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
  pin: `<svg viewBox="0 0 24 24" width="11" height="11"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><circle cx="12" cy="10" r="3" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>`,
  mail: `<svg viewBox="0 0 24 24" width="11" height="11"><path d="M3 6h18v12H3z" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M3 7l9 6 9-6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  phone: `<svg viewBox="0 0 24 24" width="11" height="11"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7 12.8 12.8 0 0 0 .7 2.8 2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4 12.8 12.8 0 0 0 2.8.7A2 2 0 0 1 22 16.9z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  web: `<svg viewBox="0 0 24 24" width="11" height="11"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`,
  link: `<svg viewBox="0 0 24 24" width="11" height="11"><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`,
};

function proficiencyPercent(level: string | undefined): number {
  if (!level) return 80;
  const v = level.toLowerCase().trim();
  const fraction = v.match(/^(\d+)\s*\/\s*(\d+)/);
  if (fraction) {
    const n = parseInt(fraction[1], 10);
    const d = parseInt(fraction[2], 10);
    if (Number.isFinite(n) && Number.isFinite(d) && d > 0) {
      return Math.max(5, Math.min(100, Math.round((n / d) * 100)));
    }
  }
  if (/^\d+%$/.test(v)) return Math.max(5, Math.min(100, parseInt(v, 10)));
  if (/^\d+$/.test(v)) {
    const n = parseInt(v, 10);
    if (n >= 0 && n <= 5) return n * 20;
    if (n <= 10) return n * 10;
    return Math.max(5, Math.min(100, n));
  }
  if (/native|mother/.test(v)) return 100;
  if (/fluent|c2|expert/.test(v)) return 92;
  if (/advanced|c1/.test(v)) return 82;
  if (/upper.intermediate|b2/.test(v)) return 72;
  if (/intermediate|business|b1/.test(v)) return 62;
  if (/conversational|a2/.test(v)) return 48;
  if (/basic|beginner|novice|a1/.test(v)) return 30;
  return 80;
}

function bar(percent: number): string {
  const clamped = Math.max(2, Math.min(100, percent));
  return `
    <div class="bar-track">
      <div class="bar-fill" style="width: ${clamped}%"></div>
      <div class="bar-knob" style="left: calc(${clamped}% - 5px)"></div>
    </div>
  `;
}

function renderSkillRows(items: SectionItemDto[]): string {
  const flat: Array<{ label: string; level: string }> = [];
  for (const it of items) {
    const details = (it.details ?? '').trim();
    const date = (it.date ?? '').trim();
    const notes = (it.notes ?? []).filter((n) => n.trim());
    if (notes.length) {
      // "Backend / 4" with notes ["TypeScript","PostgreSQL"] → one row per note inheriting parent level
      for (const n of notes) flat.push({ label: n.trim(), level: date });
    } else if (details) {
      flat.push({ label: details, level: date });
    }
  }
  if (!flat.length) return '';
  return flat
    .map(
      (row) => `
        <div class="skill-row">
          <span class="skill-label">${escape(row.label)}</span>
          ${bar(proficiencyPercent(row.level))}
        </div>
      `,
    )
    .join('');
}

function renderLanguageRows(items: SectionItemDto[]): string {
  return items
    .filter((it) => (it.details ?? '').trim() || (it.date ?? '').trim())
    .map((it) => {
      const name = (it.details ?? '').trim();
      const level = (it.date ?? '').trim();
      return `
        <div class="skill-row">
          <span class="skill-label">${escape(name)}${level ? ` <span class="skill-level">· ${escape(level)}</span>` : ''}</span>
          ${bar(proficiencyPercent(level))}
        </div>
      `;
    })
    .join('');
}

function renderTimelineEntries(items: SectionItemDto[]): string {
  return items
    .filter((it) => (it.details ?? '').trim() || (it.date ?? '').trim() || (it.notes ?? []).some((n) => n.trim()))
    .map((it) => {
      const details = (it.details ?? '').trim();
      const date = (it.date ?? '').trim();
      const notes = (it.notes ?? []).filter((n) => n.trim());
      const firstNote = notes[0] ?? '';
      const restNotes = notes.slice(1);
      return `
        <div class="timeline-row">
          <div class="timeline-date">${escape(date)}</div>
          <div class="timeline-body">
            ${details ? `<p class="timeline-title">${escape(details)}</p>` : ''}
            ${firstNote ? `<p class="timeline-sub">${escape(firstNote)}</p>` : ''}
            ${restNotes.map((n) => `<p class="timeline-note">${lineBreaks(n)}</p>`).join('')}
          </div>
        </div>
      `;
    })
    .join('');
}

function renderReferenceRows(items: ReferenceItemDto[]): string {
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
      const contact = [(r.phone ?? '').trim(), (r.email ?? '').trim()].filter(Boolean).join(' · ');
      return `
        <div class="ref-row">
          ${name ? `<p class="ref-name">${escape(name)}</p>` : ''}
          ${role ? `<p class="ref-role">${escape(role)}</p>` : ''}
          ${contact ? `<p class="ref-contact">${escape(contact)}</p>` : ''}
        </div>
      `;
    })
    .join('');
}

function flattenList(items: SectionItemDto[]): string[] {
  const out: string[] = [];
  for (const it of items) {
    const details = (it.details ?? '').trim();
    const notes = (it.notes ?? []).filter((n) => n.trim());
    if (notes.length) for (const n of notes) out.push(n);
    else if (details) out.push(details);
  }
  return out;
}

function block(heading: string, body: string, side: 'left' | 'right' = 'left'): string {
  if (!body.trim()) return '';
  return `<section class="block ${side}"><h2>${escape(heading)}</h2>${body}</section>`;
}

export function renderModern(resume: ResumePayloadDto): string {
  const bio = resume.biography ?? {};
  const contacts = resume.contacts ?? {};
  const photo = resume.photo?.dataUrl;
  const summary = (resume.summary ?? '').trim();

  const fullName = (bio.name ?? '').trim() || resume.title || 'Your Name';
  const jobTitle = (resume.workExperience ?? []).find((w) => (w.details ?? '').trim())?.details ?? '';
  // Job title fallback: first work entry's details. Often "Position - Company" form.

  const personalInfo: Array<{ icon: keyof typeof ICONS; text: string }> = [];
  if ((bio.address ?? '').trim()) personalInfo.push({ icon: 'pin',   text: bio.address!.trim() });
  if ((contacts.email ?? '').trim())    personalInfo.push({ icon: 'mail',  text: contacts.email!.trim() });
  if ((contacts.phone ?? '').trim())    personalInfo.push({ icon: 'phone', text: contacts.phone!.trim() });
  if ((contacts.website ?? '').trim())  personalInfo.push({ icon: 'web',   text: contacts.website!.trim() });
  if ((contacts.linkedin ?? '').trim()) personalInfo.push({ icon: 'link',  text: contacts.linkedin!.trim() });

  const aboutBlock = block(
    'About Me',
    summary ? `<p class="about-text">${lineBreaks(summary)}</p>` : '',
    'left',
  );

  const skillsBlock = block('Personal Skills', renderSkillRows(resume.skills ?? []), 'left');
  const languagesBlock = block('Languages', renderLanguageRows(resume.languages ?? []), 'left');

  const personalInfoBlock = block(
    'Personal Info',
    personalInfo.length
      ? personalInfo
          .map((row) => `
            <div class="info-row">
              <span class="info-icon">${ICONS[row.icon]}</span>
              <span class="info-text">${escape(row.text)}</span>
            </div>
          `)
          .join('')
      : '',
    'left',
  );

  const hobbies = flattenList(resume.hobbies ?? []);
  const hobbiesBlock = block(
    'Hobbies',
    hobbies.length ? `<ul class="hobby-list">${hobbies.map((h) => `<li>${lineBreaks(h)}</li>`).join('')}</ul>` : '',
    'left',
  );

  const workBlock        = block('Work Experience', renderTimelineEntries(resume.workExperience ?? []), 'right');
  const educationBlock   = block('Education',       renderTimelineEntries(resume.education ?? []),      'right');
  const achievementsBlock = block('Awards',         renderTimelineEntries(resume.achievements ?? []),   'right');
  const referencesBlock  = block('References',      renderReferenceRows(resume.references ?? []),       'right');

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
    font-family: 'Inter', 'Inter Variable', 'DejaVu Sans', 'Liberation Sans', Helvetica, Arial, sans-serif;
    color: #1f2937;
    font-size: 10.5pt;
    line-height: 1.55;
    background-color: #ffffff;
    text-rendering: geometricPrecision;
    -webkit-font-feature-settings: "kern" 1, "liga" 1, "calt" 1, "tnum" 1, "ss01" 1, "cv11" 1;
    font-feature-settings: "kern" 1, "liga" 1, "calt" 1, "tnum" 1, "ss01" 1, "cv11" 1;
  }

  .page { width: 210mm; min-height: 297mm; background: #ffffff; position: relative; }

  /* Header band */
  .header {
    background-color: #2c3e50;
    color: #ffffff;
    padding: 30px 40px 30px 200px;
    min-height: 110px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  /* Photo overlapping the header/body boundary */
  .photo {
    position: absolute;
    top: 32px;
    left: 36px;
    width: 116px;
    height: 116px;
    border-radius: 50%;
    background-color: #3d556d;
    overflow: hidden;
    border: 4px solid #ffffff;
    z-index: 2;
    box-sizing: border-box;
  }
  .photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .header h1 {
    margin: 0;
    font-family: 'Inter Display', 'Inter', sans-serif;
    font-size: 26pt;
    letter-spacing: 0.16em;
    font-weight: 700;
    color: #ffffff;
    text-transform: uppercase;
    line-height: 1.05;
  }
  .header .job-title {
    margin: 6px 0 0 0;
    font-size: 10.5pt;
    letter-spacing: 0.22em;
    color: #c9d4dd;
    text-transform: uppercase;
    font-weight: 500;
  }

  .columns {
    display: grid;
    grid-template-columns: 36% 1fr;
    align-items: stretch;
    width: 100%;
  }
  /* leave room for the photo that protrudes ~50px below the header */
  .left  { padding: 64px 22px 36px 36px; min-width: 0; }
  .right { padding: 24px 36px 36px 22px; min-width: 0; }

  section.block { margin-bottom: 20px; page-break-inside: avoid; }
  section.block h2 {
    font-size: 11pt;
    color: #2c3e50;
    letter-spacing: 0.16em;
    font-weight: 700;
    text-transform: uppercase;
    margin: 0 0 10px 0;
    padding-bottom: 6px;
    border-bottom: 1.5px solid #2c3e50;
  }

  .about-text { margin: 0; color: #4b5563; font-size: 10pt; line-height: 1.6; }

  /* Skill / Language bars */
  .skill-row { margin-bottom: 9px; }
  .skill-label { display: block; font-size: 10pt; color: #2c3e50; margin-bottom: 4px; font-weight: 600; letter-spacing: 0.005em; }
  .skill-level { font-weight: 400; color: #6b7280; font-size: 9pt; }
  .bar-track {
    position: relative;
    height: 4px;
    background-color: #d6dde3;
    border-radius: 4px;
  }
  .bar-fill {
    position: absolute; top: 0; left: 0; bottom: 0;
    background-color: #2c3e50;
    border-radius: 4px;
  }
  .bar-knob {
    position: absolute; top: -3px;
    width: 10px; height: 10px; border-radius: 50%;
    background-color: #2c3e50;
    border: 2px solid #ffffff;
  }

  /* Personal info icons */
  .info-row {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 7px; font-size: 10pt; color: #374151; word-break: break-word;
  }
  .info-icon {
    display: inline-flex; align-items: center; justify-content: center;
    width: 18px; height: 18px; flex: 0 0 18px;
    color: #2c3e50;
  }

  /* Hobbies */
  ul.hobby-list { list-style: disc; padding-left: 18px; margin: 0; }
  ul.hobby-list li { margin-bottom: 4px; font-size: 10pt; color: #4b5563; }

  /* Right-column entries: date column left, content right */
  .timeline-row {
    display: flex;
    gap: 18px;
    margin-bottom: 14px;
    page-break-inside: avoid;
  }
  .timeline-date {
    flex: 0 0 96px;
    font-size: 9.5pt;
    font-weight: 600;
    color: #2c3e50;
    letter-spacing: 0.04em;
    word-wrap: break-word;
    padding-top: 2px;
    font-feature-settings: "tnum" 1;
  }
  .timeline-body { flex: 1; min-width: 0; }
  .timeline-title { margin: 0 0 3px 0; font-size: 11pt; font-weight: 700; color: #1f2937; letter-spacing: 0.005em; }
  .timeline-sub { margin: 0 0 5px 0; font-size: 10pt; font-style: italic; color: #6b7280; }
  .timeline-note { margin: 3px 0 0 0; font-size: 10pt; color: #4b5563; line-height: 1.6; }

  /* References */
  .ref-row { margin-bottom: 10px; }
  .ref-name { margin: 0; font-weight: 700; color: #1f2937; font-size: 10.5pt; letter-spacing: 0.005em; }
  .ref-role { margin: 2px 0 0 0; font-size: 10pt; color: #6b7280; font-style: italic; }
  .ref-contact { margin: 2px 0 0 0; font-size: 10pt; color: #4b5563; font-feature-settings: "tnum" 1; }

  @page { size: A4; margin: 0; }
</style>
</head>
<body>
  <div class="page">
    <div class="photo">
      ${photo ? `<img src="${photo}" alt="" />` : ''}
    </div>
    <header class="header">
      <div class="head-text">
        <h1>${escape(fullName)}</h1>
        ${jobTitle ? `<p class="job-title">${escape(jobTitle)}</p>` : ''}
      </div>
    </header>

    <div class="columns">
      <aside class="left">
        ${aboutBlock}
        ${skillsBlock}
        ${personalInfoBlock}
        ${languagesBlock}
        ${hobbiesBlock}
      </aside>
      <main class="right">
        ${workBlock}
        ${educationBlock}
        ${achievementsBlock}
        ${referencesBlock}
      </main>
    </div>
  </div>
</body>
</html>`;
}
