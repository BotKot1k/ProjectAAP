module.exports = function checkBlocked(req, res, next) {
  if (req.user?.isBlocked) {
    return res.status(418).json({ error: 'User is blocked' });
  }
  next();
};
