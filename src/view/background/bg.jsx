import React, { useEffect } from 'react';
import './background.css';

const Background = () => {
  useEffect(() => {
    const random = (min, max) => Math.random() * (max - min) + min;

    const backgroundContainer = document.querySelector('.stars');
    const rs = getComputedStyle(document.documentElement);

    const canvasSize =
      backgroundContainer.clientWidth * backgroundContainer.clientHeight;
    const starsFraction = canvasSize / 4000;
    for (let i = 0; i < starsFraction; i++) {
      const size = Math.random() < 0.4 ? 1 : 2;

      const star = document.createElement('div');
      star.className = 'star';
      star.style.left = `${random(0, 99)}%`;
      star.style.top = `${random(0, 99)}%`;
      star.style.opacity = `${random(0.4, 1)}`;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.backgroundColor = rs.getPropertyValue('--spice-star');

      if (Math.random() < 0.2) {
        const twinkleClass = `twinkle${Math.floor(random(1, 5))}`;
        star.classList.add(twinkleClass);
        star.style.animationDelay = `${random(0, 5)}s`;
      }

      backgroundContainer.appendChild(star);

    }
  }, []);

  return (
    <div className="stars">
      <a></a>
      <a></a>
      <a></a>
      <a></a>
      <a></a>
    </div>
  );
};

export default Background;