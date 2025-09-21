import React, { useState, useMemo } from 'react';
// FIX: Corrected import path for types
import { User, AttendanceRecord, Student, AttendanceStatus } from '../types';
// FIX: Corrected import path for icons
import { DocumentTextIcon } from './icons';

interface ReportsPageProps {
  currentUser: User;
  allRecords: AttendanceRecord[];
}

// --- Helper Functions ---
const getISOMonth = (date: Date) => date.toISOString().slice(0, 7); // YYYY-MM
const getISODate = (date: Date) => date.toISOString().split('T')[0]; // YYYY-MM-DD

// --- Report Components ---

const DailyAbsenteeism: React.FC<{ records: AttendanceRecord[] }> = ({ records }) => {
    const [selectedDate, setSelectedDate] = useState(getISODate(new Date()));
  
    const absentStudents = useMemo(() => {
      return records.filter(r => getISODate(r.date) === selectedDate && r.status === AttendanceStatus.ABSENT)
        .map(r => r.student)
        .sort((a, b) => a.name.localeCompare(b.name));
    }, [records, selectedDate]);
  
    return (
      <div className="bg-white p-6 rounded-lg shadow-md report-card">
        <h3 className="text-xl font-bold text-slate-800">Daily Absenteeism Breakdown</h3>
        <p className="text-slate-500 mb-4">Lists all students marked as absent on a specific day.</p>
        <div className="flex items-center gap-4 mb-4">
          <label htmlFor="absent-date" className="font-semibold text-slate-700">Select Date:</label>
          <input
            type="date"
            id="absent-date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div id="absenteeism-report">
            <h4 className="font-bold text-lg mb-2 text-center">Absenteeism Report for {new Date(selectedDate + 'T00:00:00').toLocaleDateString()}</h4>
            {absentStudents.length > 0 ? (
                <ul className="divide-y divide-slate-200">
                {absentStudents.map(student => (
                    <li key={student.id} className="py-2 flex justify-between">
                    <span>{student.name}</span>
                    <span className="text-slate-500">ID: {student.id} / Grade: {student.grade}</span>
                    </li>
                ))}
                </ul>
            ) : (
                <p className="text-center py-4 text-slate-500">No students were marked absent on this day.</p>
            )}
        </div>
      </div>
    );
};

const MonthlyPerfectAttendance: React.FC<{ records: AttendanceRecord[], students: Student[] }> = ({ records, students }) => {
    const [selectedMonth, setSelectedMonth] = useState(getISOMonth(new Date()));
  
    const perfectAttendanceStudents = useMemo(() => {
      const recordsForMonth = records.filter(r => getISOMonth(r.date) === selectedMonth);
      
      const schoolDays = [...new Set(recordsForMonth.map(r => getISODate(r.date)))];
      if (schoolDays.length === 0) return [];

      const studentAttendance = new Map<string, Set<string>>();

      recordsForMonth.forEach(record => {
        if (record.status === AttendanceStatus.PRESENT || record.status === AttendanceStatus.CHECKED_OUT) {
          if (!studentAttendance.has(record.student.id)) {
            studentAttendance.set(record.student.id, new Set());
          }
          studentAttendance.get(record.student.id)!.add(getISODate(record.date));
        }
      });
      
      const perfectStudents: Student[] = [];
      students.forEach(student => {
        const attendedDays = studentAttendance.get(student.id);
        if (attendedDays && attendedDays.size === schoolDays.length) {
          perfectStudents.push(student);
        }
      });

      return perfectStudents.sort((a, b) => a.name.localeCompare(b.name));
    }, [records, students, selectedMonth]);

    return (
      <div className="bg-white p-6 rounded-lg shadow-md report-card">
        <h3 className="text-xl font-bold text-slate-800">Monthly Perfect Attendance</h3>
        <p className="text-slate-500 mb-4">Finds students who were present every school day of a selected month.</p>
        <div className="flex items-center gap-4 mb-4">
            <label htmlFor="perfect-month" className="font-semibold text-slate-700">Select Month:</label>
            <input
                type="month"
                id="perfect-month"
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
        </div>
         <div id="perfect-attendance-report">
            <h4 className="font-bold text-lg mb-2 text-center">Perfect Attendance for {new Date(selectedMonth + '-02').toLocaleString('default', { month: 'long', year: 'numeric' })}</h4>
            {perfectAttendanceStudents.length > 0 ? (
                <ul className="divide-y divide-slate-200">
                {perfectAttendanceStudents.map(student => (
                    <li key={student.id} className="py-2 flex justify-between">
                    <span>{student.name}</span>
                    <span className="text-slate-500">ID: {student.id} / Grade: {student.grade}</span>
                    </li>
                ))}
                </ul>
            ) : (
                <p className="text-center py-4 text-slate-500">No students achieved perfect attendance this month.</p>
            )}
        </div>
      </div>
    );
};


// --- Main Page Component ---
const ReportsPage: React.FC<ReportsPageProps> = ({ currentUser, allRecords }) => {
    
    // Role-based record filtering
    const recordsForUser = useMemo(() => {
        if (currentUser.role === 'Teacher') {
        return allRecords.filter(record => record.student.grade === currentUser.grade);
        }
        return allRecords;
    }, [allRecords, currentUser]);

    const allStudentsForUser = useMemo(() => {
        const studentMap = new Map<string, Student>();
        recordsForUser.forEach(record => {
            studentMap.set(record.student.id, record.student);
        });
        return Array.from(studentMap.values());
    }, [recordsForUser]);
    
    const handlePrint = () => {
        const printableContent = document.querySelector('.printable-area')?.innerHTML;
        if (printableContent) {
            const originalContent = document.body.innerHTML;
            document.body.innerHTML = printableContent;
            window.print();
            document.body.innerHTML = originalContent;
            // We need to re-attach the React app to the root after printing
            window.location.reload();
        }
    }
  
    return (
      <main className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h2 className="text-3xl font-bold text-slate-800">Attendance Reports</h2>
                <p className="text-slate-500 mt-1">Generate and export pre-built attendance reports.</p>
            </div>
            <button
                onClick={() => window.print()}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
            >
                <DocumentTextIcon className="w-5 h-5" />
                <span>Export Page to PDF</span>
            </button>
        </div>
        
        <div className="space-y-8 printable-area">
          <DailyAbsenteeism records={recordsForUser} />
          <MonthlyPerfectAttendance records={recordsForUser} students={allStudentsForUser} />
        </div>
      </main>
    );
};

export default ReportsPage;
