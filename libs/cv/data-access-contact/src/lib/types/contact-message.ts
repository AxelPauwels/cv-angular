/** What a visitor writes on the contact page */
export interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
  /** Honeypot: hidden from people, so only bots tick it; Web3Forms drops those */
  botcheck: boolean;
}

export const EMPTY_CONTACT_MESSAGE: ContactMessage = {
  name: '',
  email: '',
  subject: '',
  message: '',
  botcheck: false,
};

export const CONTACT_LIMITS = {
  nameMax: 100,
  subjectMax: 150,
  messageMin: 20,
  messageMax: 2000,
} as const;
