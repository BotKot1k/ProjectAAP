const mongoose = require('mongoose');

const RefreshTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  token: { type: String },
  expiresAt: { type: Date }
});

module.exports = mongoose.model('RefreshToken', RefreshTokenSchema);