import type { AdditionalLearning } from '../generated/resolvers-types';

const additionalLearnings: AdditionalLearning[] = [
  {
    name: 'Pluralsight',
    url: 'https://www.pluralsight.com/profile/AxelPauwels',
  },
];

export const additionalLearningRepository = {
  findAll: (): AdditionalLearning[] => additionalLearnings,
};
