const loginTokens = new Map();

const LOGIN_TOKEN_TTL = 5 * 60 * 1000; // 5 минут

function createLoginToken(token) {
  loginTokens.set(token, {
    status: 'pending',
    expiresAt: Date.now() + LOGIN_TOKEN_TTL
  });
}

function getLoginToken(token) {
  return loginTokens.get(token);
}

function resolveLoginToken(token, data) {
  const record = loginTokens.get(token);
  if (!record) return;

  record.status = 'success';
  record.result = data;
}

function rejectLoginToken(token) {
  const record = loginTokens.get(token);
  if (!record) return;

  record.status = 'rejected';
}

module.exports = {
  createLoginToken,
  getLoginToken,
  resolveLoginToken,
  rejectLoginToken
};