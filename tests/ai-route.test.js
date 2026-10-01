const request = require('supertest');
const { createError } = require('../src/lib/errors');

jest.mock('../src/services/openaiClient', () => ({
  rewriteTextProfessionally: jest.fn()
}));

const { rewriteTextProfessionally } = require('../src/services/openaiClient');
const { app } = require('../src/app');

describe('POST /api/ai/rewrite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 for missing text', async () => {
    const response = await request(app).post('/api/ai/rewrite').send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 for oversized text payload', async () => {
    const response = await request(app)
      .post('/api/ai/rewrite')
      .send({ text: 'a'.repeat(1001) });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns standardized 502 on upstream failures', async () => {
    rewriteTextProfessionally.mockRejectedValue(
      createError(502, 'AI_UPSTREAM_ERROR', 'Failed to generate AI response. Please try again.')
    );

    const response = await request(app).post('/api/ai/rewrite').send({ text: 'Hello' });

    expect(response.status).toBe(502);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('AI_UPSTREAM_ERROR');
  });

  it('returns rewritten text for valid requests', async () => {
    rewriteTextProfessionally.mockResolvedValue('Professional message.');

    const response = await request(app).post('/api/ai/rewrite').send({ text: 'hey' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.rewrittenText).toBe('Professional message.');
  });
});
