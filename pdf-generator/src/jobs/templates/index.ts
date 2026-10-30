import { ResumePayloadDto } from '../job.types';
import { renderClassic } from './classic';
import { renderModern } from './modern';
import { renderEditorial } from './editorial';

export type TemplateRenderer = (resume: ResumePayloadDto) => string;

const REGISTRY: Record<string, TemplateRenderer> = {
  classic: renderClassic,
  modern: renderModern,
  editorial: renderEditorial,
};

export function getTemplate(key: string | undefined): TemplateRenderer {
  if (key && REGISTRY[key]) return REGISTRY[key];
  return REGISTRY.classic;
}

export const TEMPLATE_KEYS = Object.keys(REGISTRY);
