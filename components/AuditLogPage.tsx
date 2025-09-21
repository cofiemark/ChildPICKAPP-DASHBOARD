import React, { useState, useMemo } from 'react';
import { AuditLog } from '../types';
import { SearchIcon } from './icons';

interface AuditLogPageProps {
  auditLogs: AuditLog[];
}

const AuditLogPage: React.FC<AuditLogPageProps> = ({ auditLogs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 15;

  const filteredLogs = useMemo(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    return auditLogs.filter(log =>
      log.user.name.toLowerCase().includes(lowercasedFilter) ||
      log.action.toLowerCase().includes(lowercasedFilter) ||
      log.details.toLowerCase().includes(lowercasedFilter)
    );
  }, [auditLogs, searchTerm]);

  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * logsPerPage;
    return filteredLogs.slice(startIndex, startIndex + logsPerPage);
  }, [filteredLogs, currentPage, logsPerPage]);

  const formatDate = (date: Date) => {
    return date.toLocaleString();
  };
  
  return (
    <main className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Audit Log</h2>
          <p className="text-slate-500 mt-1">Review system and user activity.</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <div className="relative max-w-sm">
            <input
              type="text"
              placeholder="Search by user, action, or details..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-slate-400" />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-100">
              <tr>
                <th scope="col" className="px-6 py-3">Timestamp</th>
                <th scope="col" className="px-6 py-3">User</th>
                <th scope="col" className="px-6 py-3">Action</th>
                <th scope="col" className="px-6 py-3">Details</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.length > 0 ? (
                paginatedLogs.map(log => (
                  <tr key={log.id} className="bg-white border-b hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(log.timestamp)}</td>
                    <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{log.user.name}</th>
                    <td className="px-6 py-4">{log.action}</td>
                    <td className="px-6 py-4">{log.details}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={4} className="text-center py-8 text-slate-500">No logs found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
         {totalPages > 1 && (
            <div className="p-4 border-t border-slate-200 flex justify-between items-center">
                <span className="text-sm text-slate-600">
                    Page {currentPage} of {totalPages}
                </span>
                <div className="space-x-2">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 text-sm font-medium bg-white border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1.5 text-sm font-medium bg-white border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        )}
      </div>
    </main>
  );
};

export default AuditLogPage;
