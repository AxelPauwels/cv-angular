import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@tolgee/ngx';
import { CvKnowledgeService } from '@cv/showcase-data-access-assistant';
import { ASSISTANT_TOOLS } from './assistant-tools';

describe('ASSISTANT_TOOLS', () => {
  const knowledge = {
    profile: vi.fn(async () => ({ job: 't.job.title' })),
    experiences: vi.fn(async () => [{ position: 't.position' }]),
    references: vi.fn(async () => [{ name: 'Ada' }]),
    skills: vi.fn(async () => ({ core: ['t.skill'] })),
    education: vi.fn(async () => ({ degree: 't.degree' })),
  };

  /** Runs a tool the way Hashbrown does: in an injection context */
  function run(name: string): Promise<unknown> {
    const tool = ASSISTANT_TOOLS.find((candidate) => candidate.name === name);
    if (!tool) {
      throw new Error(`No tool ${name}`);
    }
    return TestBed.runInInjectionContext(() =>
      tool.handler(undefined, new AbortController().signal)
    );
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: CvKnowledgeService, useValue: knowledge },
        {
          provide: TranslateService,
          useValue: { instant: (key: string) => `[${key}]` },
        },
      ],
    });
  });

  it.each([
    ['getProfile', { job: '[t.job.title]' }],
    ['getExperiences', [{ position: '[t.position]' }]],
    ['getReferences', [{ name: 'Ada' }]],
    ['getSkills', { core: ['[t.skill]'] }],
    ['getEducation', { degree: '[t.degree]' }],
  ])('%s reads the CV and translates its keys', async (name, expected) => {
    // Act
    const result = await run(name);

    // Assert
    expect(result).toEqual(expected);
  });

  it('describes every tool for the model', () => {
    for (const tool of ASSISTANT_TOOLS) {
      expect(tool.description.length).toBeGreaterThan(20);
    }
  });
});
