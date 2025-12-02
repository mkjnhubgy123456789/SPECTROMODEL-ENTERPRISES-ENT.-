import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function LiveClock({ timezone, showDate = true, className = "" }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date, tz) => {
    try {
      // Use provided timezone or default to browser timezone
      const effectiveTimezone = tz && tz.trim() !== '' 
        ? tz 
        : Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      const timeString = date.toLocaleString('en-US', {
        timeZone: effectiveTimezone,
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });

      const dateString = date.toLocaleString('en-US', {
        timeZone: effectiveTimezone,
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      return { time: timeString, date: dateString };
    } catch (error) {
      console.error("Time formatting error:", error);
      // Fallback to local time
      return { 
        time: date.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit', 
          second: '2-digit', 
          hour12: true 
        }),
        date: date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        })
      };
    }
  };

  const { time, date } = formatTime(currentTime, timezone);

  return (
    <div className={`flex items-center gap-2 ${className} select-text`}>
      <Clock className="w-4 h-4 text-purple-400 animate-pulse" />
      <div className="flex flex-col">
        <span className="text-white font-mono text-sm font-bold select-text">{time}</span>
        {showDate && (
          <span className="text-slate-400 text-xs select-text">{date}</span>
        )}
      </div>
    </div>
  );
}