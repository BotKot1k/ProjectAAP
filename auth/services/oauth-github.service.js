const axios = require('axios');
const User = require('../models/User');
const { createAccessToken, createRefreshToken } = require('./token.service');
const { resolveLoginToken } = require('./loginToken.service');
const { getPermissionsByRole } = require('./permissions.service');

function getGithubAuthUrl(loginToken) {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: process.env.GITHUB_CALLBACK_URL,
    scope: 'user:email',
    state: loginToken
  });

  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

async function handleGithubCallback(code, loginToken) {
  const tokenResponse = await axios.post(
    'https://github.com/login/oauth/access_token',
    {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code
    },
    { headers: { Accept: 'application/json' } }
  );

  const githubAccessToken = tokenResponse.data.access_token;
  if (!githubAccessToken) throw new Error('GitHub access token not received');

  const emailResponse = await axios.get(
    'https://api.github.com/user/emails',
    { headers: { Authorization: `Bearer ${githubAccessToken}` } }
  );

  const primaryEmail = emailResponse.data.find(email => email.primary && email.verified)?.email;
  if (!primaryEmail) throw new Error('Primary email not found');

  let user = await User.findOne({ email: primaryEmail });
  if (!user) {
    user = await User.create({
      email: primaryEmail,
      name: 'GitHubUser',
      role: 'student',
      permissions: []
    });
  }

  user.permissions = getPermissionsByRole(user.role);
  await user.save();

  const newAccessToken = createAccessToken(user, { expiresIn: '1m' });
  const newRefreshToken = await createRefreshToken(user, { expiresIn: '7d' });

  resolveLoginToken(loginToken, {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions
    }
  });
}

module.exports = { getGithubAuthUrl, handleGithubCallback };
