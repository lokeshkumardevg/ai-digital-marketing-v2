import React, { useState, useEffect } from 'react';
import { Search, ChevronUp, ChevronDown, MoreVertical, Download, ChevronLeft, ChevronRight } from 'lucide-react';

interface Column {
  key: string;
  label: string;
  render?: (row: any) => React.ReactNode;
  sortable?: boolean;
}

interface SmartTableProps {
  columns: Column[];
  data: any[];
  title?: string;
  searchPlaceholder?: string;
  actions?: (row: any) => React.ReactNode;
}

export const SmartTable: React.FC<SmartTableProps> = ({ 
  columns, 
  data, 
  title, 
  searchPlaceholder = 'Search records...',
  actions 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortConfig]);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const tableData = Array.isArray(data) ? data : [];

  const filteredData = tableData.filter(row => 
    row && typeof row === 'object' && Object.values(row).some(val => 
      String(val || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
  ).sort((a, b) => {
    if (!sortConfig || !a || !b) return 0;
    const { key, direction } = sortConfig;
    const valA = a[key] ?? '';
    const valB = b[key] ?? '';
    if (valA < valB) return direction === 'asc' ? -1 : 1;
    if (valA > valB) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="smart-table-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        {title && <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{title}</h3>}
        <div style={{ display: 'flex', gap: '12px' }}>
           <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={16} />
              <input 
                type="text" 
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ 
                  padding: '10px 16px 10px 40px', background: '#f8fafc', 
                  border: '1px solid #e2e8f0', borderRadius: '10px', color: '#0f172a', 
                  width: '300px', outline: 'none', transition: '0.2s'
                }}
              />
           </div>
           <button className="btn btn-secondary" style={{ padding: '10px' }} title="Export CSV">
              <Download size={18} />
           </button>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              {columns.map(col => (
                <th 
                  key={col.key} 
                  onClick={() => col.sortable && handleSort(col.key)}
                  style={{ 
                    padding: '16px 20px', fontSize: '0.8rem', color: '#64748b', 
                    fontWeight: 700, cursor: col.sortable ? 'pointer' : 'default',
                    whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.05em'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {col.label}
                    {col.sortable && sortConfig?.key === col.key && (
                      sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </div>
                </th>
              ))}
              {actions && <th style={{ padding: '16px 20px', width: '60px' }}></th>}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                   No matching records found.
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr 
                  key={idx} 
                  style={{ 
                    borderBottom: idx < paginatedData.length - 1 ? '1px solid #f1f5f9' : 'none', 
                    transition: '0.2s', background: 'transparent'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {columns.map(col => (
                    <td key={col.key} style={{ padding: '16px 20px', fontSize: '0.9rem', color: '#334155' }}>
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                  {actions ? (
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                       {actions(row)}
                    </td>
                  ) : (
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                       <button style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                          <MoreVertical size={18} />
                       </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {/* Pagination Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderTop: '1px solid #e2e8f0', background: '#fff' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>
            Showing {filteredData.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} records
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '6px 12px', border: '1px solid #e2e8f0', 
                background: currentPage === 1 ? '#f8fafc' : '#fff', 
                color: currentPage === 1 ? '#94a3b8' : '#0f172a', 
                borderRadius: '6px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', 
                fontSize: '0.85rem', fontWeight: 600, transition: '0.15s'
              }}
              onMouseEnter={e => { if (currentPage !== 1) e.currentTarget.style.background = '#f1f5f9' }}
              onMouseLeave={e => { if (currentPage !== 1) e.currentTarget.style.background = '#fff' }}
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '6px 12px', border: '1px solid #e2e8f0', 
                background: currentPage === totalPages || totalPages === 0 ? '#f8fafc' : '#fff', 
                color: currentPage === totalPages || totalPages === 0 ? '#94a3b8' : '#0f172a', 
                borderRadius: '6px', cursor: currentPage === totalPages || totalPages === 0 ? 'not-allowed' : 'pointer', 
                fontSize: '0.85rem', fontWeight: 600, transition: '0.15s'
              }}
              onMouseEnter={e => { if (currentPage !== totalPages && totalPages !== 0) e.currentTarget.style.background = '#f1f5f9' }}
              onMouseLeave={e => { if (currentPage !== totalPages && totalPages !== 0) e.currentTarget.style.background = '#fff' }}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
