import { NavTranslationKey, TranslationKey } from '@cv/shared-util-i18n';
import { ROUTES } from '@cv/shared-util-routing';
import report from './lighthouse-scores.json';

/** The four categories of a Lighthouse report, in Lighthouse's own order */
export const LIGHTHOUSE_CATEGORIES = [
  { id: 'performance', labelKey: 't.lighthouse.category.performance' },
  { id: 'accessibility', labelKey: 't.lighthouse.category.accessibility' },
  { id: 'best-practices', labelKey: 't.lighthouse.category.best-practices' },
  { id: 'seo', labelKey: 't.lighthouse.category.seo' },
] as const satisfies readonly { id: string; labelKey: TranslationKey }[];

export type LighthouseCategoryId = (typeof LIGHTHOUSE_CATEGORIES)[number]['id'];

/** Scores from 0 to 100, as Lighthouse shows them */
export type LighthouseScores = Readonly<Record<LighthouseCategoryId, number>>;

export interface LighthousePage {
  readonly labelKey: NavTranslationKey;
  readonly link: string;
  /** Missing when the page was not audited in the last run */
  readonly scores?: LighthouseScores;
}

export interface LighthouseSection {
  readonly id: string;
  readonly labelKey: NavTranslationKey;
  readonly pages: readonly LighthousePage[];
}

/** When, where and how the scores were measured */
export interface LighthouseRun {
  readonly url: string;
  readonly fetchTime: string;
  readonly lighthouseVersion: string;
  readonly formFactor: string;
}

/**
 * The scores of the last run, by router link. Regenerate them with
 * `npx nx run showcase-feature-lighthouse:audit`.
 */
const scores: Readonly<Record<string, LighthouseScores>> = report.pages;

export const LIGHTHOUSE_RUN: LighthouseRun = {
  url: report.url,
  fetchTime: report.fetchTime,
  lighthouseVersion: report.lighthouseVersion,
  formFactor: report.formFactor,
};

function page(labelKey: NavTranslationKey, link: string): LighthousePage {
  return { labelKey, link, scores: scores[link] };
}

/** The main menu, each item with its sub menu items: every page of the app */
export const LIGHTHOUSE_SECTIONS: readonly LighthouseSection[] = [
  {
    id: 'cv',
    labelKey: 't.nav.cv',
    pages: [
      page('t.nav.home', ROUTES.CV.HOME_ROUTER_LINK),
      page('t.nav.personal', ROUTES.CV.PERSONAL_ROUTER_LINK),
      page('t.nav.education', ROUTES.CV.EDUCATION_ROUTER_LINK),
      page('t.nav.experience', ROUTES.CV.EXPERIENCE_ROUTER_LINK),
      page('t.nav.skills', ROUTES.CV.SKILLS_ROUTER_LINK),
      page('t.nav.references', ROUTES.CV.REFERENCES_ROUTER_LINK),
    ],
  },
  {
    id: 'technical',
    labelKey: 't.nav.technical',
    pages: [
      page('t.nav.architecture', ROUTES.TECHNICAL.ARCHITECTURE_ROUTER_LINK),
      page('t.nav.project-graph', ROUTES.TECHNICAL.PROJECT_GRAPH_ROUTER_LINK),
      page('t.nav.graphql-docs', ROUTES.TECHNICAL.GRAPHQL_DOCS_ROUTER_LINK),
      page('t.nav.code-coverage', ROUTES.TECHNICAL.CODE_COVERAGE_ROUTER_LINK),
      page(
        't.nav.end-to-end-tests',
        ROUTES.TECHNICAL.END_TO_END_TESTS_ROUTER_LINK
      ),
      page('t.nav.versions', ROUTES.TECHNICAL.VERSIONS_ROUTER_LINK),
    ],
  },
  {
    id: 'showcase',
    labelKey: 't.nav.showcase',
    pages: [
      page(
        't.nav.micro-frontends',
        ROUTES.SHOWCASE.MICRO_FRONTENDS_ROUTER_LINK
      ),
      page('t.nav.lighthouse', ROUTES.SHOWCASE.LIGHTHOUSE_ROUTER_LINK),
      page('t.nav.admin', ROUTES.SHOWCASE.ADMIN_ROUTER_LINK),
    ],
  },
];

/** Lighthouse's color bands: 0–49 fail, 50–89 average, 90–100 pass */
export type ScoreRating = 'fail' | 'average' | 'pass';

export function scoreRating(score: number): ScoreRating {
  if (score >= 90) {
    return 'pass';
  }
  return score >= 50 ? 'average' : 'fail';
}
