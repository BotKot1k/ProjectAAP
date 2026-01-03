const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },
  permissions: {
    type: [String],
    required: true
  },
  // Добавленные поля для OAuth авторизации
  yandexId: {
    type: String,
    sparse: true, // Разрешает null для пользователей без Яндекс авторизации
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
  // Поле для связи с исходной системой (если нужно)
  originalUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
});

module.exports = mongoose.model('User', UserSchema);