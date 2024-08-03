class InMemoryCache {
    constructor(maxSize = 2) {
        this.cache = new Map(); // Инициализация кэша
        this.maxSize = maxSize; // Максимальный размер кэша
    }

    get(key) {
        if (this.cache.has(key)) {
            const value = this.cache.get(key); // Получение значения по ключу
            this.cache.delete(key); // Удаление прошлого
            this.cache.set(key, value); // (Обновление)
            return value;
        }
        return null; // если ключ не найден
    }

    set(key, value) {
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value; // Получение первого ключа
            this.cache.delete(firstKey); // Удаление первого ключа
        }
        this.cache.set(key, value); // Установка нового ключа и значения
        console.log(`Кэш Зарезервирован для: ${key}`);
    }

    delete(key) {
        this.cache.delete(key); // Удаление ключа
        console.log(`Кэш удалён для: ${key}`);
    }

    clear() {
        console.log('Кэш очищен');
        this.cache.clear(); // Очистка кэша
    }

    resize(newSize) {
        this.maxSize = newSize; // Установка нового размера кэша
        while (this.cache.size > newSize) {
            const firstKey = this.cache.keys().next().value; // Получение первого ключа
            this.cache.delete(firstKey); // Удаление первого ключа
        }
    }


    getCache() {
        const entries = Array.from(this.cache.entries()); // Возвращение всех записей

    }
}

module.exports = InMemoryCache; // Экспорт класса