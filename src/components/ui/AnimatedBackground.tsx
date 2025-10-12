import React, { useRef, useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';

const AnimatedBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme(); // Using theme to trigger redraw on change

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: any[] = [];
    
    // Read the primary color directly from the CSS variables.
    // This gives us the HSL components like '210 40% 98%'.
    const primaryColorHsl = getComputedStyle(document.documentElement)
      .getPropertyValue('--primary')
      .trim();

    // This function sets up the canvas dimensions and generates the particles.
    const setup = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = [];
      
      // Adjust particle density based on screen size for a consistent look.
      const particleCount = Math.floor((canvas.width * canvas.height) / 20000); 
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.5 + 0.5, // Small radius for subtlety
          vx: (Math.random() - 0.5) * 0.2, // Slow velocity
          vy: (Math.random() - 0.5) * 0.2, // Slow velocity
        });
      }
    };

    // The main animation loop.
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Use the theme's primary color with low opacity for the particles.
      ctx.fillStyle = `hsla(${primaryColorHsl}, 0.5)`;

      particles.forEach(p => {
        // Update particle position.
        p.x += p.vx;
        p.y += p.vy;

        // Implement a wrap-around effect for seamless looping.
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Draw the particle.
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      setup();
    };

    // Initial setup and start the animation.
    setup();
    animate();

    window.addEventListener('resize', handleResize);

    // Cleanup function to stop the animation and remove the listener.
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]); // We re-run this effect if the theme changes.

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full z-[-1] opacity-60"
    />
  );
};

export default AnimatedBackground;
