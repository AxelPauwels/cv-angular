import { exposeComponent, exposeMarkdown } from '@hashbrownai/angular';
import { s } from '@hashbrownai/core';
import { PersonCard } from '@cv/showcase-ui-assistant';

/**
 * The components the model may answer with. It never writes HTML: it picks
 * one of these and fills its inputs, which Skillet validates.
 */
export const ASSISTANT_COMPONENTS = [
  exposeMarkdown({
    name: 'text',
    description: 'Text for the visitor, in markdown (lists, bold, links).',
  }),
  exposeComponent(PersonCard, {
    name: 'personCard',
    description: `Shows one reference (a person from getReferences) as a card.
Use one personCard per person instead of describing the person in text.`,
    input: {
      name: s.string('Full name of the person'),
      function: s.string('Their function, e.g. Lead developer'),
      employer: s.string('The employer they worked at'),
      client: s.string(
        "The employer's client where we worked together; empty string when none"
      ),
      start: s.string('Start of working together, YYYY-MM'),
      end: s.string(
        'End of working together, YYYY-MM; empty string while ongoing'
      ),
    },
  }),
];
