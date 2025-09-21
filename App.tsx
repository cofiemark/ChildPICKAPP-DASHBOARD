import React, { useState, useEffect } from 'react';
import { User, AttendanceRecord, Student, AuditLog } from './types';
import { getAttendanceRecords, manualCheckInCheckOut, getStudents, saveStudent as apiSaveStudent, deleteStudent as apiDeleteStudent, getUsers, saveUser as apiSaveUser, deleteUser as apiDeleteUser } from './services/attendanceService';
import { getAuditLogs } from './services/auditLogService';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import StudentsPage from './components/StudentsPage';
import ReportsPage from './components/ReportsPage';
import UserManagementPage from './components/UserManagementPage';
import AuditLogPage from './components/AuditLogPage';
import LoginPage from './components/LoginPage';
import StudentProfile from './components/StudentProfile';
import ToastContainer from './components/ToastContainer';
import { useToast } from './contexts/ToastContext';

export type Page = 'Dashboard' | 'Students' | 'Reports' | 'Users' | 'Audit Log' | 'StudentProfile';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('Dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { addToast } = useToast();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        // In a real app, you'd validate the token with a backend
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);

      const [recordsData, studentsData, usersData, auditLogsData] = await Promise.all([
        getAttendanceRecords(thirtyDaysAgo, today),
        getStudents(),
        getUsers(),
        getAuditLogs(),
      ]);
      setRecords(recordsData);
      setStudents(studentsData);
      setUsers(usersData);
      setAuditLogs(auditLogsData);
    } catch (error) {
      console.error("Failed to load data", error);
      addToast('Failed to load initial data.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('Dashboard');
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
  };

  const handleManualEntry = async (studentId: string, guardianName: string, action: 'check-in' | 'check-out'): Promise<void> => {
    await manualCheckInCheckOut(studentId, guardianName, action);
    addToast(`Successfully recorded ${action} for student ${studentId}.`, 'success');
    await loadData(); // Refresh data
  };

  const handleSaveStudent = async (studentData: Omit<Student, 'id'> | Student) => {
    await apiSaveStudent(studentData);
    await loadData();
  };
  
  const handleDeleteStudent = async (studentId: string) => {
    await apiDeleteStudent(studentId);
    await loadData();
  };
  
  const handleSaveUser = async (userData: Omit<User, 'id'> | User) => {
    await apiSaveUser(userData);
    await loadData();
  };

  const handleDeleteUser = async (userId: string) => {
    await apiDeleteUser(userId);
    await loadData();
  };

  const handleRowClick = (studentId: string) => {
    setSelectedStudentId(studentId);
    setCurrentPage('StudentProfile');
  };
  
  const handleBackToDashboard = () => {
    setSelectedStudentId(null);
    setCurrentPage('Dashboard');
  };

  if (!user) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'Dashboard':
        return <Dashboard records={records} onRowClick={handleRowClick} onManualEntry={handleManualEntry} />;
      case 'Students':
        return <StudentsPage allStudents={students} onSaveStudent={handleSaveStudent} onDeleteStudent={handleDeleteStudent} />;
      case 'StudentProfile':
        return <StudentProfile studentId={selectedStudentId} records={records} onBack={handleBackToDashboard} />;
      case 'Reports':
        return <ReportsPage currentUser={user} allRecords={records} />;
      case 'Users':
        return <UserManagementPage allUsers={users} onSaveUser={handleSaveUser} onDeleteUser={handleDeleteUser} />;
      case 'Audit Log':
        return <AuditLogPage auditLogs={auditLogs} />;
      default:
        return <Dashboard records={records} onRowClick={handleRowClick} onManualEntry={handleManualEntry} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar user={user} currentPage={currentPage} setCurrentPage={setCurrentPage} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-x-hidden overflow-y-auto">
          {isLoading ? <div className="p-8 text-center">Loading data...</div> : renderPage()}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default App;
