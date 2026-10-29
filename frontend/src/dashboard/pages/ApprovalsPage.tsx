import React, { useEffect, useState, useTransition } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { GlassCard } from '../components/GlassCard';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  Edit3,
  Send,
  Sliders,
  Star,
  Megaphone,
  TrendingUp,
  FileText,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import {
  fetchApprovals,
  approveApproval,
  rejectApproval,
  simulateApprovalEvent,
  type ApprovalItem,
} from '../../store/slices/approvalsSlice';
import type { RootState, AppDispatch } from '../../store';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const COWORKER_COLORS: Record<string, { bg: string; text: string; border: string; name: string }> = {
  max: { bg: 'rgba(6,101,255,0.15)', text: '#60a5fa', border: 'rgba(6,101,255,0.3)', name: 'Max (Growth)' },
  stella: { bg: 'rgba(16,185,129,0.15)', text: '#34d399', border: 'rgba(16,185,129,0.3)', name: 'Stella (Presence)' },
  atlas: { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24', border: 'rgba(245,158,11,0.3)', name: 'Atlas (Operations)' },
  echo: { bg: 'rgba(139,92,246,0.15)', text: '#c084fc', border: 'rgba(139,92,246,0.3)', name: 'Echo (Experience)' },
};

const PRIORITY_BADGES: Record<string, { bg: string; color: string; label: string }> = {
  urgent: { bg: 'rgba(239,68,68,0.2)', color: '#f87171', label: 'Urgent' },
  high: { bg: 'rgba(245,158,11,0.2)', color: '#fbbf24', label: 'High' },
  medium: { bg: 'rgba(6,101,255,0.2)', color: '#60a5fa', label: 'Standard' },
  low: { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8', label: 'Low' },
};

export const ApprovalsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, pendingCount, status } = useSelector((state: RootState) => state.approvals);

  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [selectedCoworker, setSelectedCoworker] = useState<string>('all');
  const [isSimulating, setIsSimulating] = useState(false);
  const [, startTransition] = useTransition();

  // Edit draft state per approvalId
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftEdits, setDraftEdits] = useState<Record<string, string>>({});

  useEffect(() => {
    dispatch(
      fetchApprovals({
        status: activeTab,
        coworker: selectedCoworker !== 'all' ? selectedCoworker : undefined,
      }),
    );
  }, [dispatch, activeTab, selectedCoworker]);

  const handleApprove = async (approval: ApprovalItem) => {
    const editedReply = draftEdits[approval.approvalId];
    const editedData = editedReply
      ? { ...approval.proposedData, replyText: editedReply, reply: editedReply }
      : undefined;

    const result = await Swal.fire({
      title: 'Approve & Execute Action?',
      text: `This will dispatch the action (${approval.actionType}) to live integration channels.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Execute Now',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#475569',
      background: '#0a0f1e',
      color: '#f8fafc',
    });

    if (result.isConfirmed) {
      try {
        await dispatch(approveApproval({ approvalId: approval.approvalId, editedData })).unwrap();
        toast.success('Action approved and executed successfully!');
        setEditingId(null);
      } catch (err: any) {
        toast.error(err.message || 'Execution failed.');
      }
    }
  };

  const handleReject = async (approval: ApprovalItem) => {
    const { value: reason } = await Swal.fire({
      title: 'Reject Action Proposal',
      input: 'textarea',
      inputLabel: 'Reason for rejection (logged for agent fine-tuning):',
      inputPlaceholder: 'e.g. Tone too informal, budget shift too aggressive...',
      showCancelButton: true,
      confirmButtonText: 'Confirm Rejection',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#475569',
      background: '#0a0f1e',
      color: '#f8fafc',
      inputValidator: (value) => {
        if (!value || value.trim().length < 5) {
          return 'Please write a brief reason (at least 5 characters).';
        }
      },
    });

    if (reason) {
      try {
        await dispatch(rejectApproval({ approvalId: approval.approvalId, reason })).unwrap();
        toast.success('Action proposal rejected.');
      } catch (err: any) {
        toast.error(err.message || 'Rejection failed.');
      }
    }
  };

  const handleSimulate = async (type: 'review' | 'budget', rating: number = 2) => {
    setIsSimulating(true);
    try {
      await dispatch(
        simulateApprovalEvent({
          type,
          rating,
          reviewerName: rating <= 2 ? 'Kunal Verma' : 'Priya Mehta',
          reviewText:
            rating <= 2
              ? 'Terrible experience with delayed delivery. Called support 3 times without a callback. Want a refund!'
              : 'Absolutely love the new software release! The team helped us scale our inquiries within 48 hours.',
        }),
      ).unwrap();

      toast.success(
        type === 'review'
          ? `Simulated ${rating}★ review event emitted. Stella has drafted a response in queue!`
          : 'Simulated budget anomaly event emitted. Max has staged an ad spend adjustment!',
      );

      // Refresh queue after short pause
      setTimeout(() => {
        startTransition(() => {
          dispatch(
            fetchApprovals({
              status: activeTab,
              coworker: selectedCoworker !== 'all' ? selectedCoworker : undefined,
            }),
          );
        });
      }, 700);
    } catch {
      toast.error('Simulation failed.');
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div style={{ padding: '28px 32px', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* ── Top Header ── */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #0665ff 0%, #22d3ee 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 18px rgba(6,101,255,0.4)',
              }}
            >
              <ShieldCheck size={24} color="#ffffff" />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              AI Governance & <span style={{ color: 'var(--accent-primary)' }}>Approvals Queue</span>
            </h1>
            {pendingCount > 0 && (
              <span
                style={{
                  background: 'rgba(239,68,68,0.2)',
                  color: '#f87171',
                  border: '1px solid rgba(239,68,68,0.3)',
                  padding: '3px 12px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <AlertCircle size={14} />
                {pendingCount} Pending Review
              </span>
            )}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', margin: 0 }}>
            Human-in-the-Loop policy gate: review, refine, or approve AI-proposed ad shifts, review replies, and customer outreach.
          </p>
        </div>

        {/* ── Quick Event Simulation Bar (For Testing Acceptance Tests) ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255,255,255,0.03)',
            padding: '8px 12px',
            borderRadius: '14px',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={14} color="#f59e0b" /> Simulate Events:
          </span>
          <button
            onClick={() => handleSimulate('review', 2)}
            disabled={isSimulating}
            style={{
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#f87171',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Star size={12} fill="#f87171" /> 2★ Google Review
          </button>
          <button
            onClick={() => handleSimulate('review', 5)}
            disabled={isSimulating}
            style={{
              background: 'rgba(16,185,129,0.15)',
              border: '1px solid rgba(16,185,129,0.3)',
              color: '#34d399',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Star size={12} fill="#34d399" /> 5★ Review
          </button>
          <button
            onClick={() => handleSimulate('budget')}
            disabled={isSimulating}
            style={{
              background: 'rgba(6,101,255,0.15)',
              border: '1px solid rgba(6,101,255,0.3)',
              color: '#60a5fa',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Megaphone size={12} /> Ad Spend Anomaly
          </button>
        </div>
      </div>

      {/* ── Status Tabs & Coworker Filter ── */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          paddingBottom: '14px',
        }}
      >
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['pending', 'approved', 'rejected', 'all'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                fontSize: '0.86rem',
                fontWeight: 600,
                textTransform: 'capitalize',
                background: activeTab === tab ? 'var(--accent-primary)' : 'rgba(255,255,255,0.03)',
                color: activeTab === tab ? '#ffffff' : 'var(--text-secondary)',
                border: activeTab === tab ? '1px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.06)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {tab === 'pending' ? `Pending (${pendingCount})` : tab}
            </button>
          ))}
        </div>

        {/* Filter by Coworker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sliders size={13} /> Coworker:
          </span>
          {['all', 'max', 'stella', 'atlas', 'echo'].map((cw) => (
            <button
              key={cw}
              onClick={() => setSelectedCoworker(cw)}
              style={{
                padding: '5px 12px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 600,
                textTransform: 'capitalize',
                background: selectedCoworker === cw ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: selectedCoworker === cw ? 'var(--text-primary)' : 'var(--text-dim)',
                border: selectedCoworker === cw ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
                cursor: 'pointer',
              }}
            >
              {cw === 'all' ? 'All Coworkers' : cw.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* ── Approvals List ── */}
      {status === 'loading' ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <RefreshCw size={28} className="animate-spin" color="var(--accent-primary)" />
        </div>
      ) : items.length === 0 ? (
        <GlassCard style={{ padding: '60px 20px', textAlign: 'center', borderRadius: '16px' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(16,185,129,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <CheckCircle2 size={32} color="#10b981" />
          </div>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
            All Clear! No {activeTab} approvals found.
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '440px', margin: '0 auto 20px' }}>
            When agents detect anomalies, negative reviews, or proposed ad launches that require human review, they will appear right here.
          </p>
          <button
            onClick={() => handleSimulate('review', 2)}
            style={{
              padding: '10px 20px',
              background: 'var(--accent-primary)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
            }}
          >
            Simulate a Review to Test Workflow
          </button>
        </GlassCard>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {items.map((item) => {
            const cw = COWORKER_COLORS[item.coworker] || COWORKER_COLORS.max;
            const prio = PRIORITY_BADGES[item.priority] || PRIORITY_BADGES.medium;
            const isEditing = editingId === item.approvalId;
            const proposedText =
              draftEdits[item.approvalId] !== undefined
                ? draftEdits[item.approvalId]
                : item.proposedData?.replyText ||
                  item.proposedData?.reply ||
                  item.proposedData?.reason ||
                  JSON.stringify(item.proposedData, null, 2);

            return (
              <GlassCard
                key={item.approvalId}
                style={{
                  borderRadius: '18px',
                  padding: '24px',
                  border: item.status === 'pending' ? '1px solid rgba(6,101,255,0.25)' : '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(15,22,41,0.7)',
                }}
              >
                {/* ── Top Bar of Card ── */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '16px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        background: cw.bg,
                        color: cw.text,
                        border: `1px solid ${cw.border}`,
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      {cw.name}
                    </span>

                    <span
                      style={{
                        background: prio.bg,
                        color: prio.color,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                      }}
                    >
                      {prio.label} Priority
                    </span>

                    <span
                      style={{
                        background:
                          item.status === 'approved'
                            ? 'rgba(16,185,129,0.15)'
                            : item.status === 'rejected'
                            ? 'rgba(239,68,68,0.15)'
                            : 'rgba(245,158,11,0.15)',
                        color:
                          item.status === 'approved'
                            ? '#34d399'
                            : item.status === 'rejected'
                            ? '#f87171'
                            : '#fbbf24',
                        padding: '3px 10px',
                        borderRadius: '20px',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        textTransform: 'capitalize',
                      }}
                    >
                      Status: {item.status}
                    </span>
                  </div>

                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={13} /> {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>

                {/* ── Title & Reason Callout ── */}
                <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', margin: '0 0 6px 0', fontWeight: 700 }}>
                  {item.title}
                </h3>
                {item.description && (
                  <div
                    style={{
                      background: 'rgba(245,158,11,0.08)',
                      borderLeft: '3px solid #f59e0b',
                      padding: '8px 12px',
                      borderRadius: '0 8px 8px 0',
                      marginBottom: '16px',
                      fontSize: '0.85rem',
                      color: '#fbbf24',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <AlertTriangle size={15} style={{ flexShrink: 0 }} />
                    <span>{item.description}</span>
                  </div>
                )}

                {/* ── Side-by-Side Comparison Grid ── */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: '16px',
                    marginBottom: '20px',
                  }}
                >
                  {/* Left: Original Context */}
                  <div
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '12px',
                      padding: '14px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.78rem',
                        color: 'var(--text-dim)',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <FileText size={13} /> Incoming Context / Source Data
                    </div>
                    {item.originalContext?.review_text || item.originalContext?.content ? (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                            {item.originalContext?.reviewerName || 'Customer'}
                          </span>
                          {item.originalContext?.rating && (
                            <span style={{ color: '#fbbf24', fontSize: '0.85rem' }}>
                              {'★'.repeat(item.originalContext.rating)} ({item.originalContext.rating}/5)
                            </span>
                          )}
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0, fontStyle: 'italic' }}>
                          "{item.originalContext?.review_text || item.originalContext?.content}"
                        </p>
                      </div>
                    ) : item.originalContext?.campaignName ? (
                      <div>
                        <p style={{ color: 'var(--text-primary)', fontWeight: 600, margin: '0 0 4px 0' }}>
                          Campaign: {item.originalContext?.campaignName}
                        </p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                          Current Budget Cap: <strong>${item.originalContext?.currentBudget}</strong>
                        </p>
                      </div>
                    ) : (
                      <pre
                        style={{
                          margin: 0,
                          fontSize: '0.78rem',
                          color: 'var(--text-secondary)',
                          whiteSpace: 'pre-wrap',
                          maxHeight: '140px',
                          overflow: 'auto',
                        }}
                      >
                        {JSON.stringify(item.originalContext || item.proposedData, null, 2)}
                      </pre>
                    )}
                  </div>

                  {/* Right: Agent Proposed Action */}
                  <div
                    style={{
                      background: 'rgba(6,101,255,0.03)',
                      border: '1px solid rgba(6,101,255,0.18)',
                      borderRadius: '12px',
                      padding: '14px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.78rem',
                          color: '#60a5fa',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Sparkles size={13} color="#60a5fa" /> Proposed Agent Action
                      </span>
                      {item.status === 'pending' && (
                        <button
                          onClick={() => {
                            if (isEditing) {
                              setEditingId(null);
                            } else {
                              setEditingId(item.approvalId);
                              if (draftEdits[item.approvalId] === undefined) {
                                setDraftEdits((prev) => ({
                                  ...prev,
                                  [item.approvalId]: item.proposedData?.replyText || item.proposedData?.reply || '',
                                }));
                              }
                            }
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: isEditing ? '#34d399' : '#60a5fa',
                            fontSize: '0.76rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Edit3 size={12} /> {isEditing ? 'Done Editing' : 'Edit Draft'}
                        </button>
                      )}
                    </div>

                    {isEditing ? (
                      <textarea
                        value={draftEdits[item.approvalId] || ''}
                        onChange={(e) =>
                          setDraftEdits((prev) => ({
                            ...prev,
                            [item.approvalId]: e.target.value,
                          }))
                        }
                        rows={4}
                        style={{
                          width: '100%',
                          background: 'rgba(10,15,30,0.8)',
                          color: '#f8fafc',
                          border: '1px solid rgba(6,101,255,0.4)',
                          borderRadius: '8px',
                          padding: '10px',
                          fontSize: '0.88rem',
                          fontFamily: 'inherit',
                          resize: 'vertical',
                          outline: 'none',
                        }}
                      />
                    ) : item.actionType === 'adjust_budget' ? (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Shift Daily Spend:</span>
                          <span style={{ color: '#34d399', fontWeight: 700, fontSize: '1.05rem' }}>
                            ${item.proposedData?.currentBudget} → ${item.proposedData?.newBudget}
                          </span>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', margin: 0 }}>
                          {item.proposedData?.reason}
                        </p>
                      </div>
                    ) : (
                      <p
                        style={{
                          color: 'var(--text-primary)',
                          fontSize: '0.9rem',
                          lineHeight: '1.5',
                          margin: 0,
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {proposedText}
                      </p>
                    )}
                  </div>
                </div>

                {/* ── Footer Actions ── */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    paddingTop: '16px',
                  }}
                >
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                    Action Executor: <code style={{ color: '#93c5fd' }}>{item.actionType}</code>
                  </div>

                  {item.status === 'pending' ? (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => handleReject(item)}
                        style={{
                          padding: '8px 16px',
                          background: 'rgba(239,68,68,0.1)',
                          color: '#f87171',
                          border: '1px solid rgba(239,68,68,0.3)',
                          borderRadius: '10px',
                          fontWeight: 600,
                          fontSize: '0.84rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <XCircle size={15} /> Reject
                      </button>
                      <button
                        onClick={() => handleApprove(item)}
                        style={{
                          padding: '8px 20px',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '10px',
                          fontWeight: 700,
                          fontSize: '0.86rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 4px 14px rgba(16,185,129,0.35)',
                        }}
                      >
                        <CheckCircle2 size={16} /> Approve & Execute
                      </button>
                    </div>
                  ) : item.status === 'approved' ? (
                    <span
                      style={{
                        color: '#34d399',
                        fontSize: '0.84rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <CheckCircle2 size={15} /> Approved & Executed by {item.reviewedBy || 'User'}
                    </span>
                  ) : (
                    <span
                      style={{
                        color: '#f87171',
                        fontSize: '0.84rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <XCircle size={15} /> Rejected: {item.rejectionReason}
                    </span>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
};

