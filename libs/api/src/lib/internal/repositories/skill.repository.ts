import type { Skill } from '../generated/resolvers-types';

/*
 * Levels are on a 0–5 scale, shown as five dots (one dot per level).
 * Sections go from what I do every day to broader experience; entries within a
 * section are ordered by level, then by relevance.
 */

const coreStackSkill: Skill = {
  category: 'CORE_STACK',
  icon: 'code',
  entries: [
    { level: 5, name: 'Angular', icon: 'angular' },
    { level: 5, name: 'TypeScript', icon: 'typescript' },
    { level: 4, name: 'RxJS', icon: 'rxjs' },
    { level: 4, name: 'Signals · NgRx Signal Store', icon: 'ngrx' },
    { level: 4, name: 'Nx monorepos', icon: 'nx' },
    { level: 5, name: 'GraphQL · Apollo', icon: 'graphql' },
    { level: 4, name: 'Kendo UI', icon: 'telerik' },
    { level: 2, name: 'Angular Material', icon: 'angular-material' },
    { level: 5, name: 'Sass (SCSS)', icon: 'scss' },
    { level: 5, name: 'HTML5', icon: 'html5' },
    { level: 5, name: 'CSS3', icon: 'css3' },
  ],
};

const engineeringPracticesSkill: Skill = {
  category: 'ENGINEERING_PRACTICES',
  icon: 'layers',
  entries: [
    { level: 5, name: 'Component-driven architecture', icon: 'layers' },
    { level: 5, name: 'Scrum · Agile', icon: 'scrum' },
    { level: 4, name: 'Reactive programming', icon: 'rxjs' },
    { level: 4, name: 'Design patterns', icon: 'code' },
    { level: 4, name: 'GraphQL Codegen', icon: 'graphql' },
    { level: 3, name: 'CI/CD', icon: 'git-branch' },
  ],
};

const testingAndQualitySkill: Skill = {
  category: 'TESTING_AND_QUALITY',
  icon: 'award',
  entries: [
    { level: 4, name: 'Unit testing · Vitest/Jest', icon: 'code' },
    { level: 3, name: 'Accessibility (a11y)', icon: 'accessibility' },
    { level: 4, name: 'Code reviews', icon: 'github' },
    { level: 5, name: 'ESLint · Prettier · Stylelint', icon: 'wrench' },
    { level: 4, name: 'Integration testing', icon: 'layers' },
    { level: 4, name: 'E2E testing · Playwright', icon: 'terminal' },
  ],
};

const aiSkill: Skill = {
  category: 'AI',
  icon: 'brain',
  entries: [
    { level: 4, name: 'Claude Code', icon: 'claude' },
    { level: 4, name: 'GitHub Copilot', icon: 'github' },
    { level: 3, name: 'Cursor', icon: 'cursor' },
    { level: 3, name: 'Agent & Skills Development', icon: 'ai' },
  ],
};

const developmentToolsSkill: Skill = {
  category: 'DEVELOPMENT_TOOLS',
  icon: 'wrench',
  entries: [
    { level: 5, name: 'Git (CLI) · GitHub', icon: 'git' },
    { level: 5, name: 'Jira · Confluence', icon: 'jira' },
    { level: 4, name: 'JetBrains · IntelliJ', icon: 'jetbrains' },
    { level: 4, name: 'Postman', icon: 'postman' },
    { level: 3, name: 'GitLab · Bitbucket', icon: 'gitlab' },
  ],
};

const additionalTechnologiesSkill: Skill = {
  category: 'ADDITIONAL_TECHNOLOGIES',
  icon: 'terminal',
  entries: [
    { level: 4, name: 'REST APIs', icon: 'rest-api' },
    { level: 4, name: 'PHP', icon: 'php' },
    { level: 4, name: 'Magento 2', icon: 'magento' },
    { level: 3, name: 'Node.js', icon: 'nodejs' },
    { level: 3, name: 'NestJs', icon: 'nestjs' },
    { level: 3, name: 'React', icon: 'react' },
    { level: 3, name: 'Java', icon: 'java' },
    { level: 3, name: 'Symfony', icon: 'symfony' },
    { level: 2, name: 'Sulu', icon: 'sulu' },
    { level: 3, name: 'Laravel', icon: 'laravel' },
    { level: 2, name: 'C#', icon: 'csharp' },
    { level: 3, name: 'SQL · MySQL', icon: 'mysql' },
  ],
};

/**
 * Other technologies, listed without a level (the CV's "Other skills"): a name,
 * or a translation key for a translatable label
 */
const otherSkills: string[] = [
  'PHP',
  'Magento 2',
  'Symfony',
  'MySQL',
  'Node.js',
  'React',
  'REST APIs',
  'Codegen',
  // Unit, integration & E2E testing
  't.skill.other.testing',
];

export const skillRepository = {
  findOthers: (): string[] => otherSkills,
  findAll: (): Skill[] => [
    coreStackSkill,
    engineeringPracticesSkill,
    testingAndQualitySkill,
    aiSkill,
    developmentToolsSkill,
    additionalTechnologiesSkill,
  ],
};
