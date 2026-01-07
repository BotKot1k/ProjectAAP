const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true
  },

  // Пользователь может иметь несколько ролей
  roles: {
    type: [String],
    enum: ['student', 'teacher', 'admin'],
    default: ['student']
  },

  // Блокировка пользователя (418 на любой запрос)
  blocked: {
    type: Boolean,
    default: false
  },

  // OAuth
  yandexId: {
    type: String,
    sparse: true,
    unique: true
  },

  githubId: {
    type: String,
    sparse: true,
    unique: true
  },

  name: {
    type: String,
    default: ''
  },

  avatar: {
    type: String,
    default: ''
  },

  isEmailVerified: {
    type: Boolean,
    default: false
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);
