import React, { useState, FormEvent, useEffect } from 'react';
import { getStudentById } from '../services/attendanceService';

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
  const [error, setError] = useState<string | null>(null);
  const [studentIdError, setStudentIdError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      // Reset form state when modal is closed/hidden
      setStudentId('');
      setGuardianName('');
      setAction('check-in');
      setError(null);
      setStudentIdError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!studentId) {
      setStudentIdError(null);
      return;
    }

    const handler = setTimeout(() => {
      const studentExists = getStudentById(studentId);
      if (!studentExists) {
        setStudentIdError('Student ID not found.');
      } else {
        setStudentIdError(null);
      }
    }, 300); // Debounce to avoid checking on every keystroke

    return () => clearTimeout(handler);
  }, [studentId]);


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!studentId || !guardianName || studentIdError) {
      setError('Please fill in all fields correctly before submitting.');
      return;
    }

    const confirmationMessage = `Are you sure you want to perform '${action}' for student ${studentId.toUpperCase()} with guardian ${guardianName}?`;
    if (!window.confirm(confirmationMessage)) {
      return; // Abort if user cancels
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(studentId, guardianName, action);
      onClose();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-slate-800">Manual Attendance Entry</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">{error}</div>}
            <div>
              <label htmlFor="studentId" className="block text-sm font-medium text-slate-700 mb-1">Student ID</label>
              <input 
                type="text" 
                id="studentId" 
                value={studentId} 
                onChange={(e) => setStudentId(e.target.value.toUpperCase())} 
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${studentIdError ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-indigo-500'}`} 
                placeholder="e.g., S001" 
                aria-invalid={!!studentIdError}
                aria-describedby="studentId-error"
              />
              {studentIdError && <p id="studentId-error" className="mt-1 text-xs text-red-600">{studentIdError}</p>}
            </div>
            <div>
              <label htmlFor="guardianName" className="block text-sm font-medium text-slate-700 mb-1">Parent/Guardian Name</label>
              <input type="text" id="guardianName" value={guardianName} onChange={(e) => setGuardianName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g., Mr. Johnson" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Action</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input type="radio" name="action" value="check-in" checked={action === 'check-in'} onChange={() => setAction('check-in')} className="form-radio text-indigo-600 focus:ring-indigo-500" />
                  <span className="ml-2">Check-in</span>
                </label>
                <label className="flex items-center">
                  <input type="radio" name="action" value="check-out" checked={action === 'check-out'} onChange={() => setAction('check-out')} className="form-radio text-indigo-600 focus:ring-indigo-500" />
                  <span className="ml-2">Check-out</span>
                </label>
              </div>
            </div>
          </div>
          <div className="p-4 bg-slate-50 flex justify-end space-x-2 rounded-b-lg">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={isSubmitting || !!studentIdError || !studentId || !guardianName} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed">
              {isSubmitting ? 'Submitting...' : 'Submit Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManualEntryModal;