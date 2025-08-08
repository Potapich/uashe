import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // <--- Імпортуємо компонент App
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App /> {/* <--- Рендеримо App, який містить усі маршрути */}
    </React.StrictMode>,
);