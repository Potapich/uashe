// src/Wheel.jsx
import React, { useRef, useEffect, useState } from 'react';
import './Wheel.css';

const Wheel = ({ choices }) => {
    const canvasRef = useRef(null);
    const [isSpinning, setIsSpinning] = useState(false);
    const [result, setResult] = useState(null);
    const [finalRotation, setFinalRotation] = useState(0); // Зберігаємо загальний кут обертання в градусах

    const colors = [
        '#FF6B6B', '#FFD166', '#06D6A0', '#118AB2', '#073B4C',
        '#F79256', '#A1C181', '#F4F1DE', '#E0A890', '#C38D9E'
    ];

    const totalChoices = choices.length;
    const arcSizeInDegrees = 360 / totalChoices;

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const wheelSize = canvas.width;

        const drawWheel = () => {
            ctx.clearRect(0, 0, wheelSize, wheelSize);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;

            choices.forEach((choice, index) => {
                // Кут у радіанах для функції arc
                // Початковий зсув -90 градусів, щоб перший сегмент починався зверху
                const startAngle = (index * arcSizeInDegrees - 90) * Math.PI / 180;
                const endAngle = ((index + 1) * arcSizeInDegrees - 90) * Math.PI / 180;
                const color = colors[index % colors.length];

                ctx.beginPath();
                ctx.fillStyle = color;
                ctx.moveTo(wheelSize / 2, wheelSize / 2);
                ctx.arc(wheelSize / 2, wheelSize / 2, wheelSize / 2, startAngle, endAngle);
                ctx.lineTo(wheelSize / 2, wheelSize / 2);
                ctx.fill();
                ctx.stroke();

                ctx.save();
                ctx.translate(wheelSize / 2, wheelSize / 2);
                const textAngle = startAngle + (endAngle - startAngle) / 2;
                ctx.rotate(textAngle);
                ctx.fillStyle = '#fff';
                ctx.font = `bold ${wheelSize > 400 ? '18px' : '14px'} Arial`;
                ctx.textAlign = 'right';
                ctx.fillText(choice, wheelSize / 2 - 30, 10);
                ctx.restore();
            });
        };

        drawWheel();

    }, [choices, colors, arcSizeInDegrees]);

    const spinWheel = () => {
        if (isSpinning || choices.length === 0) return;

        setIsSpinning(true);
        setResult(null);

        // Вибираємо випадковий індекс
        const randomIndex = Math.floor(Math.random() * choices.length);
        const selectedChoice = choices[randomIndex];

        // Кількість повних обертів для анімації (не менше 10)
        const fullSpins = 360 * 10;

        // Визначаємо кут, щоб центр обраного сегмента зупинився під стрілкою
        // Кут стрілки на 12 годині (вгорі) дорівнює -90 градусів.
        // Зміщення для вирівнювання з центром сегмента
        const rotationToAlign = -(randomIndex * arcSizeInDegrees) - (arcSizeInDegrees / 2);

        // Обчислюємо різницю між поточною позицією та бажаною позицією зупинки.
        // Ця різниця додається до загальної кількості обертань, щоб колесо
        // правильно вирівнялось з обраним сегментом.
        const rotationDifference = (rotationToAlign - finalRotation % 360 + 360) % 360;

        // Загальний кут обертання включає попередню позицію, повні оберти та
        // необхідну різницю для вирівнювання.
        const totalRotation = finalRotation + fullSpins + rotationDifference;

        const spinDuration = 3000 + Math.random() * 2000;

        const canvas = canvasRef.current;

        canvas.style.transition = `transform ${spinDuration}ms cubic-bezier(0.2, 0.8, 0.4, 1)`;
        canvas.style.transform = `rotate(${totalRotation}deg)`;

        setTimeout(() => {
            setIsSpinning(false);
            setResult(selectedChoice);

            // Зберігаємо кінцевий кут для наступного обертання
            setFinalRotation(totalRotation % 360);

            // Очищуємо transition, щоб запобігти повторному обертанню
            canvas.style.transition = 'none';
        }, spinDuration);
    };

    const wheelSize = window.innerWidth <= 600 ? 300 : 500;

    return (
        <div className="wheel-container">
            <h3>Рандомізоване колесо</h3>
            <div className="wheel-wrapper">
                <canvas
                    ref={canvasRef}
                    width={wheelSize}
                    height={wheelSize}
                    style={{ transform: `rotate(${finalRotation}deg)` }}
                ></canvas>
                <div className="wheel-pin"></div>
            </div>
            <button onClick={spinWheel} disabled={isSpinning}>
                {isSpinning ? 'Обертання...' : 'Обертати колесо'}
            </button>
            {result && (
                <div className="wheel-result">
                    <h4>Вибір: {result}</h4>
                </div>
            )}
        </div>
    );
};

export default Wheel;
