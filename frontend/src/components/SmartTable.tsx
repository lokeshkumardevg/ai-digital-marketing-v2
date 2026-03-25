import React, { useState } from 'react';
import { Search, ChevronUp, ChevronDown, MoreVertical, Download } from 'lucide-react';

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
                  padding: '10px 16px 10px 40px', background: 'rgba(255,255,255,0.03)', 
                  border: '1px solid var(--glass-border)', borderRadius: '10px', color: '#fff', 
                  width: '300px', outline: 'none', transition: '0.2s'
                }}
              />
           </div>
           <button className="btn btn-secondary" style={{ padding: '10px' }} title="Export CSV">
              <Download size={18} />
           </button>
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
              {columns.map(col => (
                <th 
                  key={col.key} 
                  onClick={() => col.sortable && handleSort(col.key)}
                  style={{ 
                    padding: '16px 20px', fontSize: '0.85rem', color: 'var(--text-secondary)', 
                    fontWeight: 600, cursor: col.sortable ? 'pointer' : 'default',
                    whiteSpace: 'nowrap'
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
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                   No matching records found.
                </td>
              </tr>
            ) : (
              filteredData.map((row, idx) => (
                <tr 
                  key={idx} 
                  style={{ 
                    borderBottom: idx < filteredData.length - 1 ? '1px solid var(--glass-border)' : 'none', 
                    transition: '0.2s', background: 'transparent'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {columns.map(col => (
                    <td key={col.key} style={{ padding: '16px 20px', fontSize: '0.9rem' }}>
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                  {actions ? (
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                       {actions(row)}
                    </td>
                  ) : (
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                       <button style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                          <MoreVertical size={18} />
                       </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
