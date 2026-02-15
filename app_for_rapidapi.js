const express = require('express');
const app = express();
const PORT = process.env.PORT || 8060;

app.disable('x-powered-by');

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
        // Формуємо запит для Binance: ["BTCUSDT","ETHUSDT",...]
        const symbolsParam = JSON.stringify(TOP_10_SYMBOLS);
        const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbols=${symbolsParam}`);

        if (!response.ok) throw new Error('Binance error');

        const data = await response.json();

        res.json({
            status: 'success',
            count: data.length,
            timestamp: new Date().toISOString(),
            data: data.map(item => ({
                symbol: item.symbol,
                price: parseFloat(item.price)
            }))
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Could not fetch top 10' });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));