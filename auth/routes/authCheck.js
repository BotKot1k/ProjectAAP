const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/check', authMiddleware, (req, res) => {
  res.json({
    user: req.user
  });
});

module.exports = router;
