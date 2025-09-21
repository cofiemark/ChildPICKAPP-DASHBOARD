import React, { useState, useMemo } from 'react';
// FIX: Corrected import path for types
import { AttendanceRecord } from '../types';
import StatusBadge from './StatusBadge';
import TimeStatusIndicator from './TimeStatusIndicator';
// FIX: Corrected import path for icons
import { SearchIcon, ChevronUpIcon, ChevronDownIcon } from './icons';

interface AttendanceTableProps {
  records: AttendanceRecord[];
  onRowClick: (studentId: string) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
}

type SortableColumn = 'studentName' | 'studentId' | 'grade' | 'checkIn' | 'checkOut' | 'status';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  key: SortableColumn;
  direction: SortDirection;
}

const AttendanceTable: React.FC<AttendanceTableProps> = ({ records, onRowClick, startDate, setStartDate, endDate, setEndDate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'studentName', direction: 'asc' });

  const requestSort = (key: SortableColumn) => {
    let direction: SortDirection = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const processedRecords = useMemo(() => {
    // Filtering
    const lowercasedFilter = searchTerm.toLowerCase();
    const filtered = lowercasedFilter
      ? records.filter(record =>
          record.student.name.toLowerCase().includes(lowercasedFilter) ||
          record.student.id.toLowerCase().includes(lowercasedFilter) ||
          (record.checkInGuardian && record.checkInGuardian.name.toLowerCase().includes(lowercasedFilter)) ||
          (record.checkOutGuardian && record.checkOutGuardian.name.toLowerCase().includes(lowercasedFilter))
        )
      : [...records];

    // Sorting
    filtered.sort((a, b) => {
      let aValue: string | number | Date | null = null;
      let bValue: string | number | Date | null = null;

      switch (sortConfig.key) {
        case 'studentName':
          aValue = a.student.name;
          bValue = b.student.name;
          break;
        case 'studentId':
          aValue = a.student.id;
          bValue = b.student.id;
          break;
        case 'grade':
            aValue = a.student.grade;
            bValue = b.student.grade;
            break;
        case 'status':
            aValue = a.status;
            bValue = b.status;
            break;
        case 'checkIn':
            aValue = a.checkInTime;
            bValue = b.checkInTime;
            break;
        case 'checkOut':
            aValue = a.checkOutTime;
            bValue = b.checkOutTime;
            break;
      }
      
      if (aValue === null) return 1;
      if (bValue === null) return -1;
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return filtered;
  }, [records, searchTerm, sortConfig]);

  const SortableHeader: React.FC<{ columnKey: SortableColumn; title: string; }> = ({ columnKey, title }) => {
    const isSorted = sortConfig.key === columnKey;
    return (
        <th scope="col" className="px-6 py-3">
            <button onClick={() => requestSort(columnKey)} className="flex items-center space-x-1 group">
                <span className="group-hover:text-slate-900">{title}</span>
                {isSorted ? (
                    sortConfig.direction === 'asc' ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />
                ) : (
                    <ChevronUpIcon className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
                )}
            </button>
        </th>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-slate-200 flex flex-wrap items-center gap-4 justify-between">
        <div className="relative flex-grow min-w-[250px]">
          <input
            type="text"
            placeholder="Search by student, ID, or guardian..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-slate-400" />
          </div>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
                <label htmlFor="startDate" className="text-sm font-medium text-slate-600 shrink-0">From:</label>
                <input 
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
            </div>
            <div className="flex items-center gap-2">
                <label htmlFor="endDate" className="text-sm font-medium text-slate-600 shrink-0">To:</label>
                <input 
                    type="date"
                    id="endDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
            </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500">
          <thead className="text-xs text-slate-700 uppercase bg-slate-100">
            <tr>
              <SortableHeader columnKey="studentName" title="Student Name" />
              <SortableHeader columnKey="studentId" title="Student ID" />
              <th scope="col" className="px-6 py-3">Check-in Guardian</th>
              <th scope="col" className="px-6 py-3">Check-out Guardian</th>
              <SortableHeader columnKey="checkIn" title="Check-in" />
              <SortableHeader columnKey="checkOut" title="Check-out" />
              <SortableHeader columnKey="status" title="Status" />
            </tr>
          </thead>
          <tbody>
            {processedRecords.length > 0 ? (
                processedRecords.map(record => (
                <tr 
                    key={record.id} 
                    className="bg-white border-b hover:bg-slate-50 cursor-pointer"
                    onClick={() => onRowClick(record.student.id)}
                >
                    <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                    {record.student.name}
                    </th>
                    <td className="px-6 py-4">{record.student.id}</td>
                    <td className="px-6 py-4">{record.checkInGuardian?.name || '—'}</td>
                    <td className="px-6 py-4">{record.checkOutGuardian?.name || '—'}</td>
                    <td className="px-6 py-4">
                      <TimeStatusIndicator time={record.checkInTime} type="check-in" />
                    </td>
                    <td className="px-6 py-4">
                      <TimeStatusIndicator time={record.checkOutTime} type="check-out" />
                    </td>
                    <td className="px-6 py-4">
                    <StatusBadge status={record.status} />
                    </td>
                </tr>
                ))
            ) : (
                <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-500">
                        No records found for the selected criteria.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceTable;
