import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ImpInfoPage from './ImpInfoPage';
import WheelPage from './WheelPage'; // Припустимо, що у вас вже є цей файл

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<ImpInfoPage />} />
                <Route path="/wheel" element={<WheelPage />} />
            </Routes>
        </Router>
    );
}

export default App;