import type { Skill } from '../generated/resolvers-types';

const programmingLanguagesSkill: Skill = {
  category: 'PROGRAMMING_LANGUAGES',
  icon: 'code',
  entries: [
    {
      level: 8,
      name: 'HTML5',
      icon: 'html5',
    },
    {
      level: 9,
      name: 'CSS3',
      icon: 'css3',
    },
    {
      level: 9,
      name: 'SCSS',
      icon: 'scss',
    },
    {
      level: 5,
      name: 'C#',
      icon: 'csharp',
    },
    {
      level: 7,
      name: 'PHP',
      icon: 'php',
    },
    {
      level: 6,
      name: 'JAVA',
      icon: 'java',
    },
    {
      level: 6,
      name: 'jQuery',
      icon: 'jquery',
    },
    {
      level: 8,
      name: 'Typescript',
      icon: 'typescript',
    },
  ],
};

const frameworksSkill: Skill = {
  category: 'FRAMEWORKS',
  icon: 'layers',
  entries: [
    {
      level: 6,
      name: 'React',
      icon: 'react',
    },
    {
      level: 8,
      name: 'Angular',
      icon: 'angular',
    },
    {
      level: 5,
      name: 'Laravel',
      icon: 'laravel',
    },
    {
      level: 7,
      name: 'Magento2',
      icon: 'magento',
    },
    {
      level: 3,
      name: 'Sulu',
      icon: 'sulu',
    },
    {
      level: 8,
      name: 'Kendo UI',
      icon: 'telerik',
    },
  ],
};

const librariesSkill: Skill = {
  category: 'LIBRARIES',
  icon: 'book-marked',
  entries: [
    {
      level: 8,
      name: 'Graphql',
      icon: 'graphql',
    },
    {
      level: 8,
      name: 'RxJs',
      icon: 'rxjs',
    },
  ],
};

const operatingSystemsSkill: Skill = {
  category: 'OPERATING_SYSTEMS',
  icon: 'terminal',
  entries: [
    {
      level: 6,
      name: 'Windows',
      icon: 'windows',
    },
    {
      level: 6,
      name: 'linux',
      icon: 'linux',
    },
    {
      level: 8,
      name: 'OsX/Unix',
      icon: 'mac',
    },
  ],
};

const versionControlSkill: Skill = {
  category: 'VERSION_CONTROL',
  icon: 'git-branch',
  entries: [
    {
      level: 8,
      name: 'Git (CLI)',
      icon: 'git',
    },
    {
      level: 8,
      name: 'GitHub',
      icon: 'github',
    },
    {
      level: 6,
      name: 'GitLab',
      icon: 'gitlab',
    },
    {
      level: 6,
      name: 'Bitbucket',
      icon: 'bitbucket',
    },
  ],
};

export const skillRepository = {
  findAll: (): Skill[] => [
    programmingLanguagesSkill,
    frameworksSkill,
    librariesSkill,
    operatingSystemsSkill,
    versionControlSkill,
  ],
};
