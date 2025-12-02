import React, { useEffect } from 'react';

export default function CodeProtection() {
  useEffect(() => {
    // Disable Right Click
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    // Disable Keyboard Shortcuts
    const handleKeyDown = (e) => {
      // Ctrl+U (View Source)
      if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+Shift+I (DevTools)
      if (e.ctrlKey && e.shiftKey && (e.key === 'i' || e.key === 'I')) {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+Shift+J (DevTools Console)
      if (e.ctrlKey && e.shiftKey && (e.key === 'j' || e.key === 'J')) {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+Shift+C (Inspect Element)
      if (e.ctrlKey && e.shiftKey && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        return false;
      }
      
      // F12 (DevTools)
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+S (Save Page)
      if (e.ctrlKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    // Anti-Audit / Console Clearing
    const consoleInterval = setInterval(() => {
      if (typeof console !== 'undefined' && typeof console.clear === 'function') {
        console.clear();
      }
      console.log('%c STOP! AUDITING PROHIBITED. ', 'color: red; font-size: 50px; font-weight: bold; text-shadow: 2px 2px 0px black;');
      console.log('%c This application is protected by strict anti-audit protocols. Any attempt to reverse engineer, inspect, or audit this code is a violation of the Terms of Service and Intellectual Property rights of SpectroModel Inc.', 'font-size: 16px; color: white; background: red; padding: 10px;');
    }, 1000);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      clearInterval(consoleInterval);
    };
  }, []);

  return null;
}