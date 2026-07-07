import { useState, useEffect } from 'react';
import { Calendar, Filter, RefreshCw } from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface LogEntry {
  _id: string;
  level: string;
  context?: string;
  message: string;
  timestamp: string;
  meta?: any;
}

export const Logs = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  
  // Filters
  const [levelFilter, setLevelFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const params = new URLSearchParams();
      if (levelFilter !== 'all') params.append('level', levelFilter);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      params.append('page', String(page));
      params.append('limit', '50');

      const res = await axios.get(`${API_BASE}/logs?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error('Failed to fetch logs', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.get(`${API_BASE}/logs/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(res.data.data.filter(Boolean));
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [levelFilter, categoryFilter, startDate, endDate, page]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'warn': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'log': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'debug': return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
      case 'verbose': return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
      default: return 'text-gray-300 bg-gray-800 border-gray-700';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            System Logs
          </h1>
          <p className="text-gray-400 mt-2">Monitor application events and errors</p>
        </div>
        <button 
          onClick={fetchLogs}
          disabled={loading}
          className="p-2 bg-[#1A1A1A] border border-[#333] rounded-lg hover:bg-[#222] transition-colors"
        >
          <RefreshCw size={20} className={`text-gray-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="bg-[#111] border border-[#222] rounded-xl mb-6 p-4 flex flex-wrap gap-4">
        {/* Date Filters */}
        <div className="flex gap-2 items-center bg-[#1A1A1A] border border-[#333] rounded-lg p-2">
          <Calendar size={18} className="text-gray-400" />
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-transparent text-sm text-gray-300 outline-none w-32"
          />
          <span className="text-gray-600">-</span>
          <input 
            type="date" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-transparent text-sm text-gray-300 outline-none w-32"
          />
        </div>

        {/* Level Filter */}
        <div className="flex gap-2 items-center bg-[#1A1A1A] border border-[#333] rounded-lg p-2">
          <Filter size={18} className="text-gray-400" />
          <select 
            value={levelFilter}
            onChange={(e) => { setLevelFilter(e.target.value); setPage(1); }}
            className="bg-transparent text-sm text-gray-300 outline-none min-w-[100px]"
          >
            <option value="all" className="bg-[#111]">All Levels</option>
            <option value="log" className="bg-[#111]">Log</option>
            <option value="warn" className="bg-[#111]">Warning</option>
            <option value="error" className="bg-[#111]">Error</option>
            <option value="debug" className="bg-[#111]">Debug</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 items-center bg-[#1A1A1A] border border-[#333] rounded-lg p-2">
          <Filter size={18} className="text-gray-400" />
          <select 
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="bg-transparent text-sm text-gray-300 outline-none min-w-[150px]"
          >
            <option value="all" className="bg-[#111]">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c} className="bg-[#111]">{c}</option>
            ))}
          </select>
        </div>
        
        {/* Clear Filters */}
        {(startDate || endDate || levelFilter !== 'all' || categoryFilter !== 'all') && (
          <button 
            onClick={() => {
              setStartDate('');
              setEndDate('');
              setLevelFilter('all');
              setCategoryFilter('all');
              setPage(1);
            }}
            className="text-sm text-accent-primary hover:underline px-2"
          >
            Clear Filters
          </button>
        )}
      </div>

      <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-[#1A1A1A] text-gray-400 border-b border-[#333]">
              <tr>
                <th className="px-6 py-4 font-medium">Timestamp</th>
                <th className="px-6 py-4 font-medium">Level</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    {loading ? 'Loading logs...' : 'No logs found for the selected filters.'}
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-[#151515] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getLevelColor(log.level)}`}>
                        {log.level.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-400 bg-[#222] px-2 py-1 rounded-md text-xs">
                        {log.context || 'System'}
                      </span>
                    </td>
                    <td className="px-6 py-4 break-words max-w-2xl">
                      <div className="text-gray-300 whitespace-pre-wrap font-mono text-xs leading-relaxed">
                        {log.message}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 bg-[#1A1A1A] border border-[#333] rounded-lg disabled:opacity-50 hover:bg-[#222] transition-colors text-sm text-gray-300"
            >
              Previous
            </button>
            <button 
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 bg-[#1A1A1A] border border-[#333] rounded-lg disabled:opacity-50 hover:bg-[#222] transition-colors text-sm text-gray-300"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
