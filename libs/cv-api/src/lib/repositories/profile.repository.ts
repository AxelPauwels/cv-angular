import { Profile } from '../models';

// Mock data: replace with your own CV content.
const profile: Profile = {
  name: 'Axel Pauwels',
  headline: 'Angular Developer',
  location: 'Belgium',
  summary: 'Mock profile served by an in-browser GraphQL API.',
};

export const profileRepository = {
  get: (): Profile => profile,
};
