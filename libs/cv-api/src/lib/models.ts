export type SkillCategory = 'FRONTEND' | 'BACKEND' | 'TOOLING';

export interface Profile {
  name: string;
  headline: string;
  location: string;
  summary: string;
}

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  /** ISO date (yyyy-mm) */
  from: string;
  /** ISO date (yyyy-mm), undefined = current position */
  to?: string;
  description: string;
  skillIds: string[];
}

export interface Person {
  id: string;
  name: string;
  age: number;
}
