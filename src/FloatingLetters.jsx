import { useState, useEffect } from 'react';

// --- CONFIGURATION ---
// 1. Add your letter images to the `public/assets/letters/` folder.
// 2. Define each letter in this array.
const lettersConfig = [
  // Example letters (replace with your image paths)
  { id: 'd', src: '/D.svg', size: 270, initialPos: { left: '25%' }, animation: 'floatUp 12s -2s ease-in-out infinite', opacity: 0.08 },
  { id: 'a', src: '/A.svg', size: 270, initialPos: { left: '35%' }, animation: 'floatDown 15s 0s ease-in-out infinite', opacity: 0.05 },
  { id: 'n', src: '/N1.svg', size: 270,  initialPos: { left: '45%' }, animation: 'floatUp 10s -5s ease-in-out infinite', opacity: 0.07 },
  { id: 'y', src: '/N2.svg', size: 270, initialPos: { left: '55%' }, animation: 'floatDown 18s -10s ease-in-out infinite', opacity: 0.06 },
  { id: 'i', src: '/Y.svg', size: 270,  initialPos: { left: '65%' }, animation: 'floatUp 13s -8s ease-in-out infinite', opacity: 0.08 },
  // Add more letters as needed
];

function FloatingLetters() {
  const [parallaxStyle, setParallaxStyle] = useState({});

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Get mouse position relative to the center of the screen
      const { clientX, clientY } = e;
      const moveX = (clientX - window.innerWidth / 2) * -0.002; // Invert and reduce the effect
      const moveY = (clientY - window.innerHeight / 2) * -0.002;

      setParallaxStyle({
        transform: `translate(${moveX}px, ${moveY}px)`,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className="floating-letters-container" style={parallaxStyle}>
      {lettersConfig.map((letter) => (
        <img
          key={letter.id}
          src={letter.src}
          alt={`Floating letter ${letter.id}`}
          className="floating-letter"
          style={{
            ...letter.initialPos,
            animation: letter.animation,
            opacity: letter.opacity,
          }}
        />
      ))}
    </div>
  );
}

export default FloatingLetters;