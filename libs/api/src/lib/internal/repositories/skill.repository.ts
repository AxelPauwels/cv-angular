import type { Skill } from '../generated/resolvers-types';

/*
 * Levels are on a 0–5 scale, shown as five dots (one dot per level).
 * Sections go from what I do every day to broader experience; entries within a
 * section are ordered by level, then by relevance.
 */

const coreStackSkill: Skill = {
  uuid: 'e83ce25b-afa1-4f90-9990-243450867a8f',
  category: 'CORE_STACK',
  icon: 'code',
  entries: [
    {
      uuid: 'cacf8027-c63b-4fdc-8673-0a04b9fc56f9',
      level: 5,
      name: 'Angular',
      icon: 'angular',
    },
    {
      uuid: '032b6383-2357-40c1-bb74-60855ac8f999',
      level: 5,
      name: 'TypeScript',
      icon: 'typescript',
    },
    {
      uuid: '7a8343ee-0dbd-455a-83e8-d19c2f318d5d',
      level: 4,
      name: 'RxJS',
      icon: 'rxjs',
    },
    {
      uuid: 'f58db1ef-9ed5-406c-9011-97090a2ed8a9',
      level: 4,
      name: 'Signals · NgRx Signal Store',
      icon: 'ngrx',
    },
    {
      uuid: '4554766b-269b-4728-abe9-727e14c39ad8',
      level: 4,
      name: 'Nx monorepos',
      icon: 'nx',
    },
    {
      uuid: '2dddd546-0523-42a7-beb8-ad226b5bc89f',
      level: 5,
      name: 'GraphQL · Apollo',
      icon: 'graphql',
    },
    {
      uuid: '8bc7fa08-adc9-4325-ba96-4f7ab325ed9b',
      level: 4,
      name: 'Kendo UI',
      icon: 'telerik',
    },
    {
      uuid: 'ed0d7741-f47a-476d-a113-865c6eac0b27',
      level: 2,
      name: 'Angular Material',
      icon: 'angular-material',
    },
    {
      uuid: '6b8581b5-31e0-47f8-af49-443e5a963e50',
      level: 5,
      name: 'Sass (SCSS)',
      icon: 'scss',
    },
    {
      uuid: '8a3e2433-c5a6-45c6-99f9-7f64fc4dd470',
      level: 5,
      name: 'HTML5',
      icon: 'html5',
    },
    {
      uuid: '1fcbaa05-1752-4478-aee3-4d5adf558726',
      level: 5,
      name: 'CSS3',
      icon: 'css3',
    },
  ],
};

const engineeringPracticesSkill: Skill = {
  uuid: '7416381e-f8ee-4ff2-9cc1-ca5bf6bc15e2',
  category: 'ENGINEERING_PRACTICES',
  icon: 'layers',
  entries: [
    {
      uuid: '6b956d94-8413-4cc1-8340-29fb8ce62fae',
      level: 5,
      name: 'Component-driven architecture',
      icon: 'layers',
    },
    {
      uuid: 'c53b4307-4b28-43b1-9542-2a86012ce703',
      level: 5,
      name: 'Scrum · Agile',
      icon: 'scrum',
    },
    {
      uuid: '349bfad4-f5d9-43fd-8814-3327c643656b',
      level: 4,
      name: 'Reactive programming',
      icon: 'rxjs',
    },
    {
      uuid: 'cabda32d-a836-4fb4-ad16-b10d918a18ce',
      level: 4,
      name: 'Design patterns',
      icon: 'code',
    },
    {
      uuid: '23ae4ecd-091d-4c48-afd6-7e587842aaea',
      level: 4,
      name: 'GraphQL Codegen',
      icon: 'graphql',
    },
    {
      uuid: '70e43192-460d-4d6d-8ea4-5a708398c375',
      level: 3,
      name: 'CI/CD',
      icon: 'git-branch',
    },
  ],
};

const testingAndQualitySkill: Skill = {
  uuid: '064bc440-cb67-4503-a3cb-3309b381609b',
  category: 'TESTING_AND_QUALITY',
  icon: 'award',
  entries: [
    {
      uuid: '47f4fd6f-661d-4d90-be8e-a4aed907552e',
      level: 4,
      name: 'Unit testing · Vitest/Jest',
      icon: 'code',
    },
    {
      uuid: '2c3c8e86-2175-4c0e-86c8-1510ee2c2d7a',
      level: 3,
      name: 'Accessibility (a11y)',
      icon: 'accessibility',
    },
    {
      uuid: '45b3a3f3-812e-4ec4-a449-0f916b26cd95',
      level: 4,
      name: 'Code reviews',
      icon: 'github',
    },
    {
      uuid: '30695c6c-6855-47c4-8248-2d572a517bb0',
      level: 5,
      name: 'ESLint · Prettier · Stylelint',
      icon: 'wrench',
    },
    {
      uuid: 'f38ea7a5-b96a-487d-b377-dedf813840d4',
      level: 4,
      name: 'Integration testing',
      icon: 'layers',
    },
    {
      uuid: '70894f6f-dd58-41b3-8980-b830389ae9dd',
      level: 4,
      name: 'E2E testing · Playwright',
      icon: 'terminal',
    },
  ],
};

const aiSkill: Skill = {
  uuid: '434ebf1c-a098-45cb-9aaa-6cfc34e85d7c',
  category: 'AI',
  icon: 'brain',
  entries: [
    {
      uuid: '3e12ca1f-6988-47f7-90f1-92e55abc549e',
      level: 4,
      name: 'Claude Code',
      icon: 'claude',
    },
    {
      uuid: '1799af44-2b99-4f39-8bd2-915390daac56',
      level: 4,
      name: 'GitHub Copilot',
      icon: 'github',
    },
    {
      uuid: '32d77034-d3cb-4c4d-9b6a-a83e25b18d77',
      level: 3,
      name: 'Cursor',
      icon: 'cursor',
    },
    {
      uuid: '573e3b79-cb26-43d0-95eb-4088cbce0872',
      level: 3,
      name: 'Agent & Skills Development',
      icon: 'ai',
    },
  ],
};

const developmentToolsSkill: Skill = {
  uuid: 'fa496d6f-2849-4825-b924-59d9229c331b',
  category: 'DEVELOPMENT_TOOLS',
  icon: 'wrench',
  entries: [
    {
      uuid: '3ee5e288-f317-4cef-8266-c53b4ecbe7a1',
      level: 5,
      name: 'Git (CLI) · GitHub',
      icon: 'git',
    },
    {
      uuid: '653a9c1b-e747-47a7-95fd-4236fc7d3c34',
      level: 5,
      name: 'Jira · Confluence',
      icon: 'jira',
    },
    {
      uuid: 'b96b2dea-3b1d-4a76-9bfc-0e5bdb53b994',
      level: 4,
      name: 'JetBrains · IntelliJ',
      icon: 'jetbrains',
    },
    {
      uuid: '06eec561-01a1-4d34-ae2b-c7ab3df820d5',
      level: 4,
      name: 'Postman',
      icon: 'postman',
    },
    {
      uuid: 'eea0a797-96c7-498a-aac4-28a1915707d2',
      level: 3,
      name: 'GitLab · Bitbucket',
      icon: 'gitlab',
    },
  ],
};

const additionalTechnologiesSkill: Skill = {
  uuid: '91736d60-5646-4c82-9154-fd315b273eab',
  category: 'ADDITIONAL_TECHNOLOGIES',
  icon: 'terminal',
  entries: [
    {
      uuid: 'c6a4b909-3f7c-4670-a482-c6ceb54b6ab9',
      level: 4,
      name: 'REST APIs',
      icon: 'rest-api',
    },
    {
      uuid: '97725b7f-98d0-46df-b9c0-14d7797be98c',
      level: 4,
      name: 'PHP',
      icon: 'php',
    },
    {
      uuid: 'f0770b32-7a52-4a18-aac3-8eed4671535d',
      level: 4,
      name: 'Magento 2',
      icon: 'magento',
    },
    {
      uuid: '491aca87-e934-4c56-9984-c6cfb34cb781',
      level: 3,
      name: 'Node.js',
      icon: 'nodejs',
    },
    {
      uuid: '40d2b50b-cb81-40d9-a8c4-cca67565b6a2',
      level: 3,
      name: 'NestJs',
      icon: 'nestjs',
    },
    {
      uuid: 'f148518e-88da-482d-bedf-323896803334',
      level: 3,
      name: 'React',
      icon: 'react',
    },
    {
      uuid: '96ade544-1d04-450b-88d8-dd6127c5c74f',
      level: 3,
      name: 'Java',
      icon: 'java',
    },
    {
      uuid: '1271fa61-7e7f-4519-b439-978837ac885b',
      level: 3,
      name: 'Symfony',
      icon: 'symfony',
    },
    {
      uuid: 'd8779d13-d1e2-4440-9146-785cb44a636e',
      level: 2,
      name: 'Sulu',
      icon: 'sulu',
    },
    {
      uuid: 'f646d4d1-e502-4763-a959-549926b9a941',
      level: 3,
      name: 'Laravel',
      icon: 'laravel',
    },
    {
      uuid: '7cef2321-ddca-4e94-958f-191a1006d16b',
      level: 2,
      name: 'C#',
      icon: 'csharp',
    },
    {
      uuid: '1984c1eb-a762-4b99-9d08-73c8016ba44e',
      level: 3,
      name: 'SQL · MySQL',
      icon: 'mysql',
    },
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
