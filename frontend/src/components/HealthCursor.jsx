import React, { useEffect, useRef } from 'react';

const HealthCursor = () => {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      // Dot follows instantly
      dot.style.left = `${mouseX}px`;
      dot.style.top = `${mouseY}px`;
    };

    const handleMouseDown = () => {
      dot.style.backgroundColor = '#FF3B30';
      ring.style.borderColor = '#FF3B30';
    };

    const handleMouseUp = () => {
      dot.style.backgroundColor = '#00D9FF';
      ring.style.borderColor = '#00D9FF';
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      const isInteractive = target.matches('a, button, input, textarea, select, [role="button"]') ||
                           target.closest('a, button, [role="button"]');
      ring.style.width = isInteractive ? '48px' : '32px';
      ring.style.height = isInteractive ? '48px' : '32px';
      ring.style.borderWidth = isInteractive ? '2px' : '1px';
    };

    // Smooth ring follow with RAF
    const animate = () => {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      ring.style.left = `${ringX}px`;
      ring.style.top = `${ringY}px`;
      requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseover', handleMouseOver);
    requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] hidden md:block">
      <div
        ref={ringRef}
        className="absolute rounded-full -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 32,
          height: 32,
          border: '1px solid #00D9FF',
          opacity: 0.6,
          willChange: 'left, top',
        }}
      />
      <div
        ref={dotRef}
        className="absolute rounded-full -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 4,
          height: 4,
          backgroundColor: '#00D9FF',
          willChange: 'left, top',
        }}
      />
    </div>
  );
};

export default HealthCursor;
