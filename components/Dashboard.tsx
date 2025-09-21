import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { updateAttendance, getAttendanceRecords } from '../services/attendanceService';
import { AttendanceRecord, AttendanceStatus, Student, User, Role } from '../types';
import StatCard from './StatCard';
import AttendanceTable from './AttendanceTable';
import ManualEntryModal from './ManualEntryModal';
import LateArrivalNotification from './LateArrivalNotification';
import StudentProfile from './StudentProfile';
import AttendanceChart from './AttendanceChart';
import StatDetailsModal from './StatDetailsModal';
import { UsersIcon, CheckCircleIcon, XCircleIcon, LogoutIcon, PlusIcon, ArrowDownTrayIcon } from './icons';

interface DashboardProps {
    currentUser: User;
    allRecords: AttendanceRecord[];
    setAllRecords: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
}

const Dashboard: React.FC<DashboardProps> = ({ currentUser, allRecords, setAllRecords }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lateStudents, setLateStudents] = useState<Student[]>([]);
  const [showLateNotification, setShowLateNotification] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isStatModalOpen, setIsStatModalOpen] = useState(false);
  const [statModalData, setStatModalData] = useState<{ title: string; students: Student[] }>({ title: '', students: [] });

  const todayStr = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);

  // Role-based record filtering
  const recordsForUser = useMemo(() => {
    if (currentUser.role === Role.TEACHER) {
      return allRecords.filter(record => record.student.grade === currentUser.grade);
    }
    return allRecords; // Admins see all
  }, [allRecords, currentUser]);

  const todayRecords = useMemo(() => {
    return recordsForUser.filter(r => r.date.toDateString() === new Date().toDateString());
  }, [recordsForUser]);

  useEffect(() => {
    const now = new Date();
    if (now.getHours() >= 9) {
        const absentStudents = todayRecords
            .filter(r => r.status === AttendanceStatus.ABSENT)
            .map(r => r.student);
        setLateStudents(absentStudents);
    }
  }, [todayRecords]);
  
  const dateFilteredRecords = useMemo(() => {
    if (!startDate || !endDate) return recordsForUser;
    const start = new Date(startDate);
    start.setHours(0,0,0,0);
    const end = new Date(endDate);
    end.setHours(23,59,59,999);
    return recordsForUser.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= start && recordDate <= end;
    });
  }, [recordsForUser, startDate, endDate]);

  const stats = useMemo(() => {
    const present = todayRecords.filter(r => r.status === AttendanceStatus.PRESENT).length;
    const checkedOut = todayRecords.filter(r => r.status === AttendanceStatus.CHECKED_OUT).length;
    const absent = todayRecords.filter(r => r.status === AttendanceStatus.ABSENT).length;
    const total = todayRecords.length;
    return { present, checkedOut, absent, total };
  }, [todayRecords]);

  const handleManualSubmit = async (studentId: string, guardianName: string, action: 'check-in' | 'check-out') => {
    try {
      await updateAttendance(studentId, guardianName, action);
      const updatedRecords = await getAttendanceRecords();
      setAllRecords(updatedRecords);
    } catch (err: any) {
        throw err;
    }
  };

  const handleStatCardClick = (type: 'Total' | AttendanceStatus) => {
    let title = '';
    let students: Student[] = [];

    switch (type) {
        case 'Total':
            title = 'Total Students for Today';
            students = todayRecords.map(r => r.student);
            break;
        case AttendanceStatus.PRESENT:
            title = 'Present Students';
            students = todayRecords.filter(r => r.status === AttendanceStatus.PRESENT).map(r => r.student);
            break;
        case AttendanceStatus.CHECKED_OUT:
            title = 'Checked Out Students';
            students = todayRecords.filter(r => r.status === AttendanceStatus.CHECKED_OUT).map(r => r.student);
            break;
        case AttendanceStatus.ABSENT:
            title = 'Absent Students';
            students = todayRecords.filter(r => r.status === AttendanceStatus.ABSENT).map(r => r.student);
            break;
    }
    
    setStatModalData({ title, students: students.sort((a,b) => a.name.localeCompare(b.name)) });
    setIsStatModalOpen(true);
};
  
  const handleExportCSV = () => {
    if (dateFilteredRecords.length === 0) {
      alert("No data to export for the selected date range.");
      return;
    }
    const headers = ["Student ID", "Student Name", "Grade", "Status", "Check-in Time", "Check-out Time", "Check-in Guardian", "Check-out Guardian"];
    const escapeCsvValue = (value: any): string => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      return `"${str.replace(/"/g, '""')}"`;
    };
    const formatTimeForCsv = (date: Date | null) => date ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '';
    const csvRows = dateFilteredRecords.map(record => [
      escapeCsvValue(record.student.id), escapeCsvValue(record.student.name), escapeCsvValue(record.student.grade),
      escapeCsvValue(record.status), formatTimeForCsv(record.checkInTime),
      formatTimeForCsv(record.checkOutTime), escapeCsvValue(record.checkInGuardian?.name), escapeCsvValue(record.checkOutGuardian?.name),
    ].join(','));
    const csvString = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance_report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (allRecords.length === 0) return <div className="text-center p-8">Loading dashboard...</div>;
  
  if (selectedStudentId) return <StudentProfile studentId={selectedStudentId} records={recordsForUser} onBack={() => setSelectedStudentId(null)} />;

  const canPerformActions = currentUser.role === Role.SUPER_ADMIN || currentUser.role === Role.ADMIN_STAFF;

  return (
    <main className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h2 className="text-3xl font-bold text-slate-800">Today's Overview</h2>
                <p className="text-slate-500 mt-1">
                  {currentUser.role === Role.TEACHER ? `Viewing attendance for Grade ${currentUser.grade}.` : 'A summary of student attendance for today.'}
                </p>
            </div>
            {canPerformActions && (
                <div className="flex items-center space-x-2">
                    <button onClick={handleExportCSV} className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        <span>Export to CSV</span>
                    </button>
                    <button onClick={() => setIsModalOpen(true)} className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
                        <PlusIcon className="w-5 h-5" />
                        <span>Manual Entry</span>
                    </button>
                </div>
            )}
        </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div onClick={() => handleStatCardClick('Total')} className="cursor-pointer transition-transform transform hover:scale-105">
          <StatCard icon={<UsersIcon className="w-6 h-6 text-indigo-500" />} title="Total Students" value={stats.total} color="bg-indigo-100" />
        </div>
        <div onClick={() => handleStatCardClick(AttendanceStatus.PRESENT)} className="cursor-pointer transition-transform transform hover:scale-105">
          <StatCard icon={<CheckCircleIcon className="w-6 h-6 text-emerald-500" />} title="Present" value={stats.present} color="bg-emerald-100" />
        </div>
        <div onClick={() => handleStatCardClick(AttendanceStatus.CHECKED_OUT)} className="cursor-pointer transition-transform transform hover:scale-105">
          <StatCard icon={<LogoutIcon className="w-6 h-6 text-sky-500" />} title="Checked Out" value={stats.checkedOut} color="bg-sky-100" />
        </div>
        <div onClick={() => handleStatCardClick(AttendanceStatus.ABSENT)} className="cursor-pointer transition-transform transform hover:scale-105">
          <StatCard icon={<XCircleIcon className="w-6 h-6 text-slate-500" />} title="Absent" value={stats.absent} color="bg-slate-200" />
        </div>
      </div>

      <LateArrivalNotification lateStudents={lateStudents} onDismiss={() => setShowLateNotification(false)} isVisible={showLateNotification} />
      
      <AttendanceChart trendRecords={recordsForUser} overviewRecords={dateFilteredRecords} />

      <div>
        <h3 className="text-2xl font-bold text-slate-800 mb-1">Attendance Records</h3>
        <p className="text-slate-500 mb-4">Click on a row to view student details. Use the date filters to view historical data.</p>
        <AttendanceTable 
            records={dateFilteredRecords} 
            onRowClick={(studentId) => setSelectedStudentId(studentId)}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
        />
      </div>

      <ManualEntryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleManualSubmit} />
      <StatDetailsModal 
        isOpen={isStatModalOpen}
        onClose={() => setIsStatModalOpen(false)}
        title={statModalData.title}
        students={statModalData.students}
      />
    </main>
  );
};

export default Dashboard;