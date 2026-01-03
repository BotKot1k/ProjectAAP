const axios = require('axios');
const { resolveLoginToken } = require('./loginToken.service');
const User = require('../models/User');
const { createAccessToken, createRefreshToken } = require('./token.service');
const { getPermissionsByRole } = require('./permissions.service');

const YANDEX_CLIENT_ID = process.env.YANDEX_CLIENT_ID;
const YANDEX_CLIENT_SECRET = process.env.YANDEX_CLIENT_SECRET;
const YANDEX_REDIRECT_URI = process.env.YANDEX_REDIRECT_URI || 'http://localhost:4000/auth/yandex/callback';

function getYandexAuthUrl(loginToken) {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: YANDEX_CLIENT_ID,
    redirect_uri: YANDEX_REDIRECT_URI,
    state: loginToken,
    scope: 'login:email login:info'
  });

  return `https://oauth.yandex.ru/authorize?${params.toString()}`;
}

async function handleYandexCallback(code, state) {
  try {
    const tokenResponse = await axios.post('https://oauth.yandex.ru/token', new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: YANDEX_CLIENT_ID,
      client_secret: YANDEX_CLIENT_SECRET
    }).toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const accessToken = tokenResponse.data.access_token;

    const userResponse = await axios.get('https://login.yandex.ru/info', {
      headers: { Authorization: `OAuth ${accessToken}` },
      params: { format: 'json' }
    });

    const yandexUser = userResponse.data;

    let user = await User.findOne({ yandexId: yandexUser.id });
    if (!user) {
      if (yandexUser.default_email) {
        user = await User.findOne({ email: yandexUser.default_email });
      }
      if (!user) {
        user = new User({
          yandexId: yandexUser.id,
          email: yandexUser.default_email,
          name: yandexUser.real_name || yandexUser.display_name || yandexUser.login,
          avatar: yandexUser.default_avatar_id ? 
            `https://avatars.yandex.net/get-yapic/${yandexUser.default_avatar_id}/islands-200` : null,
          isEmailVerified: !!yandexUser.default_email,
          role: 'student',
          permissions: [] 
        });
      } else {
        user.yandexId = yandexUser.id;
        user.name = yandexUser.real_name || yandexUser.display_name || yandexUser.login;
        user.avatar = yandexUser.default_avatar_id ? 
          `https://avatars.yandex.net/get-yapic/${yandexUser.default_avatar_id}/islands-200` : user.avatar || '';
        user.isEmailVerified = yandexUser.default_email ? true : user.isEmailVerified;
      }
    }

    // Формируем права по роли
    user.permissions = getPermissionsByRole(user.role);
    await user.save();

    const newAccessToken = createAccessToken(user, { expiresIn: '1m' });
    const newRefreshToken = await createRefreshToken(user, { expiresIn: '7d' });

    resolveLoginToken(state, {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        permissions: user.permissions
      }
    });
  } catch (error) {
    console.error('Yandex OAuth error:', error.response?.data || error.message);
    throw new Error('Yandex authentication failed');
  }
}

module.exports = { getYandexAuthUrl, handleYandexCallback };
