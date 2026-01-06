const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/auth.middleware');
const checkPermission = require('../middlewares/checkPermission');

const tests = [];

/**
 * POST /tests/pass
 * student
 */
router.post(
  '/pass',
  authMiddleware,
  checkPermission(['test:pass']),
  (req, res) => {
    res.json({ result: 'test passed' });
  }
);

/**
 * POST /tests/question
 * teacher
 */
router.post(
  '/question',
  authMiddleware,
  checkPermission(['test:quest:add']),
  (req, res) => {
    tests.push(req.body);
    res.json({ ok: true });
  }
);

/**
 * GET /tests/answers
 * teacher / admin
 */
router.get(
  '/answers',
  authMiddleware,
  checkPermission(['test:answer:read']),
  (req, res) => {
    res.json(tests);
  }
);

module.exports = router;
