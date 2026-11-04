import type { Certificate } from '../generated/resolvers-types';

const certificates: Certificate[] = [
  {
    name: 'LPI Linux Essentials',
    url: 'https://cs.lpi.org/caf/Xamman/certification/verify/LPI000350719/zywvtfv54j',
  },
  {
    name: 'Web Security Fundamentals',
    url: 'https://courses.edx.org/certificates/5f1612206fdd4199baec23065868f63d',
  },
  {
    name: 'Magento 2 Front End Developer',
    url: 'moved to adobe',
  },
];

export const certificateRepository = {
  findAll: (): Certificate[] => certificates,
};
