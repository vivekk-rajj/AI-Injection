const path = require('path');
const express = require('express');
const { aiRouter } = require('./routes/ai');
const { createError, errorMiddleware } = require('./lib/errors');

const app = express();

app.use(express.json({ limit: '100kb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/api/health', (req, res) => {
  res.json({ success: true });
});

app.use('/api/ai', aiRouter);

app.use('/api/*', (req, res, next) => {
  next(createError(404, 'NOT_FOUND', 'Route not found'));
});

app.use(errorMiddleware);

module.exports = { app };
