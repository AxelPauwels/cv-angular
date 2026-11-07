import { Component, computed, inject, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { PageTitle } from '@cv/shared-ui-design-system';
import { MatChip, MatChipSet } from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslatePipe, TranslateService } from '@tolgee/ngx';
import {
  FEATURE_TOGGLES,
  FeatureToggleGroup,
  FeatureToggleId,
  FeatureToggleInfo,
  FeatureToggleService,
  featureTogglesInGroup,
} from '@cv/shared-data-access';

interface ToggleSection {
  readonly id: string;
  /** The heading; several keys are joined, e.g. "Submenu" + "CV" */
  readonly titleKeys: readonly string[];
  readonly descriptionKey?: string;
  /** The section whose description describes the toggles without their own */
  readonly describedBySection: string;
  /** Starts a new row of cards on larger screens */
  readonly newRow?: boolean;
  readonly toggles: readonly FeatureToggleInfo[];
}

/** A toggle another toggle switched along, announced to screen readers */
interface LinkedChange {
  readonly id: FeatureToggleId;
  readonly labelKey: string;
  readonly messageKey: 't.admin.linked.on' | 't.admin.linked.off';
}

function submenu(
  id: string,
  group: FeatureToggleGroup,
  titleKey: string,
  descriptionKey?: string
): ToggleSection {
  return {
    id,
    titleKeys: ['t.admin.section.submenu.title', titleKey],
    descriptionKey,
    describedBySection: 'submenu-cv',
    toggles: featureTogglesInGroup(group),
  };
}

/** The admin page: switches every feature toggle on or off */
@Component({
  selector: 'showcase-feature-toggles',
  imports: [
    MatButton,
    MatCardModule,
    MatChip,
    MatChipSet,
    MatIcon,
    MatSlideToggle,
    PageTitle,
    TranslatePipe,
  ],
  templateUrl: './feature-toggles.html',
  styleUrl: './feature-toggles.scss',
})
export class FeatureToggles {
  protected readonly service = inject(FeatureToggleService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  /** Navbar icons and general on top, the menus in four columns below */
  protected readonly sections: readonly ToggleSection[] = [
    {
      id: 'navbar',
      titleKeys: ['t.admin.section.navbar.title'],
      descriptionKey: 't.admin.section.navbar.description',
      describedBySection: 'navbar',
      toggles: featureTogglesInGroup('navbar'),
    },
    {
      id: 'general',
      titleKeys: ['t.admin.section.general.title'],
      describedBySection: 'general',
      toggles: featureTogglesInGroup('general'),
    },
    {
      id: 'main-menu',
      titleKeys: ['t.admin.section.main-menu.title'],
      descriptionKey: 't.admin.section.main-menu.description',
      describedBySection: 'main-menu',
      newRow: true,
      toggles: featureTogglesInGroup('main-menu'),
    },
    // the submenu description is shown once, on the first submenu card
    submenu(
      'submenu-cv',
      'cv-menu',
      't.nav.cv',
      't.admin.section.submenu.description'
    ),
    submenu('submenu-technical', 'technical-menu', 't.nav.technical'),
    submenu('submenu-showcase', 'showcase-menu', 't.nav.showcase'),
  ];

  /** The sections, with how many of their toggles are on for the chip */
  protected readonly cards = computed(() => {
    const states = this.service.states();

    return this.sections.map((section) => {
      const { toggles } = section;
      const on = toggles.filter((toggle) => states[toggle.id]).length;

      return {
        section,
        allOn: on === toggles.length,
        // the translate pipe only takes string params
        count: { on: String(on), total: String(toggles.length) },
      };
    });
  });

  /** The toggles switched along with the last change */
  protected readonly linkedChanges = signal<readonly LinkedChange[]>([]);

  protected change(id: FeatureToggleId, enabled: boolean): void {
    if (id === 'showcase-admin' && !enabled) {
      this.explainHiddenAdmin();
    }
    const before = this.service.states();
    this.service.change(id, enabled);
    const after = this.service.states();
    this.linkedChanges.set(
      FEATURE_TOGGLES.filter(
        (toggle) => toggle.id !== id && before[toggle.id] !== after[toggle.id]
      ).map(({ id, labelKey }) => ({
        id,
        labelKey,
        messageKey: after[id] ? 't.admin.linked.on' : 't.admin.linked.off',
      }))
    );
  }

  /**
   * Switching this page's own menu item off hides the way back here, so a message
   * says where to find it. It stays until the visitor closes it with "OK": no
   * time limit to read it (WCAG 2.2.1).
   */
  private explainHiddenAdmin(): void {
    this.snackBar.open(
      this.translate.instant('t.admin.hidden-notice'),
      this.translate.instant('t.common.ok')
    );
  }

  protected reset(): void {
    this.service.reset();
    this.linkedChanges.set([]);
  }

  /** Each switch is described by its own text, else by its section's */
  protected describedBy(
    section: ToggleSection,
    toggle: FeatureToggleInfo
  ): string {
    return toggle.descriptionKey
      ? `feature-toggle-${toggle.id}-description`
      : `feature-toggles-${section.describedBySection}-description`;
  }
}
