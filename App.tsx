import React, { useState, useEffect } from 'react';
import { User, AppView, AttendanceRecord } from './types';
import { getUserFromToken, logout, getUsers, addUser, updateUser, deleteUser } from './services/authService';
import { getAttendanceRecords } from './services/attendanceService';
import { SettingsProvider } from './contexts/SettingsContext';
import { ToastProvider, useToast } from './contexts/ToastContext';
import ToastContainer from './components/ToastContainer';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import StudentsPage from './components/StudentsPage';
import ReportsPage from './components/ReportsPage';
import SettingsModal from './components/SettingsModal';
import LoginPage from './components/LoginPage';
import UserManagementPage from './components/UserManagementPage';

const AppContent: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [allRecords, setAllRecords] = useState<AttendanceRecord[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const { addToast } = useToast();

  const fetchData = async () => {
    try {
      const [records, users] = await Promise.all([getAttendanceRecords(), getUsers()]);
      setAllRecords(records);
      setAllUsers(users);
    } catch (error) {
      console.error("Failed to fetch initial data", error);
      addToast('Could not load app data. Please refresh.', 'error');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      const user = getUserFromToken(token);
      if (user) {
        setCurrentUser(user);
      }
    }
    setIsLoading(false);
  }, []);
  
  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    setAllRecords([]);
    setAllUsers([]);
  };
  
  const handleNavigate = (view: AppView) => {
      if (view === 'settings') {
          setIsSettingsOpen(true);
      } else {
          setCurrentView(view);
      }
  }
  
  const handleSaveUser = async (userData: Omit<User, 'id'> | User) => {
    if ('id' in userData) {
        await updateUser(userData.id, userData);
    } else {
        await addUser(userData);
    }
    await fetchData(); // Refresh users list
  };
  
  const handleDeleteUser = async (userId: string) => {
      await deleteUser(userId);
      await fetchData(); // Refresh users list
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard currentUser={currentUser!} allRecords={allRecords} setAllRecords={setAllRecords} />;
      case 'students':
        return <StudentsPage currentUser={currentUser!} />;
      case 'reports':
        return <ReportsPage currentUser={currentUser!} allRecords={allRecords} />;
      case 'user_management':
        return <UserManagementPage allUsers={allUsers} onSaveUser={handleSaveUser} onDeleteUser={handleDeleteUser} />;
      default:
        return <Dashboard currentUser={currentUser!} allRecords={allRecords} setAllRecords={setAllRecords} />;
    }
  };

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }
  
  return (
    <div className="bg-slate-50 min-h-screen">
      {!currentUser ? (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      ) : (
        <div className="flex">
          <Sidebar 
            user={currentUser} 
            currentView={currentView} 
            onNavigate={handleNavigate} 
            onLogout={handleLogout} 
          />
          <div className="flex-1 flex flex-col">
            <Header />
            <div className="flex-grow">
              {renderCurrentView()}
            </div>
          </div>
        </div>
      )}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};

const App: React.FC = () => {
    return (
        <SettingsProvider>
            <ToastProvider>
                <AppContent />
                <ToastContainer />
            </ToastProvider>
        </SettingsProvider>
    )
}

export default App;