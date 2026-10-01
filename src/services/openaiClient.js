const OpenAI = require('openai');
const { createError } = require('../lib/errors');
const { sanitizeAiOutput } = require('../lib/sanitize');

const SYSTEM_PROMPT = 'Rewrite the given text so it sounds professional, concise, and polite. Return plain text only.';

async function rewriteTextProfessionally(inputText) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw createError(503, 'AI_CONFIG_MISSING', 'AI service is not configured. Set OPENAI_API_KEY.');
  }

  const client = new OpenAI({ apiKey });

  try {
    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.3,
      max_tokens: 220,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: inputText }
      ]
    });

    const output = response.choices?.[0]?.message?.content || '';
    const sanitized = sanitizeAiOutput(output);

    if (!sanitized) {
      throw createError(502, 'AI_UPSTREAM_ERROR', 'AI service returned an empty response.');
    }

    return sanitized;
  } catch (error) {
    if (error.code && error.status) {
      throw error;
    }

    throw createError(502, 'AI_UPSTREAM_ERROR', 'Failed to generate AI response. Please try again.');
  }
}

module.exports = {
  rewriteTextProfessionally
};
