require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// === Настройка CORS ===
// Укажи IP фронтенда (где запускается твой веб-клиент)
// Можно с портом, если фронтенд на другом порту
const FRONTEND_URL = 'http://26.104.217.228:5500';

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', FRONTEND_URL);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true'); // если используете cookie
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

// === Проверка JWT_SECRET ===
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is missing! Set it in your .env file.');
  process.exit(1);
}

// === Подключение маршрутов ===
const yandexRoutes = require('./routes/yandexAuth');
const githubRoutes = require('./routes/githubAuth');
const codeRoutes = require('./routes/codeAuth');

app.use('/auth/yandex', yandexRoutes);
app.use('/auth/github', githubRoutes);
app.use('/auth/code', codeRoutes);

app.use('/users', require('./routes/users'));
app.use('/courses', require('./routes/courses'));
app.use('/tests', require('./routes/tests'));

// === Проверка работы сервера ===
app.get('/', (req, res) => res.send('Authorization server running'));

// === Подключение к MongoDB и запуск сервера ===
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');

    const PORT = process.env.PORT || 8080;

    // Слушаем все интерфейсы 0.0.0.0 → доступ извне
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Frontend CORS allowed from: ${FRONTEND_URL}`);
    });
  })
  .catch(err => console.error('MongoDB connection error:', err.message));
