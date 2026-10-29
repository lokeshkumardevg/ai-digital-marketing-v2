import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/GlassCard';
import { api } from '../../api/axios';
import {
  Users,
  Megaphone,
  Search,
  Star,
  MessageSquare,
  Globe,
  Share2,
  Headphones,
  Calendar,
  Clock,
  Repeat,
  TrendingUp,
  ShieldCheck,
  Mic,
  CheckSquare,
  Ticket,
  HeartHandshake,
  Target,
  FileText,
  Bot,
  Layers,
  Palette,
  Zap,
  Sparkles,
  Send,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { SectionLoader } from '../components/Loader';

const AGENT_ICON_MAP: Record<string, React.ElementType> = {
  Megaphone,
  Search,
  Users,
  Layers,
  Sparkles,
  Palette,
  Zap,
  Star,
  MessageSquare,
  MapPin: Globe,
  Globe,
  Share2,
  MessageCircle: MessageSquare,
  Bot,
  Headphones,
  Calendar,
  Clock,
  Repeat,
  TrendingUp,
  ShieldCheck,
  Mic,
  CheckSquare,
  Ticket,
  HeartHandshake,
  Target,
  FileText,
};

export const CoworkersPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const activeCoworkerId = id?.toLowerCase() || 'max';

  const [coworkersList, setCoworkersList] = useState<any[]>([]);
  const [detailData, setDetailData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [taskPrompt, setTaskPrompt] = useState('');
  const [submittingTask, setSubmittingTask] = useState(false);

  // Fetch list of 4 coworkers
  useEffect(() => {
    const fetchList = async () => {
      try {
        const res = await api.get('/v1/coworkers');
        setCoworkersList(res.data.coworkers || []);
      } catch (err: any) {
        console.error(err);
      }
    };
    fetchList();
  }, []);

  // Fetch detail for selected coworker
  const fetchDetail = async (cid: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/v1/coworkers/${cid}`);
      setDetailData(res.data);
    } catch (err: any) {
      toast.error(`Failed to load coworker: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail(activeCoworkerId);
  }, [activeCoworkerId]);

  const handleToggleMode = async (agentId: string, currentMode: string) => {
    const newMode = currentMode === 'approval' ? 'auto' : 'approval';
    try {
      await api.patch(`/v1/coworkers/agents/${agentId}/settings`, { mode: newMode });
      toast.success(`Agent mode changed to ${newMode === 'approval' ? 'Approval Required' : 'Autonomous Auto'}`);
      fetchDetail(activeCoworkerId);
    } catch {
      toast.error('Failed to update agent mode.');
    }
  };

  const handleRunTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskPrompt.trim()) return;

    setSubmittingTask(true);
    try {
      await api.post(`/v1/coworkers/${activeCoworkerId}/tasks`, { instruction: taskPrompt });
      toast.success(`Task dispatched to ${detailData?.coworker?.name || 'Coworker'}! Action staged in Approvals.`);
      setTaskPrompt('');
      fetchDetail(activeCoworkerId);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to dispatch task.');
    } finally {
      setSubmittingTask(false);
    }
  };

  const coworker = detailData?.coworker;
  const agents: any[] = detailData?.agents || [];
  const recentRuns: any[] = detailData?.recentRuns || [];

  return (
    <div style={{ padding: '28px 32px', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* ── Coworker Selector Tabs ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px',
          marginBottom: '28px',
        }}
      >
        {coworkersList.map((cw) => {
          const isActive = activeCoworkerId === cw.id;
          return (
            <GlassCard
              key={cw.id}
              onClick={() => navigate(`/coworkers/${cw.id}`)}
              style={{
                cursor: 'pointer',
                borderRadius: '16px',
                padding: '16px 20px',
                border: isActive ? `2px solid ${cw.accent}` : '1px solid rgba(255,255,255,0.08)',
                background: isActive ? `${cw.accent}14` : 'rgba(15,22,41,0.6)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: `${cw.accent}20`,
                  border: `2px solid ${cw.accent}40`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                <img
                  src={cw.avatar}
                  alt={cw.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    // Fallback to text initials if mascot image isn't loaded
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {cw.name}
                  </h3>
                  <span
                    style={{
                      background: `${cw.accent}20`,
                      color: cw.accent,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '12px',
                    }}
                  >
                    {cw.domain}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '3px' }}>
                  {cw.builtCount} Built · {cw.partialCount} Partial · {cw.pendingCount} Pending
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {loading ? (
        <div style={{ padding: '80px 0' }}>
          <SectionLoader />
        </div>
      ) : (
        <>
          {/* ── Coworker Hero Banner ── */}
          {coworker && (
            <GlassCard
              style={{
                borderRadius: '20px',
                padding: '28px 32px',
                marginBottom: '28px',
                background: `radial-gradient(circle at 10% 20%, ${coworker.accent}18, transparent 40%), rgba(15,22,41,0.85)`,
                border: `1px solid ${coworker.accent}30`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '24px',
                  marginBottom: '24px',
                }}
              >
                <div style={{ maxWidth: '650px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span
                      style={{
                        background: coworker.accent,
                        color: '#ffffff',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      AI Coworker: {coworker.domain}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                      Governed Multi-Agent Workforce
                    </span>
                  </div>
                  <h1 style={{ fontSize: '2.1rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 10px 0' }}>
                    Meet <span style={{ color: coworker.accent }}>{coworker.name}</span>
                  </h1>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', lineHeight: '1.5', margin: 0 }}>
                    {coworker.tagline}
                  </p>
                </div>

                {/* Outcome Metrics Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '12px',
                    background: 'rgba(255,255,255,0.02)',
                    padding: '16px 20px',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  {coworker.outcomeMetrics?.map((m: any, idx: number) => (
                    <div key={idx} style={{ minWidth: '130px' }}>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                        {m.label}
                      </div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: coworker.accent, marginTop: '2px' }}>
                        {m.format}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Assign Task in Plain English ── */}
              <form
                onSubmit={handleRunTask}
                style={{
                  display: 'flex',
                  gap: '12px',
                  background: 'rgba(10,15,30,0.8)',
                  padding: '10px 16px',
                  borderRadius: '14px',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', color: coworker.accent }}>
                  <Sparkles size={20} />
                </div>
                <input
                  type="text"
                  value={taskPrompt}
                  onChange={(e) => setTaskPrompt(e.target.value)}
                  placeholder={`Assign a plain-English task to ${coworker.name} (e.g. "Review customer feedback and craft personalized replies for 1-2 star complaints")...`}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    color: '#f8fafc',
                    fontSize: '0.92rem',
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  disabled={submittingTask || !taskPrompt.trim()}
                  style={{
                    padding: '10px 22px',
                    background: coworker.accent,
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.86rem',
                    cursor: submittingTask || !taskPrompt.trim() ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    opacity: submittingTask || !taskPrompt.trim() ? 0.6 : 1,
                  }}
                >
                  <Send size={15} /> {submittingTask ? 'Assigning...' : 'Assign Task'}
                </button>
              </form>
            </GlassCard>
          )}

          {/* ── Agents Grid ── */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Specialized Agents Under {coworker?.name}
                </h2>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-dim)', margin: '4px 0 0 0' }}>
                  Each agent operates within strict policy boundaries. Switch between Approval Required and Autonomous execution.
                </p>
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {agents.length} Total Registered
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: '18px',
              }}
            >
              {agents.map((agent: any) => {
                const IconComponent = AGENT_ICON_MAP[agent.icon] || Bot;
                const isAuto = agent.settings?.mode === 'auto';
                const statusColor =
                  agent.buildStatus === 'built'
                    ? '#10b981'
                    : agent.buildStatus === 'partial'
                    ? '#f59e0b'
                    : '#8b5cf6';

                return (
                  <GlassCard
                    key={agent.agentId}
                    style={{
                      borderRadius: '16px',
                      padding: '22px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      border: '1px solid rgba(255,255,255,0.08)',
                      background: 'rgba(15,22,41,0.65)',
                    }}
                  >
                    <div>
                      {/* Top Badges */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '14px',
                        }}
                      >
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: `${statusColor}18`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <IconComponent size={22} color={statusColor} />
                        </div>

                        <div style={{ display: 'flex', gap: '6px' }}>
                          <span
                            style={{
                              background: `${statusColor}20`,
                              color: statusColor,
                              border: `1px solid ${statusColor}40`,
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                            }}
                          >
                            {agent.buildStatus}
                          </span>
                          <span
                            style={{
                              background: 'rgba(255,255,255,0.06)',
                              color: 'var(--text-dim)',
                              padding: '3px 6px',
                              borderRadius: '6px',
                              fontSize: '0.7rem',
                            }}
                          >
                            v{agent.version}
                          </span>
                        </div>
                      </div>

                      <h3 style={{ fontSize: '1.08rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
                        {agent.name}
                      </h3>
                      <p
                        style={{
                          fontSize: '0.86rem',
                          color: 'var(--text-secondary)',
                          lineHeight: '1.45',
                          margin: '0 0 16px 0',
                          minHeight: '40px',
                        }}
                      >
                        {agent.description}
                      </p>

                      {/* Trigger Event & Tools */}
                      <div
                        style={{
                          background: 'rgba(255,255,255,0.02)',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          color: 'var(--text-dim)',
                          marginBottom: '16px',
                          border: '1px solid rgba(255,255,255,0.04)',
                        }}
                      >
                        <div style={{ marginBottom: '4px' }}>
                          <strong style={{ color: 'var(--text-secondary)' }}>Trigger:</strong>{' '}
                          <code>{agent.trigger?.event || 'scheduled'}</code>
                        </div>
                        <div>
                          <strong style={{ color: 'var(--text-secondary)' }}>Tools:</strong>{' '}
                          {agent.tools?.slice(0, 2).join(', ')}
                          {agent.tools?.length > 2 && ` +${agent.tools.length - 2} more`}
                        </div>
                      </div>
                    </div>

                    {/* Mode Toggle Footer */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderTop: '1px solid rgba(255,255,255,0.06)',
                        paddingTop: '14px',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>Policy Mode:</div>
                        <div
                          style={{
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            color: isAuto ? '#34d399' : '#fbbf24',
                          }}
                        >
                          {isAuto ? 'Autonomous Auto' : 'Approval Gate'}
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleMode(agent.agentId, agent.settings?.mode || 'approval')}
                        style={{
                          background: isAuto ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                          border: isAuto ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(245,158,11,0.3)',
                          color: isAuto ? '#34d399' : '#fbbf24',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        {isAuto ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                        {isAuto ? 'Set Approval' : 'Set Auto'}
                      </button>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          </div>

          {/* ── Recent Runs Timeline ── */}
          {recentRuns.length > 0 && (
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '14px' }}>
                Recent Runs for {coworker?.name}
              </h2>
              <GlassCard style={{ borderRadius: '16px', padding: '16px', background: 'rgba(15,22,41,0.6)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {recentRuns.map((run: any) => (
                    <div
                      key={run.runId}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        background: 'rgba(255,255,255,0.02)',
                        borderRadius: '10px',
                        border: '1px solid rgba(255,255,255,0.04)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span
                          style={{
                            background:
                              run.status === 'executed'
                                ? 'rgba(16,185,129,0.2)'
                                : run.status === 'awaiting_approval'
                                ? 'rgba(245,158,11,0.2)'
                                : 'rgba(239,68,68,0.2)',
                            color:
                              run.status === 'executed'
                                ? '#34d399'
                                : run.status === 'awaiting_approval'
                                ? '#fbbf24'
                                : '#f87171',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                          }}
                        >
                          {run.status}
                        </span>
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {run.proposedAction?.summary || run.agentId}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                            Run ID: {run.runId.slice(0, 8)} · Model: {run.model}
                          </div>
                        </div>
                      </div>

                      <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                        {new Date(run.startedAt).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          )}
        </>
      )}
    </div>
  );
};

