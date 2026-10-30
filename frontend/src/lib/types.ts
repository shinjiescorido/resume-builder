export interface Biography {
  name: string;
  address: string;
  height: string;
  weight: string;
}

export interface Contacts {
  email: string;
  phone: string;
  website: string;
  linkedin: string;
}

export interface SectionItem {
  id: string;
  details: string;
  date: string;
  notes: string[];
}

export interface Reference {
  id: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  position: string;
}

export type ListSectionKey =
  | 'workExperience'
  | 'education'
  | 'skills'
  | 'achievements'
  | 'languages'
  | 'hobbies';

export type PdfStatus = 'none' | 'pending' | 'ready' | 'failed';

export interface Resume {
  _id: string;
  userId: string;
  title: string;
  template: string;
  summary: string;
  biography: Biography;
  contacts: Contacts;
  workExperience: SectionItem[];
  education: SectionItem[];
  skills: SectionItem[];
  achievements: SectionItem[];
  languages: SectionItem[];
  hobbies: SectionItem[];
  references: Reference[];
  photoPath: string | null;
  pdfStatus: PdfStatus;
  pdfJobId: string | null;
  pdfError: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  userId: string;
  username: string;
}
