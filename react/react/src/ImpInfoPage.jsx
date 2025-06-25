// src/ImpInfoPage.jsx
import React, {useEffect, useState} from 'react';
import './index.css';

const API_URL = 'http://127.0.0.1:8070/getImpInfo';

function ImpInfoPage() {
    const [info, setInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchImportantInfo = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(API_URL, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                setInfo(data);
            } catch (e) {
                console.error("Failed to fetch important info:", e);
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };

        fetchImportantInfo();
    }, []);

    // Оновлена допоміжна функція для парсингу та форматування цін на пальне у вигляді таблиці
    const formatFuelPrices = (fuelArray) => {
        if (!fuelArray || fuelArray.length < 2) { // Перевірка на достатню кількість елементів
            return (
                <table className="fuel-prices-table">
                    <tbody>
                    <tr>
                        <td colSpan="2">Немає даних про пальне.</td>
                    </tr>
                    </tbody>
                </table>
            );
        }

        // 3. Дані для рядків таблиці (всі елементи, починаючи з третього)
        const pricesData = fuelArray.slice(1).toString().replace("А-92", "А-92 ");
        const pricesDataMod = pricesData.toString().replaceAll('А-95', "А-95 ");
        // Розділяємо великий рядок на окремі записи для кожного виду палива
        // Використовуємо позитивний lookahead, щоб розбити рядок перед "Бензин", "Дизельне", "Газ"
        const fuelEntries = pricesDataMod.split(/(?=Бензин|Дизельне|Газ)/).filter(Boolean); // filter(Boolean) видалить порожні рядки

        const columnHeaders = ["Вид палива", "Ціна (грн.)"];

        // Парсимо кожен запис
        const parsedData = fuelEntries.map((item, index) => {
            // Регулярний вираз для захоплення назви палива та першого числового значення
            // Наприклад: "Бензин А-95 преміум62,770.741.193%" -> "Бензин А-95 преміум" та "62,77"
            const match = item.match(/^(.*?)([0-9]+[,.][0-9]+)/);

            if (match && match.length >= 3) {
                const fuelName = match[1].trim(); // Назва палива
                const priceStr = match[2].replace(',', '.'); // Замінюємо кому на крапку для parseFloat
                const price = parseFloat(priceStr);

                if (!isNaN(price)) {
                    const formattedPrice = price.toFixed(2); // Форматуємо до двох знаків після крапки
                    return {fuelName, formattedPrice};
                }
            }
            return null; // Якщо рядок не вдалося розпарсити, повертаємо null
        }).filter(Boolean); // Видаляємо будь-які null-значення (нерозпарсовані рядки)

        if (parsedData.length === 0) {
            return <p className="info-item-line">Немає даних про пальне для відображення.</p>;
        }

        return (
            <table className="fuel-prices-table">
                {/* Назва таблиці - ви можете змінити її на більш динамічну, якщо вона надходить з іншого джерела */}
                <caption>Актуальні ціни на пальне (Станом на 23.06.2025)</caption>
                <thead>
                <tr>
                    {columnHeaders.map((header, index) => (
                        <th key={index}>{header}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {parsedData.map((data, index) => (
                    <tr key={index}>
                        <td>{data.fuelName}</td>
                        <td>{data.formattedPrice}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        );
    };

// --- ОНОВЛЕНА допоміжна функція для форматування Втрат у вигляді ТАБЛИЦІ ---
    const formatKillsContent = (killsArray) => {
        // Припускаємо, що killsArray має вигляд: ["\nТанки — 10965 (+1)ББМ — 22872 (+5)..."]
        if (!killsArray || killsArray.length === 0 || typeof killsArray[0] !== 'string') {
            return (
                <table className="kills-table">
                    <tbody>
                    <tr>
                        <td colSpan="3">Немає даних про втрати.</td>
                    </tr>
                    </tbody>
                </table>
            );
        }

        const rawKillsString = killsArray[0]; // Беремо перший (і, можливо, єдиний) рядок
        const cleanedString = rawKillsString.trim();

        // Розділяємо рядок на окремі записи
        const killEntries = cleanedString.split(/(?=Танки|ББМ|Артилерійські системи|РСЗВ|Засоби ППО|Літаки|Гелікоптери|БПЛА|Крилаті ракети|Кораблі \(катери\)|Підводні човни|Автомобілі та автоцистерни|Спеціальна техніка|Особовий склад)/)
            .filter(Boolean);

        const parsedKills = killEntries.map((entry, index) => {
            const match = entry.match(/^(.*?)\s*—\s*([0-9\s]+)\s*(\(\+[0-9]+\))?/);

            if (match) {
                let name = match[1].trim();
                const total = parseInt(match[2].replace(/\s/g, ''), 10);
                const dailyChange = match[3] ? parseInt(match[3].replace(/\(|\+|\)/g, ''), 10) : 0;

                if (name.includes('Особовий склад')) {
                    name = 'Особовий склад';
                }
                if (name.includes('Кораблі')) {
                    name = 'Кораблі (катери)';
                }

                return {
                    id: index,
                    name: name,
                    total: total,
                    dailyChange: dailyChange
                };
            }
            return null;
        }).filter(Boolean);

        if (parsedKills.length === 0) {
            return (
                <table className="kills-table">
                    <tbody>
                    <tr>
                        <td colSpan="3">Не вдалося розпарсити дані про втрати.</td>
                    </tr>
                    </tbody>
                </table>
            );
        }

        return (
            <table className="fuel-prices-table">
                <caption>Втрати ворога</caption>
                <thead>
                <tr>
                    <th>Вид втрат</th>
                    <th>Загалом</th>
                    <th>За добу</th>
                </tr>
                </thead>
                <tbody>
                {parsedKills.map((item) => (
                    <tr key={item.id}>
                        <td>{item.name}</td>
                        <td>{item.total.toLocaleString('uk-UA')}</td>
                        <td className={item.dailyChange > 0 ? 'positive-change' : ''}>
                            {item.dailyChange > 0 ? `+${item.dailyChange}` : item.dailyChange}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        );
    };
    // --- КІНЕЦЬ ОНОВЛЕНОЇ допоміжної функції для форматування Втрат ---

    //допоміжна функція для парсу А95+сума
    function addSpaceBeforePrice(inputString) {
        // Регулярний вираз:
        // (.*?)([0-9]+\.?[0-9]*)$
        // (.*?)  - захоплює назву палива (Бензин А-95)
        // ([0-9]+\.?[0-9]*) - захоплює число (58.44)
        // $ - кінець рядка
        //
        // Замінюємо знайдений шаблон на "$1 $2", де $1 - перша група (назва), $2 - друга група (ціна),
        // а між ними додаємо пробіл.
        return inputString.replace(/^(.*?)([0-9]+\.?[0-9]*)$/, '$1 $2');
    }

    if (loading) {
        return <div className="info-container loading">Завантаження важливої інформації...</div>;
    }

    if (error) {
        return <div className="info-container error">Помилка завантаження: {error}</div>;
    }

    if (!info) {
        return <div className="info-container">Дані не завантажені.</div>;
    }

    return (
        <div className="info-container">
            <h2>Важлива Інформація</h2>
            <div className="info-card">
                <p><strong>Днів з початку повномасштабного вторгнення: </strong> {info.message}</p>

                <div className="info-section">
                    <h3>Ціни на пальне:</h3>
                    <div className="info-content">
                        {/* Передаємо весь масив info.fuel, функція сама розбере, що є що */}
                        {formatFuelPrices(info.fuel)}
                    </div>
                </div>

                <div className="info-section">
                    <h3>Втрати (Кількість):</h3>
                    <div className="info-content">
                        {formatKillsContent(info.kills)}
                    </div>
                </div>

                <p><strong>Фраза:</strong> {info.fraze}</p>
                <p><strong>Автор:</strong> {info.author}</p>

                <p><strong>Відвідувачі:</strong> {info.visiters}</p>
            </div>
        </div>
    );
}

export default ImpInfoPage;