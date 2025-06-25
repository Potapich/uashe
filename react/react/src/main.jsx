import React from 'react';
import ReactDOM from 'react-dom/client';
import ImpInfoPage from './ImpInfoPage.jsx'; // <--- Імпортуємо ваш компонент
import './index.css'; // Базові стилі для всього додатка

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ImpInfoPage /> {/* <--- Рендеримо ImpInfoPage як основний компонент */}
    </React.StrictMode>,
);