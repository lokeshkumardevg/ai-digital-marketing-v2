import React, { useState } from 'react';
import { GlassCard } from './GlassCard';
import { MousePointer2, Thermometer, UserCheck } from 'lucide-react';

export const HeatmapOverlay: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'clicks' | 'scroll'>('clicks');

  // Generating mock heatmap density points
  const points = Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    x: Math.random() * 80 + 10,
    y: Math.random() * 80 + 10,
    size: Math.random() * 40 + 20,
    intensity: Math.random()
  }));

  return (
    <div className="heatmap-container" style={{ position: 'relative', marginTop: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Thermometer size={18} color="var(--error)" /> Behavior <span className="text-gradient">Heatmaps</span>
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Identifying conversion friction and engagement hot zones.</p>
        </div>
        <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: '4px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
           <button 
             onClick={() => setActiveTab('clicks')}
             style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: activeTab === 'clicks' ? 'var(--accent-primary)' : 'transparent', color: '#fff', cursor: 'pointer', fontSize: '0.8rem' }}
           >
             Click Density
           </button>
           <button 
             onClick={() => setActiveTab('scroll')}
             style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: activeTab === 'scroll' ? 'var(--accent-primary)' : 'transparent', color: '#fff', cursor: 'pointer', fontSize: '0.8rem' }}
           >
             Scroll Depth
           </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
         {/* Live Page Preview Mockup */}
         <GlassCard style={{ height: '500px', padding: '0', position: 'relative', overflow: 'hidden', background: '#fff' }}>
            {/* The "Website" being tracked */}
            <div style={{ width: '100%', height: '100%', padding: '40px', color: '#000', display: 'flex', flexDirection: 'column', gap: '24px' }}>
               <div style={{ width: '150px', height: '30px', background: '#f1f5f9', borderRadius: '4px' }}></div>
               <div style={{ width: '80%', height: '40px', background: '#e2e8f0', borderRadius: '8px' }}></div>
               <div style={{ width: '100%', height: '200px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}></div>
               <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ width: '120px', height: '40px', background: '#3b82f6', borderRadius: '8px' }}></div>
                  <div style={{ width: '120px', height: '40px', background: '#f1f5f9', borderRadius: '8px' }}></div>
               </div>
            </div>

            {/* Heatmap Overlay Points */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', background: 'rgba(0,0,0,0.05)' }}>
               {points.map(p => (
                 <div key={p.id} style={{
                    position: 'absolute',
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, rgba(239, 68, 68, ${p.intensity * 0.6}) 0%, transparent 70%)`,
                    transform: 'translate(-50%, -50%)',
                    filter: 'blur(4px)'
                 }}></div>
               ))}
            </div>
         </GlassCard>

         {/* Insights List */}
         <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <GlassCard style={{ padding: '20px' }}>
               <h4 style={{ fontSize: '0.9rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><UserCheck size={16} color="var(--success)" /> Conversion Wins</h4>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '8px', borderLeft: '3px solid var(--success)', background: 'rgba(16, 185, 129, 0.05)' }}>
                     <strong>CTA High Intensity:</strong> 85% of users are interacting with the primary pricing button.
                  </div>
               </div>
            </GlassCard>

            <GlassCard style={{ padding: '20px' }}>
               <h4 style={{ fontSize: '0.9rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><MousePointer2 size={16} color="var(--warning)" /> Friction Points</h4>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '8px', borderLeft: '3px solid var(--warning)', background: 'rgba(234, 179, 8, 0.05)' }}>
                     <strong>Dead Clicks:</strong> High density detected on the non-clickable secondary logo.
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '8px', borderLeft: '3px solid var(--warning)', background: 'rgba(234, 179, 8, 0.05)' }}>
                     <strong>Scroll Barrier:</strong> 40% bounce rate at the 600px mark. Check for content gaps.
                  </div>
               </div>
            </GlassCard>
         </div>
      </div>
    </div>
  );
};
