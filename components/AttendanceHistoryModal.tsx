import React from 'react';
import { AttendanceRecord } from '../types';
import StatusBadge from './StatusBadge';
import TimeStatusIndicator from './TimeStatusIndicator';
import { XCircleIcon } from './icons';

interface AttendanceHistoryModalProps {
  studentName: string;
  history: AttendanceRecord[];
  onClose: () => void;
}

const AttendanceHistoryModal: React.FC<AttendanceHistoryModalProps> = ({ studentName, history, onClose }) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-800">
            Attendance History for <span className="text-indigo-600">{studentName}</span>
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
             <XCircleIcon className="h-6 w-6"/>
          </button>
        </div>
        <div className="p-4 overflow-y-auto">
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm text-left text-slate-500">
              <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                <tr>
                  <th scope="col" className="px-4 py-3">Date</th>
                  <th scope="col" className="px-4 py-3">Status</th>
                  <th scope="col" className="px-4 py-3">Check-in</th>
                  <th scope="col" className="px-4 py-3">Check-out</th>
                  <th scope="col" className="px-4 py-3">Check-in Guardian</th>
                  <th scope="col" className="px-4 py-3">Check-out Guardian</th>
                </tr>
              </thead>
              <tbody>
                {history.length > 0 ? (
                  history.map(record => (
                    <tr key={record.id} className="bg-white border-b hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{formatDate(record.date)}</td>
                      <td className="px-4 py-3"><StatusBadge status={record.status} /></td>
                      <td className="px-4 py-3">
                        <TimeStatusIndicator time={record.checkInTime} type="check-in" />
                      </td>
                      <td className="px-4 py-3">
                        <TimeStatusIndicator time={record.checkOutTime} type="check-out" />
                      </td>
                      <td className="px-4 py-3">{record.checkInGuardian?.name || '—'}</td>
                      <td className="px-4 py-3">{record.checkOutGuardian?.name || '—'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500">
                      No historical records found for this student.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
         <div className="p-4 bg-slate-50 flex justify-end rounded-b-lg">
            <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceHistoryModal;