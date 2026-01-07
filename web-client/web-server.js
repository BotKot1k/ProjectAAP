const express = require('express');
const path = require('path');
const app = express();

// Раздаем статические файлы
app.use(express.static(__dirname));

// Главная страница (редирект на main.html)
app.get('/', (req, res) => {
    res.redirect('/main.html');
});

// Маршрут для обработки OAuth callback
app.get('/oauth-callback', (req, res) => {
    const { accessToken, refreshToken, userId } = req.query;
    
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Авторизация успешна</title>
            <script>
                if (window.opener && !window.opener.closed) {
                    window.opener.postMessage({
                        type: 'oauth_success',
                        accessToken: '${accessToken}',
                        refreshToken: '${refreshToken}',
                        userId: '${userId}'
                    }, window.location.origin);
                }
                setTimeout(() => window.close(), 1000);
            </script>
        </head>
        <body>
            <h2>Авторизация успешна! Закройте это окно.</h2>
        </body>
        </html>
    `);
});

const PORT = 5500;
app.listen(PORT, () => {
    console.log(`Frontend server running at http://127.0.0.1:${PORT}`);
    console.log(`Open in browser: http://127.0.0.1:${PORT}/main.html`);
});