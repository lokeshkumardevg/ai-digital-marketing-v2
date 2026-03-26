import React, { useState, useEffect } from 'react';
import { Plus, Sparkles, Image, Video, AlignLeft, Search, Calendar, Package, MoreHorizontal, Inbox } from 'lucide-react';

// AdsGo-style Creative Hub: "All Creatives" tab, Upload Date/Lifetime filters, Add Creative + AI Creative Generation
const typeIcon: Record<string, React.ElementType> = { image: Image, video: Video, text: AlignLeft };

export const Content: React.FC = () => {
  const [activeTab, setActiveTab] = useState('All Creatives');
  const [search, setSearch] = useState('');
  const [creatives, setCreatives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/content', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
    })
    .then(res => res.json())
    .then(json => {
      const mapped = json.map((c: any) => ({
        id: c._id,
        name: c.title || 'Untitled Creative',
        type: c.contentType === 'video' ? 'video' : 'image',
        platform: c.platforms?.[0] || 'Meta',
        uploadDate: new Date(c.createdAt).toISOString().split('T')[0],
        lifetime: '2026-03-27 → 2026-04-27',
        status: c.status || 'draft'
      }));
      setCreatives(mapped);
      setLoading(false);
    })
    .catch(err => {
      console.error('Content fetch failed', err);
      setLoading(false);
    });
  }, []);

  const filtered = creatives.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f6fa' }}>
      <div className="animate-fade-in" style={{ fontSize: '1rem', color: '#64748b', fontWeight: 600 }}>Loading Creative Hub...</div>
    </div>
  );

  return (
    <div style={{ minHeight: '100%', background: '#f5f6fa' }}>
      {/* Header breadcrumb strip */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e8eaf0', padding: '0 32px' }}>
        <div style={{ display: 'flex', gap: '0', padding: '0' }}>
          {['All Creatives'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '14px 20px', border: 'none', background: 'none', cursor: 'pointer',
              fontSize: '0.88rem', fontWeight: 600,
              color: activeTab === tab ? '#7c3aed' : '#64748b',
              borderBottom: activeTab === tab ? '2px solid #7c3aed' : '2px solid transparent',
            }}>{tab}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: '20px 32px' }}>
        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 18px', borderRadius: '8px', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }}>
            <Plus size={14} /> Add Creative
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 18px', borderRadius: '8px', border: '1.5px solid #c4b5fd', background: 'transparent', color: '#7c3aed', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
            <Sparkles size={14} /> AI Creative Generation
          </button>
        </div>

        {/* Filters Row */}
        <div style={{ background: '#fff', border: '1px solid #e8eaf0', borderRadius: '12px', padding: '16px 20px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Upload Date */}
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Upload Date</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fafafa', cursor: 'pointer', fontSize: '0.82rem', color: '#64748b' }}>
                <Calendar size={13} /> Start date → End date
              </div>
            </div>
            {/* Limited Lifetime */}
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Limited Lifetime</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fafafa', cursor: 'pointer', fontSize: '0.82rem', color: '#64748b' }}>
                <Calendar size={13} /> Start date → End date
              </div>
            </div>
            {/* Item */}
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Item</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fafafa', cursor: 'pointer', fontSize: '0.82rem', color: '#64748b', minWidth: '140px' }}>
                <Package size={13} /> Please select
              </div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Search</div>
              <div style={{ position: 'relative' }}>
                <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search creatives..."
                  style={{ padding: '8px 12px 8px 30px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.82rem', color: '#334155', outline: 'none', background: '#fafafa', width: '200px' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Creatives Table / Empty State */}
        <div style={{ background: '#fff', border: '1px solid #e8eaf0', borderRadius: '12px', overflow: 'hidden' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '80px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Inbox size={28} color="#94a3b8" />
              </div>
              <div style={{ fontWeight: 600, color: '#475569' }}>No creatives found.</div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Add creative to get started.</div>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#fafafa', borderBottom: '1px solid #f1f5f9' }}>
                  {['Creative', 'Type', 'Platform', 'Upload Date', 'Lifetime', 'Status', ''].map(h => (
                    <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => {
                  const Icon = typeIcon[c.type] || Image;
                  return (
                    <tr key={c.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f8fafc' : 'none', cursor: 'pointer' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <td style={{ padding: '13px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon size={16} color="#7c3aed" />
                        </div>
                        <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}>{c.name}</span>
                      </td>
                      <td style={{ padding: '13px 16px' }}>
                        <span style={{ padding: '3px 9px', borderRadius: '6px', background: '#f1f5f9', color: '#475569', fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize' }}>{c.type}</span>
                      </td>
                      <td style={{ padding: '13px 16px', fontSize: '0.85rem', color: '#475569' }}>{c.platform}</td>
                      <td style={{ padding: '13px 16px', fontSize: '0.85rem', color: '#475569' }}>{c.uploadDate}</td>
                      <td style={{ padding: '13px 16px', fontSize: '0.82rem', color: '#64748b' }}>{c.lifetime}</td>
                      <td style={{ padding: '13px 16px' }}>
                        <span style={{ padding: '3px 9px', borderRadius: '99px', background: c.status === 'active' || c.status === 'published' ? '#f0fdf4' : '#f8fafc', color: c.status === 'active' || c.status === 'published' ? '#16a34a' : '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize' }}>{c.status}</span>
                      </td>
                      <td style={{ padding: '13px 16px' }}>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px', borderRadius: '4px' }}>
                          <MoreHorizontal size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
