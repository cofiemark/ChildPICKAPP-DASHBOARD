import React from 'react';
import { Student } from '../types';
import { XCircleIcon, UserCircleIcon } from './icons';

interface StudentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
}

const DetailItem: React.FC<{ label: string; value: string | React.ReactNode }> = ({ label, value }) => (
    <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="font-semibold text-slate-800">{value || 'N/A'}</p>
    </div>
);

const StudentDetailsModal: React.FC<StudentDetailsModalProps> = ({ isOpen, onClose, student }) => {
  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-800">Student Details</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
            <XCircleIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto space-y-4">
            <div className="flex items-center space-x-4">
                 {student.photoUrl ? (
                    <img src={student.photoUrl} alt={student.name} className="h-20 w-20 rounded-full object-cover" />
                ) : (
                    <div className="h-20 w-20 rounded-full bg-slate-200 flex items-center justify-center">
                        <UserCircleIcon className="h-16 w-16 text-slate-400" />
                    </div>
                )}
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">{student.name}</h2>
                    <p className="text-md text-slate-500">Student ID: {student.id} &bull; Grade: {student.grade}</p>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                <DetailItem label="Notes" value={student.notes} />
            </div>
            <div>
                 <h4 className="text-md font-semibold text-slate-700 mb-2">Authorized Guardians</h4>
                 <ul className="divide-y divide-slate-200 border rounded-lg">
                    {student.authorizedGuardians.map(g => (
                        <li key={g.id} className="px-4 py-2 flex justify-between items-center">
                            <span className="font-medium">{g.name}</span>
                            <span className="text-sm text-slate-500">{g.phone}</span>
                        </li>
                    ))}
                 </ul>
            </div>
        </div>
        <div className="p-4 bg-slate-50 flex justify-end rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailsModal;
