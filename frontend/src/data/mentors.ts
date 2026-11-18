export interface Mentor {
  id: string;
  name: string;
  role: string;
  bio: string;
  specialties: string[];
  photo?: string;
  links?: { label: string; url: string }[];
}

// Add real mentors here (real photos and biographies only).
export const mentors: Mentor[] = [];
