const express = require('express');
const webhooksService = require('../services/webhooks');

const webhooksRouter = express.Router();

webhooksRouter.post('/task-update', (req, res, next) => {
  try {
    res.json(webhooksService.handleTaskUpdate(req.body));
  } catch (err) {
    next(err);
  }
});

module.exports = { webhooksRouter };
