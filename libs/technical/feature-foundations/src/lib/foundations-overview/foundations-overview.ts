import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { Lordicon, type LordiconName } from '@cv/shared-ui-lordicon';
import { PageLayout, PageTitle, SectionHeading } from '@cv/shared-ui-page';
import { TranslatePartsPipe } from '@cv/shared-ui-i18n';
import { TranslationKey } from '@cv/shared-util-i18n';
import { TranslatePipe } from '@tolgee/ngx';

/** A folder of `apps/cv/src/styles`, from the broadest to the most specific */
export interface StyleLayer {
  folder: string;
  nameKey: TranslationKey;
  textKey: TranslationKey;
  /** The class prefix the layer's classes start with */
  namespace?: string;
}

export const STYLE_LAYERS: readonly StyleLayer[] = [
  {
    folder: '1.settings',
    nameKey: 't.foundations.itcss.layer.settings.name',
    textKey: 't.foundations.itcss.layer.settings.text',
  },
  {
    folder: '2.tools',
    nameKey: 't.foundations.itcss.layer.tools.name',
    textKey: 't.foundations.itcss.layer.tools.text',
  },
  {
    folder: '3.vendors',
    nameKey: 't.foundations.itcss.layer.vendors.name',
    textKey: 't.foundations.itcss.layer.vendors.text',
  },
  {
    folder: '4.elements',
    nameKey: 't.foundations.itcss.layer.elements.name',
    textKey: 't.foundations.itcss.layer.elements.text',
  },
  {
    folder: '5.objects',
    nameKey: 't.foundations.itcss.layer.objects.name',
    textKey: 't.foundations.itcss.layer.objects.text',
    namespace: 'o-',
  },
  {
    folder: '6.components',
    nameKey: 't.foundations.itcss.layer.components.name',
    textKey: 't.foundations.itcss.layer.components.text',
    namespace: 'c-',
  },
  {
    folder: '7.patterns',
    nameKey: 't.foundations.itcss.layer.patterns.name',
    textKey: 't.foundations.itcss.layer.patterns.text',
    namespace: 'p-',
  },
  {
    folder: '8.scopes',
    nameKey: 't.foundations.itcss.layer.scopes.name',
    textKey: 't.foundations.itcss.layer.scopes.text',
    namespace: 's-',
  },
  {
    folder: '9.utilities',
    nameKey: 't.foundations.itcss.layer.utilities.name',
    textKey: 't.foundations.itcss.layer.utilities.text',
    namespace: 'u-',
  },
];

/** A few glyphs of the Icomoon font (`cv-icon-<name>`) */
export const ICON_SAMPLES: readonly { name: string }[] = [
  { name: 'angular' },
  { name: 'nx' },
  { name: 'claude' },
  { name: 'rxjs' },
  { name: 'graphql' },
  { name: 'github' },
];

/**
 * As many Material Symbols as Icomoon samples. Each `icon:` line is read by
 * tools/material-symbols, so these come from the subset the app already loads
 */
export const MATERIAL_SAMPLES: readonly { icon: string }[] = [
  { icon: 'home' },
  { icon: 'palette' },
  { icon: 'translate' },
  { icon: 'dark_mode' },
  { icon: 'accessibility_new' },
  { icon: 'mail' },
];

/**
 * Animated Lordicons: three for this page and the three of the contact links
 * in the footer, which the browser already has
 */
export const LORDICON_SAMPLES: readonly LordiconName[] = [
  'layers',
  'code-branch',
  'terminal',
  'mail',
  'linkedin',
  'github',
];

/** The signal stores of the data-access libs */
export const STORES: readonly string[] = [
  'PersonStore',
  'EducationStore',
  'ExperienceStore',
  'SkillStore',
  'ReferenceStore',
  'ArchitectureStore',
  'VersionStore',
];

@Component({
  selector: 'technical-foundations-overview',
  imports: [
    PageLayout,
    PageTitle,
    SectionHeading,
    Lordicon,
    MatIcon,
    NgTemplateOutlet,
    TranslatePipe,
    TranslatePartsPipe,
  ],
  templateUrl: './foundations-overview.html',
  styleUrl: './foundations-overview.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FoundationsOverview {
  protected readonly layers = STYLE_LAYERS;
  protected readonly icons = ICON_SAMPLES;
  protected readonly materialIcons = MATERIAL_SAMPLES;
  protected readonly lordicons = LORDICON_SAMPLES;
  protected readonly stores = STORES;
}
