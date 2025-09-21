import React from 'react';
import { AttendanceStatus } from '../types';

interface StatusBadgeProps {
  status: AttendanceStatus;
}

const statusStyles: Record<AttendanceStatus, string> = {
  [AttendanceStatus.PRESENT]: 'bg-emerald-100 text-emerald-800',
  [AttendanceStatus.CHECKED_OUT]: 'bg-sky-100 text-sky-800',
  [AttendanceStatus.ABSENT]: 'bg-slate-200 text-slate-800',
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const style = statusStyles[status] || 'bg-gray-100 text-gray-800';
  return (
    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${style}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
