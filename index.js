const express = require('express');
const { PORT } = require('./src/utils/constants');
const router = require('./routes');
const { healthRouter } = require('./src/routes/health');
const { webhooksRouter } = require('./src/routes/webhooks');
const { tagsRouter, taskTagsRouter } = require('./src/routes/tags');
const { requestLogger } = require('./src/middleware/request-logger');
const { errorHandler } = require('./src/middleware/error-handler');

const app = express();

app.use(express.json());
app.use(requestLogger);

app.get('/', (req, res) => {
  res.json({ name: 'Taskr API', version: '1.0.0', docs: '/health' });
});

app.use('/health', healthRouter);
app.use('/webhooks', webhooksRouter);
app.use('/tags', tagsRouter);
app.use('/tasks/:taskId/tags', taskTagsRouter);
app.use(router);
app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Taskr API running on port ${PORT}`);
  });
}

module.exports = app;
