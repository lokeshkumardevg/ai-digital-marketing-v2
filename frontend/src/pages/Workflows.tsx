import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../components/GlassCard';
import { 
  GitBranch, 
  Play, 
  Pause, 
  Plus, 
  Zap, 
  Clock, 
  Bot, 
  Globe, 
  Search,
  Megaphone,
  Activity,
  ChevronRight,
  Target,
  BarChart,
  Settings,
  X
} from 'lucide-react';
import { fetchWorkflows, toggleWorkflow } from '../store/slices/workflowsSlice';
import { SmartTable } from '../components/SmartTable';
import type { AppDispatch } from '../store';
import toast from 'react-hot-toast';

const NODE_THEMES: Record<string, { icon: any, color: string, label: string }> = {
  trigger: { icon: Zap, color: '#f59e0b', label: 'Trigger Event' },
  scraper: { icon: Search, color: '#06b6d4', label: 'AI Web Scraper' },
  agent: { icon: Bot, color: '#8b5cf6', label: 'AI Marketing Agent' },
  ads: { icon: Megaphone, color: '#ec4899', label: 'Ad Platform Sync' },
  condition: { icon: GitBranch, color: '#f43f5e', label: 'Smart Router' },
  delay: { icon: Clock, color: '#64748b', label: 'Delay' },
  conversion: { icon: Target, color: '#10b981', label: 'ROI Tracking' }
};

export const Workflows: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { workflows } = useSelector((state: any) => state.workflows);
  const { activeWebsiteId } = useSelector((state: any) => state.workspace);
  const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'canvas' | 'table'>('canvas');
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchWorkflows(activeWebsiteId));
  }, [dispatch, activeWebsiteId]);

  useEffect(() => {
    if (workflows.length > 0 && !selectedWorkflow) {
      setSelectedWorkflow(workflows[0]);
    }
  }, [workflows, selectedWorkflow]);

  const handleToggle = async (id: string) => {
    try {
      await dispatch(toggleWorkflow(id)).unwrap();
      toast.success('Workflow state updated.');
    } catch (err) {
      toast.error('Failed to update workflow.');
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>
            Marketing <span className="text-gradient">Flow Builder</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Design omni-channel automation journeys with AI-driven execution paths.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '12px', marginRight: '16px', border: '1px solid var(--glass-border)' }}>
            <button 
              className={`btn ${viewMode === 'canvas' ? 'btn-primary' : ''}`} 
              onClick={() => setViewMode('canvas')}
              style={{ padding: '8px 16px', background: viewMode === 'canvas' ? 'var(--accent-primary)' : 'transparent', border: 'none', color: '#fff', fontSize: '0.8rem', borderRadius: '8px' }}
            >
              Canvas View
            </button>
            <button 
              className={`btn ${viewMode === 'table' ? 'btn-primary' : ''}`} 
              onClick={() => setViewMode('table')}
              style={{ padding: '8px 16px', background: viewMode === 'table' ? 'var(--accent-primary)' : 'transparent', border: 'none', color: '#fff', fontSize: '0.8rem', borderRadius: '8px' }}
            >
              Performance
            </button>
          </div>
          <button className="btn btn-primary" onClick={() => toast('Initializing Quantum Canvas...')}>
            <Plus size={18} style={{ marginRight: '8px' }} /> New Journey
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className="animate-fade-in">
           <SmartTable 
             title="Journey Audit Report"
             searchPlaceholder="Find automation sequences..."
             columns={[
                { 
                  key: 'name', 
                  label: 'Journey Name', 
                  sortable: true,
                  render: (row) => (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                       <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: row.status === 'Active' ? 'var(--success)' : 'var(--text-secondary)' }} />
                       <div style={{ fontWeight: 600 }}>{row.name}</div>
                    </div>
                  )
                },
                {
                   key: 'status',
                   label: 'State',
                   sortable: true,
                   render: (row) => (
                    <span style={{ 
                      fontSize: '0.7rem', fontWeight: 700, 
                      background: row.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)', 
                      color: row.status === 'Active' ? 'var(--success)' : 'var(--text-secondary)', 
                      padding: '4px 10px', borderRadius: '12px', border: '1px solid currentColor' 
                    }}>
                      {row.status.toUpperCase()}
                    </span>
                   )
                },
                {
                   key: 'executionsCount',
                   label: 'Total Executions',
                   sortable: true,
                   render: (row) => <div style={{ color: 'var(--info)' }}>{row.executionsCount?.toLocaleString() || 0}</div>
                },
                {
                   key: 'successRate',
                   label: 'Conversion %',
                   sortable: true,
                   render: (row) => (
                     <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', width: '60px' }}>
                           <div style={{ width: `${row.successRate}%`, height: '100%', background: 'var(--accent-primary)', borderRadius: '2px' }} />
                        </div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{row.successRate}%</div>
                     </div>
                   )
                }
             ]}
             data={workflows}
             actions={(row) => (
                <button 
                   className="btn-secondary" 
                   style={{ padding: '6px' }}
                   onClick={() => handleToggle(row._id)}
                >
                   {row.status === 'Active' ? <Pause size={14} /> : <Play size={14} />}
                </button>
             )}
           />
        </div>
      ) : (
      <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px', height: 'calc(100vh - 250px)' }}>
        
        {/* Visual Flow Canvas */}
        <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius-xl)', border: '1px solid var(--glass-border)', background: '#ffffff', boxShadow: '0 10px 40px rgba(112, 51, 245, 0.05)' }}>
            
            {/* Canvas Grid Pattern */}
            <div style={{ 
              position: 'absolute', inset: 0, 
              backgroundImage: 'radial-gradient(circle, rgba(112, 51, 245, 0.08) 1px, transparent 1px)', 
              backgroundSize: '40px 40px', 
              opacity: 0.5 
            }} />

            <div style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 10, display: 'flex', gap: '8px' }}>
               <div style={{ background: '#ffffff', padding: '10px 20px', borderRadius: '30px', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                  <Activity size={14} color="var(--success)" className="animate-pulse" /> Live Analysis
               </div>
               <div style={{ background: '#ffffff', padding: '10px 20px', borderRadius: '30px', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                  <Globe size={14} color="var(--accent-primary)" /> Project Hub
               </div>
            </div>

            {selectedWorkflow ? (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                 
                 {/* SVG Connection Layer */}
                 <svg style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
                    <defs>
                      <linearGradient id="flowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.1" />
                        <stop offset="50%" stopColor="var(--accent-primary)" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0.1" />
                      </linearGradient>
                    </defs>
                    
                    <motion.path 
                      d="M 500 100 L 500 450" 
                      stroke="url(#flowGradient)" 
                      strokeWidth="2" 
                      fill="none" 
                      strokeDasharray="6 6" 
                      animate={{ strokeDashoffset: [0, -24] }} 
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    />
                 </svg>

                 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '70px', zIndex: 5 }}>
                    {selectedWorkflow.config.nodes.map((node: any, idx: number) => {
                       const theme = NODE_THEMES[node.type] || NODE_THEMES.trigger;
                       const Icon = theme.icon;
                       const isActive = activeNodeId === node.id;
                       
                       return (
                         <motion.div 
                           key={node.id}
                           initial={{ opacity: 0, y: 20 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ delay: idx * 0.1 }}
                           onClick={() => setActiveNodeId(node.id)}
                           style={{ 
                             width: '300px', padding: '24px', 
                             background: '#ffffff',
                             borderRadius: 'var(--radius-lg)', 
                             border: `2px solid ${isActive ? theme.color : 'rgba(112, 51, 245, 0.05)'}`, 
                             boxShadow: isActive ? `0 15px 40px ${theme.color}22` : '0 10px 30px rgba(0,0,0,0.04)',
                             display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', cursor: 'pointer',
                             transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                           }}
                           whileHover={{ scale: 1.02, boxShadow: '0 20px 50px rgba(112, 51, 245, 0.1)' }}
                         >
                            <div style={{ 
                               width: '52px', height: '52px', borderRadius: '16px', 
                               background: `${theme.color}10`,
                               color: theme.color,
                               display: 'flex', alignItems: 'center', justifyContent: 'center',
                               border: `1px solid ${theme.color}22`
                            }}>
                               <Icon size={26} />
                            </div>
                            <div style={{ flex: 1 }}>
                               <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: '4px' }}>{theme.label}</div>
                               <div style={{ fontWeight: 700, fontSize: '1rem', color: '#141414' }}>{node.data.label}</div>
                            </div>
                            <ChevronRight size={20} color="#cbd5e1" />

                            {/* Node Connection Points */}
                            <div style={{ position: 'absolute', top: '-8px', left: '50%', transform: 'translateX(-50%)', width: '16px', height: '16px', borderRadius: '50%', background: theme.color, border: '4px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                            <div style={{ position: 'absolute', bottom: '-8px', left: '50%', transform: 'translateX(-50%)', width: '16px', height: '16px', borderRadius: '50%', background: theme.color, border: '4px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                         </motion.div>
                       )
                    })}
                 </div>
              </div>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontWeight: 500 }}>
                 Load a marketing sequence to visualize the flow.
              </div>
            )}
        </div>


        {/* Configuration Side Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
           
           <GlassCard style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Journey Library</h3>
                 <button className="btn-secondary" style={{ padding: '6px' }} onClick={() => toast('Flow Search...') }><Plus size={16} /></button>
              </div>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                 {workflows.map((wf: any) => (
                   <div 
                     key={wf._id} 
                     onClick={() => setSelectedWorkflow(wf)}
                     style={{ 
                       padding: '16px 20px', cursor: 'pointer', transition: '0.2s',
                       background: selectedWorkflow?._id === wf._id ? 'rgba(139, 92, 246, 0.08)' : 'transparent',
                       borderLeft: `4px solid ${selectedWorkflow?._id === wf._id ? 'var(--accent-primary)' : 'transparent'}`
                     }}
                   >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <span style={{ fontWeight: selectedWorkflow?._id === wf._id ? 600 : 400, fontSize: '0.9rem' }}>{wf.name}</span>
                         <span style={{ fontSize: '0.7rem', color: wf.status === 'Active' ? 'var(--success)' : 'var(--text-secondary)' }}>{wf.status}</span>
                      </div>
                   </div>
                 ))}
              </div>
           </GlassCard>

           <AnimatePresence mode="wait">
             {activeNodeId ? (
               <motion.div
                 key={activeNodeId}
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: 20 }}
               >
                 <GlassCard style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                       <h3 style={{ fontSize: '1.1rem' }}>Node Settings</h3>
                       <button style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }} onClick={() => setActiveNodeId(null)}>
                          <X size={20} />
                       </button>
                    </div>
                    
                    <div className="input-group" style={{ marginBottom: '20px' }}>
                       <label>Action Label</label>
                       <input type="text" className="input-field" defaultValue="Optimize Creative V2" />
                    </div>

                    <div className="input-group" style={{ marginBottom: '20px' }}>
                       <label>AI Confidence Threshold</label>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <input type="range" style={{ flex: 1 }} />
                          <span style={{ fontSize: '0.85rem' }}>85%</span>
                       </div>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid var(--glass-border)', marginBottom: '24px' }}>
                       <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Logic Summary:</div>
                       <p style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>If user engagement from <b>Meta Ads</b> exceeds benchmark, trigger <b>Budget Scaling agent</b>.</p>
                    </div>

                    <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => toast.success('Node logic updated.')}>
                       Apply AI Parameters
                    </button>
                 </GlassCard>
               </motion.div>
             ) : (
               <GlassCard style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                 <div style={{ marginBottom: '16px' }}><Settings size={40} opacity={0.3} /></div>
                 <p style={{ fontSize: '0.9rem' }}>Select a node on the canvas to configure its AI logic and automation rules.</p>
               </GlassCard>
             )}
           </AnimatePresence>

        </div>

      </div>
      )}
    </div>
  );
};

