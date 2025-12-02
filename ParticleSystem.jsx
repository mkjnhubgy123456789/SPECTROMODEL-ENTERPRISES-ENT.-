import React, { useMemo } from "react";

const ParticleSystem = () => {
  const particles = useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => {
      const size = Math.random() * 4 + 2 + "px";
      const left = Math.random() * 100 + "%";
      const duration = Math.random() * 10 + 10 + "s";
      const delay = Math.random() * 5 + "s";
      // Randomize vibrant colors
      const colors = ["#06B6D4", "#A855F7", "#F59E0B", "#10B981"];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      return (
        <div
          key={i}
          className="particle"
          style={{
            width: size,
            height: size,
            left: left,
            backgroundColor: color,
            "--duration": duration,
            "--delay": delay,
            boxShadow: `0 0 10px ${color}`
          }}
        />
      );
    });
  }, []);

  return <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">{particles}</div>;
};

export default ParticleSystem;