require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// Проверка JWT_SECRET
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is missing! Set it in your .env file.');
  process.exit(1);
}

// Подключение маршрутов
const yandexRoutes = require('./routes/yandexAuth');
const githubRoutes = require('./routes/githubAuth');
const codeRoutes = require('./routes/codeAuth');

app.use('/auth/yandex', yandexRoutes);
app.use('/auth/github', githubRoutes);
app.use('/auth/code', codeRoutes);

app.use('/users', require('./routes/users'));
app.use('/courses', require('./routes/courses'));
app.use('/tests', require('./routes/tests'));

// Проверка работы сервера
app.get('/', (req, res) => res.send('Authorization server running'));

// Подключение к MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('MongoDB connection error:', err.message));
