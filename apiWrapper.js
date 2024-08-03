const axios = require('axios');
const InMemoryCache = require('./cache');

const cache = new InMemoryCache();

// Получение данных с кэшированием
async function fetchWithCache(url) {
    const cachedResponse = cache.get(url); // Пытаемся получить данные из кэша
    if (cachedResponse) {
        return cachedResponse; // Если данные есть в кэше, возвращаем их
    }

    const response = await axios.get(url, { responseType: 'arraybuffer' }); // Выполняем запрос, если данных нет в кэше
    cache.set(url, response.data); // сохраняем полученные данные в кэш
    return response.data; // Возвращаем полученные данные
}

// Очистка кэша
function clearCache() {
    cache.clear();
}

// изменение размера кэша
function resizeCache(newSize) {
    cache.resize(newSize);
}

// Экспортируем функции
module.exports = {
    fetchWithCache,
    clearCache,
    resizeCache
};