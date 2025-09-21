import React, { useState, useEffect } from 'react';
import { User, Role } from '../types';
import { useToast } from '../contexts/ToastContext';
import { XCircleIcon } from './icons';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: Omit<User, 'id'> | User) => Promise<void>;
  user: User | null;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ isOpen, onClose, onSubmit, user }) => {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: Role.TEACHER,
    grade: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        grade: user.grade ? String(user.grade) : '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        role: Role.TEACHER,
        grade: '',
      });
    }
  }, [user, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.role) {
      addToast('Name, email, and role are required.', 'error');
      return;
    }
    if (formData.role === Role.TEACHER && !formData.grade) {
        addToast('Grade is required for the Teacher role.', 'error');
        return;
    }

    setIsSubmitting(true);
    
    const userDataPayload: Omit<User, 'id' | 'password'> & { grade?: number } = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
    };

    if (formData.role === Role.TEACHER) {
        userDataPayload.grade = parseInt(formData.grade, 10);
    }

    try {
      if (user) {
        await onSubmit({ ...userDataPayload, id: user.id });
        addToast('User updated successfully!', 'success');
      } else {
        await onSubmit(userDataPayload as Omit<User, 'id'>);
        addToast('User added successfully!', 'success');
      }
      onClose();
    } catch (err: any) {
      addToast(err.message || 'Failed to save user.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-800">{user ? 'Edit User' : 'Add New User'}</h3>
            <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-800">
                <XCircleIcon className="h-6 w-6"/>
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">Full Name</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full input" required />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Address</label>
              <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full input" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-slate-700">Role</label>
                <select name="role" id="role" value={formData.role} onChange={handleChange} className="mt-1 block w-full input">
                  {Object.values(Role).map(roleValue => (
                    <option key={roleValue} value={roleValue}>{roleValue}</option>
                  ))}
                </select>
              </div>
              {formData.role === Role.TEACHER && (
                <div>
                  <label htmlFor="grade" className="block text-sm font-medium text-slate-700">Grade</label>
                  <input type="number" name="grade" id="grade" value={formData.grade} onChange={handleChange} className="mt-1 block w-full input" required />
                </div>
              )}
            </div>
            {!user && (
                <p className="text-xs text-slate-500">The new user will receive an invitation email to set their password. For this demo, a default password is used.</p>
            )}
          </div>
          <div className="p-4 bg-slate-50 flex justify-end space-x-2 rounded-b-lg">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100" disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;