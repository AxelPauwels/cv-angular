import { Component, computed, inject, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { Card } from '@cv/shared-ui-card';
import { PageTitle } from '@cv/shared-ui-page';
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
  /** The heading, after the optional prefix, e.g. "Submenu" + "CV" */
  readonly titleKey: string;
  readonly prefixKey?: string;
  /** Starts a new row of cards on larger screens */
  readonly newRow?: boolean;
  readonly toggles: readonly FeatureToggleInfo[];
}

/** A toggle another toggle switched along, announced to screen readers */
interface LinkedChange {
  readonly id: FeatureToggleId;
  readonly labelKey: string;
  readonly messageKey:
    't.feature-toggles.linked.on' | 't.feature-toggles.linked.off';
}

function submenu(
  id: string,
  group: FeatureToggleGroup,
  titleKey: string
): ToggleSection {
  return {
    id,
    prefixKey: 't.feature-toggles.section.submenu.title',
    titleKey,
    toggles: featureTogglesInGroup(group),
  };
}

/** The feature toggles page: switches every feature toggle on or off */
@Component({
  selector: 'showcase-feature-toggles',
  imports: [Card, MatButton, MatIcon, MatSlideToggle, PageTitle, TranslatePipe],
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
      titleKey: 't.feature-toggles.section.navbar.title',
      toggles: featureTogglesInGroup('navbar'),
    },
    {
      id: 'general',
      titleKey: 't.feature-toggles.section.general.title',
      toggles: featureTogglesInGroup('general'),
    },
    {
      id: 'main-menu',
      titleKey: 't.feature-toggles.section.main-menu.title',
      newRow: true,
      toggles: featureTogglesInGroup('main-menu'),
    },
    submenu('submenu-cv', 'cv-menu', 't.nav.cv'),
    submenu('submenu-technical', 'technical-menu', 't.nav.technical'),
    submenu('submenu-showcase', 'showcase-menu', 't.nav.showcase'),
  ];

  /** The sections, with how many of their toggles are on for the card's tag */
  protected readonly cards = computed(() => {
    const states = this.service.states();

    return this.sections.map((section) => {
      const { toggles } = section;
      const on = toggles.filter((toggle) => states[toggle.id]).length;

      return {
        section,
        // the translate pipe only takes string params
        count: { on: String(on), total: String(toggles.length) },
      };
    });
  });

  /** The toggles switched along with the last change */
  protected readonly linkedChanges = signal<readonly LinkedChange[]>([]);

  protected change(id: FeatureToggleId, enabled: boolean): void {
    if (id === 'showcase-feature-toggles' && !enabled) {
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
        messageKey: after[id]
          ? 't.feature-toggles.linked.on'
          : 't.feature-toggles.linked.off',
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
      this.translate.instant('t.feature-toggles.hidden-notice'),
      this.translate.instant('t.common.ok')
    );
  }

  protected reset(): void {
    this.service.reset();
    this.linkedChanges.set([]);
  }
}
