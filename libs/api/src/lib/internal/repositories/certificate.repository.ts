import type { Certificate } from '../generated/resolvers-types';

const certificates: Certificate[] = [
  {
    name: 'Accessible Code',
    issuer: 'A11Y Collective',
    year: 2021,
    url: '/assets/certificates/2021-09-13_Certificaat_A11Y-Collective_Accessible-Code.png',
  },
  {
    name: 'Web Accessibility',
    issuer: 'A11Y Collective',
    year: 2021,
    url: '/assets/certificates/2021-09-13_Certificaat_A11Y-Collective_Web-Accessibility.png',
  },
  {
    name: 'Magento 2 Front-End Developer',
    issuer: 'Magento, an Adobe Company',
    year: 2020,
    url: '/assets/certificates/2019-08-08_Certificaat_Magento2-Professional-Front-End-Developer.pdf',
  },
  {
    name: 'Web Security Fundamentals',
    issuer: 'edX · KU Leuven',
    year: 2017,
    url: '/assets/certificates/2017-10-09_Certificaat_WEBSEC_edX_Axel-Pauwels.pdf',
  },
  {
    name: 'Linux Essentials',
    issuer: 'Linux Professional Institute',
    year: 2016,
    url: '/assets/certificates/2016-01-26_Certificaat_LPI_Axel-Pauwels.pdf',
  },
];

export const certificateRepository = {
  findAll: (): Certificate[] => certificates,
};
