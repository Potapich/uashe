// src/WheelPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Wheel from './Wheel';
import './WheelPage.css';

const WheelPage = () => {
    const [choices, setChoices] = useState([
        "Вибір 1", "Вибір 2", "Вибір 3", "Вибір 4", "Вибір 5"
    ]);
    const [inputValue, setInputValue] = useState('');

    const handleAddChoice = () => {
        if (inputValue.trim() !== '') {
            setChoices([...choices, inputValue.trim()]);
            setInputValue('');
        }
    };

    const handleRemoveChoice = (indexToRemove) => {
        setChoices(choices.filter((_, index) => index !== indexToRemove));
    };

    return (
        <div className="wheel-page-container">
            <Link to="/" className="back-button">
                &larr; Повернутися
            </Link>

            <div className="wheel-page-content">
                <div className="wheel-controls">
                    <h3>Налаштування колеса</h3>
                    <div className="input-group">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleAddChoice();
                                }
                            }}
                            placeholder="Додати новий варіант..."
                        />
                        <button onClick={handleAddChoice}>Додати</button>
                    </div>
                    <ul className="choices-list">
                        {choices.map((choice, index) => (
                            <li key={index}>
                                {choice}
                                <button onClick={() => handleRemoveChoice(index)} className="remove-button">&times;</button>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="wheel-display">
                    <Wheel choices={choices} />
                </div>
            </div>
        </div>
    );
};

export default WheelPage;