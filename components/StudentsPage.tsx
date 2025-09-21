import React, { useState, useMemo } from 'react';
import { Student } from '../types';
import { useToast } from '../contexts/ToastContext';
import StudentFormModal from './StudentFormModal';
import { UserPlusIcon, PencilIcon, TrashIcon, SearchIcon, UserCircleIcon } from './icons';

interface StudentsPageProps {
  allStudents: Student[];
  onSaveStudent: (studentData: Omit<Student, 'id'> | Student) => Promise<void>;
  onDeleteStudent: (studentId: string) => Promise<void>;
}

const StudentsPage: React.FC<StudentsPageProps> = ({ allStudents, onSaveStudent, onDeleteStudent }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const { addToast } = useToast();

  const filteredStudents = useMemo(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    return allStudents.filter(student =>
      student.name.toLowerCase().includes(lowercasedFilter) ||
      student.id.toLowerCase().includes(lowercasedFilter) ||
      String(student.grade).includes(lowercasedFilter)
    ).sort((a,b) => a.name.localeCompare(b.name));
  }, [allStudents, searchTerm]);

  const handleOpenModal = (student: Student | null = null) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
  };
  
  const handleDelete = async (student: Student) => {
    if (window.confirm(`Are you sure you want to delete "${student.name}"? This action cannot be undone.`)) {
        try {
            await onDeleteStudent(student.id);
            addToast('Student deleted successfully.', 'success');
        } catch (err: any) {
            addToast(err.message || 'Failed to delete student.', 'error');
        }
    }
  };

  return (
    <>
      <main className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">Student Roster</h2>
            <p className="text-slate-500 mt-1">View, add, or edit student information.</p>
          </div>
          <button onClick={() => handleOpenModal()} className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
            <UserPlusIcon className="w-5 h-5" />
            <span>Add New Student</span>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <div className="relative max-w-sm">
              <input
                type="text"
                placeholder="Search by name, ID, or grade..."
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
                  <th scope="col" className="px-6 py-3">Student ID</th>
                  <th scope="col" className="px-6 py-3">Grade</th>
                  <th scope="col" className="px-6 py-3">Authorized Guardians</th>
                  <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map(student => (
                    <tr key={student.id} className="bg-white border-b hover:bg-slate-50">
                      <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                            {student.photoUrl ? (
                                <img src={student.photoUrl} alt={student.name} className="h-10 w-10 rounded-full object-cover" />
                            ) : (
                                <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                                    <UserCircleIcon className="w-8 h-8 text-slate-400" />
                                </div>
                            )}
                            <span>{student.name}</span>
                        </div>
                      </th>
                      <td className="px-6 py-4">{student.id}</td>
                      <td className="px-6 py-4">{student.grade}</td>
                      <td className="px-6 py-4">{student.authorizedGuardians.map(g => g.name).join(', ')}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button onClick={() => handleOpenModal(student)} className="p-2 text-indigo-600 hover:text-indigo-800 rounded-md hover:bg-indigo-50">
                          <PencilIcon className="w-5 h-5"/>
                        </button>
                        <button onClick={() => handleDelete(student)} className="p-2 text-red-600 hover:text-red-800 rounded-md hover:bg-red-50">
                          <TrashIcon className="w-5 h-5"/>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={5} className="text-center py-8 text-slate-500">No students found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      {isModalOpen && (
        <StudentFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={onSaveStudent}
          student={editingStudent}
        />
      )}
    </>
  );
};

export default StudentsPage;
