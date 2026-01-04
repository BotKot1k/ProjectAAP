const express = require('express');
const router = express.Router();

const User = require('../models/User');

const authMiddleware = require('../middlewares/auth.middleware');
const checkPermission = require('../middlewares/checkPermission');
const checkSelf = require('../middlewares/checkSelf');

/**
 * GET /users
 * admin → список пользователей
 */
router.get(
  '/',
  authMiddleware,
  checkPermission(['user:list:read']),
  async (req, res) => {
    const users = await User.find().select('-__v');
    res.json(users);
  }
);

/**
 * GET /users/:userId
 * пользователь → только себя
 * admin → любого
 */
router.get(
  '/:userId',
  authMiddleware,
  checkPermission(['user:data:read']),
  async (req, res) => {
    if (
      req.user.id !== req.params.userId &&
      !req.user.permissions.includes('user:list:read')
    ) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) return res.sendStatus(404);

    res.json(user);
  }
);

/**
 * PATCH /users/:userId/block
 * admin → блокировка пользователя
 */
router.patch(
  '/:userId/block',
  authMiddleware,
  checkPermission(['user:block:write']),
  async (req, res) => {
    await User.findByIdAndUpdate(req.params.userId, { isBlocked: true });
    res.json({ ok: true });
  }
);

/**
 * PATCH /users/:userId/roles
 * admin → смена ролей
 */
router.patch(
  '/:userId/roles',
  authMiddleware,
  checkPermission(['user:roles:write']),
  async (req, res) => {
    const { roles } = req.body;
    if (!Array.isArray(roles)) {
      return res.status(400).json({ error: 'roles must be array' });
    }

    await User.findByIdAndUpdate(req.params.userId, { roles });
    res.json({ ok: true });
  }
);

module.exports = router;
