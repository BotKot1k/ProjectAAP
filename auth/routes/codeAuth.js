const express = require('express');
const router = express.Router();

const { generateCode, verifyCode } = require('../services/code.service');
const { createAccessToken, createRefreshToken } = require('../services/token.service');
const { resolveLoginToken } = require('../services/loginToken.service');
const User = require('../models/User');
const { getPermissionsByRoles } = require('../services/permissions.service');

const JWT_SECRET = process.env.JWT_SECRET;

router.post('/start', (req, res) => {
  const { loginToken } = req.body;
  if (!loginToken) {
    return res.status(400).json({ error: 'loginToken required' });
  }

  const code = generateCode(loginToken);

  resolveLoginToken(loginToken, {
    status: 'pending',
    expiresAt: Date.now() + 5 * 60 * 1000
  });

  res.json({ code });
});

router.post('/verify', async (req, res) => {
  const { code, refreshToken } = req.body;
  if (!code || !refreshToken) {
    return res.status(400).json({ error: 'code and refreshToken required' });
  }

  try {
    const { loginToken, email } = verifyCode(code, refreshToken, JWT_SECRET);

    let user = await User.findOne({ email });

    if (!user) {
      const randomNum = Math.floor(Math.random() * 100000);
      user = await User.create({
        email,
        name: `Аноним${randomNum}`,
        roles: ['student']
      });
    }

    if (user.blocked) {
      return res.sendStatus(418);
    }

    const permissions = getPermissionsByRoles(user.roles);

    const accessToken = createAccessToken(
      {
        id: user._id,
        email: user.email,
        roles: user.roles,
        permissions,
        blocked: user.blocked
      },
      { expiresIn: '15m' }
    );

    const newRefreshToken = await createRefreshToken(user, {
      expiresIn: '7d'
    });

    resolveLoginToken(loginToken, {
      accessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        roles: user.roles
      }
    });

    res.json({ ok: true });
  } catch (err) {
    console.error('Code verify error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
