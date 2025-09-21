import React, { useState, useEffect, useMemo } from 'react';
import { Student, User, Role } from '../types';
import { getStudents, addStudent, updateStudent } from '../services/attendanceService';
import StudentFormModal from './StudentFormModal';
import { PlusIcon, PencilIcon, SearchIcon, UserCircleIcon } from './icons';

interface StudentsPageProps {
  currentUser: User;
}

const StudentsPage: React.FC<StudentsPageProps> = ({ currentUser }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  
  const canPerformActions = currentUser.role === Role.SUPER_ADMIN || currentUser.role === Role.ADMIN_STAFF;

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      let allStudents = await getStudents();
      if (currentUser.role === Role.TEACHER) {
        allStudents = allStudents.filter(s => s.grade === currentUser.grade);
      }
      setStudents(allStudents);
    } catch (error) {
      console.error("Failed to fetch students:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [currentUser]);

  const filteredStudents = useMemo(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    return students.filter(student =>
      student.name.toLowerCase().includes(lowercasedFilter) ||
      student.id.toLowerCase().includes(lowercasedFilter) ||
      String(student.grade).includes(lowercasedFilter)
    );
  }, [students, searchTerm]);

  const handleOpenModal = (student: Student | null = null) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
  };

  const handleSubmitForm = async (studentData: Omit<Student, 'id'> | Student) => {
    try {
      if ('id' in studentData) {
        await updateStudent(studentData.id, studentData);
      } else {
        await addStudent(studentData);
      }
      await fetchStudents(); // Refresh list
    } catch (error) {
      console.error("Failed to save student:", error);
      alert("Error saving student. Please try again.");
    }
  };

  return (
    <>
      <main className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">Student Management</h2>
            <p className="text-slate-500 mt-1">View, add, or edit student information.</p>
          </div>
          {canPerformActions && (
            <button onClick={() => handleOpenModal()} className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
              <PlusIcon className="w-5 h-5" />
              <span>Add New Student</span>
            </button>
          )}
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
                  <th scope="col" className="px-6 py-3">Student Name</th>
                  <th scope="col" className="px-6 py-3">Student ID</th>
                  <th scope="col" className="px-6 py-3">Grade</th>
                  <th scope="col" className="px-6 py-3">Authorized Guardians</th>
                  {canPerformActions && <th scope="col" className="px-6 py-3"><span className="sr-only">Edit</span></th>}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={5} className="text-center py-8">Loading students...</td></tr>
                ) : filteredStudents.length > 0 ? (
                  filteredStudents.map(student => (
                    <tr key={student.id} className="bg-white border-b hover:bg-slate-50">
                      <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          {student.photoUrl ? (
                            <img src={student.photoUrl} alt={student.name} className="h-10 w-10 rounded-full object-cover"/>
                          ) : (
                            <UserCircleIcon className="h-10 w-10 text-slate-300"/>
                          )}
                          <span>{student.name}</span>
                        </div>
                      </th>
                      <td className="px-6 py-4">{student.id}</td>
                      <td className="px-6 py-4">{student.grade}</td>
                      <td className="px-6 py-4">{student.authorizedGuardians.map(g => g.name).join(', ')}</td>
                      {canPerformActions && (
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleOpenModal(student)} className="font-medium text-indigo-600 hover:text-indigo-800 p-2 rounded-md hover:bg-indigo-50">
                            <PencilIcon className="w-5 h-5"/>
                          </button>
                        </td>
                      )}
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
          onSubmit={handleSubmitForm}
          student={editingStudent}
        />
      )}
    </>
  );
};

export default StudentsPage;
