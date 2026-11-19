import {
  Component,
  computed,
  effect,
  ElementRef,
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
import { Walker } from '@cv/shared-ui-walker';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { MobileNav } from './mobile-nav/mobile-nav';
import {
  WALKER_FEET_BELOW_SCREEN_PX,
  WALKER_FEET_IN_FOOTER_PX,
  WALKER_IMAGES,
  WALKER_PAUSES,
  WALKER_SPEED_FACTORS,
} from './walker-images';

/** The md breakpoint (apps/cv/src/styles/1.settings/_breakpoints.scss) */
const FOOTER_FIXED_FROM = '(min-width: 768px)';

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
    Walker,
    TranslatePipe,
  ],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
  host: {
    // where the walker's feet are, for pages that put a figure on the footer
    // too (the contact page)
    '[style.--shell-walker-bottom.px]': 'walkerBottom()',
  },
})
export class Shell {
  protected readonly languageService = inject(LanguageService);
  protected readonly themeService = inject(ThemeService);
  protected readonly fontService = inject(FontService);
  protected readonly accessibilityService = inject(AccessibilityService);
  protected readonly tour = inject(TourService);
  /** Which menu items and navbar icons show, switched on the admin page */
  protected readonly toggles = inject(FeatureToggleService).states;

  /** The hamburger menu that replaces the domain tabs below md (768px) */
  protected readonly mobileMenuOpen = signal(false);
  private readonly mobileMenu = viewChild(MobileMenu);
  private readonly footer = viewChild<ElementRef<HTMLElement>>('footer');
  /** The footer's height in px; 0 without a footer (the home page) */
  protected readonly footerHeight = signal(0);
  /** From md up the shell is the screen high, with the footer always at the bottom */
  private readonly footerFixed = toSignal(
    inject(BreakpointObserver)
      .observe(FOOTER_FIXED_FROM)
      .pipe(map(({ matches }) => matches)),
    { initialValue: false }
  );

  constructor() {
    // follow the footer's height (it wraps on narrow screens, and the home page
    // has none), so the walking figure keeps its feet on it
    effect((onCleanup) => {
      const footer = this.footer()?.nativeElement;
      if (!footer || typeof ResizeObserver === 'undefined') {
        this.footerHeight.set(0);
        return;
      }
      const observer = new ResizeObserver(() =>
        this.footerHeight.set(footer.getBoundingClientRect().height)
      );
      observer.observe(footer);
      onCleanup(() => observer.disconnect());
    });

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

  /** The footer's name links to the admin page while its menu item is off */
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

  /**
   * The contact page has its own figure on the footer: the walker keeps
   * walking there (his schedule runs on), only unseen
   */
  protected readonly onContact = isActive(
    ROUTES.CONTACT.ROOT_ROUTER_LINK,
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

  protected readonly walkerImages = WALKER_IMAGES;
  /**
   * From md up the footer stays at the bottom of the screen: the walking
   * figure's feet go a little into it, so he walks on it. Below md the page
   * scrolls past the footer, so he walks along the bottom of the screen, his
   * feet a little below it.
   */
  protected readonly walkerBottom = computed(() =>
    this.footerFixed()
      ? Math.max(0, this.footerHeight() - WALKER_FEET_IN_FOOTER_PX)
      : -WALKER_FEET_BELOW_SCREEN_PX
  );
  protected readonly walkerPauses = WALKER_PAUSES;
  protected readonly walkerSpeedFactors = WALKER_SPEED_FACTORS;
  /**
   * The walking figure: switched on the feature toggles page, and never for a
   * visitor who wants reduced motion (the system setting or the accessibility menu)
   */
  protected readonly showWalker = computed(
    () =>
      this.toggles()['walker'] &&
      !this.accessibilityService.settings().reduceMotion
  );

  private readonly content =
    viewChild.required<ElementRef<HTMLElement>>('content');

  /**
   * Moves focus (and so the next Tab and a screen reader) to the page content.
   * By code instead of the fragment: the router would treat `#main-content` as
   * a navigation.
   */
  protected skipToContent(event: MouseEvent): void {
    event.preventDefault();
    const content = this.content().nativeElement;
    content.focus();
    content.scrollIntoView({ block: 'start' });
  }
}
