/** A section of the skills page, in the order they are shown */
export type SkillCategory =
  | 'CORE_STACK'
  | 'ENGINEERING_PRACTICES'
  | 'TESTING_AND_QUALITY'
  | 'AI'
  | 'DEVELOPMENT_TOOLS'
  | 'ADDITIONAL_TECHNOLOGIES';

export interface SkillEntry {
  name: string;
  /** 0–5 scale */
  level: number;
  icon: string;
}

export interface Skill {
  category: SkillCategory;
  icon: string;
  entries: SkillEntry[];
}
