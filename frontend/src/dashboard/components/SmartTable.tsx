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
  dark?: boolean; // ← NEW: opt-in dark mode
}

export const SmartTable: React.FC<SmartTableProps> = ({
  columns,
  data,
  title,
  searchPlaceholder = 'Search records...',
  actions,
  dark = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // ── Dark palette tokens (only used when dark=true) ─────────────
  const D = {
    surface:     '#0f1629',
    surfaceAlt:  '#141d35',
    border:      'rgba(99,102,241,0.18)',
    borderHover: 'rgba(112,51,245,0.35)',
    purple:      '#7c3aed',
    purpleSoft:  'rgba(124,58,237,0.12)',
    purpleText:  '#a78bfa',
    textPrimary: '#f1f5f9',
    textMuted:   '#94a3b8',
    textDim:     '#64748b',
    rowHover:    'rgba(255,255,255,0.04)',
    inputBg:     'rgba(255,255,255,0.05)',
    btnBg:       'rgba(255,255,255,0.06)',
    btnBgHover:  'rgba(255,255,255,0.10)',
    btnDisabled: 'rgba(255,255,255,0.03)',
    white010:    'rgba(255,255,255,0.10)',
  };

  useEffect(() => { setCurrentPage(1); }, [searchTerm, sortConfig]);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig?.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const tableData = Array.isArray(data) ? data : [];

  const filteredData = tableData
    .filter(row =>
      row && typeof row === 'object' &&
      Object.values(row).some(val => String(val || '').toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (!sortConfig || !a || !b) return 0;
      const { key, direction } = sortConfig;
      const valA = a[key] ?? '';
      const valB = b[key] ?? '';
      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    });

  const totalPages   = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // ── Light theme styles (original, unchanged) ──────────────────
  if (!dark) {
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
                style={{ padding: '10px 16px 10px 40px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', color: '#0f172a', width: '300px', outline: 'none', transition: '0.2s' }}
              />
            </div>
          </div>
        </div>
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                {columns.map(col => (
                  <th key={col.key} onClick={() => col.sortable && handleSort(col.key)}
                    style={{ padding: '14px 20px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', cursor: col.sortable ? 'pointer' : 'default', whiteSpace: 'nowrap', userSelect: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {col.label}
                      {col.sortable && (
                        <div style={{ display: 'flex', flexDirection: 'column', opacity: 0.5 }}>
                          <ChevronUp size={10} style={{ color: sortConfig?.key === col.key && sortConfig.direction === 'asc' ? 'var(--accent-primary)' : undefined }} />
                          <ChevronDown size={10} style={{ color: sortConfig?.key === col.key && sortConfig.direction === 'desc' ? 'var(--accent-primary)' : undefined }} />
                        </div>
                      )}
                    </div>
                  </th>
                ))}
                <th style={{ padding: '14px 20px' }}></th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr><td colSpan={columns.length + 1} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>No matching records found.</td></tr>
              ) : (
                paginatedData.map((row, idx) => (
                  <tr key={idx}
                    style={{ borderBottom: idx < paginatedData.length - 1 ? '1px solid #f1f5f9' : 'none', transition: '0.2s', background: 'transparent' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {columns.map(col => (
                      <td key={col.key} style={{ padding: '16px 20px', fontSize: '0.9rem', color: '#334155' }}>
                        {col.render ? col.render(row) : row[col.key]}
                      </td>
                    ))}
                    {actions ? (
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>{actions(row)}</td>
                    ) : (
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <button style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><MoreVertical size={18} /></button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderTop: '1px solid #e2e8f0', background: '#fff' }}>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>
              Showing {filteredData.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} records
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', border: '1px solid #e2e8f0', background: currentPage === 1 ? '#f8fafc' : '#fff', color: currentPage === 1 ? '#94a3b8' : '#0f172a', borderRadius: '6px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: '0.15s' }}
                onMouseEnter={e => { if (currentPage !== 1) e.currentTarget.style.background = '#f1f5f9'; }}
                onMouseLeave={e => { if (currentPage !== 1) e.currentTarget.style.background = '#fff'; }}
              ><ChevronLeft size={16} /> Previous</button>
              <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', border: '1px solid #e2e8f0', background: currentPage === totalPages || totalPages === 0 ? '#f8fafc' : '#fff', color: currentPage === totalPages || totalPages === 0 ? '#94a3b8' : '#0f172a', borderRadius: '6px', cursor: currentPage === totalPages || totalPages === 0 ? 'not-allowed' : 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: '0.15s' }}
                onMouseEnter={e => { if (currentPage !== totalPages && totalPages !== 0) e.currentTarget.style.background = '#f1f5f9'; }}
                onMouseLeave={e => { if (currentPage !== totalPages && totalPages !== 0) e.currentTarget.style.background = '#fff'; }}
              >Next <ChevronRight size={16} /></button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Dark theme ─────────────────────────────────────────────────
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        {title && <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: D.textPrimary }}>{title}</h3>}
        <div style={{ position: 'relative' }}>
          <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: D.textDim, pointerEvents: 'none' }} size={15} />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ padding: '10px 16px 10px 38px', background: D.inputBg, border: `1px solid ${D.border}`, borderRadius: 10, color: D.textPrimary, width: 280, outline: 'none', fontSize: '0.875rem', transition: '0.2s' }}
            onFocus={e => e.currentTarget.style.borderColor = D.purple}
            onBlur={e => e.currentTarget.style.borderColor = D.border}
          />
        </div>
      </div>

      <div style={{ background: D.surface, borderRadius: 16, border: `1px solid ${D.border}`, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: `1px solid ${D.border}` }}>
              {columns.map(col => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && handleSort(col.key)}
                  style={{ padding: '14px 20px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: D.textDim, textTransform: 'uppercase', letterSpacing: '0.07em', cursor: col.sortable ? 'pointer' : 'default', whiteSpace: 'nowrap', userSelect: 'none' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {col.label}
                    {col.sortable && (
                      <div style={{ display: 'flex', flexDirection: 'column', opacity: 0.5 }}>
                        <ChevronUp   size={10} style={{ color: sortConfig?.key === col.key && sortConfig.direction === 'asc'  ? D.purpleText : undefined }} />
                        <ChevronDown size={10} style={{ color: sortConfig?.key === col.key && sortConfig.direction === 'desc' ? D.purpleText : undefined }} />
                      </div>
                    )}
                  </div>
                </th>
              ))}
              <th style={{ padding: '14px 20px' }}></th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} style={{ padding: 48, textAlign: 'center', color: D.textDim, fontSize: '0.9rem' }}>
                  No matching records found.
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr
                  key={idx}
                  style={{ borderBottom: idx < paginatedData.length - 1 ? `1px solid ${D.border}` : 'none', transition: '0.15s', background: 'transparent' }}
                  onMouseEnter={e => e.currentTarget.style.background = D.rowHover}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {columns.map(col => (
                    <td key={col.key} style={{ padding: '15px 20px', fontSize: '0.875rem', color: D.textMuted }}>
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                  {actions ? (
                    <td style={{ padding: '15px 20px', textAlign: 'right' }}>{actions(row)}</td>
                  ) : (
                    <td style={{ padding: '15px 20px', textAlign: 'right' }}>
                      <button style={{ background: 'transparent', border: 'none', color: D.textDim, cursor: 'pointer' }}>
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderTop: `1px solid ${D.border}`, background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ fontSize: '0.82rem', color: D.textDim, fontWeight: 500 }}>
            Showing {filteredData.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} – {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} records
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 14px', border: `1px solid ${D.border}`, background: currentPage === 1 ? D.btnDisabled : D.btnBg, color: currentPage === 1 ? D.textDim : D.textMuted, borderRadius: 8, cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontSize: '0.82rem', fontWeight: 600, transition: '0.15s' }}
              onMouseEnter={e => { if (currentPage !== 1) { e.currentTarget.style.background = D.btnBgHover; e.currentTarget.style.color = D.textPrimary; }}}
              onMouseLeave={e => { if (currentPage !== 1) { e.currentTarget.style.background = D.btnBg; e.currentTarget.style.color = D.textMuted; }}}
            >
              <ChevronLeft size={15} /> Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 14px', border: `1px solid ${D.border}`, background: currentPage === totalPages || totalPages === 0 ? D.btnDisabled : D.btnBg, color: currentPage === totalPages || totalPages === 0 ? D.textDim : D.textMuted, borderRadius: 8, cursor: currentPage === totalPages || totalPages === 0 ? 'not-allowed' : 'pointer', fontSize: '0.82rem', fontWeight: 600, transition: '0.15s' }}
              onMouseEnter={e => { if (currentPage !== totalPages && totalPages !== 0) { e.currentTarget.style.background = D.btnBgHover; e.currentTarget.style.color = D.textPrimary; }}}
              onMouseLeave={e => { if (currentPage !== totalPages && totalPages !== 0) { e.currentTarget.style.background = D.btnBg; e.currentTarget.style.color = D.textMuted; }}}
            >
              Next <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
