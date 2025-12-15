function getGithubAuthUrl(loginToken) {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: process.env.GITHUB_CALLBACK_URL,
    state: loginToken,
    scope: 'user:email'
  });

  return https`//github.com/login/oauth/authorize?${params.toString()}`;
}

module.exports = { getGithubAuthUrl };