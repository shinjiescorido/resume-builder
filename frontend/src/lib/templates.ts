export interface TemplateInfo {
  key: string;
  name: string;
  description: string;
  swatch: string;
  preview: string;
}

export const TEMPLATES: TemplateInfo[] = [
  {
    key: 'classic',
    name: 'Classic',
    description: 'Two-column serif resume with a peach sidebar. Warm, traditional, hiring-manager friendly.',
    swatch: '#f1dccc',
    preview: 'Peach sidebar · serif name · bullet skills',
  },
  {
    key: 'modern',
    name: 'Modern',
    description: 'Clean sans-serif with a navy header band, timeline-style work history and skill bars.',
    swatch: '#2c3e50',
    preview: 'Navy header · timeline dates · skill bars',
  },
  {
    key: 'editorial',
    name: 'Editorial',
    description: 'Single-column layout with a dark hero band, serif name, sans body and structured ▸ section headings.',
    swatch: '#1f2937',
    preview: 'Hero band · serif display · two-col skills',
  },
];

export function getTemplateInfo(key: string | undefined): TemplateInfo {
  return TEMPLATES.find((t) => t.key === key) ?? TEMPLATES[0];
}
