import {
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { isActive, Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatTabNavPanel } from '@angular/material/tabs';
import {
  AccessibilityOptions,
  AccessibilitySwitcher,
  BackToTop,
  ColorSchemeOption,
  ColorSchemeSwitcher,
  DownloadMenu,
  DownloadOption,
  FontSwitcher,
  LanguageSwitcher,
  MainNavbar,
  MobileMenu,
  NavItem,
  ThemeSwitcher,
} from '@cv/shared-ui-layout';
import { isLanguageCode, LanguageService } from '@cv/shared-data-access-i18n';
import {
  AccessibilityService,
  FeatureToggleId,
  FeatureToggleService,
  FontService,
  isTextSize,
  isFontId,
  isThemeId,
  ThemeService,
  TourService,
} from '@cv/shared-data-access';
import { ROUTES } from '@cv/shared-util-routing';
import { TourOverlay } from '@cv/shared-feature-tour';
import { ContactLinks } from '@cv/cv-feature-contact';
import { TranslatePipe } from '@tolgee/ngx';
import { MobileNav } from './mobile-nav/mobile-nav';

@Component({
  selector: 'app-shell',
  imports: [
    RouterOutlet,
    RouterLink,
    MatTabNavPanel,
    MainNavbar,
    MobileMenu,
    DownloadMenu,
    LanguageSwitcher,
    ThemeSwitcher,
    FontSwitcher,
    ColorSchemeSwitcher,
    AccessibilitySwitcher,
    BackToTop,
    // only used in @defer blocks, so they get their own lazy chunks
    TourOverlay,
    ContactLinks,
    MobileNav,
    TranslatePipe,
  ],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  protected readonly languageService = inject(LanguageService);
  protected readonly themeService = inject(ThemeService);
  protected readonly fontService = inject(FontService);
  protected readonly accessibilityService = inject(AccessibilityService);
  protected readonly tour = inject(TourService);
  /** Which menu items and navbar icons show, switched on the admin page */
  protected readonly toggles = inject(FeatureToggleService).states;

  /** The hamburger menu that replaces the domain tabs on phones */
  protected readonly mobileMenuOpen = signal(false);
  private readonly mobileMenu = viewChild(MobileMenu);

  constructor() {
    // the tour opens the menu for the steps on the domains, and closes it again.
    // Set on the menu itself: between two menu steps the navigation closes it
    // and the tour reopens it in the same tick, so the `[(open)]` binding would
    // see no change and leave the menu closed
    effect(() => {
      const open = this.tour.menuOpen();
      untracked(() => {
        const menu = this.mobileMenu();
        if (menu) {
          menu.open.set(open);
        } else {
          this.mobileMenuOpen.set(open);
        }
      });
    });
  }

  /** The footer's name links to the admin page */
  protected readonly adminLink = ROUTES.SHOWCASE.FEATURE_TOGGLES_ROUTER_LINK;

  /** The home page fills the screen on its own: no footer there */
  protected readonly onHome = isActive(
    ROUTES.HOME.ROOT_ROUTER_LINK,
    inject(Router),
    {
      paths: 'exact',
      queryParams: 'ignored',
    }
  );

  /** Both language versions of the cv, from `public/assets/documents` */
  protected readonly cvDownloads: DownloadOption[] = (
    ['EN', 'NL'] as const
  ).map((code) => {
    const fileName = `Axel-Pauwels_CV_Senior-Angular-Developer_${code}.pdf`;
    return {
      href: `/assets/documents/${encodeURIComponent(fileName)}`,
      fileName,
      labelKey: code === 'EN' ? 't.language.english' : 't.language.dutch',
      lang: code.toLowerCase(),
    };
  });

  private readonly allNavItems: (NavItem & { toggle?: FeatureToggleId })[] = [
    {
      labelKey: 't.nav.home',
      path: ROUTES.HOME.ROOT,
      icon: 'home',
      tourId: 'menu-home',
    },
    {
      labelKey: 't.nav.cv',
      path: ROUTES.CV.ROOT,
      tourId: 'menu-cv',
      toggle: 'main-menu-cv',
    },
    {
      labelKey: 't.nav.technical',
      path: ROUTES.TECHNICAL.ROOT,
      tourId: 'menu-technical',
      toggle: 'main-menu-technical',
    },
    {
      labelKey: 't.nav.showcase',
      path: ROUTES.SHOWCASE.ROOT,
      tourId: 'menu-showcase',
      toggle: 'main-menu-showcase',
    },
  ];

  protected readonly navItems = computed<NavItem[]>(() => {
    const toggles = this.toggles();
    return this.allNavItems.filter(({ toggle }) => !toggle || toggles[toggle]);
  });

  protected changeLanguage(code: string): void {
    if (isLanguageCode(code)) {
      void this.languageService.changeLanguage(code);
    }
  }

  protected resetLanguage(): void {
    void this.languageService.resetLanguage();
  }

  protected changeTheme(id: string): void {
    if (isThemeId(id)) {
      this.themeService.changeTheme(id);
    }
  }

  protected changeFont(id: string): void {
    if (isFontId(id)) {
      this.fontService.changeFont(id);
    }
  }

  protected changeColorScheme(scheme: ColorSchemeOption): void {
    this.themeService.changeColorScheme(scheme);
  }

  protected changeAccessibility({
    textSize,
    ...switches
  }: Partial<AccessibilityOptions>): void {
    this.accessibilityService.change(
      isTextSize(textSize) ? { ...switches, textSize } : switches
    );
  }

  // Todo i18n
  protected readonly year = new Date().getFullYear();
}
