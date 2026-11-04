import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@tolgee/ngx';
import {
  Gender,
  LanguageIsoCode,
  LanguageProficiency,
  PersonStore,
} from '@cv/cv-data-access-personal';

/** Translation keys for API values, e.g. `MARRIED` -> `...marital-status.married` */
const ABOUT_ME = 't.personal.about-me.card';
const toKey = (value: string) => value.toLowerCase().replaceAll('_', '-');

@Component({
  selector: 'cv-personal-details',
  imports: [DatePipe, TranslatePipe],
  templateUrl: './personal-details.html',
})
export class PersonalDetails {
  protected readonly store = inject(PersonStore);

  protected readonly titleKeys = {
    dateOfBirth: `${ABOUT_ME}.title.date-of-birth`,
    nationality: `${ABOUT_ME}.title.nationality`,
    maritalStatus: `${ABOUT_ME}.title.marital-status`,
    children: `${ABOUT_ME}.title.children`,
    personalityType: `${ABOUT_ME}.title.personality-type`,
    driverLicense: `${ABOUT_ME}.title.driver-license`,
  };

  protected readonly languageKeys: Record<LanguageIsoCode, string> = {
    NL: 't.language.dutch',
    EN: 't.language.english',
    FR: 't.language.french',
    ES: 't.language.spanish',
    DE: 't.language.german',
    IT: 't.language.italian',
  };

  protected readonly childKeys: Partial<Record<Gender, string>> = {
    FEMALE: 't.daughter',
    MALE: 't.son',
  };

  protected nationalityKey(code: string): string {
    return `${ABOUT_ME}.description.nationality.${code}`;
  }

  protected maritalStatusKey(status: string): string {
    return `${ABOUT_ME}.description.marital-status.${toKey(status)}`;
  }

  protected personalityTypeKey(type: string): string {
    return `${ABOUT_ME}.description.personality-type.${type}`;
  }

  protected driverLicenseKey(category: string): string {
    return `${ABOUT_ME}.description.driver-license.${category}`;
  }

  protected proficiencyKey(level: LanguageProficiency): string {
    return `t.language.proficiency.${toKey(level)}`;
  }
}
