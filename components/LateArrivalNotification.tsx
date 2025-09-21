import React from 'react';
// FIX: Corrected import path for types
import { Student } from '../types';
// FIX: Corrected import path for icons
import { ExclamationTriangleIcon, XCircleIcon } from './icons';

interface LateArrivalNotificationProps {
  lateStudents: Student[];
  onDismiss: () => void;
  isVisible: boolean;
}

const LateArrivalNotification: React.FC<LateArrivalNotificationProps> = ({ lateStudents, onDismiss, isVisible }) => {
  if (!isVisible || lateStudents.length === 0) {
    return null;
  }

  return (
    <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-800 p-4 rounded-md shadow-lg" role="alert">
      <div className="flex">
        <div className="py-1">
            <ExclamationTriangleIcon className="h-6 w-6 text-amber-500 mr-4"/>
        </div>
        <div>
          <div className="flex justify-between items-center">
             <p className="font-bold">Late Arrival Alert</p>
             <button onClick={onDismiss} aria-label="Dismiss notification" className="text-amber-600 hover:text-amber-800">
                <XCircleIcon className="h-5 w-5"/>
            </button>
          </div>
          <p className="text-sm mt-1">
            The following student(s) have not checked in past the 9:00 AM deadline:
          </p>
          <ul className="list-disc list-inside mt-2 text-sm font-medium">
            {lateStudents.map(student => (
              <li key={student.id}>{student.name} ({student.id})</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LateArrivalNotification;
