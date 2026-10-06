const express = require('express');
const healthService = require('../services/health');

const healthRouter = express.Router();

healthRouter.get('/', (req, res, next) => {
  try {
    res.json(healthService.getHealth());
  } catch (err) {
    next(err);
  }
});

module.exports = { healthRouter };
