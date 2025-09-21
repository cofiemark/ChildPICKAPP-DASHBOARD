import React, { useState, useEffect } from 'react';
import { Student } from '../types';
import { XCircleIcon } from './icons';
import { useToast } from '../contexts/ToastContext';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (studentData: Omit<Student, 'id'> | Student) => Promise<void>;
  student: Student | null;
}

const StudentFormModal: React.FC<StudentFormModalProps> = ({ isOpen, onClose, onSubmit, student }) => {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    photoUrl: '',
    notes: '',
  });
  const [guardians, setGuardians] = useState<{ id: string; name: string; phone: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name,
        grade: String(student.grade),
        photoUrl: student.photoUrl || '',
        notes: student.notes || '',
      });
      setGuardians(student.authorizedGuardians.map(g => ({ ...g })));
    } else {
      setFormData({ name: '', grade: '', photoUrl: '', notes: '' });
      setGuardians([{ id: `temp-${Date.now()}`, name: '', phone: '' }]);
    }
  }, [student, isOpen]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleGuardianChange = (index: number, field: 'name' | 'phone', value: string) => {
    const newGuardians = [...guardians];
    newGuardians[index][field] = value;
    setGuardians(newGuardians);
  };
  
  const addGuardian = () => {
    setGuardians([...guardians, { id: `temp-${Date.now()}`, name: '', phone: '' }]);
  };

  const removeGuardian = (index: number) => {
    if (guardians.length > 1) {
      setGuardians(guardians.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.grade || guardians.some(g => !g.name)) {
      addToast('Student name, grade, and at least one guardian name are required.', 'error');
      return;
    }

    setIsSubmitting(true);
    const studentData: Omit<Student, 'id'> = {
      name: formData.name,
      grade: parseInt(formData.grade, 10),
      photoUrl: formData.photoUrl,
      notes: formData.notes,
      authorizedGuardians: guardians.filter(g => g.name),
    };

    try {
        if (student) {
            await onSubmit({ ...studentData, id: student.id });
             addToast('Student updated successfully!', 'success');
        } else {
            await onSubmit(studentData);
            addToast('Student added successfully!', 'success');
        }
        onClose();
    } catch (err: any) {
        addToast(err.message || 'Failed to save student.', 'error');
    } finally {
        setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="p-6 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold text-slate-800">{student ? 'Edit Student' : 'Add New Student'}</h3>
                <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-800">
                    <XCircleIcon className="h-6 w-6"/>
                </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700">Full Name</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
                    </div>
                    <div>
                        <label htmlFor="grade" className="block text-sm font-medium text-slate-700">Grade</label>
                        <input type="number" name="grade" id="grade" value={formData.grade} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
                    </div>
                </div>
                <div>
                    <label htmlFor="photoUrl" className="block text-sm font-medium text-slate-700">Photo URL (Optional)</label>
                    <input type="text" name="photoUrl" id="photoUrl" value={formData.photoUrl} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-slate-700">Notes (Optional)</label>
                    <textarea name="notes" id="notes" value={formData.notes} onChange={handleFormChange} rows={3} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>

                <div className="pt-2">
                    <h4 className="text-md font-semibold text-slate-800 mb-2">Authorized Guardians</h4>
                    <div className="space-y-3">
                    {guardians.map((g, index) => (
                        <div key={g.id} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center">
                            <input
                                type="text"
                                placeholder="Guardian Name"
                                value={g.name}
                                onChange={(e) => handleGuardianChange(index, 'name', e.target.value)}
                                className="md:col-span-2 w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                            />
                            <input
                                type="tel"
                                placeholder="Phone Number"
                                value={g.phone}
                                onChange={(e) => handleGuardianChange(index, 'phone', e.target.value)}
                                className="md:col-span-2 w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                            <button type="button" onClick={() => removeGuardian(index)} className="text-red-500 hover:text-red-700 disabled:opacity-50 text-sm font-medium md:col-span-1" disabled={guardians.length <= 1}>
                                Remove
                            </button>
                        </div>
                    ))}
                    </div>
                    <button type="button" onClick={addGuardian} className="mt-3 text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                        + Add another guardian
                    </button>
                </div>
            </div>
            <div className="p-4 bg-slate-50 flex justify-end space-x-2 rounded-b-lg mt-auto">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100" disabled={isSubmitting}>
                    Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save Student'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default StudentFormModal;