import React, { useState, useEffect } from 'react';
import { Search, Plus, MoreHorizontal, Inbox } from 'lucide-react';



export const Products: React.FC = () => {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/products`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
    })
      .then(res => res.json())
      .then(json => {
        const mapped = json.map((p: any, i: number) => ({
          id: p._id || Date.now().toString() + i,
          name: p.name,
          source: p.source || 'Manual',
          updated: new Date().toISOString().split('T')[0],
          img: p.category === 'Software' ? '🛠️' : '📦'
        }));
        console.log(mapped, 'mapped')
        setProducts(mapped);
        setLoading(false);
      })
      .catch(err => {
        console.error('Products fetch failed', err);
        setLoading(false);
      });
  }, []);

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <div className="animate-fade-in" style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Loading Products...</div>
    </div>
  );

  return (
    <div style={{ minHeight: '100%', background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--glass-border)', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Products</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by product name"
              style={{ padding: '8px 14px 8px 32px', borderRadius: '8px', border: '1px solid var(--glass-border)', fontSize: '0.82rem', color: 'var(--text-secondary)', outline: 'none', width: '220px', background: 'var(--bg-elevated)' }} />
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 16px', borderRadius: '8px', background: 'linear-gradient(135deg, #0665ff, #1e27a8)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', boxShadow: '0 4px 10px rgba(124,58,237,0.25)' }}>
            <Plus size={14} /> Add Product
          </button>
        </div>
      </div>

      <div style={{ padding: '0' }}>
        {/* Table */}
        <div style={{ background: 'var(--bg-card)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <th style={{ padding: '12px 32px', textAlign: 'left', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Products</th>
                <th style={{ padding: '12px 32px', textAlign: 'left', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Source</th>
                <th style={{ padding: '12px 32px', textAlign: 'left', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Updated</th>
                <th style={{ padding: '12px 32px', textAlign: 'left', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '80px 32px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Inbox size={24} color="#94a3b8" />
                      </div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>No data</div>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((product, i) => (
                  <tr key={product.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f8fafc' : 'none', cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '14px 32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                        {product.img}
                      </div>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{product.name}</span>
                    </td>
                    <td style={{ padding: '14px 32px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{product.source}</td>
                    <td style={{ padding: '14px 32px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{product.updated}</td>
                    <td style={{ padding: '14px 32px' }}>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: '4px', borderRadius: '4px' }}>
                        <MoreHorizontal size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
