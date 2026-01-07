const express = require('express');
const jwt = require('jsonwebtoken');
const RefreshToken = require('../models/RefreshToken');
const User = require('../models/User');
const { createAccessToken } = require('../services/token.service');
const { getPermissionsByRoles } = require('../services/permissions.service');

const router = express.Router();

router.post('/refresh', async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) return res.sendStatus(401);

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET);

    const savedToken = await RefreshToken.findOne({ token: refreshToken });
    if (!savedToken) return res.sendStatus(401);

    const user = await User.findById(payload.id);
    if (!user || user.blocked) return res.sendStatus(403);

    const permissions = getPermissionsByRoles(user.roles);

    const newAccessToken = createAccessToken(
      {
        id: user._id,
        email: user.email,
        roles: user.roles,
        permissions,
        blocked: user.blocked
      },
      { expiresIn: '15m' }
    );

    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      sameSite: 'lax'
    });

    res.json({ ok: true });
  } catch (err) {
    res.sendStatus(401);
  }
});

module.exports = router;
