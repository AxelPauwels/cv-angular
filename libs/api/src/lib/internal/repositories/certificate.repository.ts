import type { Certificate } from '../generated/resolvers-types';

const certificates: Certificate[] = [
  {
    uuid: '25898636-21d7-4463-9d9f-ddbfcc1a7170',
    name: 'Accessible Code',
    issuer: 'A11Y Collective',
    year: 2021,
    url: '/assets/certificates/2021-09-13_Certificaat_A11Y-Collective_Accessible-Code.png',
  },
  {
    uuid: '23aba509-1aab-4038-b3f1-0784499eb8f1',
    name: 'Web Accessibility',
    issuer: 'A11Y Collective',
    year: 2021,
    url: '/assets/certificates/2021-09-13_Certificaat_A11Y-Collective_Web-Accessibility.png',
  },
  {
    uuid: '7fa89a23-93d1-47eb-8992-fb087dad4403',
    name: 'Magento 2 Front-End Developer',
    issuer: 'Magento, an Adobe Company',
    year: 2020,
    url: '/assets/certificates/2019-08-08_Certificaat_Magento2-Professional-Front-End-Developer.pdf',
  },
  {
    uuid: 'b460efbb-f249-4189-ac82-5a456531f8d4',
    name: 'Web Security Fundamentals',
    issuer: 'edX · KU Leuven',
    year: 2017,
    url: '/assets/certificates/2017-10-09_Certificaat_WEBSEC_edX_Axel-Pauwels.pdf',
  },
  {
    uuid: '29fffd4d-186e-430e-a68a-e42542095f57',
    name: 'Linux Essentials',
    issuer: 'Linux Professional Institute',
    year: 2016,
    url: '/assets/certificates/2016-01-26_Certificaat_LPI_Axel-Pauwels.pdf',
  },
];

export const certificateRepository = {
  findAll: (): Certificate[] => certificates,
};
