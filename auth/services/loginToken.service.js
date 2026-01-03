const loginTokens = new Map();

const LOGIN_TOKEN_TTL = 5 * 60 * 1000; // 5 минут

function createLoginToken(token) {
  loginTokens.set(token, {
    status: 'pending',
    expiresAt: Date.now() + LOGIN_TOKEN_TTL
  });
}

function getLoginToken(token) {
  const record = loginTokens.get(token);
  if (!record) return null;

  //  Истёк срок жизни
  if (Date.now() > record.expiresAt) {
    record.status = 'rejected';
    record.reason = 'expired';
  }

  return record;
}


function resolveLoginToken(token, data) {
  const record = loginTokens.get(token);
  if (!record) return;

  // нельзя завершать истёкший или отклонённый токен
  if (record.status !== 'pending') return;

  record.status = 'success';
  record.result = data;
}


function rejectLoginToken(token) {
  const record = loginTokens.get(token);
  if (!record) return;

  if (record.status !== 'pending') return;

  record.status = 'rejected';
}


module.exports = {
  createLoginToken,
  getLoginToken,
  resolveLoginToken,
  rejectLoginToken
};