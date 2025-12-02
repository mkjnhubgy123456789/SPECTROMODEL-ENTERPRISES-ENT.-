/**
 * GLOBAL STYLES - Dynamic Theme Support
 * Ensures theme colors work across all devices
 * Replaces purple with selected theme color throughout the app
 */

import { useEffect, useState } from 'react';

export default function GlobalStyles() {
  const [theme, setTheme] = useState('purple');

  useEffect(() => {
    const savedTheme = localStorage.getItem('spectromodel_theme') || 'purple';
    setTheme(savedTheme);
    
    // Listen for storage changes (theme updates)
    const handleStorageChange = (e) => {
      if (e.key === 'spectromodel_theme') {
        setTheme(e.newValue || 'purple');
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const themeColors = {
    purple: {
      primary: '#a855f7',
      primaryDark: '#7c3aed',
      secondary: '#3b82f6',
      gradient: 'linear-gradient(135deg, rgb(88, 28, 135) 0%, rgb(109, 40, 217) 50%, rgb(88, 28, 135) 100%)',
      buttonGradient: 'linear-gradient(135deg, rgb(168, 85, 247) 0%, rgb(124, 58, 237) 100%)'
    },
    blue: {
      primary: '#3b82f6',
      primaryDark: '#2563eb',
      secondary: '#06b6d4',
      gradient: 'linear-gradient(135deg, rgb(30, 64, 175) 0%, rgb(59, 130, 246) 50%, rgb(30, 64, 175) 100%)',
      buttonGradient: 'linear-gradient(135deg, rgb(59, 130, 246) 0%, rgb(37, 99, 235) 100%)'
    },
    green: {
      primary: '#10b981',
      primaryDark: '#059669',
      secondary: '#14b8a6',
      gradient: 'linear-gradient(135deg, rgb(6, 78, 59) 0%, rgb(16, 185, 129) 50%, rgb(6, 78, 59) 100%)',
      buttonGradient: 'linear-gradient(135deg, rgb(16, 185, 129) 0%, rgb(5, 150, 105) 100%)'
    },
    orange: {
      primary: '#f97316',
      primaryDark: '#ea580c',
      secondary: '#fb923c',
      gradient: 'linear-gradient(135deg, rgb(124, 45, 18) 0%, rgb(249, 115, 22) 50%, rgb(124, 45, 18) 100%)',
      buttonGradient: 'linear-gradient(135deg, rgb(249, 115, 22) 0%, rgb(234, 88, 12) 100%)'
    },
    red: {
      primary: '#ef4444',
      primaryDark: '#dc2626',
      secondary: '#f97316',
      gradient: 'linear-gradient(135deg, rgb(127, 29, 29) 0%, rgb(239, 68, 68) 50%, rgb(127, 29, 29) 100%)',
      buttonGradient: 'linear-gradient(135deg, rgb(239, 68, 68) 0%, rgb(220, 38, 38) 100%)'
    },
    pink: {
      primary: '#ec4899',
      primaryDark: '#db2777',
      secondary: '#f472b6',
      gradient: 'linear-gradient(135deg, rgb(131, 24, 67) 0%, rgb(236, 72, 153) 50%, rgb(131, 24, 67) 100%)',
      buttonGradient: 'linear-gradient(135deg, rgb(236, 72, 153) 0%, rgb(219, 39, 119) 100%)'
    },
    gold: {
      primary: '#eab308',
      primaryDark: '#ca8a04',
      secondary: '#f59e0b',
      gradient: 'linear-gradient(135deg, rgb(113, 63, 18) 0%, rgb(234, 179, 8) 50%, rgb(113, 63, 18) 100%)',
      buttonGradient: 'linear-gradient(135deg, rgb(234, 179, 8) 0%, rgb(202, 138, 4) 100%)'
    },
    silver: {
      primary: '#94a3b8',
      primaryDark: '#64748b',
      secondary: '#cbd5e1',
      gradient: 'linear-gradient(135deg, rgb(51, 65, 85) 0%, rgb(148, 163, 184) 50%, rgb(51, 65, 85) 100%)',
      buttonGradient: 'linear-gradient(135deg, rgb(148, 163, 184) 0%, rgb(100, 116, 139) 100%)'
    },
    black: {
      primary: '#3f3f46',
      primaryDark: '#27272a',
      secondary: '#52525b',
      gradient: 'linear-gradient(135deg, rgb(9, 9, 11) 0%, rgb(39, 39, 42) 50%, rgb(9, 9, 11) 100%)',
      buttonGradient: 'linear-gradient(135deg, rgb(63, 63, 70) 0%, rgb(39, 39, 42) 100%)'
    },
    white: {
      primary: '#000000',
      primaryDark: '#1a1a1a',
      secondary: '#e2e8f0',
      gradient: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 50%, #ffffff 100%)',
      buttonGradient: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)'
    },
    brown: {
      primary: '#b45309',
      primaryDark: '#92400e',
      secondary: '#d97706',
      gradient: 'linear-gradient(135deg, rgb(69, 26, 3) 0%, rgb(180, 83, 9) 50%, rgb(69, 26, 3) 100%)',
      buttonGradient: 'linear-gradient(135deg, rgb(180, 83, 9) 0%, rgb(146, 64, 14) 100%)'
    },
    yellow: {
      primary: '#facc15',
      primaryDark: '#eab308',
      secondary: '#fbbf24',
      gradient: 'linear-gradient(135deg, rgb(113, 63, 18) 0%, rgb(250, 204, 21) 50%, rgb(113, 63, 18) 100%)',
      buttonGradient: 'linear-gradient(135deg, rgb(250, 204, 21) 0%, rgb(234, 179, 8) 100%)'
    }
  };

  const colors = themeColors[theme] || themeColors.purple;

  // CSS color replacements based on theme
  const colorReplacements = {
    purple: {
      // Purple stays purple
      purpleReplace: 'purple',
      violetReplace: 'violet',
      indigoReplace: 'indigo'
    },
    blue: {
      // Blue replaces purple
      purpleReplace: 'blue',
      violetReplace: 'sky',
      indigoReplace: 'cyan'
    },
    green: {
      // Green replaces purple
      purpleReplace: 'emerald',
      violetReplace: 'green',
      indigoReplace: 'teal'
    },
    orange: {
      // Orange replaces purple
      purpleReplace: 'orange',
      violetReplace: 'amber',
      indigoReplace: 'yellow'
    },
    red: {
      // Red replaces purple
      purpleReplace: 'red',
      violetReplace: 'rose',
      indigoReplace: 'pink'
    }
  };

  const replacements = colorReplacements[theme] || colorReplacements.purple;

  return (
    <>
      <meta name="color-scheme" content="dark" />
      <meta name="theme-color" content="#0f172a" />
      <style>{`
        /* --- SPECTROMODEL FLAMBOYANT STYLES --- */
        .bg-cyber-grid {
          background-size: 50px 50px;
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          mask-image: radial-gradient(ellipse at center, black 40%, transparent 80%);
          -webkit-mask-image: radial-gradient(ellipse at center, black 40%, transparent 80%);
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          z-index: 0;
          opacity: 0.6;
          animation: float-orb 10s ease-in-out infinite;
        }

        @keyframes float-orb {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(30px, -50px); }
          66% { transform: translate(-20px, 20px); }
        }

        .particle {
          position: absolute;
          border-radius: 50%;
          opacity: 0;
          animation: shimmer-rise var(--duration) ease-in-out infinite;
          animation-delay: var(--delay);
          bottom: -20px;
        }
        
        @keyframes shimmer-rise {
          0% { transform: translateY(0) scale(0); opacity: 0; }
          20% { opacity: 0.8; }
          50% { opacity: 0.4; }
          80% { opacity: 0.8; }
          100% { transform: translateY(-120vh) scale(1.5); opacity: 0; }
        }

        .spectro-title {
          background-image: linear-gradient(
            -45deg,
            #FFD700, /* Gold */
            #F59E0B, /* Amber */
            #06B6D4, /* Cyan */
            #10B981, /* Emerald */
            #3B82F6, /* Blue */
            #D946EF, /* Fuchsia */
            #FFD700  /* Loop */
          );
          background-size: 300% 300%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: spectral-flow 2s linear infinite;
          filter: drop-shadow(0 0 30px rgba(250, 204, 21, 0.3));
        }
        
        @keyframes spectral-flow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .glass-panel {
          background: rgba(10, 10, 15, 0.6);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
        }

        .card-flamboyant {
          background: rgba(10, 10, 15, 0.6);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          position: relative;
          overflow: hidden;
        }
        
        .card-flamboyant:hover {
          transform: translateY(-10px) rotateX(2deg) rotateY(2deg) scale(1.02);
          box-shadow: 0 20px 50px -10px rgba(6, 182, 212, 0.3);
          border-color: rgba(6, 182, 212, 0.5);
          background: rgba(15, 15, 25, 0.8);
        }

        .card-flamboyant::before {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent);
          transform: skewX(-25deg);
          transition: 0s;
          z-index: 10;
          pointer-events: none;
        }
        
        .card-flamboyant:hover::before {
          left: 150%;
          transition: 0.7s ease-in-out;
        }

        .btn-flamboyant {
          background: linear-gradient(90deg, #06B6D4, #3B82F6, #8B5CF6, #F59E0B, #06B6D4);
          background-size: 300% 300%;
          animation: gradient-shift 3s ease infinite, pulse-neon 2s infinite;
          position: relative;
          z-index: 1;
          border: none;
        }
        
        .btn-flamboyant:hover {
          transform: scale(1.05);
          animation: gradient-shift 1s ease infinite, pulse-neon-fast 1s infinite;
        }

        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes pulse-neon {
          0% { box-shadow: 0 0 10px rgba(6,182,212,0.5); }
          50% { box-shadow: 0 0 25px rgba(6,182,212,0.8), 0 0 5px rgba(255,255,255,0.5); }
          100% { box-shadow: 0 0 10px rgba(6,182,212,0.5); }
        }

        @keyframes pulse-neon-fast {
          0% { box-shadow: 0 0 15px rgba(6,182,212,0.6); }
          50% { box-shadow: 0 0 35px rgba(6,182,212,1), 0 0 10px rgba(255,255,255,0.8); }
          100% { box-shadow: 0 0 15px rgba(6,182,212,0.6); }
        }

        .icon-flamboyant {
          animation: icon-glow-pulse 3s infinite ease-in-out;
        }
        @keyframes icon-glow-pulse {
          0%, 100% { filter: drop-shadow(0 0 15px rgba(250,204,21,0.4)); transform: scale(1); }
          50% { filter: drop-shadow(0 0 40px rgba(6,182,212,0.8)) drop-shadow(0 0 15px rgba(249,115,22,0.6)); transform: scale(1.05); }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        
        .animate-pulse-slow {
          animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        /* COLOR SPACE NORMALIZATION FOR CROSS-DEVICE CONSISTENCY */
        @media (color-gamut: srgb) {
          :root {
            color-profile: sRGB;
          }
        }
        
        /* Force sRGB color space on all devices */
        * {
          color-adjust: exact;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        /* Z-INDEX HIERARCHY - FIXED */
        .z-base { z-index: 1; }
        .z-cards { z-index: 5; }
        .z-dropdown { z-index: 50; }
        .z-modal { z-index: 100; }
        .z-sidebar { z-index: 500; }
        .z-navigation { z-index: 1000; }
        .z-ai-assistant { z-index: 9999; }
        .z-toast { z-index: 10000; }

        /* LANDSCAPE ORIENTATION FIXES */
        @media (orientation: landscape) and (max-width: 1024px) {
          header {
            padding-left: 2.5rem !important;
          }
          main {
            padding-left: 2rem !important;
          }
          .avatar-container {
            height: 60vh !important;
            min-height: 60vh !important;
          }
        }

        /* RESET & BASE */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          word-wrap: break-word;
          overflow-wrap: break-word;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }

        html, body {
          overflow-x: hidden;
          max-width: 100vw;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          background: #030014; /* Force Dark Holographic Base */
          /* background: ${colors.gradient}; REMOVED per user request to keep holographic bg */
          color: rgb(226, 232, 240);
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          -webkit-text-size-adjust: 100%;
          -ms-text-size-adjust: 100%;
          touch-action: manipulation;
          /* Mobile Optimization */
          padding-left: env(safe-area-inset-left);
          padding-right: env(safe-area-inset-right);
          padding-bottom: env(safe-area-inset-bottom);
        }
        
        /* Ensure inputs don't zoom on mobile */
        @media screen and (max-width: 768px) {
          input, select, textarea {
            font-size: 16px !important;
          }
        }

        /* TEXT TRUNCATION */
        .truncate {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .break-words {
          word-wrap: break-word;
          overflow-wrap: break-word;
          word-break: break-word;
        }

        /* COLORS - Dynamic Theme */
        :root {
          --primary: ${colors.primary};
          --primary-dark: ${colors.primaryDark};
          --secondary: ${colors.secondary};
          --success: rgb(16, 185, 129);
          --warning: rgb(245, 158, 11);
          --danger: rgb(239, 68, 68);
          --bg-dark: rgb(15, 23, 42);
          --bg-card: rgba(30, 41, 59, 0.8);
          --border: rgba(148, 163, 184, 0.3);
          --text-primary: rgb(255, 255, 255);
          --text-secondary: rgb(203, 213, 225);
          --text-muted: rgb(148, 163, 184);
        }

        /* CONTAINERS */
        .container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        /* CARDS */
        .card {
          background: var(--bg-card);
          backdrop-filter: blur(12px);
          border: 1px solid var(--border);
          border-radius: 1rem;
          padding: 1.5rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
          transition: all 0.3s ease;
          z-index: 5;
        }

        .card:hover {
          border-color: var(--primary);
          box-shadow: 0 15px 35px ${colors.primary}66;
          transform: translateY(-2px);
        }

        .card-header {
          margin-bottom: 1rem;
          border-bottom: 1px solid var(--border);
          padding-bottom: 1rem;
        }

        .card-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .card-content {
          color: var(--text-secondary);
        }

        /* BOLD TEXT GLOBALLY & VISIBILITY */
        * {
          font-weight: bold !important;
          text-shadow: none !important;
        }

        /* FORCE VISIBILITY & BOLDNESS & LARGER TEXT */
        body, p, h1, h2, h3, h4, h5, h6, span, div, a, button, input, textarea, label, li, ul, ol {
          font-weight: 700 !important;
          opacity: 1 !important;
          visibility: visible !important;
          text-shadow: none;
        }

        /* TEXT SHADOW FOR WHITE TEXT ON DARK BACKGROUNDS */
        .text-white, .text-slate-50, .text-slate-100, .text-slate-200 {
          text-shadow: 0px 1px 3px rgba(0,0,0,0.9) !important;
        }

        /* HIGHER CONTRAST FOR GRAY TEXT */
        .text-slate-300, .text-slate-400, .text-slate-500, .text-gray-300, .text-gray-400, .text-gray-500 {
          color: #e2e8f0 !important; /* slate-200 */
          text-shadow: 0px 1px 2px rgba(0,0,0,0.8) !important;
        }

        /* INCREASE FONT SIZES FOR HEADINGS & DESCRIPTIONS */
        h1, .text-3xl, .text-4xl, .text-2xl {
          letter-spacing: -0.02em;
        }
        
        /* Font size bump removed per user request */

        /* PLACEHOLDERS VISIBILITY */
        input::placeholder, textarea::placeholder {
          color: #cbd5e1 !important; /* slate-300 */
          opacity: 1 !important;
          font-weight: bold !important;
        }

        /* BUTTONS */
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 0.5rem;
          font-weight: bold !important;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          z-index: 9999;
          opacity: 1 !important; /* Ensure visible */
        }
        
        /* Fix button text visibility on hover */
        button:hover, a:hover, [role="button"]:hover {
          opacity: 1 !important;
          visibility: visible !important;
        }
        
        button span, button p, button div, a span, a p, a div {
          visibility: visible !important;
          opacity: 1 !important;
        }

        /* Ensure text is visible before clicking/hovering */
        .btn, button {
          opacity: 1 !important;
          visibility: visible !important;
        }

        /* FORCE VISIBILITY FOR GRAY TEXT */
        .text-slate-400, .text-slate-500, .text-gray-400, .text-gray-500 {
          color: #cbd5e1 !important; /* slate-300 */
          opacity: 1 !important;
          font-weight: bold !important;
        }

        .btn-primary, .vibrant-nav-button {
          background: ${colors.buttonGradient};
          color: rgb(255, 255, 255);
          box-shadow: 0 10px 25px ${colors.primary}66;
        }

        .btn-primary:hover, .vibrant-nav-button:hover {
          background: ${colors.buttonGradient};
          box-shadow: 0 15px 35px ${colors.primary}99;
          transform: translateY(-2px);
        }

        .btn-secondary {
          background: ${colors.secondary}33;
          color: ${colors.secondary};
          border: 1px solid ${colors.secondary}80;
        }

        .btn-secondary:hover {
          background: ${colors.secondary}4d;
          border-color: ${colors.secondary};
        }

        .btn-danger {
          background: rgba(239, 68, 68, 0.2);
          color: rgb(252, 165, 165);
          border: 1px solid rgba(239, 68, 68, 0.5);
        }

        .btn-danger:hover {
          background: rgba(239, 68, 68, 0.3);
          border-color: rgb(239, 68, 68);
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* INPUTS */
        .input {
          width: 100%;
          padding: 0.75rem 1rem;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          color: var(--text-primary);
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px ${colors.primary}33;
        }

        .input::placeholder {
          color: var(--text-muted);
        }

        .textarea {
          width: 100%;
          min-height: 120px;
          padding: 0.75rem 1rem;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          color: var(--text-primary);
          font-size: 1rem;
          font-family: inherit;
          resize: vertical;
          transition: all 0.3s ease;
        }

        .textarea:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px ${colors.primary}33;
        }

        /* BADGES */
        .badge {
          display: inline-flex;
          align-items: center;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 900 !important;
          background-color: #000000 !important;
          color: #ffffff !important;
          border: 1px solid #333333 !important;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .badge-primary {
          background: ${colors.primary}33;
          color: ${colors.primary};
          border: 1px solid ${colors.primary}4d;
        }

        .badge-success {
          background: rgba(16, 185, 129, 0.2);
          color: rgb(110, 231, 183);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .badge-warning {
          background: rgba(245, 158, 11, 0.2);
          color: rgb(252, 211, 77);
          border: 1px solid rgba(245, 158, 11, 0.3);
        }

        .badge-danger {
          background: rgba(239, 68, 68, 0.2);
          color: rgb(252, 165, 165);
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        /* ALERTS */
        .alert {
          padding: 1rem;
          border-radius: 0.5rem;
          border: 1px solid;
          margin-bottom: 1rem;
        }

        .alert-info {
          background: rgba(59, 130, 246, 0.1);
          border-color: rgba(59, 130, 246, 0.3);
          color: rgb(147, 197, 253);
        }

        .alert-success {
          background: rgba(16, 185, 129, 0.1);
          border-color: rgba(16, 185, 129, 0.3);
          color: rgb(110, 231, 183);
        }

        .alert-warning {
          background: rgba(245, 158, 11, 0.1);
          border-color: rgba(245, 158, 11, 0.3);
          color: rgb(252, 211, 77);
        }

        .alert-danger {
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.3);
          color: rgb(252, 165, 165);
        }

        /* PROGRESS BAR */
        .progress {
          width: 100%;
          height: 0.5rem;
          background: rgba(51, 65, 85, 0.5);
          border-radius: 9999px;
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          background: ${colors.buttonGradient};
          transition: width 0.3s ease;
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }

        /* GRID */
        .grid {
          display: grid;
          gap: 1.5rem;
        }

        .grid-cols-1 { grid-template-columns: repeat(1, 1fr); }
        .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
        .grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
        .grid-cols-4 { grid-template-columns: repeat(4, 1fr); }

        @media (max-width: 768px) {
          .grid-cols-2, .grid-cols-3, .grid-cols-4 {
            grid-template-columns: repeat(1, 1fr);
          }
        }

        @media (min-width: 768px) {
          .md\\:grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
          .md\\:grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
        }

        @media (min-width: 1024px) {
          .lg\\:grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
          .lg\\:grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
        }

        /* FLEX */
        .flex { display: flex; }
        .flex-col { flex-direction: column; }
        .items-center { align-items: center; }
        .justify-center { justify-content: center; }
        .justify-between { justify-content: space-between; }
        .gap-2 { gap: 0.5rem; }
        .gap-3 { gap: 0.75rem; }
        .gap-4 { gap: 1rem; }
        .gap-6 { gap: 1.5rem; }
        .gap-8 { gap: 2rem; }

        /* SPACING */
        .p-2 { padding: 0.5rem; }
        .p-3 { padding: 0.75rem; }
        .p-4 { padding: 1rem; }
        .p-6 { padding: 1.5rem; }
        .p-8 { padding: 2rem; }

        .m-2 { margin: 0.5rem; }
        .m-4 { margin: 1rem; }
        .m-6 { margin: 1.5rem; }

        .mb-2 { margin-bottom: 0.5rem; }
        .mb-3 { margin-bottom: 0.75rem; }
        .mb-4 { margin-bottom: 1rem; }
        .mb-6 { margin-bottom: 1.5rem; }
        .mb-8 { margin-bottom: 2rem; }

        .mt-2 { margin-top: 0.5rem; }
        .mt-4 { margin-top: 1rem; }
        .mt-6 { margin-top: 1.5rem; }

        /* TEXT */
        .text-center { text-align: center; }
        .text-left { text-align: left; }
        .text-right { text-align: right; }

        .text-xs { font-size: 0.75rem; }
        .text-sm { font-size: 0.875rem; }
        .text-base { font-size: 1rem; }
        .text-lg { font-size: 1.125rem; }
        .text-xl { font-size: 1.25rem; }
        .text-2xl { font-size: 1.5rem; }
        .text-3xl { font-size: 1.875rem; }
        .text-4xl { font-size: 2.25rem; }
        .text-5xl { font-size: 3rem; }

        .font-bold { font-weight: 700; }
        .font-semibold { font-weight: 600; }
        .font-black { font-weight: 900; }

        .text-white { color: rgb(255, 255, 255); }
        .text-primary { color: var(--primary); }
        .text-secondary { color: var(--text-secondary); }
        .text-muted { color: var(--text-muted); }
        .text-success { color: var(--success); }
        .text-warning { color: var(--warning); }
        .text-danger { color: var(--danger); }

        /* GRADIENTS */
        .gradient-text {
          background: ${colors.buttonGradient};
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .gradient-bg {
          background: ${colors.buttonGradient};
        }

        /* ANIMATIONS */
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        .animate-spin { animation: spin 1s linear infinite; }

        /* SHADOWS */
        .shadow-sm { box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); }
        .shadow { box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .shadow-lg { box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3); }
        .shadow-xl { box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4); }

        /* BORDERS */
        .border { border: 1px solid var(--border); }
        .border-2 { border: 2px solid var(--border); }
        .rounded { border-radius: 0.25rem; }
        .rounded-lg { border-radius: 0.5rem; }
        .rounded-xl { border-radius: 1rem; }
        .rounded-full { border-radius: 9999px; }

        /* UTILITIES */
        .min-h-screen { min-height: 100vh; }
        .w-full { width: 100%; }
        .h-full { height: 100%; }
        .max-w-4xl { max-width: 56rem; }
        .max-w-7xl { max-width: 80rem; }
        .mx-auto { margin-left: auto; margin-right: auto; }

        .hidden { display: none; }
        .block { display: block; }
        .inline-block { display: inline-block; }

        .cursor-pointer { cursor: pointer; }
        .cursor-not-allowed { cursor: not-allowed; }

        /* RESPONSIVE & DEVICE OPTIMIZATION */
        @media (max-width: 768px) {
          .md\\:hidden { display: none; }
          .md\\:text-xl { font-size: 1.25rem; }
          .md\\:p-6 { padding: 1.5rem; }
          
          /* Mobile Touch Targets */
          button, .btn, input, select, .slider-root {
            min-height: 44px; /* Apple Human Interface Guidelines */
            touch-action: manipulation;
          }
          
          /* Prevent horizontal scroll on mobile */
          body, main, .container {
            overflow-x: hidden;
            width: 100%;
          }
        }

        /* LANDSCAPE / ROTATION FIXES */
        @media (orientation: landscape) {
          html, body {
            overflow-x: hidden;
            -webkit-text-size-adjust: 100%;
          }
          .min-h-screen {
            min-height: 100vh; 
          }
        }

        @media (orientation: landscape) and (max-height: 600px) {
          header {
            position: static !important; 
            padding: 0.5rem !important;
          }
          
          .sidebar {
            display: none; 
          }
          
          .min-h-screen {
            min-height: auto !important;
          }
          
          .py-12, .py-8 {
            padding-top: 1rem !important;
            padding-bottom: 1rem !important;
          }
          
          /* Ensure titles are readable in landscape */
          .spectro-title {
            font-size: 1.2rem !important;
          }
        }

        @media (min-width: 768px) {
          .md\\:block { display: block; }
          .md\\:flex { display: flex; }
          .md\\:text-3xl { font-size: 1.875rem; }
          .md\\:p-8 { padding: 2rem; }
        }

        @media (min-width: 1024px) {
          .lg\\:text-5xl { font-size: 3rem; }
        }

        /* CUSTOM SCROLLBAR - CYBER STYLE */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        ::-webkit-scrollbar-track {
          background: #030014;
          border-left: 1px solid rgba(255, 255, 255, 0.05);
        }

        ::-webkit-scrollbar-thumb {
          background: #06b6d4;
          border-radius: 0;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #22d3ee;
          box-shadow: 0 0 10px #06b6d4;
        }

        /* --- GEOMETRICAL & PANACHE COMPONENT OVERRIDES --- */

        /* 1. CARDS: Glass, Neon Borders, Sharp/Tech Feel */
        .bg-card, .card, .Card, .glass-panel {
          background: rgba(10, 10, 15, 0.7) !important;
          backdrop-filter: blur(16px) !important;
          -webkit-backdrop-filter: blur(16px) !important;
          border: 1px solid rgba(6, 182, 212, 0.3) !important; /* Cyan-ish border */
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2), inset 0 0 20px rgba(6, 182, 212, 0.05) !important;
          border-radius: 4px !important; /* Minimal radius for geometrical feel */
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          position: relative;
          overflow: hidden;
        }

        /* Card Hover Effect - The "Panache" */
        .bg-card:hover, .card:hover, .Card:hover {
          border-color: rgba(6, 182, 212, 0.8) !important;
          box-shadow: 0 0 30px rgba(6, 182, 212, 0.2), inset 0 0 20px rgba(6, 182, 212, 0.1) !important;
          transform: translateY(-2px) scale(1.005) !important;
          z-index: 10;
        }

        /* Corner Accents for Cards (Pseudo-elements) */
        .bg-card::after, .card::after, .Card::after {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 20px;
          height: 20px;
          background: linear-gradient(135deg, transparent 50%, rgba(6, 182, 212, 0.5) 50%);
          pointer-events: none;
        }

        /* 2. BUTTONS: Flamboyant Gradients & Alignment */
        button, .btn, .button {
          border-radius: 2px !important; /* Sharp corners */
          text-transform: uppercase !important;
          font-family: 'Orbitron', sans-serif !important; /* Tech font */
          letter-spacing: 0.1em !important;
          font-weight: 800 !important;
          transition: all 0.3s ease !important;
          position: relative;
          overflow: hidden;
        }

        /* Primary Action Buttons */
        .bg-primary, .btn-primary, button[class*="bg-purple-600"], button[class*="bg-blue-600"], .bg-cyan-500 {
          background: linear-gradient(90deg, #06B6D4, #3B82F6, #8B5CF6) !important;
          background-size: 200% auto !important;
          border: none !important;
          color: white !important;
          text-shadow: 0 1px 2px rgba(0,0,0,0.5);
          animation: gradient-shift 5s ease infinite !important;
        }

        .bg-primary:hover, .btn-primary:hover, button[class*="bg-purple-600"]:hover {
          background-position: right center !important;
          box-shadow: 0 0 20px rgba(6, 182, 212, 0.6) !important;
          transform: translateY(-1px);
        }

        /* Secondary/Outline Buttons */
        .bg-secondary, .btn-secondary, .border-input, button.variant-outline {
          background: transparent !important;
          border: 1px solid rgba(255, 255, 255, 0.3) !important;
          color: #cbd5e1 !important;
        }

        .bg-secondary:hover, .btn-secondary:hover, button.variant-outline:hover {
          border-color: #F59E0B !important; /* Amber glow */
          color: #F59E0B !important;
          background: rgba(245, 158, 11, 0.1) !important;
          box-shadow: 0 0 15px rgba(245, 158, 11, 0.2) !important;
        }

        /* Destructive Buttons */
        .bg-destructive, .bg-red-600 {
          background: linear-gradient(90deg, #ef4444, #b91c1c) !important;
          border: 1px solid #ef4444 !important;
        }
        
        .bg-destructive:hover, .bg-red-600:hover {
          box-shadow: 0 0 20px rgba(239, 68, 68, 0.5) !important;
        }

        /* 3. BADGES: Neon Capsules */
        .badge, .Badge {
          border-radius: 4px !important;
          font-family: 'JetBrains Mono', monospace !important;
          border: 1px solid currentColor !important;
          background: rgba(0, 0, 0, 0.6) !important;
          backdrop-filter: blur(4px);
          box-shadow: 0 0 10px currentColor;
          padding: 4px 10px !important;
        }

        /* 4. TYPOGRAPHY: Coordinated & Aligned */
        h1, h2, h3, .card-title {
          font-family: 'Orbitron', sans-serif !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          color: white !important;
          text-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
        }

        h1 {
          background: linear-gradient(to right, #fff, #a5f3fc);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent !important;
        }

        p, span, div, li {
          font-family: 'Inter', sans-serif !important;
          letter-spacing: 0.02em;
        }

        /* 5. INPUTS: Cyber Fields */
        input, textarea, select, .input {
          background: rgba(0, 0, 0, 0.4) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 2px !important;
          color: #22d3ee !important;
          font-family: 'JetBrains Mono', monospace !important;
        }

        input:focus, textarea:focus, select:focus {
          border-color: #06b6d4 !important;
          box-shadow: 0 0 15px rgba(6, 182, 212, 0.3) !important;
          background: rgba(0, 0, 0, 0.6) !important;
        }

        /* 6. SIDEBAR & NAV: Glass Integration */
        aside, .sidebar {
          background: rgba(3, 0, 20, 0.6) !important; /* Match body bg but glass */
          border-right: 1px solid rgba(255, 255, 255, 0.05) !important;
        }
        
        .sidebar-group-label {
          color: #F59E0B !important; /* Amber titles */
          text-shadow: 0 0 10px rgba(245, 158, 11, 0.4);
        }

        /* Active Nav Item */
        a[aria-current="page"], .router-link-active {
          background: linear-gradient(90deg, rgba(6, 182, 212, 0.1), transparent) !important;
          border-left: 3px solid #06b6d4 !important;
          color: #22d3ee !important;
        }

        /* 7. ALIGNMENT & LAYOUT FIXES */
        .container, .max-w-7xl {
          max-width: 1400px !important; /* Wider layout */
        }

        /* Grid gaps */
        .grid {
          gap: 24px !important;
        }

        /* Animation Global */
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* DYNAMIC THEME COLOR OVERRIDES */
        /* Replace purple classes with theme color */
        ${theme !== 'purple' ? `
        /* Background colors */
        .bg-purple-50 { background-color: var(--primary) !important; opacity: 0.05; }
        .bg-purple-100 { background-color: var(--primary) !important; opacity: 0.1; }
        .bg-purple-200 { background-color: var(--primary) !important; opacity: 0.2; }
        .bg-purple-300 { background-color: var(--primary) !important; opacity: 0.3; }
        .bg-purple-400 { background-color: var(--primary) !important; opacity: 0.4; }
        .bg-purple-500 { background-color: var(--primary) !important; }
        .bg-purple-600 { background-color: var(--primary-dark) !important; }
        .bg-purple-700 { background-color: var(--primary-dark) !important; }
        .bg-purple-800 { background-color: var(--primary-dark) !important; }
        .bg-purple-900 { background-color: var(--primary-dark) !important; }
        
        /* Text colors */
        .text-purple-50, .text-purple-100, .text-purple-200, .text-purple-300 { color: ${colors.primary} !important; opacity: 0.7; }
        .text-purple-400, .text-purple-500 { color: ${colors.primary} !important; }
        .text-purple-600, .text-purple-700, .text-purple-800, .text-purple-900 { color: ${colors.primaryDark} !important; }
        
        /* Border colors */
        .border-purple-300, .border-purple-400, .border-purple-500 { border-color: ${colors.primary} !important; }
        .border-purple-600, .border-purple-700 { border-color: ${colors.primaryDark} !important; }
        
        /* Ring colors */
        .ring-purple-500, .focus\\:ring-purple-500:focus { --tw-ring-color: ${colors.primary} !important; }
        
        /* Hover states */
        .hover\\:bg-purple-500:hover, .hover\\:bg-purple-600:hover, .hover\\:bg-purple-700:hover { background-color: ${colors.primaryDark} !important; }
        .hover\\:text-purple-400:hover, .hover\\:text-purple-500:hover { color: ${colors.primary} !important; }
        .hover\\:border-purple-500:hover { border-color: ${colors.primary} !important; }

        /* Violet replacements */
        .bg-violet-500, .bg-violet-600 { background-color: ${colors.primary} !important; }
        .text-violet-400, .text-violet-500, .text-violet-600 { color: ${colors.primary} !important; }
        .border-violet-500 { border-color: ${colors.primary} !important; }
        
        /* Indigo replacements */
        .bg-indigo-500, .bg-indigo-600 { background-color: ${colors.secondary} !important; }
        .text-indigo-400, .text-indigo-500, .text-indigo-600 { color: ${colors.secondary} !important; }
        .border-indigo-500 { border-color: ${colors.secondary} !important; }

        /* Gradient overrides */
        .from-purple-500 { --tw-gradient-from: ${colors.primary} !important; }
        .from-purple-600 { --tw-gradient-from: ${colors.primaryDark} !important; }
        .to-purple-500 { --tw-gradient-to: ${colors.primary} !important; }
        .to-purple-600 { --tw-gradient-to: ${colors.primaryDark} !important; }
        .via-purple-500 { --tw-gradient-stops: var(--tw-gradient-from), ${colors.primary}, var(--tw-gradient-to) !important; }
        .via-purple-900 { --tw-gradient-stops: var(--tw-gradient-from), ${colors.primaryDark}, var(--tw-gradient-to) !important; }
        
        .from-indigo-500, .from-indigo-600 { --tw-gradient-from: ${colors.secondary} !important; }
        .to-indigo-500, .to-indigo-600 { --tw-gradient-to: ${colors.secondary} !important; }
        
        .from-violet-500, .from-violet-600 { --tw-gradient-from: ${colors.primary} !important; }
        .to-violet-500, .to-violet-600 { --tw-gradient-to: ${colors.primary} !important; }

        /* Shadow overrides */
        .shadow-purple-500\\/25, .shadow-purple-500\\/30 { --tw-shadow-color: ${colors.primary}40 !important; }
        
        /* Opacity variants */
        .bg-purple-500\\/10, .bg-purple-600\\/10, .bg-purple-500\\/20, .bg-purple-600\\/20 { background-color: ${colors.primary}33 !important; }
        .bg-purple-500\\/30, .bg-purple-600\\/30 { background-color: ${colors.primary}4d !important; }
        .bg-purple-500\\/50 { background-color: ${colors.primary}80 !important; }
        .bg-purple-900\\/50, .bg-purple-900\\/80, .bg-purple-900\\/90 { background-color: ${colors.primaryDark}cc !important; }
        
        .border-purple-500\\/20, .border-purple-500\\/30, .border-purple-500\\/40, .border-purple-500\\/50 { border-color: ${colors.primary}80 !important; }
        .border-purple-700\\/50 { border-color: ${colors.primaryDark}80 !important; }
        ` : ''}
        
        /* Fix for Tailwind gradient classes */
        .bg-gradient-to-r.from-purple-600.to-indigo-600,
        .bg-gradient-to-r.from-purple-500.to-blue-500,
        .bg-gradient-to-r.from-purple-500.to-indigo-500,
        .bg-gradient-to-r.from-purple-600.via-pink-600.to-cyan-600 {
          background: ${colors.buttonGradient} !important;
        }
        
        .bg-gradient-to-br.from-slate-900.via-purple-900.to-slate-900 {
          background: ${colors.gradient} !important;
        }

        /* Text gradient override */
        .bg-gradient-to-r.from-purple-300,
        .bg-gradient-to-r.from-purple-400 {
          background: linear-gradient(to right, ${colors.primary}, ${colors.secondary}) !important;
          -webkit-background-clip: text !important;
          background-clip: text !important;
        }

        /* 1. UNIVERSAL FONT UPGRADE - CLEAN & PREMIUM */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&display=swap');
        
        body, p, span, div, button, input, label {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
        }

        /* Orbitron for Branding */
        .spectro-title, h1.spectro-title, .sidebar-group-label.spectro-title {
          font-family: 'Orbitron', sans-serif !important;
          letter-spacing: 0.05em !important;
          text-transform: uppercase !important;
        }

        h1, h2, h3, .page-title, .card-title, .CardTitle {
          font-weight: 900 !important;
          letter-spacing: -0.02em !important;
          text-transform: none !important;
        }
        
        button, .btn, .badge {
          font-weight: 700 !important;
          letter-spacing: 0.01em !important;
          text-transform: none !important;
        }

        /* 2. WHITE THEME: INVERTED CONTRAST ENGINE */
        /* FORCE DARK HOLOGRAPHIC BACKGROUND FOR ALL THEMES */
        body.theme-white, body {
          background-color: #030014 !important;
          color: #ffffff !important;
        }

        /* Ensure no grey backgrounds leak through */
        .bg-slate-900, .bg-slate-950, .bg-black {
          background-color: rgba(15, 23, 42, 0.6) !important; /* Semi-transparent dark */
        }
        body.theme-white .bg-slate-950,
        body.theme-white .bg-black,
        body.theme-white .card,
        body.theme-white .Card,
        body.theme-white .bg-\[\#0a0a0a\],
        body.theme-white .bg-\[\#050505\],
        body.theme-white .bg-\[\#080808\] {
          background-color: #ffffff !important;
          border: 2px solid #000000 !important;
          color: #000000 !important;
          box-shadow: 4px 4px 0px #000000 !important; /* Neo-brutalism shadow */
        }

        /* Buttons in White Theme -> Turn BLACK with WHITE Text (Solid/Primary) */
        body.theme-white button:not(.variant-ghost):not(.variant-outline):not(.bg-transparent),
        body.theme-white .button:not(.variant-ghost),
        body.theme-white .btn:not(.variant-ghost),
        body.theme-white button[type="submit"],
        body.theme-white .btn-primary {
          background-color: #000000 !important;
          color: #ffffff !important;
          border: 2px solid #000000 !important;
          font-weight: 900 !important;
          background-image: none !important;
          box-shadow: 4px 4px 0px rgba(0,0,0,0.2) !important;
        }
        
        /* Outline/Ghost Buttons in White Theme -> Turn WHITE with BLACK Text */
        body.theme-white button.variant-outline,
        body.theme-white button.variant-ghost,
        body.theme-white button.bg-transparent,
        body.theme-white button[variant="ghost"],
        body.theme-white button[variant="outline"],
        body.theme-white .btn-secondary,
        body.theme-white .btn-outline {
          background-color: #ffffff !important;
          color: #000000 !important;
          border: 2px solid #000000 !important;
          font-weight: 900 !important;
        }

        /* Ensure text inside buttons respects the theme */
        body.theme-white button span, 
        body.theme-white button p, 
        body.theme-white button div {
           color: inherit !important;
        }

        /* Hover States */
        body.theme-white button:hover {
          transform: translate(-2px, -2px);
          box-shadow: 4px 4px 0px rgba(0,0,0,0.5) !important;
        }

        /* Text Visibility Fixes */
        body.theme-white .text-slate-300,
        body.theme-white .text-slate-400,
        body.theme-white .text-slate-500,
        body.theme-white .text-gray-400 {
          color: #000000 !important;
          font-weight: 600 !important;
        }

        /* Specific "Zero-Iteration" and Badge Fixes */
        body.theme-white .zero-static-text, .zero-static-text {
          color: #000000 !important;
          font-weight: 900 !important;
          font-size: 1.1em !important;
          text-transform: uppercase !important;
          background: transparent !important;
        }
        
        /* Dark theme specific for zero-static-text */
        body:not(.theme-white) .zero-static-text {
          color: #ffffff !important;
          text-shadow: 0 0 10px rgba(255,255,255,0.5);
        }

        /* Fix for specific blue text in converter */
        body.theme-white .text-blue-300,
        body.theme-white .text-blue-200,
        body.theme-white .text-purple-300,
        body.theme-white .text-slate-300,
        body.theme-white .text-slate-400 {
           color: #000000 !important;
           font-weight: 700 !important;
        }

        /* Sidebar Specifics for White Theme */
        body.theme-white aside, 
        body.theme-white .sidebar {
          background-color: #ffffff !important;
          border-right: 3px solid #000000 !important;
        }
        body.theme-white .sidebar-menu-button {
           color: #000000 !important;
        }
        body.theme-white .sidebar-group-label {
           color: #000000 !important;
           font-family: 'Bungee Inline', cursive !important;
        }

        /* SpectroModel Title Visibility */
        body.theme-white header h1,
        body.theme-white .spectro-title {
           color: #000000 !important;
           font-weight: 900 !important;
           text-shadow: none !important;
        }
        
        /* Dark Theme Visibility Improvements */
        body:not(.theme-white) .spectro-title {
           color: #ffffff !important;
           text-shadow: 0 0 15px rgba(168,85,247,0.6) !important;
        }
        
        body:not(.theme-white) h1, 
        body:not(.theme-white) h2, 
        body:not(.theme-white) h3,
        body:not(.theme-white) .text-white {
           text-shadow: 0 1px 4px rgba(0,0,0,0.8) !important;
        }
        
        /* Ensure Card Titles Pop */
        body:not(.theme-white) .card-title,
        body:not(.theme-white) .CardTitle {
           color: #ffffff !important;
           font-weight: 900 !important;
        }

        /* Prevent Overflow Globally */
        * {
          box-sizing: border-box;
        }
        
        p, h1, h2, h3, h4, span, div {
          word-break: break-word;
          overflow-wrap: break-word;
        }
        
        /* Fix Card Overflow & Enforce Dark Backgrounds in Dark Mode */
        .card, .Card {
          overflow: hidden;
        }

        /* Aggressively enforce dark backgrounds for cards in non-white themes */
        body:not(.theme-white) .card:not([class*="bg-"]), 
        body:not(.theme-white) .Card:not([class*="bg-"]) {
          background-color: #0a0a0a !important;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        /* Ensure text is light in dark cards */
        body:not(.theme-white) .card p, 
        body:not(.theme-white) .card span, 
        body:not(.theme-white) .card li {
          color: #e2e8f0; /* slate-200 */
        }

        /* Force dark mode style on specific cards even in light mode */
        .dark-card-force {
          background-color: #0f172a !important; /* slate-950 */
          color: white !important;
          border: 1px solid rgba(148, 163, 184, 0.2) !important;
        }
        .dark-card-force h1, .dark-card-force h2, .dark-card-force h3, .dark-card-force p, .dark-card-force span, .dark-card-force label {
          color: white !important;
        }
        .dark-card-force .text-slate-400 {
          color: #94a3b8 !important;
        }
        .dark-card-force .text-blue-300 {
          color: #93c5fd !important;
        }

        /* Category Buttons Visibility Fix */
        .category-btn {
           color: #000000 !important;
           font-weight: 900 !important;
           text-shadow: none !important;
        }
        /* In dark mode/default, revert to light text for outline buttons if needed, 
           but user asked for "perfect color difference". 
           We'll assume the theme engine handles default, but enforce black on white theme. */
        body.theme-white .category-btn {
           background-color: white !important;
           color: black !important;
           border: 2px solid #000000 !important;
        }
        body.theme-white .category-btn:hover {
           background-color: #f0f0f0 !important;
        }

        /* Button text visibility global fix */
        button {
          font-weight: 700; /* Make all buttons bold by default */
        }
        body.theme-white button.bg-purple-600,
        body.theme-white button.bg-blue-600,
        body.theme-white button.bg-green-600,
        body.theme-white button.bg-red-600 {
           color: white !important; /* Keep primary buttons white text */
           text-shadow: 0 1px 2px rgba(0,0,0,0.5);
        }
        
        /* Fix "Get Current Location" and others in White Theme */
        body.theme-white .text-white {
           color: #000000 !important; /* Invert text-white to black in white theme */
        }
        
        /* FORCE WHITE TEXT CLASS - OVERRIDES THEME INVERSION */
        .text-white-force, 
        body.theme-white .text-white-force,
        .force-text-white,
        body.theme-white .force-text-white {
           color: #ffffff !important;
           text-shadow: 0 1px 2px rgba(0,0,0,0.5) !important;
        }

        /* RESTORE WHITE TEXT FOR DARK CONTAINERS & GRADIENT BUTTONS IN WHITE THEME */
        body.theme-white .bg-slate-900 .text-white,
        body.theme-white .bg-slate-950 .text-white,
        body.theme-white .bg-black .text-white,
        body.theme-white .bg-gradient-to-r .text-white,
        body.theme-white .bg-gradient-to-br .text-white,
        body.theme-white [class*="bg-gradient-"] .text-white {
           color: #ffffff !important;
        }

        /* ARROW & ICON VISIBILITY FIX */
        /* White Theme: Icons inside buttons/badges/cards should be BLACK (unless forced white) */
        body.theme-white button svg,
        body.theme-white .btn svg,
        body.theme-white .badge svg,
        body.theme-white .card svg:not(.text-green-400):not(.text-red-400):not(.text-blue-400):not(.text-purple-400):not(.text-cyan-400):not(.text-white-force),
        body.theme-white .lucide:not(.text-green-400):not(.text-red-400):not(.text-blue-400):not(.text-purple-400):not(.text-cyan-400):not(.text-white-force) {
           color: #000000 !important;
           stroke: #000000 !important;
        }

        /* Exception: Icons inside dark/gradient buttons in White Theme must be WHITE */
        /* ONLY for elements that STAY dark in white theme (gradients, primary buttons, forced dark) */
        /* REMOVED .bg-black and .bg-slate-900 because they INVERT to white */
        body.theme-white button.btn-primary svg,
        body.theme-white button[class*="bg-gradient-"] svg,
        body.theme-white .text-white-force svg,
        body.theme-white .force-text-white svg {
           color: #ffffff !important;
           stroke: #ffffff !important;
        }

        /* Dark Themes: Icons are White/Light */
        body:not(.theme-white) button svg,
        body:not(.theme-white) .btn svg {
           color: currentColor;
           stroke: currentColor;
        }

        /* Cyberpunk Palette */
        .bg-cyber-black { background-color: #05050a !important; }
        .bg-cyber-dark { background-color: #0a0a12 !important; }
        .bg-cyber-panel { background-color: #13131f !important; }
        
        .text-cyber-cyan { color: #00f3ff !important; }
        .bg-cyber-cyan { background-color: #00f3ff !important; }
        .border-cyber-cyan { border-color: #00f3ff !important; }
        
        .text-cyber-pink { color: #ff00ff !important; }
        .bg-cyber-pink { background-color: #ff00ff !important; }
        .border-cyber-pink { border-color: #ff00ff !important; }
        
        .text-cyber-purple { color: #bd00ff !important; }
        .bg-cyber-purple { background-color: #bd00ff !important; }
        .border-cyber-purple { border-color: #bd00ff !important; }
        
        .text-cyber-green { color: #00ff9d !important; }
        .bg-cyber-green { background-color: #00ff9d !important; }
        .border-cyber-green { border-color: #00ff9d !important; }
        
        .text-cyber-gold { color: #ffd700 !important; }
        .bg-cyber-gold { background-color: #ffd700 !important; }
        .border-cyber-gold { border-color: #ffd700 !important; }

        /* Utilities */
        .font-mono { font-family: 'JetBrains Mono', monospace !important; }
        .clip-path-slant { clip-path: polygon(0 0, 100% 0, 95% 100%, 0% 100%); }
        .animate-pulse-fast { animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        .animate-glitch { animation: glitch 1s linear infinite; }
        .animate-scanline { animation: scanline 8s linear infinite; }

        @keyframes glitch {
            2%, 64% { transform: translate(2px,0) skew(0deg); }
            4%, 60% { transform: translate(-2px,0) skew(0deg); }
            62% { transform: translate(0,0) skew(5deg); }
        }
        @keyframes scanline {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100%); }
        }
      `}</style>
    </>
  );
}