# Prompts & AI Integration Log

## Sprint 16 Feature
- **Feature:** Professional Rewrite Assistant
- **Provider:** OpenAI (server-side only)
- **Endpoint:** `POST /api/ai/rewrite`
- **Input:** `{ "text": "string (1-1000 chars)" }`
- **Output:** `{ "success": true, "data": { "rewrittenText": "..." } }`

## Environment Variables
- `OPENAI_API_KEY` (required): OpenAI API key used by backend only
- `OPENAI_MODEL` (optional): defaults to `gpt-4o-mini`
- `PORT` (optional): defaults to `3000`

## Local Run Instructions
1. Install dependencies:
   - `npm install`
2. Set environment variables:
   - `export OPENAI_API_KEY="your_key_here"`
3. Run the app:
   - `npm start`
4. Open:
   - `http://localhost:3000`

## Validation & Fallback Behavior
- Request payload is validated with Zod before AI execution.
- If the payload is invalid, API returns `400 VALIDATION_ERROR`.
- If `OPENAI_API_KEY` is missing, API returns `503 AI_CONFIG_MISSING`.
- If upstream AI call fails, API returns `502 AI_UPSTREAM_ERROR`.
- AI output is sanitized before returning.
- AI endpoint is rate-limited to control abuse.
