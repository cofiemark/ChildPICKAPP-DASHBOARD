import React, { useState } from 'react';
import { User, Role } from '../types';
import { Page } from '../App';
import { Cog6ToothIcon, ArrowLeftOnRectangleIcon, ChartBarIcon, UsersIcon, ShieldCheckIcon, DocumentMagnifyingGlassIcon, IdentificationIcon, XCircleIcon } from './icons';
import SettingsModal from './SettingsModal';

interface SidebarProps {
  user: User;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  onLogout: () => void;
}

const NavLink: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
      isActive
        ? 'bg-slate-900 text-white'
        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const Sidebar: React.FC<SidebarProps> = ({ user, currentPage, setCurrentPage, onLogout }) => {
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    
    const navItems = [
        { label: 'Dashboard', icon: <ChartBarIcon className="w-5 h-5" />, page: 'Dashboard', roles: [Role.ADMIN, Role.TEACHER, Role.STAFF] },
        { label: 'Students', icon: <IdentificationIcon className="w-5 h-5" />, page: 'Students', roles: [Role.ADMIN, Role.TEACHER] },
        { label: 'User Management', icon: <UsersIcon className="w-5 h-5" />, page: 'Users', roles: [Role.ADMIN] },
        { label: 'Reports', icon: <DocumentMagnifyingGlassIcon className="w-5 h-5" />, page: 'Reports', roles: [Role.ADMIN, Role.TEACHER] },
        { label: 'Audit Log', icon: <ShieldCheckIcon className="w-5 h-5" />, page: 'Audit Log', roles: [Role.ADMIN] },
    ];
    
    const accessibleNavItems = navItems.filter(item => item.roles.includes(user.role));

  return (
    <>
    <aside className="w-64 bg-slate-800 text-white flex flex-col flex-shrink-0">
      <div className="h-16 flex items-center justify-center px-4 border-b border-slate-900">
        <img src="https://placehold.co/100x100/ffffff/1e293b?text=Logo" alt="ChildPICK APP Logo" className="w-8 h-8 object-contain mr-2" />
        <span className="text-xl font-semibold">ChildPICK APP®</span>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-2">
       {accessibleNavItems.map(item => (
            <NavLink
                key={item.label}
                icon={item.icon}
                label={item.label}
                isActive={currentPage === item.page}
                onClick={() => setCurrentPage(item.page as Page)}
            />
       ))}
      </nav>
      <div className="px-4 py-4 border-t border-slate-900 space-y-2">
        <div className="flex items-center space-x-3 p-2">
            <img src={user.avatarUrl || `https://i.pravatar.cc/150?u=${user.id}`} alt={user.name} className="h-10 w-10 rounded-full" />
            <div>
                <p className="font-semibold text-sm">{user.name}</p>
                <p className="text-xs text-slate-400">{user.role}{user.role === Role.TEACHER && ` (Grade ${user.grade})`}</p>
            </div>
        </div>
        <NavLink
            icon={<Cog6ToothIcon className="w-5 h-5" />}
            label="Settings"
            isActive={isSettingsModalOpen}
            onClick={() => setIsSettingsModalOpen(true)}
        />
        <NavLink
          icon={<ArrowLeftOnRectangleIcon className="w-5 h-5" />}
          label="Logout"
          isActive={false}
          onClick={onLogout}
        />
      </div>
    </aside>
    <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
    </>
  );
};

export default Sidebar;