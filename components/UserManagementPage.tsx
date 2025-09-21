import React, { useState, useMemo } from 'react';
// FIX: Corrected import path for types
import { User, Role } from '../types';
import { useToast } from '../contexts/ToastContext';
// FIX: Corrected import path for icons
import { UserPlusIcon, PencilIcon, TrashIcon, SearchIcon } from './icons';
import UserFormModal from './UserFormModal';

interface UserManagementPageProps {
  allUsers: User[];
  onSaveUser: (userData: Omit<User, 'id'> | User) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
}

const UserManagementPage: React.FC<UserManagementPageProps> = ({ allUsers, onSaveUser, onDeleteUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { addToast } = useToast();

  const filteredUsers = useMemo(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    return allUsers.filter(user =>
      user.name.toLowerCase().includes(lowercasedFilter) ||
      user.email.toLowerCase().includes(lowercasedFilter) ||
      user.role.toLowerCase().includes(lowercasedFilter)
    );
  }, [allUsers, searchTerm]);

  const handleOpenModal = (user: User | null = null) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };
  
  const handleDelete = async (user: User) => {
    if (window.confirm(`Are you sure you want to delete the user "${user.name}"? This action cannot be undone.`)) {
        try {
            await onDeleteUser(user.id);
            addToast('User deleted successfully.', 'success');
        } catch (err: any) {
            addToast(err.message || 'Failed to delete user.', 'error');
        }
    }
  };

  return (
    <>
      <main className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">User Management</h2>
            <p className="text-slate-500 mt-1">Add, edit, or remove user accounts.</p>
          </div>
          <button onClick={() => handleOpenModal()} className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
            <UserPlusIcon className="w-5 h-5" />
            <span>Add New User</span>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <div className="relative max-w-sm">
              <input
                type="text"
                placeholder="Search by name, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-slate-400" />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500">
              <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                <tr>
                  <th scope="col" className="px-6 py-3">Name</th>
                  <th scope="col" className="px-6 py-3">Email</th>
                  <th scope="col" className="px-6 py-3">Role</th>
                  <th scope="col" className="px-6 py-3">Grade (Teachers)</th>
                  <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <tr key={user.id} className="bg-white border-b hover:bg-slate-50">
                      <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{user.name}</th>
                      <td className="px-6 py-4">{user.email}</td>
                      <td className="px-6 py-4">{user.role}</td>
                      <td className="px-6 py-4">{user.role === Role.TEACHER ? user.grade : 'N/A'}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button onClick={() => handleOpenModal(user)} className="p-2 text-indigo-600 hover:text-indigo-800 rounded-md hover:bg-indigo-50">
                          <PencilIcon className="w-5 h-5"/>
                        </button>
                        <button onClick={() => handleDelete(user)} className="p-2 text-red-600 hover:text-red-800 rounded-md hover:bg-red-50">
                          <TrashIcon className="w-5 h-5"/>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={5} className="text-center py-8 text-slate-500">No users found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      {isModalOpen && (
        <UserFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={onSaveUser}
          user={editingUser}
        />
      )}
    </>
  );
};

export default UserManagementPage;
