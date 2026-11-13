// Depending on API docs of @axel-pauwels/cv-mfe

type Snippet = `${string}`;
export type CodeBlockLanguage =
  | 'typescript'
  | 'javascript'
  | 'json'
  | 'xml'
  | 'css'
  | 'scss'
  | 'bash'
  | 'yaml'
  | 'html';

/** The inputs of the `<cv-mfe>` element */
export interface CvMfeInputs {
  snippet: Snippet;
  language: CodeBlockLanguage;
  lineNumbers: boolean;
  copyable: boolean;
}
