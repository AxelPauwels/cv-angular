import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { TranslatePipe } from '@tolgee/ngx';
import { PersonStore } from '@cv/cv-data-access-personal';
import { ROUTES } from '@cv/shared-util-routing';
import { FeatureToggleService, TourService } from '@cv/shared-data-access';

@Component({
  selector: 'cv-home',
  imports: [RouterLink, MatButton, MatIcon, TranslatePipe],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  protected readonly store = inject(PersonStore);
  protected readonly routes = ROUTES.CV;
  protected readonly tour = inject(TourService);
  protected readonly showTourButton =
    inject(FeatureToggleService).isEnabled('tour-button');

  protected readonly fullName = computed(() => {
    const person = this.store.person();
    return person ? `${person.firstName} ${person.lastName}` : '';
  });

  // split on spaces so hyphenated words (e.g. "Front-End") can be kept on one line
  protected readonly titleWords = computed(
    () => this.store.person()?.functionTitle.split(/\s+/).filter(Boolean) ?? []
  );
}
