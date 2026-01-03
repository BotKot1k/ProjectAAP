const axios = require('axios');
const User = require('../models/User');
const { createAccessToken, createRefreshToken } = require('./token.service');
const { resolveLoginToken } = require('./loginToken.service');

/**
 * Простой маппинг role → permissions
 */
function getPermissionsByRole(role) {
  switch (role) {
    case 'admin': return ['read', 'write', 'delete'];
    case 'student': return ['read'];
    case 'teacher': return ['read', 'write'];
    default: return [];
  }
}

/**
 * Формирование URL для начала GitHub OAuth
 */
function getGithubAuthUrl(loginToken) {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: process.env.GITHUB_CALLBACK_URL,
    scope: 'user:email',
    state: loginToken
  });

  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

/**
 * Завершение GitHub OAuth
 */
async function handleGithubCallback(code, loginToken) {
  // 1. Обмен code на GitHub access token
  const tokenResponse = await axios.post(
    'https://github.com/login/oauth/access_token',
    {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code
    },
    {
      headers: { Accept: 'application/json' }
    }
  );

  const githubAccessToken = tokenResponse.data.access_token;
  if (!githubAccessToken) {
    throw new Error('GitHub access token not received');
  }

  // 2. Получение email пользователя
  const emailResponse = await axios.get(
    'https://api.github.com/user/emails',
    {
      headers: {
        Authorization: `Bearer ${githubAccessToken}`
      }
    }
  );

  const primaryEmail = emailResponse.data.find(
    email => email.primary && email.verified
  )?.email;

  if (!primaryEmail) {
    throw new Error('Primary email not found');
  }

  // 3. Поиск пользователя в базе
  let user = await User.findOne({ email: primaryEmail });

  if (!user) {
    // Создаём нового пользователя
    const role = 'student';
    const permissions = getPermissionsByRole(role);

    user = await User.create({
      email: primaryEmail,
      role,
      permissions
    });
  } else {
    // Обновляем существующего пользователя: роль остаётся, обновляем permissions
    user.permissions = getPermissionsByRole(user.role);
    await user.save();
  }

  // 4. Генерация токенов
  const accessToken = createAccessToken(user, { expiresIn: '1m' }); // 1 минута
  const refreshToken = await createRefreshToken(user, { expiresIn: '7d' }); // 7 дней

  // 5. Завершение loginToken
  resolveLoginToken(loginToken, {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      permissions: user.permissions
    }
  });
}

module.exports = {
  getGithubAuthUrl,
  handleGithubCallback
};

