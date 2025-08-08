// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ImpInfoPage from './ImpInfoPage';
import WheelPage from './WheelPage';
import Footer from './Footer'; // Імпортуємо компонент футера

function App() {
    return (
        <Router>
            <div className="app-container"> {/* Додаємо контейнер для всього додатку */}
                <Routes>
                    <Route path="/" element={<ImpInfoPage />} />
                    <Route path="/wheel" element={<WheelPage />} />
                </Routes>
                <Footer /> {/* Рендеримо футер після маршрутів */}
            </div>
        </Router>
    );
}

export default App;