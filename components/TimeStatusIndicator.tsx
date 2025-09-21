import React from 'react';
import { useSettings } from '../contexts/SettingsContext';

interface TimeStatusIndicatorProps {
  time: Date | null;
  type: 'check-in' | 'check-out';
}

const TimeStatusIndicator: React.FC<TimeStatusIndicatorProps> = ({ time, type }) => {
  const { settings } = useSettings();

  if (!time) {
    return <span className="text-slate-400">—</span>;
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isLateCheckIn = type === 'check-in' && time.getHours() >= settings.lateThreshold;
  const isLateCheckOut = type === 'check-out' && time.getHours() >= settings.lateCheckOutThreshold;

  const isNotable = isLateCheckIn || isLateCheckOut;
  
  const tooltipText = () => {
    if (isLateCheckIn) return `Late Check-in (after ${settings.lateThreshold}:00)`;
    if (isLateCheckOut) return `Late Check-out (after ${settings.lateCheckOutThreshold}:00)`;
    return 'On Time';
  };

  const dotColor = isNotable ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <div className="flex items-center space-x-2 group relative">
      <span className={`h-2 w-2 rounded-full ${dotColor}`}></span>
      <span className="font-medium text-slate-700">{formatTime(time)}</span>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block px-2 py-1 bg-slate-800 text-white text-xs rounded-md shadow-lg whitespace-nowrap z-10">
        {tooltipText()}
      </div>
    </div>
  );
};

export default TimeStatusIndicator;