import React from 'react';

export default function HolographicBackground() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-[#030014]" />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] animate-pulse" style={{ backgroundColor: 'var(--primary)', opacity: 0.15 }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] animate-pulse delay-1000" style={{ backgroundColor: 'var(--secondary)', opacity: 0.15 }} />
      <div className="absolute top-[20%] right-[20%] w-[20%] h-[20%] rounded-full blur-[80px] animate-pulse delay-700" style={{ backgroundColor: 'var(--primary)', opacity: 0.1 }} />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
    </div>
  );
}