import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { GlassCard } from '../components/GlassCard';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, Activity, BarChart2, DollarSign, BrainCircuit, ScanSearch
} from 'lucide-react';
import { fetchDashboardData } from '../store/slices/analyticsSlice';
import { HeatmapOverlay } from '../components/HeatmapOverlay';
import type { AppDispatch } from '../store';
import toast from 'react-hot-toast';

export const Analytics: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, status } = useSelector((state: any) => state.analytics);
  const { websites, activeWebsiteId } = useSelector((state: any) => state.workspace);

  const activeWebsite = websites.find((w: any) => w.id === activeWebsiteId);

  useEffect(() => {
    if (status === 'idle') {
      const promise = dispatch(fetchDashboardData());
      toast.promise(promise, {
        loading: 'Loading analytics...',
        success: 'Analytics loaded!',
        error: 'Failed to load analytics.'
      });
    }
  }, [status, dispatch]);

  if (status === 'loading' || !data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ color: 'var(--accent-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <ScanSearch size={48} className="animate-fade-in" style={{ animationIterationCount: 'infinite', animationDirection: 'alternate' }} />
          <p>Analyzing data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>
            Predictive <span className="text-gradient">Analytics</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>AI-driven forecasting for {activeWebsite?.name || 'your website'}.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(16, 185, 129, 0.1)', padding: '8px 16px', borderRadius: '24px', color: 'var(--success)' }}>
          <BrainCircuit size={18} />
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>AI Confidence: {data?.summary?.aiConfidenceScore || 90}%</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
        <GlassCard style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--info)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Traffic (7d)</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{data?.summary?.totalTraffic.toLocaleString()}</div>
          </div>
        </GlassCard>
        
        <GlassCard style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Attributed Revenue</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>${data?.summary?.totalRevenue.toLocaleString()}</div>
          </div>
        </GlassCard>

        <GlassCard style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Predicted Traffic ∆</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--success)' }}>{data?.summary?.predictedTrafficGrowth}</div>
          </div>
        </GlassCard>

        <GlassCard style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(234, 179, 8, 0.1)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BarChart2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Predicted Revenue ∆</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--success)' }}>{data?.summary?.predictedRevenueGrowth}</div>
          </div>
        </GlassCard>
      </div>

      <GlassCard style={{ padding: '32px' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={18} color="var(--accent-primary)" /> Traffic & Revenue Trajectory <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--text-secondary)', marginLeft: '8px' }}>(Historical + 7d AI Projection)</span>
        </h3>
        
        <div style={{ width: '100%', height: '450px' }}>
          <ResponsiveContainer>
            <AreaChart data={data?.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--info)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--info)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                </linearGradient>
                <pattern id="diagonalHatch" width="8" height="8" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="0" x2="0" y2="8" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                </pattern>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
              <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
              <YAxis yAxisId="left" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val / 1000}k`} />
              <YAxis yAxisId="right" orientation="right" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val / 1000}k`} />
              
              <Tooltip 
                contentStyle={{ background: '#0f172a', border: '1px solid var(--glass-border)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                itemStyle={{ color: '#fff', fontSize: '0.9rem' }}
                labelStyle={{ color: 'var(--text-secondary)', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}
                formatter={(value: any, name: any) => [
                  name.includes('Revenue') ? `$${value}` : value, 
                  name.replace('hist', 'Actual ').replace('pred', 'AI Forecast ')
                ]}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Area 
                yAxisId="left" type="monotone" dataKey="histTraffic" name="Actual Traffic" stroke="var(--info)" strokeWidth={3}
                fillOpacity={0.6} fill="url(#colorTraffic)" 
                activeDot={{ r: 6, fill: 'var(--info)' }}
                connectNulls
              />
              <Area 
                yAxisId="right" type="monotone" dataKey="histRevenue" name="Actual Revenue" stroke="var(--accent-primary)" strokeWidth={3}
                fillOpacity={0.6} fill="url(#colorRevenue)" 
                activeDot={{ r: 6, fill: 'var(--accent-primary)' }}
                connectNulls
              />
              <Area 
                yAxisId="left" type="monotone" dataKey="predTraffic" name="AI Forecast Traffic" stroke="var(--info)" strokeWidth={3}
                fillOpacity={0.15} fill="url(#diagonalHatch)" strokeDasharray="5 5"
                activeDot={{ r: 6, fill: 'var(--info)' }}
                connectNulls
              />
              <Area 
                yAxisId="right" type="monotone" dataKey="predRevenue" name="AI Forecast Revenue" stroke="var(--accent-primary)" strokeWidth={3}
                fillOpacity={0.15} fill="url(#diagonalHatch)" strokeDasharray="5 5"
                activeDot={{ r: 6, fill: 'var(--accent-primary)' }}
                connectNulls
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <HeatmapOverlay />
    </div>
  );
};
