import { SYSTEM_PROMPT } from '../utils/ai/prompts';

describe('SYSTEM_PROMPT', () => {
  it('should be a non-empty string', () => {
    expect(typeof SYSTEM_PROMPT).toBe('string');
    expect(SYSTEM_PROMPT.length).toBeGreaterThan(0);
  });

  it('should contain required instructional sections', () => {
    expect(SYSTEM_PROMPT).toMatch(/You are an expert instructional tutor/);
    expect(SYSTEM_PROMPT).toMatch(/number_of_questions/);
    expect(SYSTEM_PROMPT).toMatch(/question_type/);
    expect(SYSTEM_PROMPT).toMatch(/multiple_choice/);
    expect(SYSTEM_PROMPT).toMatch(/short-answer/);
    expect(SYSTEM_PROMPT).toMatch(/coding/);
    expect(SYSTEM_PROMPT).toMatch(/valid JSON only/);
    expect(SYSTEM_PROMPT).toMatch(/Output format/);
    expect(SYSTEM_PROMPT).toMatch(/exercises/);
  });

  it('should specify rules for hints and explanations', () => {
    expect(SYSTEM_PROMPT).toMatch(/Hints: max 2 sentences/);
    expect(SYSTEM_PROMPT).toMatch(/Explanations: clear step-by-step/);
  });
});
