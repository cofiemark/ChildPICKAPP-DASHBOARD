import React, { useState, useMemo, useEffect } from 'react';
import { AttendanceRecord, AttendanceStatus, Student } from '../types';
import StatCard from './StatCard';
import AttendanceTable from './AttendanceTable';
import ManualEntryModal from './ManualEntryModal';
import LateArrivalNotification from './LateArrivalNotification';
import StatDetailsModal from './StatDetailsModal';
import AttendanceChart from './AttendanceChart';
import { UsersIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from './icons';

interface DashboardProps {
  records: AttendanceRecord[];
  onRowClick: (studentId: string) => void;
  onManualEntry: (studentId: string, guardianName: string, action: 'check-in' | 'check-out') => Promise<void>;
}

const getISODate = (date: Date) => date.toISOString().split('T')[0];

const Dashboard: React.FC<DashboardProps> = ({ records, onRowClick, onManualEntry }) => {
  const [isManualEntryModalOpen, setManualEntryModalOpen] = useState(false);
  const [isStatDetailsModalOpen, setStatDetailsModalOpen] = useState(false);
  const [statModalContent, setStatModalContent] = useState<{ title: string; students: Student[] }>({ title: '', students: [] });
  const [isLateNotificationVisible, setLateNotificationVisible] = useState(true);
  
  const today = new Date();
  const todayStr = getISODate(today);
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);
  
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);

  const filteredRecords = useMemo(() => {
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T23:59:59');
    return records.filter(r => {
      const recordDate = new Date(r.date);
      return recordDate >= start && recordDate <= end;
    });
  }, [records, startDate, endDate]);

  const trendRecords = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7);
    return records.filter(r => r.date >= start && r.date <= end);
  }, [records]);

  const stats = useMemo(() => {
    const todayRecords = records.filter(r => getISODate(r.date) === todayStr);
    const present = todayRecords.filter(r => r.status === AttendanceStatus.PRESENT || r.status === AttendanceStatus.CHECKED_OUT);
    const absent = todayRecords.filter(r => r.status === AttendanceStatus.ABSENT);
    const totalStudents = new Set(todayRecords.map(r => r.student.id)).size;
    
    // Using 9:00 AM as the late threshold for this calculation
    const lateArrivals = present.filter(r => r.checkInTime && r.checkInTime.getHours() >= 9);

    return {
      total: totalStudents,
      present: present.length,
      absent: absent.length,
      late: lateArrivals.length,
      presentStudents: present.map(r => r.student),
      absentStudents: absent.map(r => r.student),
      lateStudents: lateArrivals.map(r => r.student)
    };
  }, [records, todayStr]);

  const handleStatCardClick = (title: string, students: Student[]) => {
    setStatModalContent({ title, students });
    setStatDetailsModalOpen(true);
  };
  
  return (
    <>
      <main className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">Attendance Dashboard</h2>
            <p className="text-slate-500 mt-1">Today's summary and attendance records.</p>
          </div>
          <button
            onClick={() => setManualEntryModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
          >
            <span>Manual Entry</span>
          </button>
        </div>

        {stats.lateStudents.length > 0 && (
          <LateArrivalNotification 
            lateStudents={stats.lateStudents} 
            onDismiss={() => setLateNotificationVisible(false)}
            isVisible={isLateNotificationVisible}
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <button onClick={() => handleStatCardClick('Total Students Today', [...stats.presentStudents, ...stats.absentStudents])}>
            <StatCard icon={<UsersIcon className="h-6 w-6 text-indigo-50" />} title="Total Students" value={stats.total} color="bg-indigo-500" />
          </button>
          <button onClick={() => handleStatCardClick('Present Students', stats.presentStudents)}>
            <StatCard icon={<CheckCircleIcon className="h-6 w-6 text-emerald-50" />} title="Present" value={`${stats.present} (${stats.total > 0 ? Math.round((stats.present/stats.total)*100) : 0}%)`} color="bg-emerald-500" />
          </button>
          <button onClick={() => handleStatCardClick('Absent Students', stats.absentStudents)}>
            <StatCard icon={<XCircleIcon className="h-6 w-6 text-rose-50" />} title="Absent" value={stats.absent} color="bg-rose-500" />
          </button>
          <button onClick={() => handleStatCardClick('Late Arrivals', stats.lateStudents)}>
            <StatCard icon={<ClockIcon className="h-6 w-6 text-amber-50" />} title="Late Arrivals" value={stats.late} color="bg-amber-500" />
          </button>
        </div>
        
        <AttendanceChart trendRecords={trendRecords} overviewRecords={filteredRecords} />

        <AttendanceTable 
          records={filteredRecords} 
          onRowClick={onRowClick} 
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
        />
      </main>
      
      <ManualEntryModal 
        isOpen={isManualEntryModalOpen}
        onClose={() => setManualEntryModalOpen(false)}
        onSubmit={onManualEntry}
      />
      <StatDetailsModal 
        isOpen={isStatDetailsModalOpen}
        onClose={() => setStatDetailsModalOpen(false)}
        title={statModalContent.title}
        students={statModalContent.students}
      />
    </>
  );
};

export default Dashboard;
