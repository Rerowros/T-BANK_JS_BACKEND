const express = require('express');
const path = require('path');
const { fetchWithCache, clearCache, resizeCache } = require('./apiWrapper'); // Импортируем функции для работы с кэшем
const { swaggerUi, specs } = require('./swagger'); // Импортируем swagger для документации
const InMemoryCache = require('./cache'); // Импортируем класс кэша

const app = express(); // Создаем приложение express
const PORT = 3000;

// Инициализируем экземпляр кэша
const cache = new InMemoryCache();


app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/cats/:status', async (req, res) => {
    const statusCode = req.params.status;
    const url = `https://http.cat/${statusCode}`; // url для запроса
    try {
        const data = await fetchWithCache(url); // Получаем данные с кэшем
        res.set('Content-Type', 'image/jpeg'); // Устанавливаем тип контента
        res.send(Buffer.from(data, 'binary')); // Отправляем данные как изображение
    } catch (error) {
        res.status(500).send('Ошибка при получении данных'); // Обрабатываем ошибку
    }
});

/**
 * @swagger
 * /cache/clear:
 *   post:
 *     summary: Очищает кэш
 *     responses:
 *       200:
 *         description: Кэш очищен
 */
app.post('/cache/clear', (req, res) => {
    clearCache();
    res.send('Кэш очищен');
});

/**
 * @swagger
 * /cache/resize:
 *   post:
 *     summary: Изменяет размер кэша
 *     parameters:
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *         required: true
 *         description: Новый размер кэша
 *     responses:
 *       200:
 *         description: Размер кэша изменен
 *       400:
 *         description: Неверный размер
 */
// Обработчик POST-запроса для изменения размера кэша
app.post('/cache/resize', (req, res) => {
    // Получаем новый размер кэша из параметров запроса и преобразуем его в целое число
    const newSize = parseInt(req.query.size, 10);

    // Проверяем, является ли новый размер числом и больше ли он нуля
    if (isNaN(newSize) || newSize <= 0) {
        return res.status(400).send('Недопустимый размер');
    }
    resizeCache(newSize);
    res.send(`Кэш изменён на ${newSize}`);
});

/**
 * @swagger
 * /cache/update:
 *   post:
 *     summary: Обновляет кэш новой парой ключ-значение
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               key:
 *                 type: string
 *               value:
 *                 type: string
 *     responses:
 *       200:
 *         description: Кэш обновлен
 *       400:
 *         description: Требуются ключ и значение
 */
app.post('/cache/update', (req, res) => {
    const { key, value } = req.body || {};
    if (!key || !value) {
        return res.status(400).send('Ключ и значение являются обязательными');
    }
    cache.set(key, value);
    res.send(`Обновление кэша для: ${key}`);
});

/**
 * @swagger
 * /cache/state:
 *   get:
 *     summary: Возвращает текущее состояние кэша
 *     responses:
 *       200:
 *         description: Текущее состояние кэша
 */
app.get('/cache/state', (req, res) => {
    res.json(cache.getCache());
});

/**
 * @swagger
 * /cache/set:
 *   get:
 *     summary: Устанавливает элемент кэша через GET-запрос
 *     parameters:
 *       - in: query
 *         name: key
 *         schema:
 *           type: string
 *         required: true
 *         description: Ключ элемента кэша
 *       - in: query
 *         name: value
 *         schema:
 *           type: string
 *         required: true
 *         description: Значение элемента кэша
 *     responses:
 *       200:
 *         description: Кэш установлен
 *       400:
 *         description: Требуются ключ и значение
 */
app.get('/cache/set', (req, res) => {
    const { key, value } = req.query;
    if (!key || !value) {
        return res.status(400).send('Ключ и значение являются обязательными');
    }
    cache.set(key, value);
    res.send(`Кэш установлен для: ${key}`);
});

/**
 * @swagger
 * /cache/delete:
 *   delete:
 *     summary: Удаляет конкретный элемент кэша
 *     parameters:
 *       - in: query
 *         name: key
 *         schema:
 *           type: string
 *         required: true
 *         description: Ключ элемента кэша для удаления
 *     responses:
 *       200:
 *         description: Кэш удален
 *       400:
 *         description: Требуется ключ
 */
app.delete('/cache/delete', (req, res) => {
    const { key } = req.query;
    if (!key) {
        return res.status(400).send('Ключ обязателен');
    }
    cache.delete(key);
    res.send(`кэш удалён для: ${key}`);
});


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.listen(PORT, () => {
    console.log(`Сервер запущен. Откройте в браузере: \x1b[36mhttp://localhost:${PORT}/\x1b[0m`);
});