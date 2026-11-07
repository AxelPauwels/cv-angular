import { Component, computed, inject } from '@angular/core';
import {
  delayedLoading,
  LoadingSpinner,
  PageTitle,
  SectionHeading,
  PageLayout,
} from '@cv/shared-ui-design-system';
import { DatePipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { TranslatePipe } from '@tolgee/ngx';
import { Card } from '@cv/shared-ui-card';
import { ProgressBar } from '@cv/shared-ui-progress-bar';
import {
  LanguageIsoCode,
  LanguageProficiency,
  LanguageSkill,
  PersonStore,
} from '@cv/cv-data-access-personal';

/** Translation keys for API values, e.g. `MARRIED` -> `...marital-status.married` */
const ABOUT_ME = 't.personal.about-me.card';
const toKey = (value: string) => value.toLowerCase().replaceAll('_', '-');

/** A piece of a fact's value: plain text, a translation key or a date */
type FactPart =
  | { kind: 'text'; text: string }
  | { kind: 'key'; text: string }
  | { kind: 'date'; date: Date };

interface Fact {
  labelKey: string;
  /** Material Symbols name; decorative */
  icon: string;
  value: FactPart[];
}

const text = (value: string): FactPart => ({ kind: 'text', text: value });
const key = (value: string): FactPart => ({ kind: 'key', text: value });

/**
 * Three sections with a heading each: about me as facts with a round icon,
 * the languages as regular cards with their levels and the hobbies as tiles
 * in the header's color. The name and
 * photo live on the home page, the contact links in the footer.
 */
@Component({
  selector: 'cv-personal-details',
  imports: [
    PageLayout,
    LoadingSpinner,
    PageTitle,
    SectionHeading,
    Card,
    DatePipe,
    MatIcon,
    ProgressBar,
    TranslatePipe,
  ],
  templateUrl: './personal-details.html',
  styleUrl: './personal-details.scss',
})
export class PersonalDetails {
  protected readonly store = inject(PersonStore);
  protected readonly loading = delayedLoading(() => this.store.isLoading());

  protected readonly languageKeys: Record<LanguageIsoCode, string> = {
    NL: 't.language.dutch',
    EN: 't.language.english',
    FR: 't.language.french',
    ES: 't.language.spanish',
    DE: 't.language.german',
    IT: 't.language.italian',
  };

  /** Width of the level bars */
  protected readonly proficiencyPercentage: Record<
    LanguageProficiency,
    number
  > = {
    EXCELLENT: 100,
    VERY_GOOD: 80,
    GOOD: 60,
    FAIR: 40,
    BASIC: 20,
  };

  protected readonly facts = computed((): Fact[] => {
    const person = this.store.person();
    if (!person) {
      return [];
    }
    const { address } = person.contact;
    const { personal } = person;
    const children = personal.children.map((child) => child.name).join(', ');
    return [
      {
        labelKey: `${ABOUT_ME}.title.location`,
        icon: 'location_on',
        value: [text(`${address.city}, `), key(`t.country.${address.country}`)],
      },
      {
        labelKey: `${ABOUT_ME}.title.date-of-birth`,
        icon: 'cake',
        value: [{ kind: 'date', date: personal.dateOfBirth }],
      },
      {
        labelKey: `${ABOUT_ME}.title.nationality`,
        icon: 'flag',
        value: [
          key(`${ABOUT_ME}.description.nationality.${personal.nationality}`),
        ],
      },
      {
        labelKey: `${ABOUT_ME}.title.marital-status`,
        icon: 'favorite',
        value: [
          key(
            `${ABOUT_ME}.description.marital-status.${toKey(personal.maritalStatus)}`
          ),
        ],
      },
      {
        labelKey: `${ABOUT_ME}.title.children`,
        icon: 'child_care',
        value: [text(children || '–')],
      },
      {
        labelKey: `${ABOUT_ME}.title.personality-type`,
        icon: 'psychology',
        value: [
          key(
            `${ABOUT_ME}.description.personality-type.${personal.personalityType}`
          ),
        ],
      },
    ];
  });

  /** The languages with their speaking and writing levels, for the cards */
  protected readonly languages = computed(() =>
    (this.store.person()?.languages ?? []).map((skill: LanguageSkill) => ({
      skill,
      levels: [
        { labelKey: 't.spoken', value: skill.spoken },
        { labelKey: 't.written', value: skill.written },
      ],
    }))
  );

  protected proficiencyKey(level: LanguageProficiency): string {
    return `t.language.proficiency.${toKey(level)}`;
  }
}
