import React from 'react';
import { Student } from '../types';
import { XCircleIcon } from './icons';

interface StatDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  students: Student[];
}

const StatDetailsModal: React.FC<StatDetailsModalProps> = ({ isOpen, onClose, title, students }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
            <XCircleIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto">
          {students.length > 0 ? (
            <ul className="divide-y divide-slate-200">
              {students.map(student => (
                <li key={student.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {student.photoUrl ? (
                        <img src={student.photoUrl} alt={student.name} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                        <div className="h-10 w-10 rounded-full bg-slate-200 flex-shrink-0"></div>
                    )}
                    <div>
                        <p className="font-medium text-slate-900">{student.name}</p>
                        <p className="text-sm text-slate-500">ID: {student.id}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600">Grade: {student.grade}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center py-8 text-slate-500">No students to display for this category.</p>
          )}
        </div>
        <div className="p-4 bg-slate-50 flex justify-end rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatDetailsModal;
