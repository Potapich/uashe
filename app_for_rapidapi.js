const express = require('express');
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 8060;

app.disable('x-powered-by');

app.get('/healthcheck', function (req, res) {
    res.end('healthcheck')
});

// ВСТАВ СЮДИ СВІЙ СЕКРЕТ З RAPIDAPI
const RAPIDAPI_PROXY_SECRET = '1c736080-0a79-11f1-b3ec-49468a18f1ea';

// Middleware для перевірки, що запит прийшов саме від RapidAPI
app.use((req, res, next) => {
    const secret = req.headers['x-rapidapi-proxy-secret'];
    if (secret !== RAPIDAPI_PROXY_SECRET) {
        return res.status(403).json({ error: 'Access denied. Use RapidAPI Hub.' });
    }
    next();
});

// Наш список ТОП-10 (можна змінювати за бажанням)
const TOP_10_SYMBOLS = [
    "BTCUSDT", "ETHUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT",
    "SOLUSDT", "DOTUSDT", "DOGEUSDT", "TRXUSDT", "LINKUSDT"
];

// 1. Отримання ціни конкретної монети (твій попередній роут)
app.get('/api/v1/crypto/price', async (req, res) => {
    try {
        const symbol = req.query.symbol || 'BTCUSDT';
        const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol.toUpperCase()}`);

        if (!response.ok) throw new Error('Binance error');

        const data = await response.json();
        res.json({ status: 'success', data });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error fetching price' });
    }
});

// 2. Новий ендпоінт для ТОП-10
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

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));