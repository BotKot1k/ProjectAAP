// Конфигурация серверов
const AUTH_SERVER = 'http://26.111.149.201:8080'; // IP человека с авторизацией
const API_SERVER = 'http://localhost:3415';
const API_BASE = `${API_SERVER}/api`;
const SESSION_KEY = 'test_session';
const OAUTH_STATE_KEY = 'oauth_state';

// Состояние приложения
let state = {
    status: 'unknown',
    userId: null,
    token: null,
    refreshToken: null,
    currentCourse: null,
    currentTest: null,
    questions: [],
    currentQuestion: 0,
    answers: {}
};

// ========== ОСНОВНЫЕ ФУНКЦИИ ==========

// Инициализация приложения
document.addEventListener('DOMContentLoaded', init);

async function init() {
    await handleTokensFromURL();
    initMessageListener();
    checkSession();
}

// Обработка токенов из URL
async function handleTokensFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('accessToken');
    const refreshToken = urlParams.get('refreshToken');
    const userId = urlParams.get('userId');
    
    if (accessToken) {
        console.log('Найдены токены в URL:', { accessToken, refreshToken, userId });
        
        // Проверяем авторизацию ТОЛЬКО через AUTH_SERVER
        const isAuthorized = await checkAuthWithAuthServer(accessToken);
        
        if (!isAuthorized) {
            alert('Пользователь не авторизован или сессия недействительна');
            localStorage.removeItem(SESSION_KEY);
            updateState('unknown');
            return;
        }
        
        // Сохраняем сессию
        localStorage.setItem(SESSION_KEY, JSON.stringify({
            token: accessToken,
            refreshToken: refreshToken,
            userId: userId
        }));
        
        state.token = accessToken;
        state.refreshToken = refreshToken;
        state.userId = userId;
        
        window.history.replaceState({}, '', window.location.pathname);
        
        // Автоматически создаем пользователя в логическом модуле
        await createUserInApiModule();
        
        state.status = 'authorized';
        updateState('authorized');
        loadUserData();
    }
}

// Проверка авторизации только через AUTH_SERVER
async function checkAuthWithAuthServer(accessToken) {
    try {
        const response = await fetch(`${AUTH_SERVER}/auth/verify`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        return response.ok;
    } catch (error) {
        console.error('Ошибка проверки авторизации:', error);
        return false;
    }
}

// Автоматическое создание пользователя в логическом модуле
async function createUserInApiModule() {
    try {
        // Получаем информацию о пользователе из AUTH_SERVER
        const userInfo = await fetch(`${AUTH_SERVER}/auth/user-info`, {
            headers: {
                'Authorization': `Bearer ${state.token}`
            }
        }).then(res => res.ok ? res.json() : null);
        
        if (!userInfo) {
            console.warn('Не удалось получить информацию о пользователе');
            return;
        }
        
        // Пытаемся создать пользователя в логическом модуле
        try {
            await fetch(`${API_BASE}/user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    externalId: state.userId,
                    name: userInfo.name || `User_${state.userId}`,
                    email: userInfo.email || '',
                    authSystem: userInfo.authSystem || 'oauth'
                })
            });
        } catch (error) {
            // Игнорируем ошибку создания (пользователь может уже существовать)
            console.log('Пользователь уже существует в системе или ошибка создания:', error);
        }
    } catch (error) {
        console.warn('Ошибка создания пользователя в логическом модуле:', error);
        // Игнорируем ошибку - авторизация уже прошла
    }
}

// Обработчик сообщений от popup
function initMessageListener() {
    window.addEventListener('message', async function(event) {
        if (event.origin !== window.location.origin) {
            console.warn('Получено сообщение из недоверенного источника:', event.origin);
            return;
        }
        
        const data = event.data;
        
        if (data.type === 'oauth_success') {
            console.log('Получены токены от popup:', data);
            
            // Проверяем авторизацию ТОЛЬКО через AUTH_SERVER
            const isAuthorized = await checkAuthWithAuthServer(data.accessToken);
            
            if (!isAuthorized) {
                alert('Пользователь не авторизован или сессия недействительна');
                localStorage.removeItem(SESSION_KEY);
                updateState('unknown');
                return;
            }
            
            // Сохраняем сессию
            localStorage.setItem(SESSION_KEY, JSON.stringify({
                token: data.accessToken,
                refreshToken: data.refreshToken,
                userId: data.userId
            }));
            
            state.token = data.accessToken;
            state.refreshToken = data.refreshToken;
            state.userId = data.userId;
            
            // Автоматически создаем пользователя в логическом модуле
            await createUserInApiModule();
            
            state.status = 'authorized';
            updateState('authorized');
            loadUserData();
            alert(`Добро пожаловать!`);
        } else if (data.type === 'oauth_error') {
            console.error('Ошибка авторизации из popup:', data.error);
            alert(`Ошибка авторизации: ${data.error}`);
        }
    });
}

// ========== АВТОРИЗАЦИЯ ==========

// Обновление состояния интерфейса
function updateState(newStatus) {
    state.status = newStatus;
    document.getElementById('userStatus').textContent = `Статус: ${newStatus === 'unknown' ? 'Неизвестный' : newStatus === 'anonymous' ? 'Анонимный' : 'Авторизованный'}`;
    
    document.querySelectorAll('.state').forEach(el => el.classList.remove('active'));
    document.getElementById(`state${capitalize(newStatus)}`).classList.add('active');
    
    updateAuthButtons(newStatus);
}

function updateAuthButtons(status) {
    const authButtons = document.getElementById('authButtons');
    if (!authButtons) return;
    
    if (status === 'unknown' || status === 'anonymous') {
        authButtons.innerHTML = `
            <button class="btn-auth github" onclick="startAuth('github')">
                <i class="fab fa-github"></i> Войти через GitHub
            </button>
            <button class="btn-auth yandex" onclick="startAuth('yandex')">
                <i class="fab fa-yandex"></i> Войти через Yandex
            </button>
            <button class="btn-auth code" onclick="startAuth('code')">
                <i class="fas fa-key"></i> Войти по коду
            </button>
        `;
    } else if (status === 'authorized') {
        authButtons.innerHTML = `
            <button class="btn-auth logout" onclick="logout()">
                <i class="fas fa-sign-out-alt"></i> Выйти
            </button>
        `;
    }
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Проверка сессии
function checkSession() {
    const session = localStorage.getItem(SESSION_KEY);
    if (!session) return updateState('unknown');
    
    try {
        const data = JSON.parse(session);
        state.token = data.token;
        state.userId = data.userId;
        state.refreshToken = data.refreshToken;
        
        // Проверяем авторизацию ТОЛЬКО через AUTH_SERVER
        checkAuthWithAuthServer(data.token).then((isAuthorized) => {
            if (isAuthorized) {
                state.status = 'authorized';
                updateState('authorized');
                loadUserData();
            } else {
                updateState('unknown');
            }
        }).catch(() => {
            updateState('unknown');
        });
    } catch {
        updateState('unknown');
    }
}

// Обновление access token
async function refreshAccessToken() {
    try {
        const response = await fetch(`${AUTH_SERVER}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: state.refreshToken })
        });
        
        if (response.ok) {
            const data = await response.json();
            state.token = data.accessToken;
            
            const session = JSON.parse(localStorage.getItem(SESSION_KEY));
            session.token = data.accessToken;
            if (data.refreshToken) {
                session.refreshToken = data.refreshToken;
                state.refreshToken = data.refreshToken;
            }
            localStorage.setItem(SESSION_KEY, JSON.stringify(session));
            
            return true;
        }
    } catch (error) {
        console.error('Ошибка обновления токена:', error);
    }
    return false;
}

// ========== API ФУНКЦИИ ==========

// Общая функция для API вызовов
async function apiCall(method, endpoint, data = null) {
    const url = `${API_BASE}${endpoint}`;
    const options = {
        method,
        headers: {}
    };
    
    if (state.token) {
        options.headers['Authorization'] = `Bearer ${state.token}`;
    }
    
    if (data) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(url, options);
        
        if (response.status === 401 && state.refreshToken) {
            const refreshed = await refreshAccessToken();
            if (refreshed) {
                options.headers['Authorization'] = `Bearer ${state.token}`;
                const retryResponse = await fetch(url, options);
                if (!retryResponse.ok) {
                    throw new Error(`HTTP ${retryResponse.status}`);
                }
                return await retryResponse.json();
            } else {
                localStorage.removeItem(SESSION_KEY);
                updateState('unknown');
                alert('Сессия истекла. Войдите снова.');
                return null;
            }
        }
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('API error:', error);
        throw error;
    }
}

// Все API endpoints
async function getAllUsers() { return apiCall('GET', '/users'); }
async function getUser(userId) { return apiCall('GET', `/user/${userId}`); }
async function updateUser(userId, data) { return apiCall('PATCH', `/user/${userId}`, data); }
async function getUserCourses(userId) { return apiCall('GET', `/course/user/${userId}`); }
async function getAllCourses() { return apiCall('GET', '/courses'); }
async function getCourse(courseId) { return apiCall('GET', `/course/${courseId}`); }
async function updateCourse(courseId, data) { return apiCall('PATCH', `/course/${courseId}`, data); }
async function deleteCourse(courseId) { return apiCall('DELETE', `/course/${courseId}`); }
async function getCourseTests(courseId) { return apiCall('GET', `/course/${courseId}/test`); }
async function createTest(courseId, name) { return apiCall('POST', `/course/${courseId}/test`, {name}); }
async function getTestQuestions(courseId, testId) { return apiCall('GET', `/course/${courseId}/test/${testId}`); }
async function deleteTest(courseId, testId) { return apiCall('DELETE', `/course/${courseId}/test/${testId}`); }
async function enrollToCourse(courseId, userId) { return apiCall('POST', `/course/${courseId}/user/${userId}`); }
async function leaveCourse(courseId, userId) { return apiCall('DELETE', `/course/${courseId}/user/${userId}`); }
async function createCourse(data) { return apiCall('POST', '/course', data); }
async function getTest(testId) { return apiCall('GET', `/test/${testId}`); }
async function createQuestion(data) { return apiCall('POST', '/question', data); }
async function addQuestionToTest(testId, questionId) { return apiCall('POST', `/test/${testId}/question/${questionId}`); }
async function getUserTestScore(courseId, testId, userId) { return apiCall('GET', `/course/${courseId}/test/${testId}/user/${userId}`); }
async function getTestParticipants(courseId, testId) { return apiCall('GET', `/course/${courseId}/test/${testId}`); }
async function getUserTestAnswers(testId, userId) { return apiCall('GET', `/test/${testId}/user/${userId}`); }

// ========== UI ФУНКЦИИ ==========

function showSection(sectionName) {
    document.querySelectorAll('.section').forEach(el => el.classList.remove('active'));
    document.getElementById(`section${capitalize(sectionName)}`).classList.add('active');
    
    document.querySelectorAll('.nav button').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.nav button[onclick*="${sectionName}"]`)?.classList.add('active');
    
    switch(sectionName) {
        case 'courses': loadUserCourses(); break;
        case 'allcourses': loadAllCourses(); break;
        case 'tests': if (state.currentCourse) loadCourseTests(state.currentCourse); break;
        case 'results': loadUserResults(); break;
        case 'profile': loadProfile(); break;
        case 'admin': loadAdminPanel(); break;
    }
}

async function loadUserData() {
    try {
        const user = await getUser(state.userId);
        document.getElementById('userInfo').textContent = `Пользователь: ${user.name || user.email || 'ID: ' + state.userId}`;
        
        if (user.roles && user.roles.includes('admin')) {
            document.getElementById('adminBtn').style.display = 'block';
        }
    } catch (error) {
        console.error('Ошибка загрузки данных пользователя:', error);

    }
}

// ========== АВТОРИЗАЦИЯ ЧЕРЕЗ OAuth ==========

async function startAuth(provider) {
    try {
        console.log(`Начинаем авторизацию через ${provider} на сервере ${AUTH_SERVER}`);
        
        if (provider === 'github' || provider === 'yandex') {
            await openOAuthPopup(provider);
        } else if (provider === 'code') {
            showCodeModal();
        }
    } catch (error) {
        console.error('Полная ошибка авторизации:', error);
        alert(`Ошибка авторизации: ${error.message}`);
    }
}

async function openOAuthPopup(provider) {
    try {
        const loginToken = generateRandomToken();
        
        // Сохраняем его локально для проверки после возврата
        sessionStorage.setItem('oauth_login_token', loginToken);
        
        console.log(`Начинаем авторизацию через ${provider} с loginToken: ${loginToken}`);
        
        const response = await fetch(`${AUTH_SERVER}/auth/${provider}/start`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                redirectUri: `${window.location.origin}/oauth-popup.html`,
                loginToken: loginToken
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();

        if (data.url) {
            openPopupWindow(data.url, provider);
        } else {
            throw new Error('Сервер не вернул URL для авторизации');
        }
    } catch (error) {
        console.error('Ошибка при получении OAuth URL:', error);
        throw error;
    }
}

function generateRandomToken() {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0')) // преобразования всех символов в 16 систему
        .join('');
}

function openPopupWindow(url, provider) {
    const popupWidth = 600;
    const popupHeight = 700;
    const left = (window.screen.width - popupWidth) / 2;
    const top = (window.screen.height - popupHeight) / 2;
    
    const popup = window.open(
        url,
        'OAuthPopup',
        `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
    );
    
    if (!popup) {
        alert('Пожалуйста, разрешите всплывающие окна для этого сайта');
        return;
    }
    
    // Переходим в состояние ожидания
    state.status = 'anonymous';
    updateState('anonymous');
}

// ========== ВХОД ПО КОДУ ==========

function showCodeModal() {
    document.getElementById('codeModal').style.display = 'flex';
    document.getElementById('authCode').focus();
}

function hideCodeModal() {
    document.getElementById('codeModal').style.display = 'none';
    document.getElementById('authCode').value = '';
}

async function submitCode() {
    const code = document.getElementById('authCode').value.trim();
    if (code.length !== 6) {
        alert('Введите 6 цифр');
        return;
    }
    
    try {
        const response = await fetch(`${AUTH_SERVER}/auth/code/verify`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({code: code})
        });
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.accessToken && data.userId) {
                // Проверяем авторизацию ТОЛЬКО через AUTH_SERVER
                const isAuthorized = await checkAuthWithAuthServer(data.accessToken);
                
                if (!isAuthorized) {
                    alert('Пользователь не авторизован или сессия недействительна');
                    return;
                }
                
                state.token = data.accessToken;
                state.userId = data.userId;
                state.refreshToken = data.refreshToken;
                
                localStorage.setItem(SESSION_KEY, JSON.stringify({
                    token: data.accessToken,
                    refreshToken: data.refreshToken,
                    userId: data.userId
                }));
                
                // Автоматически создаем пользователя в логическом модуле
                await createUserInApiModule();
                
                hideCodeModal();
                state.status = 'authorized';
                updateState('authorized');
                loadUserData();
                alert('Вход по коду успешен!');
            } else {
                alert('Неверный код');
            }
        } else {
            alert('Ошибка проверки кода');
        }
    } catch {
        alert('Ошибка сервера');
    }
}

function cancelAuth() {
    localStorage.removeItem(SESSION_KEY);
    updateState('unknown');
}

// ========== КУРСЫ И ТЕСТЫ ==========

async function loadUserCourses() {
    const container = document.getElementById('coursesList');
    if (!container) return;
    
    container.innerHTML = 'Загрузка...';
    
    try {
        const courses = await getUserCourses(state.userId);
        
        if (!courses || courses.length === 0) {
            container.innerHTML = '<div class="card">Нет курсов</div>';
            return;
        }
        
        container.innerHTML = courses.map(course => `
            <div class="card">
                <h3>${course.name}</h3>
                <p>${course.description || ''}</p>
                <button onclick="viewCourse('${course.id}')">Тесты</button>
                <button onclick="leaveCourseAction('${course.id}')">Отписаться</button>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = '<div class="card">Ошибка загрузки</div>';
    }
}

async function viewCourse(courseId) {
    state.currentCourse = courseId;
    
    try {
        const course = await getCourse(courseId);
        document.getElementById('courseInfo').innerHTML = `
            <div class="card">
                <h3>${course.name}</h3>
                <p>${course.description || ''}</p>
            </div>
        `;
    } catch (error) {
        console.error('Ошибка загрузки курса:', error);
    }
    
    loadCourseTests(courseId);
    showSection('tests');
}

async function loadCourseTests(courseId) {
    const container = document.getElementById('testsList');
    if (!container) return;
    
    container.innerHTML = 'Загрузка...';
    
    try {
        const tests = await getCourseTests(courseId);
        
        if (!tests || tests.length === 0) {
            container.innerHTML = '<div class="card">Нет тестов</div>';
            return;
        }
        
        container.innerHTML = tests.map(test => `
            <div class="card">
                <h3>${test.name}</h3>
                <p>Вопросов: ${test.questionCount || 0}</p>
                <button onclick="startTest('${courseId}', '${test.id}')">Начать тест</button>
                <button onclick="viewTestResults('${courseId}', '${test.id}')">Результаты</button>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = '<div class="card">Ошибка загрузки</div>';
    }
}

async function loadAllCourses() {
    const container = document.getElementById('allCoursesList');
    if (!container) return;
    
    container.innerHTML = 'Загрузка...';
    
    try {
        const allCourses = await getAllCourses();
        const userCourses = await getUserCourses(state.userId);
        const userCourseIds = userCourses.map(c => c.id);
        
        if (!allCourses || allCourses.length === 0) {
            container.innerHTML = '<div class="card">Нет курсов</div>';
            return;
        }
        
        container.innerHTML = allCourses.map(course => `
            <div class="card">
                <h3>${course.name}</h3>
                <p>${course.description || ''}</p>
                ${userCourseIds.includes(course.id) 
                    ? '<button disabled>Записан</button>'
                    : `<button onclick="enrollToCourseAction('${course.id}')">Записаться</button>`
                }
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = '<div class="card">Ошибка загрузки</div>';
    }
}

async function enrollToCourseAction(courseId) {
    try {
        await enrollToCourse(courseId, state.userId);
        alert('Вы записались на курс');
        loadAllCourses();
        loadUserCourses();
    } catch (error) {
        alert('Ошибка записи на курс');
    }
}

async function leaveCourseAction(courseId) {
    if (!confirm('Отписаться от курса?')) return;
    
    try {
        await leaveCourse(courseId, state.userId);
        alert('Вы отписались от курса');
        loadUserCourses();
    } catch (error) {
        alert('Ошибка');
    }
}

// ========== ТЕСТИРОВАНИЕ ==========

async function startTest(courseId, testId) {
    state.currentCourse = courseId;
    state.currentTest = testId;
    state.currentQuestion = 0;
    state.answers = {};
    
    try {
        state.questions = await getTestQuestions(courseId, testId);
        
        showSection('test');
        loadQuestion();
    } catch (error) {
        alert('Ошибка загрузки теста');
    }
}

function loadQuestion() {
    const testContent = document.getElementById('testContent');
    if (!testContent) return;
    
    if (state.currentQuestion >= state.questions.length) {
        finishTest();
        return;
    }
    
    const question = state.questions[state.currentQuestion];
    document.getElementById('questionCounter').textContent = 
        `Вопрос ${state.currentQuestion + 1}/${state.questions.length}`;
    
    testContent.innerHTML = `
        <h3>${question.text}</h3>
        <div>
            ${(question.options || []).map((option, index) => `
                <div class="option ${state.answers[question.id] === index ? 'selected' : ''}" 
                     onclick="selectAnswer(${index})">
                    ${String.fromCharCode(65 + index)}. ${option}
                </div>
            `).join('')}
        </div>
        <div>
            ${state.currentQuestion > 0 ? '<button onclick="prevQuestion()">Назад</button>' : ''}
            <button onclick="nextQuestion()">
                ${state.currentQuestion === state.questions.length - 1 ? 'Завершить' : 'Далее'}
            </button>
        </div>
    `;
}

function selectAnswer(answerIndex) {
    const question = state.questions[state.currentQuestion];
    state.answers[question.id] = answerIndex;
    loadQuestion();
}

function prevQuestion() {
    state.currentQuestion--;
    loadQuestion();
}

function nextQuestion() {
    state.currentQuestion++;
    loadQuestion();
}

async function finishTest() {
    try {
        const response = await fetch(`${API_BASE}/test/${state.currentTest}/submit`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${state.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: state.userId,
                answers: state.answers
            })
        });
        
        if (response.ok) {
            await showTestResults();
        } else {
            throw new Error('Ошибка отправки ответов');
        }
    } catch (error) {
        alert('Ошибка завершения теста');
    }
}

async function showTestResults() {
    try {
        let correct = 0;
        let total = state.questions.length;
        
        state.questions.forEach(question => {
            if (state.answers[question.id] === question.correctAnswer) {
                correct++;
            }
        });
        
        const percentage = Math.round((correct / total) * 100);
        
        const testResultContent = document.getElementById('testResultContent');
        if (testResultContent) {
            testResultContent.innerHTML = `
                <div class="result">
                    <p><strong>Результат:</strong> ${correct} из ${total}</p>
                    <p><strong>Процент:</strong> ${percentage}%</p>
                </div>
            `;
        }
        
        showSection('testResult');
    } catch (error) {
        alert('Ошибка загрузки результатов');
    }
}

async function viewTestResults(courseId, testId) {
    state.currentCourse = courseId;
    state.currentTest = testId;
    await showTestResults();
}

function backToTests() {
    showSection('tests');
    if (state.currentCourse) {
        loadCourseTests(state.currentCourse);
    }
}

// ========== РЕЗУЛЬТАТЫ ==========

async function loadUserResults() {
    const container = document.getElementById('resultsList');
    if (!container) return;
    
    container.innerHTML = 'Загрузка...';
    
    try {
        const courses = await getUserCourses(state.userId);
        
        let allResults = [];
        
        for (const course of courses) {
            const tests = await getCourseTests(course.id);
            
            for (const test of tests) {
                try {
                    const response = await fetch(`${API_BASE}/test/${test.id}/user/${state.userId}`, {
                        headers: {
                            'Authorization': `Bearer ${state.token}`
                        }
                    });
                    
                    if (response.ok) {
                        const result = await response.json();
                        allResults.push({
                            course: course.name,
                            test: test.name,
                            score: result.score || 0
                        });
                    }
                } catch {}
            }
        }
        
        if (allResults.length === 0) {
            container.innerHTML = '<div class="card">Нет результатов</div>';
            return;
        }
        
        container.innerHTML = allResults.map(result => `
            <div class="card">
                <h3>${result.test}</h3>
                <p>Курс: ${result.course}</p>
                <p>Оценка: ${result.score}</p>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = '<div class="card">Ошибка загрузки</div>';
    }
}

// ========== ПРОФИЛЬ ==========

async function loadProfile() {
    const container = document.getElementById('profileContent');
    if (!container) return;
    
    try {
        const user = await getUser(state.userId);
        
        container.innerHTML = `
            <div class="card">
                <h3>Профиль</h3>
                <p>Имя: ${user.name || 'Не указано'}</p>
                <p>Email: ${user.email || 'Не указан'}</p>
                <p>ID: ${user.id}</p>
            </div>
        `;
    } catch (error) {
        container.innerHTML = '<div class="card">Ошибка загрузки</div>';
    }
}

async function saveProfile() {
    const name = document.getElementById('editName').value;
    const email = document.getElementById('editEmail').value;
    
    try {ё
        await updateUser(state.userId, {name, email});
        alert('Профиль обновлен');
        loadProfile();
    } catch (error) {
        alert('Ошибка обновления профиля');
    }
}
ёё

// ========== ВСПОМОГАТЕЛЬНЫЕ ==========

function hideModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

async function logout() {
    if (!confirm('Выйти из системы?')) return;
    
    try {
        if (state.token) {
            try {
                await fetch(`${AUTH_SERVER}/auth/logout`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${state.token}` }
                });
            } catch (error) {
                console.warn('Не удалось уведомить сервер авторизации о выходе:', error);
            }
        }
        
        localStorage.removeItem(SESSION_KEY);
        
        state = {
            status: 'unknown',
            userId: null,
            token: null,
            refreshToken: null,
            currentCourse: null,
            currentTest: null,
            questions: [],
            currentQuestion: 0,
            answers: {}
        };
        
        updateState('unknown');
    } catch (error) {
        alert('Ошибка выхода');
    }
}
