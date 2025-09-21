import React, { useState, FormEvent, useEffect } from 'react';
import { Student, Guardian } from '../types';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (studentData: Omit<Student, 'id'> | Student) => Promise<void>;
  student: Student | null;
}

const StudentFormModal: React.FC<StudentFormModalProps> = ({ isOpen, onClose, onSubmit, student }) => {
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    photoUrl: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name,
        grade: String(student.grade),
        photoUrl: student.photoUrl || '',
        notes: student.notes || ''
      });
    } else {
      setFormData({ name: '', grade: '', photoUrl: '', notes: '' });
    }
  }, [student, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.grade) {
      setError('Student Name and Grade are required.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    
    const grade = parseInt(formData.grade, 10);
    if (isNaN(grade) || grade < 1 || grade > 12) {
        setError('Please enter a valid grade (1-12).');
        setIsSubmitting(false);
        return;
    }
    
    // In a real app, guardian management would be more complex.
    // For this mock, we'll just keep existing guardians or assign none.
    const studentData = {
      name: formData.name,
      grade: grade,
      photoUrl: formData.photoUrl,
      notes: formData.notes,
      authorizedGuardians: student?.authorizedGuardians || []
    };

    try {
      if (student) {
        await onSubmit({ ...student, ...studentData });
      } else {
        await onSubmit(studentData);
      }
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-slate-800">{student ? 'Edit Student' : 'Add New Student'}</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">{error}</div>}
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
            </div>

            <div>
              <label htmlFor="grade" className="block text-sm font-medium text-slate-700 mb-1">Grade</label>
              <input type="number" id="grade" name="grade" value={formData.grade} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required min="1" max="12" />
            </div>

            <div>
              <label htmlFor="photoUrl" className="block text-sm font-medium text-slate-700 mb-1">Photo URL (Optional)</label>
              <input type="text" id="photoUrl" name="photoUrl" value={formData.photoUrl} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="https://example.com/photo.jpg"/>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1">Notes (Optional)</label>
              <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g., Allergies, medical conditions..."></textarea>
            </div>
            
            <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm font-medium text-slate-700">Guardian Management</p>
                <p className="text-xs text-slate-500 mt-1">Guardian information can be managed from the detailed student profile page (feature not implemented in this mock).</p>
            </div>
          </div>
          <div className="p-4 bg-slate-50 flex justify-end space-x-2 rounded-b-lg">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed">
              {isSubmitting ? 'Saving...' : 'Save Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentFormModal;
