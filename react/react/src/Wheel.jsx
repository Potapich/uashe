// src/Wheel.jsx
import React, { useRef, useEffect, useState } from 'react';
import './Wheel.css';

const Wheel = ({ choices }) => {
    const canvasRef = useRef(null);
    const [isSpinning, setIsSpinning] = useState(false);
    const [result, setResult] = useState(null);
    const [finalAngle, setFinalAngle] = useState(0);

    const colors = [
        '#FF6B6B', '#FFD166', '#06D6A0', '#118AB2', '#073B4C',
        '#F79256', '#A1C181', '#F4F1DE', '#E0A890', '#C38D9E'
    ];

    // Move arcSize outside of useEffect to make it accessible to all functions
    const totalChoices = choices.length;
    const arcSize = (2 * Math.PI) / totalChoices;

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const drawWheel = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;

            choices.forEach((choice, index) => {
                const angle = index * arcSize;
                const color = colors[index % colors.length];

                ctx.beginPath();
                ctx.fillStyle = color;
                ctx.moveTo(250, 250);
                ctx.arc(250, 250, 250, angle, angle + arcSize);
                ctx.lineTo(250, 250);
                ctx.fill();
                ctx.stroke();

                ctx.save();
                ctx.translate(250, 250);
                ctx.rotate(angle + arcSize / 2);
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 18px Arial';
                ctx.textAlign = 'right';
                ctx.fillText(choice, 220, 10);
                ctx.restore();
            });
        };

        drawWheel();

    }, [choices, colors, arcSize]); // Add arcSize to the dependency array

    const spinWheel = () => {
        if (isSpinning) return;

        setIsSpinning(true);
        setResult(null);

        const randomIndex = Math.floor(Math.random() * choices.length);

        // This is where the error was, now arcSize is correctly defined
        const targetAngle = (randomIndex * arcSize) + (arcSize / 2);

        const spinDuration = 3000 + Math.random() * 2000;
        const spinVelocity = 360 * 10;
        const totalRotation = spinVelocity + targetAngle;

        canvasRef.current.style.transition = `transform ${spinDuration}ms cubic-bezier(0.2, 0.8, 0.4, 1)`;
        canvasRef.current.style.transform = `rotate(${totalRotation}deg)`;

        setTimeout(() => {
            setIsSpinning(false);
            setResult(choices[randomIndex]);
            setFinalAngle(totalRotation % 360);
        }, spinDuration);
    };

    return (
        <div className="wheel-container">
            <h3>Рандомізоване колесо</h3>
            <div className="wheel-wrapper">
                <canvas ref={canvasRef} width="500" height="500" style={{ transform: `rotate(${finalAngle}deg)` }}></canvas>
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