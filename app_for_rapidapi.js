const express = require('express');
const cors = require("cors");
const { connectToDb, priceCacheCollection } = require('./libs/mongo-proc.js');

const app = express();
const PORT = process.env.PORT || 8060;

app.disable('x-powered-by');
// ------------------------------------

app.get('/healthcheck', function (req, res) {
    res.end('healthcheck')
});

const RAPIDAPI_PROXY_SECRET = '1c736080-0a79-11f1-b3ec-49468a18f1ea';

app.use((req, res, next) => {
    const secret = req.headers['x-rapidapi-proxy-secret'];
    if (secret !== RAPIDAPI_PROXY_SECRET) {
        return res.status(403).json({ error: 'Access denied. Use RapidAPI Hub.' });
    }
    next();
});

const TOP_10_SYMBOLS = [
    "BTCUSDT", "ETHUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT",
    "SOLUSDT", "DOTUSDT", "DOGEUSDT", "TRXUSDT", "LINKUSDT"
];

// Функції для отримання даних з різних джерел (залишаються без змін)
async function getBinancePrice(symbol) {
    try {
        const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol.toUpperCase()}`);
        if (!response.ok) return null;
        const data = await response.json();
        return { source: 'Binance', price: parseFloat(data.price) };
    } catch (error) {
        return null;
    }
}

async function getKucoinPrice(symbol) {
    const kucoinSymbol = symbol.replace('USDT', '-USDT');
    try {
        const response = await fetch(`https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=${kucoinSymbol.toUpperCase()}`);
        if (!response.ok) return null;
        const data = await response.json();
        if (data.code !== '200000' || !data.data.price) return null;
        return { source: 'KuCoin', price: parseFloat(data.data.price) };
    } catch (error) {
        return null;
    }
}

// ----------------------------------------------------

// Ендпоінт для отримання ціни (логіка залишається та ж, але використовує priceCacheCollection)
app.get('/api/v1/crypto/price', async (req, res) => {
    const symbol = (req.query.symbol || 'BTCUSDT').toUpperCase();

    try {
        // 1. Шукаємо свіжий кеш в MongoDB
        const cachedData = await priceCacheCollection.findOne({ symbol });
        if (cachedData) {
            return res.json({ status: 'success', source: 'cache', data: cachedData.data });
        }

        // 2. Якщо в кеші немає, отримуємо дані з API
        const promises = [getBinancePrice(symbol), getKucoinPrice(symbol)];
        const results = await Promise.all(promises);
        const validResults = results.filter(r => r !== null && r.price > 0);

        if (validResults.length === 0) {
            return res.status(502).json({ status: 'error', message: 'All external APIs failed.' });
        }

        const total = validResults.reduce((sum, result) => sum + result.price, 0);
        const averagePrice = total / validResults.length;

        const responseData = {
            symbol,
            aggregatedPrice: parseFloat(averagePrice.toFixed(4)),
            sources: validResults,
            timestamp: new Date().toISOString(),
        };

        // 3. Зберігаємо результат в кеш
        await priceCacheCollection.insertOne({
            symbol,
            data: responseData,
            createdAt: new Date() // Поле для TTL індексу
        });

        res.json({ status: 'success', source: 'live', data: responseData });

    } catch (error) {
        console.error('Error in /price endpoint:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});



// 2. Новий ендпоінт для ТОП-10 (залишаємо без змін)
app.get('/api/v1/crypto/top', async (req, res) => {
    try {
        const symbolsParam = JSON.stringify(TOP_10_SYMBOLS);
        const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=${symbolsParam}`);

        if (!response.ok) throw new Error('Binance error');

        const data = await response.json();

        // Формуємо професійну відповідь
        const result = {
            success: true,
            base_currency: "USDT",
            timestamp: new Date().toISOString(),
            market_data: data.map(item => ({
                symbol: item.symbol.replace('USDT', ''),
                full_symbol: item.symbol,
                price: parseFloat(item.lastPrice),
                price_change_percent_24h: parseFloat(item.priceChangePercent),
                high_24h: parseFloat(item.highPrice),
                low_24h: parseFloat(item.lowPrice),
                volume_24h: parseFloat(item.volume)
            }))
        };

        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Could not fetch market data' });
    }
});

// Запускаємо сервер тільки після підключення до БД, використовуючи вашу функцію
connectToDb().then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
