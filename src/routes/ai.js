const express = require('express');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');
const { asyncHandler, createError } = require('../lib/errors');
const { rewriteTextProfessionally } = require('../services/openaiClient');

const router = express.Router();

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many AI requests. Please wait and try again.'
    }
  }
});

const rewriteSchema = z.object({
  text: z
    .string({ required_error: 'text is required' })
    .trim()
    .min(1, 'text cannot be empty')
    .max(1000, 'text must be 1000 characters or fewer')
});

router.post(
  '/rewrite',
  aiLimiter,
  asyncHandler(async (req, res) => {
    const parsed = rewriteSchema.safeParse(req.body);
    if (!parsed.success) {
      throw createError(400, 'VALIDATION_ERROR', 'Invalid request payload', parsed.error.flatten());
    }

    const rewrittenText = await rewriteTextProfessionally(parsed.data.text);

    res.status(200).json({
      success: true,
      data: {
        rewrittenText
      }
    });
  })
);

module.exports = { aiRouter: router };
