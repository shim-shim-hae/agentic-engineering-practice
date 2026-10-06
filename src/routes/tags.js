const express = require('express');
const tagsService = require('../services/tags');

const tagsRouter = express.Router();
const taskTagsRouter = express.Router({ mergeParams: true });

tagsRouter.get('/', (req, res, next) => {
  try {
    res.json(tagsService.listTags());
  } catch (err) {
    next(err);
  }
});

tagsRouter.post('/', (req, res, next) => {
  try {
    res.status(201).json(tagsService.createTag(req.body.name));
  } catch (err) {
    next(err);
  }
});

taskTagsRouter.post('/', (req, res, next) => {
  try {
    const link = tagsService.addTagToTask(parseInt(req.params.taskId), req.body.tag_id);
    res.status(201).json(link);
  } catch (err) {
    next(err);
  }
});

taskTagsRouter.delete('/:tagId', (req, res, next) => {
  try {
    const result = tagsService.removeTagFromTask(parseInt(req.params.taskId), parseInt(req.params.tagId));
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = { tagsRouter, taskTagsRouter };
