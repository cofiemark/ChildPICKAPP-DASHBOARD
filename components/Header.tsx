import React, { useState, useEffect } from 'react';

const Header: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString();
  };
  
  return (
    <header className="bg-white shadow-sm p-4 sticky top-0 z-20">
      <div className="w-full flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-800 shrink-0">
          Student Attendance
        </h1>
        
        <div className="text-right">
          <p className="font-semibold text-slate-700">{formatDate(currentTime)}</p>
          <p className="text-sm text-slate-500">{formatTime(currentTime)}</p>
        </div>
      </div>
    </header>
  );
};

export default Header;