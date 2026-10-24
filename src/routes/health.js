const express = require('express');
const healthService = require('../services/health');

/**
 * @description Router for the health check, mounted at /health.
 * @type {import('express').Router}
 */
const healthRouter = express.Router();

healthRouter.get('/', (req, res, next) => {
  try {
    res.json(healthService.getHealth());
  } catch (err) {
    next(err);
  }
});

module.exports = { healthRouter };
