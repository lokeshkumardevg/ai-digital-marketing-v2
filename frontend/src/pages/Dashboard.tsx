import React from 'react';
import { GlassCard } from '../components/GlassCard';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, Target, MousePointerClick, 
  ArrowUpRight, BrainCircuit, Wand2
} from 'lucide-react';

const mockAnalytics = [
  { name: 'Mon', traffic: 4000, conversion: 2400 },
  { name: 'Tue', traffic: 3000, conversion: 1398 },
  { name: 'Wed', traffic: 2000, conversion: 9800 },
  { name: 'Thu', traffic: 2780, conversion: 3908 },
  { name: 'Fri', traffic: 1890, conversion: 4800 },
  { name: 'Sat', traffic: 2390, conversion: 3800 },
  { name: 'Sun', traffic: 3490, conversion: 4300 },
];

export const Dashboard: React.FC = () => {
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
          { label: 'Total AI Content', value: '1,429', change: '+12.5%', icon: Wand2, color: 'var(--accent-primary)' },
          { label: 'Predicted ROI', value: '342%', change: '+4.2%', icon: TrendingUp, color: 'var(--success)' },
          { label: 'Active Campaigns', value: '24', change: '+2', icon: Target, color: 'var(--warning)' },
          { label: 'Total Conversions', value: '8,904', change: '+24%', icon: MousePointerClick, color: 'var(--info)' },
        ].map((stat, i) => (
          <GlassCard key={i} onClick={() => {}}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>{stat.label}</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 600, fontFamily: 'Outfit' }}>{stat.value}</div>
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
              <AreaChart data={mockAnalytics}>
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
            {[
              { name: 'OpenAI (GPT-4)', status: 'Active', usage: '89%', color: 'var(--success)' },
              { name: 'Gemini Pro', status: 'Fallback Ready', usage: '12%', color: 'var(--warning)' },
              { name: 'Meta Llama 3', status: 'Idle', usage: '0%', color: 'var(--text-secondary)' },
              { name: 'Stability AI', status: 'Active (Ads)', usage: '45%', color: 'var(--success)' },
            ].map((model, i) => (
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
