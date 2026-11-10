import type { AdditionalLearning } from '../generated/resolvers-types';

const additionalLearnings: AdditionalLearning[] = [
  {
    uuid: '97033094-d094-42a1-aa67-2330570503c4',
    name: 'Pluralsight',
    url: 'https://www.pluralsight.com/profile/AxelPauwels',
  },
];

export const additionalLearningRepository = {
  findAll: (): AdditionalLearning[] => additionalLearnings,
};
