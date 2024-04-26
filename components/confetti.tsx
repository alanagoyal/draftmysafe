// components/ConfettiComponent.tsx
import React, { useState } from 'react';
import Confetti from 'react-confetti';

const ConfettiComponent: React.FC = () => {
    const [isActive, setIsActive] = useState(false);

    const toggleConfetti = () => {
        setIsActive(!isActive);
    }

    return (
        <div>
            <button onClick={toggleConfetti}>Celebrate!</button>
            {isActive && <Confetti />}
        </div>
    );
}

export default ConfettiComponent;
