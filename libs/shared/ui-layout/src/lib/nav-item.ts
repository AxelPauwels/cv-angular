import { NavTranslationKey } from '@cv/shared-util-i18n';

export interface NavItem {
  labelKey: NavTranslationKey;
  path: string;
  /**
   * Material Symbols name: shown instead of the label, which stays the link's
   * accessible name and its tooltip
   */
  icon?: string;
  /** Rendered as `data-tour`, so the guided tour can point at the link */
  tourId?: string;
  /**
   * The pages below this item, with paths relative to it (shown by
   * `ds-nav-accordion`; the tab navbars ignore them)
   */
  children?: readonly NavItem[];
}
