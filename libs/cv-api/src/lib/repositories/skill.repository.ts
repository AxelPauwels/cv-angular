import { Skill, SkillCategory } from '../models';

// Mock data: replace with your own CV content.
const skills: Skill[] = [
  { id: 'angular', name: 'Angular', category: 'FRONTEND' },
  { id: 'typescript', name: 'TypeScript', category: 'FRONTEND' },
  { id: 'rxjs', name: 'RxJS', category: 'FRONTEND' },
  { id: 'graphql', name: 'GraphQL', category: 'BACKEND' },
  { id: 'node', name: 'Node.js', category: 'BACKEND' },
  { id: 'nx', name: 'Nx', category: 'TOOLING' },
];

export const skillRepository = {
  findAll: (category?: SkillCategory | null): Skill[] =>
    category ? skills.filter((skill) => skill.category === category) : skills,

  findByIds: (ids: string[]): Skill[] =>
    skills.filter((skill) => ids.includes(skill.id)),
};
