function sanitizeAiOutput(text) {
  if (typeof text !== 'string') {
    return '';
  }

  const withoutControlChars = text.replace(/[\u0000-\u001F\u007F]/g, ' ');
  const withoutTags = withoutControlChars.replace(/<[^>]*>/g, ' ');
  return withoutTags.replace(/\s+/g, ' ').trim().slice(0, 1200);
}

module.exports = { sanitizeAiOutput };
