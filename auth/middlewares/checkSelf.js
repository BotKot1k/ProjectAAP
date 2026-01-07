module.exports = function checkSelf(paramName = 'userId') {
  return (req, res, next) => {
    if (req.user.id !== req.params[paramName]) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
};
