const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/auth.middleware');
const checkPermission = require('../middlewares/checkPermission');

// временное хранилище
const courses = [];

/**
 * GET /courses
 * student / teacher / admin
 */
router.get(
  '/',
  authMiddleware,
  checkPermission(['course:testList']),
  (req, res) => {
    res.json(courses);
  }
);

/**
 * POST /courses
 * teacher / admin
 */
router.post(
  '/',
  authMiddleware,
  checkPermission(['course:add']),
  (req, res) => {
    const course = {
      id: Date.now().toString(),
      title: req.body.title
    };
    courses.push(course);
    res.json(course);
  }
);

/**
 * DELETE /courses/:id
 * admin
 */
router.delete(
  '/:id',
  authMiddleware,
  checkPermission(['course:del']),
  (req, res) => {
    const index = courses.findIndex(c => c.id === req.params.id);
    if (index === -1) return res.sendStatus(404);

    courses.splice(index, 1);
    res.json({ ok: true });
  }
);

module.exports = router;
