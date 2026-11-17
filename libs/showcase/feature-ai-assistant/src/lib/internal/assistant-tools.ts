import { inject } from '@angular/core';
import { createTool } from '@hashbrownai/angular';
import { TranslateService } from '@tolgee/ngx';
import { CvKnowledgeService } from '@cv/showcase-data-access-assistant';
import { translateKeys } from './translate-keys';

/** Runs in the tool's injection context: loads, then translates the keys */
async function load<T>(
  read: (knowledge: CvKnowledgeService) => Promise<T>
): Promise<T> {
  const knowledge = inject(CvKnowledgeService);
  const translate = inject(TranslateService);
  const data = await read(knowledge);
  return translateKeys(data, (key) => translate.instant(key));
}

/**
 * The tools the model may call: read-only views on the GraphQL API, each
 * returning plain JSON. They only expose what the site already shows.
 */
export const ASSISTANT_TOOLS = [
  createTool({
    name: 'getProfile',
    description: `Returns Axel's profile: name, job title, a profile summary,
where he lives (city and country), links (website, LinkedIn, GitHub),
hobbies and spoken languages.`,
    handler: () => load((knowledge) => knowledge.profile()),
  }),
  createTool({
    name: 'getExperiences',
    description: `Returns Axel's work experience. Each item has an id, a category
(IT or HORECA = hospitality), the employer, location, position, period
(YYYY-MM, no end = current job), project, job descriptions and tech stack.`,
    handler: () => load((knowledge) => knowledge.experiences()),
  }),
  createTool({
    name: 'getReferences',
    description: `Returns the people who can give a reference about Axel. Each item
has an id, name, function, employer, optional client (the employer's client
where they worked together), category (IT or HORECA) and the period they
worked together (YYYY-MM, no end = still working together).`,
    handler: () => load((knowledge) => knowledge.references()),
  }),
  createTool({
    name: 'getSkills',
    description: `Returns Axel's skills per category with a level from 1 to 5,
other technologies without a level and his core competences.`,
    handler: () => load((knowledge) => knowledge.skills()),
  }),
  createTool({
    name: 'getEducation',
    description: `Returns Axel's education (school, specialization, degree,
period), certificates and trainings.`,
    handler: () => load((knowledge) => knowledge.education()),
  }),
];
