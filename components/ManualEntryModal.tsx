import React, { useState } from 'react';
import { XCircleIcon } from './icons';
import { useToast } from '../contexts/ToastContext';

interface ManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (studentId: string, guardianName: string, action: 'check-in' | 'check-out') => Promise<void>;
}

const ManualEntryModal: React.FC<ManualEntryModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [studentId, setStudentId] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [action, setAction] = useState<'check-in' | 'check-out'>('check-in');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !guardianName) {
        addToast('Student ID and Guardian Name are required.', 'error');
        return;
    }
    setIsSubmitting(true);
    try {
        await onSubmit(studentId, guardianName, action);
        handleClose();
    } catch (err: any) {
        addToast(err.message || 'An unexpected error occurred.', 'error');
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const handleClose = () => {
    setStudentId('');
    setGuardianName('');
    setAction('check-in');
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-800">Manual Attendance Entry</h3>
            <button type="button" onClick={handleClose} className="text-slate-500 hover:text-slate-800">
                <XCircleIcon className="h-6 w-6"/>
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="studentId" className="block text-sm font-medium text-slate-700">Student ID</label>
              <input
                type="text"
                id="studentId"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g., 1000000001"
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label htmlFor="guardianName" className="block text-sm font-medium text-slate-700">Guardian Full Name</label>
              <input
                type="text"
                id="guardianName"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                placeholder="e.g., Jane Doe"
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Action</label>
              <div className="mt-2 flex rounded-md shadow-sm">
                <button
                  type="button"
                  onClick={() => setAction('check-in')}
                  className={`relative inline-flex items-center justify-center w-1/2 px-4 py-2 rounded-l-md border text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${
                    action === 'check-in' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  Check-in
                </button>
                <button
                  type="button"
                  onClick={() => setAction('check-out')}
                  className={`relative -ml-px inline-flex items-center justify-center w-1/2 px-4 py-2 rounded-r-md border text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${
                    action === 'check-out' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  Check-out
                </button>
              </div>
            </div>
          </div>
          <div className="p-4 bg-slate-50 flex justify-end space-x-2 rounded-b-lg">
            <button type="button" onClick={handleClose} className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 disabled:opacity-50" disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManualEntryModal;
