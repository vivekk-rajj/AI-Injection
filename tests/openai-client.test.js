const { rewriteTextProfessionally } = require('../src/services/openaiClient');
const { sanitizeAiOutput } = require('../src/lib/sanitize');

describe('openai client guard rails', () => {
  const previousKey = process.env.OPENAI_API_KEY;

  afterEach(() => {
    if (previousKey === undefined) {
      delete process.env.OPENAI_API_KEY;
    } else {
      process.env.OPENAI_API_KEY = previousKey;
    }
  });

  it('throws a config error when API key is missing', async () => {
    delete process.env.OPENAI_API_KEY;

    await expect(rewriteTextProfessionally('hello')).rejects.toMatchObject({
      status: 503,
      code: 'AI_CONFIG_MISSING'
    });
  });

  it('sanitizes potentially unsafe model output', () => {
    const cleaned = sanitizeAiOutput('<script>alert(1)</script>  Hello\nworld');
    expect(cleaned).toBe('alert(1) Hello world');
  });
});
