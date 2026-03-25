import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { GlassCard } from '../components/GlassCard';
import { Bot, Star, Search, Share2, LineChart, Play, Pause, Activity } from 'lucide-react';
import { addNotification } from '../store/slices/notificationSlice';
import toast from 'react-hot-toast';

export const Agents: React.FC = () => {
  const dispatch = useDispatch();
  const { websites, activeWebsiteId } = useSelector((state: any) => state.workspace);
  const activeWebsite = websites.find((w: any) => w.id === activeWebsiteId);

  const [agents, setAgents] = useState([
    {
      id: 'agent-seo',
      name: 'SEO Listing Agent',
      icon: Search,
      description: 'Optimizes local search presence and dynamic listings to rank #1 on Google and AI search engines.',
      status: 'idle', // 'idle' | 'running' | 'paused'
      metrics: { analyzed: 120, optimized: 15 }
    },
    {
      id: 'agent-reputation',
      name: 'Reputation Manager',
      icon: Star,
      description: 'Monitors custom reviews 24/7. Automatically requests and responds to reviews instantly.',
      status: 'idle',
      metrics: { analyzed: 450, optimized: 89 }
    },
    {
      id: 'agent-social',
      name: 'Social Growth Agent',
      icon: Share2,
      description: 'Drafts, publishes, and reschedules brand-aligned content across Twitter, LinkedIn, and Facebook.',
      status: 'running',
      metrics: { analyzed: 30, optimized: 12 }
    },
    {
      id: 'agent-insights',
      name: 'Customer Insights Analyst',
      icon: LineChart,
      description: 'Analyzes demographic data and audience pain points to surface churn risks and retention tactics.',
      status: 'idle',
      metrics: { analyzed: 1250, optimized: 3 }
    }
  ]);

  const toggleAgentStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'running' ? 'paused' : 'running';
    const tgtAgent = agents.find(a => a.id === id);
    setAgents(agents.map(agent => agent.id === id ? { ...agent, status: newStatus } : agent));
    
    if (newStatus === 'running') {
      toast.success('Agent deployed securely to production.');
      dispatch(addNotification({ id: Date.now().toString(), title: `${tgtAgent?.name} Online`, message: `Agent has been deployed and is actively monitoring your connected workflows.`, type: 'success', time: new Date().toISOString(), read: false }));
    } else {
      toast('Agent orchestration paused.', { icon: '⏸️' });
      dispatch(addNotification({ id: Date.now().toString(), title: `${tgtAgent?.name} Sleeping`, message: `Agent operations have been halted safely.`, type: 'warning', time: new Date().toISOString(), read: false }));
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>
            Autonomous <span className="text-gradient">AI Agents</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Deploy specialized marketing agents to actively manage {activeWebsite?.name || 'your websites'}.</p>
        </div>
        
        <GlassCard style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(139, 92, 246, 0.08)' }}>
           <Bot size={24} color="var(--accent-primary)" />
           <div>
             <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Active Agents Running</div>
             <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{agents.filter(a => a.status === 'running').length} / 4</div>
           </div>
        </GlassCard>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {agents.map((agent) => {
          const Icon = agent.icon;
          return (
          <GlassCard key={agent.id} style={{ 
            display: 'flex', flexDirection: 'column', 
            border: agent.status === 'running' ? '1px solid rgba(139, 92, 246, 0.5)' : '1px solid var(--glass-border)',
            boxShadow: agent.status === 'running' ? '0 0 20px rgba(139, 92, 246, 0.15)' : 'none',
            transition: 'all 0.3s ease'
          }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ 
                width: '48px', height: '48px', borderRadius: '12px', 
                background: agent.status === 'running' ? 'var(--accent-gradient)' : 'rgba(255, 255, 255, 0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: agent.status === 'running' ? 'white' : 'var(--text-secondary)'
              }}>
                <Icon size={24} />
              </div>

              {agent.status === 'running' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--success)', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: '12px', fontWeight: 600 }}>
                  <Activity size={12} className="animate-fade-in" style={{ animationIterationCount: 'infinite' }} /> ACTIVE
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(255, 255, 255, 0.05)', padding: '4px 8px', borderRadius: '12px', fontWeight: 600 }}>
                   SLEEPING
                </div>
              )}
            </div>

            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>{agent.name}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, flex: 1, marginBottom: '24px' }}>
              {agent.description}
            </p>

            {agent.status === 'running' && (
              <div className="animate-fade-in" style={{ marginBottom: '20px', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  <span>Tasks Executed</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{agent.metrics.optimized} / {agent.metrics.analyzed}</span>
                </div>
                <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${(agent.metrics.optimized / agent.metrics.analyzed) * 100}%`, height: '100%', background: 'var(--accent-primary)', minWidth: '5%' }}></div>
                </div>
              </div>
            )}

            <button 
              className={agent.status === 'running' ? "btn btn-secondary" : "btn btn-primary"} 
              style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}
              onClick={() => toggleAgentStatus(agent.id, agent.status)}
            >
              {agent.status === 'running' ? (
                <><Pause size={18} /> Pause Agent</>
              ) : (
                <><Play size={18} /> Deploy Agent</>
              )}
            </button>
          </GlassCard>
        )})}
      </div>

    </div>
  );
};
