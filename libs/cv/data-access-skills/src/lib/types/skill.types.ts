export type SkillCategory =
  | 'PROGRAMMING_LANGUAGES'
  | 'FRAMEWORKS'
  | 'LIBRARIES'
  | 'OPERATING_SYSTEMS'
  | 'VERSION_CONTROL';

export interface SkillEntry {
  name: string;
  /** 0–10 scale */
  level: number;
  icon: string;
}

export interface Skill {
  category: SkillCategory;
  icon: string;
  entries: SkillEntry[];
}
