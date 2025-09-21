import React from 'react';
import { User, AppView } from '../types';
import { 
    HomeIcon, 
    UsersGroupIcon, 
    ChartBarIcon, 
    Cog6ToothIcon, 
    LogoutIcon,
    UserCircleIcon
} from './icons';

interface SidebarProps {
  user: User;
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onLogout: () => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <li>
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`flex items-center p-2 rounded-lg transition-colors duration-200 ${
        isActive
          ? 'bg-indigo-100 text-indigo-700 font-semibold'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      {icon}
      <span className="ml-3">{label}</span>
    </a>
  </li>
);

const Sidebar: React.FC<SidebarProps> = ({ user, currentView, onNavigate, onLogout }) => {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
      <div className="flex items-center justify-center h-16 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-indigo-600">RFID Attend</h1>
      </div>
      <div className="flex-grow p-4">
        <ul className="space-y-2">
          <NavItem 
            icon={<HomeIcon className="w-6 h-6" />} 
            label="Dashboard" 
            isActive={currentView === 'dashboard'} 
            onClick={() => onNavigate('dashboard')} 
          />
          <NavItem 
            icon={<UsersGroupIcon className="w-6 h-6" />} 
            label="Students" 
            isActive={currentView === 'students'} 
            onClick={() => onNavigate('students')} 
          />
          <NavItem 
            icon={<ChartBarIcon className="w-6 h-6" />} 
            label="Reports" 
            isActive={currentView === 'reports'} 
            onClick={() => onNavigate('reports')} 
          />
           <NavItem 
            icon={<Cog6ToothIcon className="w-6 h-6" />} 
            label="Settings" 
            isActive={currentView === 'settings'} 
            onClick={() => onNavigate('settings')} 
          />
        </ul>
      </div>
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center mb-4">
          <UserCircleIcon className="w-10 h-10 text-slate-400" />
          <div className="ml-3">
            <p className="font-semibold text-slate-800">{user.name}</p>
            <p className="text-sm text-slate-500">{user.role}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center p-2 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
        >
          <LogoutIcon className="w-6 h-6" />
          <span className="ml-3 font-semibold">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
