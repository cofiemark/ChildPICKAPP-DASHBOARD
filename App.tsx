import React, { useState, useEffect } from 'react';
import { User, AppView, AttendanceRecord, Role } from './types';
import { login, loginWithSSO, getUserFromToken, logout as authLogout } from './services/authService';
import { getAttendanceRecords } from './services/attendanceService';
import LoginPage from './components/LoginPage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import StudentsPage from './components/StudentsPage';
import ReportsPage from './components/ReportsPage';
import SettingsModal from './components/SettingsModal';
import { SettingsProvider } from './contexts/SettingsContext';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [allRecords, setAllRecords] = useState<AttendanceRecord[]>([]);

  // Check for existing token on initial load
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

  // Fetch attendance records when user logs in
  useEffect(() => {
    const fetchRecords = async () => {
      if (currentUser) {
        try {
          const records = await getAttendanceRecords();
          setAllRecords(records);
        } catch (error) {
          console.error("Failed to fetch attendance records:", error);
        }
      }
    };
    fetchRecords();
  }, [currentUser]);


  const handleLogin = async (email: string, password: string) => {
    const { user, token } = await login(email, password);
    localStorage.setItem('authToken', token);
    setCurrentUser(user);
  };

  const handleSSOLogin = async (provider: 'google' | 'microsoft') => {
    const { user, token } = await loginWithSSO(provider);
    localStorage.setItem('authToken', token);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    authLogout();
    setCurrentUser(null);
    setCurrentView('dashboard');
    setAllRecords([]);
  };

  const handleNavigation = (view: AppView) => {
    if (view === 'settings') {
      setIsSettingsModalOpen(true);
    } else {
      setCurrentView(view);
    }
  };

  const renderCurrentView = () => {
    if (!currentUser) return null;
    
    switch (currentView) {
      case 'dashboard':
        return <Dashboard currentUser={currentUser} allRecords={allRecords} setAllRecords={setAllRecords} />;
      case 'students':
        return <StudentsPage currentUser={currentUser} />;
      case 'reports':
        // Admins can see reports, teachers cannot for this example
        if (currentUser.role === Role.TEACHER) {
          return <div className="p-8 text-center text-slate-500">You do not have permission to view reports.</div>;
        }
        return <ReportsPage currentUser={currentUser} allRecords={allRecords} />;
      default:
        return <Dashboard currentUser={currentUser} allRecords={allRecords} setAllRecords={setAllRecords} />;
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} onSSOLogin={handleSSOLogin} />;
  }
  
  return (
    <SettingsProvider>
      <div className="flex h-screen bg-slate-50">
        <Sidebar user={currentUser} currentView={currentView} onNavigate={handleNavigation} onLogout={handleLogout} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <div className="flex-1 overflow-x-hidden overflow-y-auto">
            {renderCurrentView()}
          </div>
        </div>
        <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
      </div>
    </SettingsProvider>
  );
};

export default App;
