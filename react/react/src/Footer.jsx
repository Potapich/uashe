// src/Footer.jsx
import React from 'react';
import './Footer.css'; // Додаємо файл для стилів футера

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-content">
                <p>Made by Pedash M.O. &copy; {currentYear}</p>
            </div>
        </footer>
    );
};

export default Footer;