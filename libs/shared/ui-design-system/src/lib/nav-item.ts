import { NavTranslationKey } from '@cv/shared-util-i18n';

export interface NavItem {
  labelKey: NavTranslationKey;
  /** Absolute for the main navbar, relative to the domain shell route for the sub navbar */
  path: string;
}
