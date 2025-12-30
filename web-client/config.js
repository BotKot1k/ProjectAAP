// Конфигурация для разных окружений
const CONFIG = {
    development: {
        apiBase: 'http://localhost:3000/api',
        authBase: 'http://localhost:3001/api',
        environment: 'development'
    },
    production: {
        apiBase: '/api',
        authBase: '/auth',
        environment: 'production'
    }
};

// Определяем окружение
const isDevelopment = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.port === '8080';

const config = isDevelopment ? CONFIG.development : CONFIG.production;

// Экспортируем конфигурацию
window.APP_CONFIG = config;

// Для обратной совместимости
window.API_BASE = config.apiBase;
window.AUTH_BASE = config.authBase;

console.log(`Запущено в окружении: ${config.environment}`);
console.log(`API Base: ${config.apiBase}`);
console.log(`Auth Base: ${config.authBase}`);
