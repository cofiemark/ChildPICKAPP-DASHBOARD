import React, { useState, useMemo } from 'react';
// FIX: Corrected import path for types
import { AttendanceRecord } from '../types';
import StatusBadge from './StatusBadge';
import AttendanceHistoryModal from './AttendanceHistoryModal';
import TimeStatusIndicator from './TimeStatusIndicator';
// FIX: Corrected import path for icons
import { PhoneIcon, ClipboardListIcon, ClockIcon, UserCircleIcon, ArrowLeftIcon, CalendarDaysIcon } from './icons';

interface StudentProfileProps {
  studentId: string | null;
  records: AttendanceRecord[];
  onBack: () => void;
}

const DetailItem: React.FC<{ label: string; value: string | React.ReactNode }> = ({ label, value }) => (
    <div>
        <p className="text-sm text-slate-500">{label}</p>
        <div className="font-semibold text-slate-800">{value}</div>
    </div>
);

const StudentProfile: React.FC<StudentProfileProps> = ({ studentId, records, onBack }) => {
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  
  const studentHistory = useMemo(() => {
    if (!studentId) return [];
    return records
        .filter(r => r.student.id === studentId)
        .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [studentId, records]);

  const latestRecord = studentHistory[0] || null;

  if (!latestRecord) {
    return (
        <main className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
            <button onClick={onBack} className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800 font-semibold mb-4">
                <ArrowLeftIcon className="w-5 h-5" />
                <span>Back to Dashboard</span>
            </button>
            <div className="text-center py-12">
                <p className="text-slate-500">Student data not found.</p>
            </div>
        </main>
    );
  }

  const { student, status, checkInTime, checkOutTime, checkInGuardian, checkOutGuardian } = latestRecord;

  return (
    <>
        <main className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
            <div className="mb-6">
                <button onClick={onBack} className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800 font-semibold">
                    <ArrowLeftIcon className="w-5 h-5" />
                    <span>Back to Dashboard</span>
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b bg-slate-50">
                    <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                        {student.photoUrl ? (
                            <img src={student.photoUrl} alt={student.name} className="h-24 w-24 rounded-full object-cover ring-4 ring-white" />
                        ) : (
                            <div className="h-24 w-24 rounded-full bg-slate-200 flex items-center justify-center ring-4 ring-white">
                                <UserCircleIcon className="h-20 w-20 text-slate-400" />
                            </div>
                        )}
                        <div className="flex-grow text-center sm:text-left">
                            <div className="flex flex-col sm:flex-row justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800">{student.name}</h2>
                                    <p className="text-md text-slate-500">Student ID: {student.id} &bull; Grade: {student.grade}</p>
                                </div>
                                <div className="mt-2 sm:mt-0">
                                    <StatusBadge status={status} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <DetailItem label="Most Recent Check-in" value={<TimeStatusIndicator time={checkInTime} type="check-in" />} />
                        <DetailItem label="Most Recent Check-out" value={<TimeStatusIndicator time={checkOutTime} type="check-out" />} />
                        <DetailItem label="Check-in Guardian" value={checkInGuardian?.name || 'N/A'} />
                        <DetailItem label="Check-out Guardian" value={checkOutGuardian?.name || 'N/A'} />
                    </div>
                    
                    <div className="space-y-4">
                        <div className="p-4 bg-slate-50 rounded-lg">
                            <h4 className="flex items-center font-semibold text-slate-700 mb-2">
                                <PhoneIcon className="h-5 w-5 mr-2 text-slate-500"/>
                                Guardian Contact
                            </h4>
                            {checkInGuardian && (
                                <p className="text-sm text-slate-600">
                                   <strong>In:</strong> {checkInGuardian.name} &bull; {checkInGuardian.phone}
                                </p>
                            )}
                             {checkOutGuardian && (
                                <p className="text-sm text-slate-600 mt-1">
                                   <strong>Out:</strong> {checkOutGuardian.name} &bull; {checkOutGuardian.phone}
                                </p>
                            )}
                            {!checkInGuardian && !checkOutGuardian && (
                                 <p className="text-sm text-slate-600">No guardian information available for this record.</p>
                            )}
                        </div>

                        <div className="p-4 bg-slate-50 rounded-lg">
                            <div className="flex justify-between items-center">
                                <h4 className="flex items-center font-semibold text-slate-700">
                                    <ClockIcon className="h-5 w-5 mr-2 text-slate-500"/>
                                    Attendance History
                                </h4>
                                <button
                                    onClick={() => setIsHistoryModalOpen(true)}
                                    className="flex items-center space-x-2 px-3 py-1.5 bg-white border border-slate-300 text-sm font-semibold text-slate-700 rounded-lg hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"
                                >
                                    <CalendarDaysIcon className="h-4 w-4" />
                                    <span>View Full History</span>
                                </button>
                            </div>
                            <p className="text-sm text-slate-600 mt-2">
                                Showing the most recent record. Click to view all historical data for this student.
                            </p>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-lg">
                            <h4 className="flex items-center font-semibold text-slate-700 mb-2">
                                <ClipboardListIcon className="h-5 w-5 mr-2 text-slate-500"/>
                                Notes (Placeholder)
                            </h4>
                            <p className="text-sm text-slate-600">
                                {student.notes || 'No notes for this student.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
        {isHistoryModalOpen && (
            <AttendanceHistoryModal
                studentName={student.name}
                history={studentHistory}
                onClose={() => setIsHistoryModalOpen(false)}
            />
        )}
    </>
  );
};

export default StudentProfile;
