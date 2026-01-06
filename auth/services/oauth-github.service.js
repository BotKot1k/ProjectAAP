const axios = require('axios');

function getGithubAuthUrl(loginToken) {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: process.env.GITHUB_CALLBACK_URL,
    scope: 'user:email',
    state: loginToken
  });

  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

async function getGithubUser(code) {
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
  if (!githubAccessToken) {
    throw new Error('GitHub access token not received');
  }

  const userResponse = await axios.get(
    'https://api.github.com/user',
    { headers: { Authorization: `Bearer ${githubAccessToken}` } }
  );

  const emailsResponse = await axios.get(
    'https://api.github.com/user/emails',
    { headers: { Authorization: `Bearer ${githubAccessToken}` } }
  );

  const primaryEmail = emailsResponse.data.find(
    e => e.primary && e.verified
  )?.email;

  if (!primaryEmail) {
    throw new Error('Primary email not found');
  }

  return {
    id: userResponse.data.id,
    email: primaryEmail,
    name: userResponse.data.name || userResponse.data.login,
    avatar: userResponse.data.avatar_url
  };
}

module.exports = {
  getGithubAuthUrl,
  getGithubUser
};
