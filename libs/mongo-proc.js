const { MongoClient } = require('mongodb');
// Імпортуємо ваш конфіг напряму
const dbConfig = require('../config/config_mongo.js');

const CACHE_TTL_SECONDS = 60; // Час життя кешу для цін (1 хвилина)

// 1. Створюємо клієнт з вашого mongoURL
const client = new MongoClient(dbConfig.mongoURL);

// 2. Отримуємо інстанс БД. Ім'я 'uashe-db' буде взято з URL.
const db = client.db();

const priceCacheCollection = db.collection('price_cache'); // Нова колекція для кешування цін

async function connectToDb() {
    try {
        await client.connect();
        console.log('Successfully connected to MongoDB.');
       // await priceCacheCollection.createIndex({ "createdAt": 1 }, { expireAfterSeconds: CACHE_TTL_SECONDS });
       // console.log('TTL index for price_cache is ensured.');

        return client;
    } catch (error) {
        console.error('Connection to MongoDB failed', error);
        process.exit();
    }
}


// Експортуємо все, що потрібно для роботи застосунку
module.exports = {
    connectToDb,
    priceCacheCollection
};