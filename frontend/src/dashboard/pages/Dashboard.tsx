import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, Target, MousePointerClick, 
  ArrowUpRight, BrainCircuit, Wand2
} from 'lucide-react';



export const Dashboard: React.FC = () => {
  const [data, setData] = useState<{ daily: any[], summary: any } | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000'}/analytics/dashboard`)
      .then(res => res.json())
      .then(d => setData(d))
      .catch(console.error);
  }, []);

  const chartData = data?.daily && data.daily.length > 0 ? data.daily.map((d: any) => ({
    name: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
    traffic: d.impressions || 0,
    conversion: d.conversions || 0
  })).reverse() : [];

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>
            Marketing <span className="text-gradient">Command Center</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>AI-driven insights & automated campaign management</p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button className="btn btn-secondary">
            <Wand2 size={18} />
            Generate Report
          </button>
          <button className="btn btn-primary">
            <BrainCircuit size={18} />
            Auto-Scale Ads
          </button>
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '24px',
        marginBottom: '32px'
      }}>
        {[
          { label: 'Total AI Content', value: data?.aiContentCount || 0, change: '0%', icon: Wand2, color: 'var(--accent-primary)' },
          { label: 'Predicted ROI', value: data?.summary?.roas ? `${data.summary.roas}x` : '0x', change: '0%', icon: TrendingUp, color: 'var(--success)' },
          { label: 'Active Campaigns', value: data?.campaigns || 0, change: '0', icon: Target, color: 'var(--warning)' },
          { label: 'Total Conversions', value: data?.summary?.conversions || 0, change: '0%', icon: MousePointerClick, color: 'var(--info)' },
        ].map((stat, i) => (
          <GlassCard key={i} onClick={() => {}}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>{stat.label}</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 600, fontFamily: 'Outfit' }}>
                  {stat.value}
                </div>
              </div>
              <div style={{ 
                padding: '10px', 
                borderRadius: '12px', 
                background: `rgba(${stat.color === 'var(--accent-primary)' ? '139, 92, 246' : stat.color === 'var(--success)' ? '16, 185, 129' : stat.color === 'var(--warning)' ? '245, 158, 11' : '59, 130, 246'}, 0.1)`,
                color: stat.color
              }}>
                <stat.icon size={24} />
              </div>
            </div>
            <div style={{ 
              marginTop: '16px', display: 'flex', alignItems: 'center', gap: '4px', 
              color: stat.change.startsWith('+') ? 'var(--success)' : 'var(--error)', 
              fontSize: '0.85rem' 
            }}>
              <ArrowUpRight size={16} />
              <span>{stat.change} from last week</span>
            </div>
          </GlassCard>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <GlassCard>
          <h3 style={{ marginBottom: '24px', fontSize: '1.2rem' }}>Traffic vs Conversions (AI Predictive)</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorConversion" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--success)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--success)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                <YAxis stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Area type="monotone" dataKey="traffic" stroke="var(--accent-primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorTraffic)" />
                <Area type="monotone" dataKey="conversion" stroke="var(--success)" strokeWidth={2} fillOpacity={1} fill="url(#colorConversion)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 style={{ marginBottom: '24px', fontSize: '1.2rem' }}>AI Orchestrator Status</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {(data?.orchestratorStatus || []).map((model: any, i: number) => (
              <div key={i} style={{ 
                background: 'rgba(255,255,255,0.02)', 
                padding: '16px', borderRadius: '12px', border: '1px solid var(--glass-border)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: 500, marginBottom: '4px' }}>{model.name}</div>
                  <div style={{ fontSize: '0.8rem', color: model.color }}>{model.status}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{model.usage}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Load capacity</div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
