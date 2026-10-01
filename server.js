const { app } = require('./src/app');

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT);
}

module.exports = { PORT };
