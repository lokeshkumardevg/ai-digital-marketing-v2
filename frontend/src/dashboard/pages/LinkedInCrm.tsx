import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../../store';
import {
  fetchLinkedInAccount,
  fetchLeads,
  fetchLeadStats,
  createLead,
  updateLeadStage,
  addLeadNote,
  deleteLead,
  setSelectedLead,
  getLinkedInOAuthUrl,
  disconnectLinkedInAccount,
  publishLinkedInPost,
  fetchLeadPosts,
  fetchAdCampaigns,
  fetchPosts,
  triggerProfileScrape,
  fetchOrganizations,
  connectOrganization,
  fetchEvents,
  createEvent,
  simulateRealtimeEngagement,
  simulateNewLead,
  type LinkedInLead,
} from '../../store/slices/linkedinCrmSlice';
import {
  Users,
  TrendingUp,
  Target,
  Plus,
  Search,
  X,
  Star,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Building2,
  Tag,
  Clock,
  Zap,
  UserCheck,
  Trash2,
  ExternalLink,
  Link2,
  Unplug,
  Briefcase,
  Sparkles,
  ArrowUpRight,
  Activity,
  Send,
  Loader2,
  FileText,
  MessageCircle,
  ThumbsUp,
  Megaphone,
  Calendar,
  DollarSign,
  TrendingUp as TrendingUpIcon,
  Eye,
  Hash,
  Image,
  Wand2,
} from 'lucide-react';

const PIPELINE_STAGES = [
  { key: 'new', label: 'New', color: '#6366f1', icon: Sparkles },
  { key: 'contacted', label: 'Contacted', color: '#0ea5e9', icon: Mail },
  { key: 'qualified', label: 'Qualified', color: '#f59e0b', icon: UserCheck },
  { key: 'proposal', label: 'Proposal', color: '#8b5cf6', icon: Briefcase },
  { key: 'negotiation', label: 'Negotiation', color: '#ec4899', icon: TrendingUp },
  { key: 'won', label: 'Won', color: '#22c55e', icon: Star },
  { key: 'lost', label: 'Lost', color: '#ef4444', icon: X },
];

const PRIORITY_COLORS: Record<string, string> = {
  critical: '#ef4444',
  high: '#f59e0b',
  medium: '#6366f1',
  low: '#64748b',
};

// ==================== MAIN COMPONENT ====================

export const LinkedInCrm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    connectedAccount, accountLoading, leads, leadsLoading,
    selectedLead, leadStats, adCampaigns, adsLoading,
    posts, postsLoading, organizations, orgsLoading, events, eventsLoading
  } = useSelector((state: any) => state.linkedinCrm);

  const [view, setView] = useState<'pipeline' | 'table'>('pipeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [mainTab, setMainTab] = useState<'crm' | 'ads' | 'my_posts'>('crm');
  const [showAddLead, setShowAddLead] = useState(false);
  const [showLeadDetail, setShowLeadDetail] = useState(false);
  const [showComposePost, setShowComposePost] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postImageUrl, setPostImageUrl] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [showConnectedAccountModal, setShowConnectedAccountModal] = useState(false);
  const [liAtCookie, setLiAtCookie] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [publishTarget, setPublishTarget] = useState<'personal' | 'company'>('personal');
  const [isSimulationActive, setIsSimulationActive] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New lead form
  const [newLead, setNewLead] = useState({
    name: '', headline: '', company: '', email: '', phone: '', linkedinProfileUrl: '', location: '', industry: '',
  });

  useEffect(() => {
    dispatch(fetchLinkedInAccount());
    dispatch(fetchLeads());
    dispatch(fetchLeadStats());
    dispatch(fetchAdCampaigns());
    dispatch(fetchPosts());
    dispatch(fetchOrganizations());
    dispatch(fetchEvents());
  }, [dispatch]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('linkedinConnected') === 'success') {
      dispatch(fetchLinkedInAccount());
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [dispatch]);

  // AI Simulation Loop
  useEffect(() => {
    if (!isSimulationActive) return;

    const interval = setInterval(() => {
      // 1. Always simulate engagement
      dispatch(simulateRealtimeEngagement());

      // 2. 15% chance to generate a new lead dynamically
      if (Math.random() < 0.15) {
        const mockFirsts = ['Alex', 'Sarah', 'Jordan', 'Michael', 'Emma', 'David', 'Jessica', 'Daniel', 'Sophia', 'James'];
        const mockLasts = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
        const mockTitles = ['VP of Marketing', 'CEO', 'Director of Sales', 'Founder', 'CMO', 'Growth Hacker', 'Product Manager'];
        const mockCompanies = ['TechFlow', 'Acme Corp', 'Global Solutions', 'Innovate AI', 'Stark Industries', 'Wayne Enterprises'];

        const f = mockFirsts[Math.floor(Math.random() * mockFirsts.length)];
        const l = mockLasts[Math.floor(Math.random() * mockLasts.length)];
        const t = mockTitles[Math.floor(Math.random() * mockTitles.length)];
        const c = mockCompanies[Math.floor(Math.random() * mockCompanies.length)];

        const generatedLead = {
          _id: 'sim_' + Date.now().toString(),
          name: `${f} ${l}`,
          headline: t,
          company: c,
          email: `${f.toLowerCase()}.${l.toLowerCase()}@${c.toLowerCase().replace(' ', '')}.com`,
          stage: 'new',
          aiLeadScore: Math.floor(Math.random() * 60) + 40,
          priority: Math.random() > 0.8 ? 'high' : 'medium',
          source: 'linkedin_inbound',
          tags: ['AI Sourced'],
          notes: [],
          activityLog: [{ action: 'created', timestamp: new Date().toISOString(), details: 'Lead captured by AI Agent from LinkedIn Activity.' }],
        };

        dispatch(simulateNewLead(generatedLead));

        // Show Toast
        setToastMessage(`🚀 AI Captured New Lead: ${f} ${l} (${c})`);
        setTimeout(() => setToastMessage(null), 4000);
      }
    }, 5000); // Runs every 5 seconds

    return () => clearInterval(interval);
  }, [isSimulationActive, dispatch]);

  const filteredLeads = useMemo(() => {
    let result = leads;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l: LinkedInLead) =>
          l.name.toLowerCase().includes(q) ||
          l.company?.toLowerCase().includes(q) ||
          l.headline?.toLowerCase().includes(q) ||
          l.email?.toLowerCase().includes(q),
      );
    }
    if (stageFilter) {
      result = result.filter((l: LinkedInLead) => l.stage === stageFilter);
    }
    return result;
  }, [leads, searchQuery, stageFilter]);

  const handleConnectLinkedIn = async () => {
    const result = await dispatch(getLinkedInOAuthUrl()).unwrap();
    window.location.href = result;
  };

  const handleTriggerScrape = async () => {
    if (!liAtCookie) return;
    try {
      setIsScraping(true);
      await dispatch(triggerProfileScrape(liAtCookie)).unwrap();
      setLiAtCookie('');
      alert('Scraping started! Check back in a few minutes.');
    } catch (err) {
      alert('Failed to start scraping');
    } finally {
      setIsScraping(false);
    }
  };

  const handleDisconnect = () => {
    if (connectedAccount?._id) {
      dispatch(disconnectLinkedInAccount(connectedAccount._id));
    }
  };

  const handleCreateLead = async () => {
    if (!newLead.name.trim()) return;
    await dispatch(createLead({ ...newLead, source: 'manual' }));
    setShowAddLead(false);
    setNewLead({ name: '', headline: '', company: '', email: '', phone: '', linkedinProfileUrl: '', location: '', industry: '' });
    dispatch(fetchLeadStats());
  };

  const handleStageChange = (leadId: string, stage: string) => {
    dispatch(updateLeadStage({ leadId, stage }));
  };

  const handleAddNote = (leadId: string) => {
    if (!newNote.trim()) return;
    dispatch(addLeadNote({ leadId, message: newNote, type: 'note' }));
    setNewNote('');
  };

  const handleGenerateAiPost = async () => {
    if (!aiPrompt.trim()) return;
    setIsGeneratingAi(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000'}/ai/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          prompt: `Write a highly engaging, professional LinkedIn post about: ${aiPrompt}. Include relevant emojis and 3-5 trending hashtags at the end. Make it read naturally for a personal profile.`,
          context: 'LinkedIn Social Media Manager'
        })
      });
      const data = await res.json();
      console.log('AI Response:', data);

      if (data.success && data.data) {
        const generatedText = typeof data.data === 'string' ? data.data : (data.data.content || JSON.stringify(data.data));
        setPostContent(generatedText);
        setAiPrompt('');
      } else {
        alert('Failed to generate post from AI. Please try again.');
      }
    } catch (e) {
      console.error(e);
      alert('Error generating post. Check console.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setPostImageUrl(url);
    }
  };

  const handleGenerateImage = () => {
    if (!aiPrompt.trim()) {
      alert("Please enter a prompt in the AI box above to generate an image.");
      return;
    }
    setIsGeneratingImage(true);
    setTimeout(() => {
      const randomId = Math.floor(Math.random() * 1000);
      setPostImageUrl(`https://picsum.photos/seed/${randomId}/800/500`);
      setIsGeneratingImage(false);
    }, 2000);
  };

  const handlePublishPost = async () => {
    if (!postContent.trim()) return;
    try {
      const authorUrn = publishTarget === 'company' && connectedAccount?.connectedOrganizationUrn
        ? connectedAccount.connectedOrganizationUrn
        : undefined;
      await dispatch(publishLinkedInPost({ text: postContent, authorUrn, imageUrl: postImageUrl || undefined })).unwrap();
      setShowComposePost(false);
      setPostContent('');
      setPostImageUrl(null);
      alert('Post published successfully to LinkedIn!');
    } catch (err: any) {
      alert(`Failed to publish post: ${err.message || 'Unknown error'}`);
    }
  };

  const handleDeleteLead = (leadId: string) => {
    dispatch(deleteLead(leadId));
    setShowLeadDetail(false);
    dispatch(setSelectedLead(null));
    dispatch(fetchLeadStats());
  };

  const openLeadDetail = (lead: LinkedInLead) => {
    dispatch(setSelectedLead(lead));
    setShowLeadDetail(true);
  };

  // Stats cards data
  const statsCards = [
    {
      label: 'Total Leads',
      value: leadStats?.totalLeads || 0,
      icon: Users,
      color: '#6366f1',
      gradient: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.05))',
    },
    {
      label: 'High Value',
      value: leadStats?.highValueLeads || 0,
      icon: TrendingUp,
      color: '#22c55e',
      gradient: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))',
    },
    {
      label: 'In Pipeline',
      value: leadStats?.stageBreakdown?.filter((s: any) => !['won', 'lost'].includes(s._id)).reduce((a: number, b: any) => a + b.count, 0) || 0,
      icon: Target,
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))',
    },
    {
      label: 'Won Deals',
      value: leadStats?.stageBreakdown?.find((s: any) => s._id === 'won')?.count || 0,
      icon: Star,
      color: '#ec4899',
      gradient: 'linear-gradient(135deg, rgba(236,72,153,0.15), rgba(236,72,153,0.05))',
    },
  ];

  return (
    <div style={{ width: '100%', boxSizing: 'border-box', padding: '24px 28px', minHeight: '100vh', background: '#0a0f1e', color: '#e5e5e5', fontFamily: "'Inter', 'Outfit', sans-serif", overflowX: 'hidden' }}>

      {/* ============= LIVE AI TOAST ============= */}
      <div style={{
        position: 'fixed', bottom: '30px', right: '30px', zIndex: 9999,
        background: 'linear-gradient(135deg, rgba(34,197,94,0.9), rgba(21,128,61,0.95))',
        color: '#fff', padding: '14px 20px', borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(34,197,94,0.3)', fontWeight: 600, fontSize: '0.9rem',
        transform: toastMessage ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
        opacity: toastMessage ? 1 : 0, pointerEvents: toastMessage ? 'auto' : 'none',
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        display: 'flex', alignItems: 'center', gap: '10px'
      }}>
        <div style={{ width: '8px', height: '8px', background: '#fff', borderRadius: '50%', boxShadow: '0 0 8px #fff', animation: 'pulse 1s infinite' }} />
        {toastMessage}
      </div>

      {/* ============= HEADER ============= */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '24px', flexWrap: 'wrap', gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #0077B5, #00A0DC)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(0,119,181,0.3)',
          }}>
            <Briefcase size={26} color="#fff" />
          </div>
          <div>
            <h1 style={{
              margin: 0, fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.5px',
              background: 'linear-gradient(135deg, #0077B5, #00A0DC, #6366f1)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              display: 'flex', alignItems: 'center', gap: '12px'
            }}>
              LinkedIn AI CRM
              <button
                onClick={() => setIsSimulationActive(!isSimulationActive)}
                title={isSimulationActive ? 'Disable Live AI Simulation' : 'Enable Live AI Simulation'}
                style={{
                  background: isSimulationActive ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.05)',
                  border: isSimulationActive ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(255,255,255,0.1)',
                  color: isSimulationActive ? '#22c55e' : '#94a3b8',
                  padding: '4px 8px', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
                  display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', transition: 'all 0.3s'
                }}
              >
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: isSimulationActive ? '#22c55e' : '#64748b', boxShadow: isSimulationActive ? '0 0 6px #22c55e' : 'none', animation: isSimulationActive ? 'pulse 1.5s infinite' : 'none' }} />
                LIVE AI
              </button>
            </h1>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Manage leads, analyze profiles & automate outreach</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {connectedAccount ? (
            <div
              onClick={() => setShowConnectedAccountModal(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
                borderRadius: '12px', padding: '8px 16px', cursor: 'pointer', transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(34,197,94,0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(34,197,94,0.08)'}
            >
              <img src={connectedAccount.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(connectedAccount.profileName)}`} alt="" style={{ width: 28, height: 28, borderRadius: '50%' }} />
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#22c55e' }}>
                  {connectedAccount.profileName}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#64748b' }}>View Full Profile</div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleDisconnect(); }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444',
                  padding: '4px', borderRadius: '6px', marginLeft: '6px'
                }}
                title="Disconnect"
              >
                <Unplug size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnectLinkedIn}
              disabled={accountLoading}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'linear-gradient(135deg, #0077B5, #00A0DC)',
                color: '#fff', border: 'none', borderRadius: '12px',
                padding: '10px 20px', fontSize: '0.85rem', fontWeight: 600,
                cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,119,181,0.3)',
                transition: 'all 0.2s ease',
              }}
            >
              <Link2 size={16} />
              {accountLoading ? 'Connecting...' : 'Connect LinkedIn'}
            </button>
          )}

          <button
            onClick={() => setShowComposePost(true)}
            disabled={!connectedAccount}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: connectedAccount ? 'linear-gradient(135deg, #0077B5, #00A0DC)' : 'rgba(255,255,255,0.1)',
              color: connectedAccount ? '#fff' : '#64748b', border: 'none', borderRadius: '12px',
              padding: '10px 18px', fontSize: '0.85rem', fontWeight: 600,
              cursor: connectedAccount ? 'pointer' : 'not-allowed',
            }}
          >
            <Send size={16} /> Compose Post
          </button>

          <button
            onClick={() => setShowAddLead(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'var(--accent-gradient, linear-gradient(135deg, #7033f5, #9b59b6))',
              color: '#fff', border: 'none', borderRadius: '12px',
              padding: '10px 18px', fontSize: '0.85rem', fontWeight: 600,
              cursor: 'pointer', boxShadow: '0 4px 16px rgba(112,51,245,0.25)',
            }}
          >
            <Plus size={16} /> Add Lead
          </button>
        </div>
      </div>

      {/* ============= TABS ============= */}
      <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setMainTab('crm')}
          style={{
            background: 'none', border: 'none', padding: '12px 4px', cursor: 'pointer',
            color: mainTab === 'crm' ? '#fff' : '#64748b',
            fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px',
            borderBottom: mainTab === 'crm' ? '2px solid #00A0DC' : '2px solid transparent',
            transition: 'all 0.2s',
          }}
        >
          <Users size={18} /> CRM & Leads
        </button>
        <button
          onClick={() => setMainTab('my_posts')}
          style={{
            background: 'none', border: 'none', padding: '12px 4px', cursor: 'pointer',
            color: mainTab === 'my_posts' ? '#fff' : '#64748b',
            fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px',
            borderBottom: mainTab === 'my_posts' ? '2px solid #00A0DC' : '2px solid transparent',
            transition: 'all 0.2s',
          }}
        >
          <TrendingUpIcon size={18} /> My Content & Analytics
        </button>
        <button
          onClick={() => setMainTab('ads')}
          style={{
            background: 'none', border: 'none', padding: '12px 4px', cursor: 'pointer',
            color: mainTab === 'ads' ? '#fff' : '#64748b',
            fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px',
            borderBottom: mainTab === 'ads' ? '2px solid #00A0DC' : '2px solid transparent',
            transition: 'all 0.2s',
          }}
        >
          <Megaphone size={18} /> Ads Manager
        </button>
      </div>

      {mainTab === 'crm' ? (
        <>
          {/* ============= STATS CARDS ============= */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {statsCards.map((card) => (
              <div key={card.label} style={{
                background: card.gradient,
                border: `1px solid ${card.color}22`,
                borderRadius: '16px', padding: '20px',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', top: '16px', right: '16px', opacity: 0.15 }}>
                  <card.icon size={42} color={card.color} />
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                  {card.label}
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: card.color, letterSpacing: '-1px' }}>
                  {card.value}
                </div>
              </div>
            ))}
          </div>

          {/* ============= TOOLBAR ============= */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '20px', gap: '12px', flexWrap: 'wrap'
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'rgba(255,255,255,0.04)', borderRadius: '12px',
              padding: '6px 14px', flex: '1 1 250px', maxWidth: '400px',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <Search size={16} color="#64748b" />
              <input
                type="text"
                placeholder="Search leads by name, company, headline..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: 'transparent', border: 'none', outline: 'none',
                  color: '#e5e5e5', fontSize: '0.85rem', width: '100%',
                }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 0 }}>
                  <X size={14} />
                </button>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                style={{
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px', padding: '8px 12px', color: '#e5e5e5',
                  fontSize: '0.8rem', cursor: 'pointer', outline: 'none',
                }}
              >
                <option value="">All Stages</option>
                {PIPELINE_STAGES.map((s) => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </select>

              <div style={{
                display: 'flex', background: 'rgba(255,255,255,0.04)',
                borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)',
                overflow: 'hidden',
              }}>
                {(['pipeline', 'table'] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    style={{
                      padding: '8px 16px', border: 'none', cursor: 'pointer',
                      background: view === v ? 'rgba(99,102,241,0.2)' : 'transparent',
                      color: view === v ? '#818cf8' : '#64748b',
                      fontSize: '0.8rem', fontWeight: 600,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {v === 'pipeline' ? 'Pipeline' : 'Table'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {leadsLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
              <Activity size={32} color="#6366f1" style={{ animation: 'pulse 1.5s infinite' }} />
            </div>
          ) : view === 'pipeline' ? (
            <PipelineView leads={filteredLeads} onStageChange={handleStageChange} onLeadClick={openLeadDetail} />
          ) : (
            <TableView leads={filteredLeads} onLeadClick={openLeadDetail} onDelete={handleDeleteLead} />
          )}
        </>
      ) : mainTab === 'my_posts' ? (
        /* ============= MY POSTS & ANALYTICS CONTENT ============= */
        <MyPostsView
          posts={posts}
          loading={postsLoading}
          account={connectedAccount}
          events={events}
          eventsLoading={eventsLoading}
          onCreateEvent={(eventData) => dispatch(createEvent(eventData))}
        />
      ) : (
        /* ============= ADS MANAGER CONTENT ============= */
        <AdsManagerView campaigns={adCampaigns} loading={adsLoading} />
      )}

      {/* ============= ADD LEAD MODAL ============= */}
      {showAddLead && (
        <Modal title="Add New Lead" onClose={() => setShowAddLead(false)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {[
              { key: 'name', label: 'Full Name *', icon: Users },
              { key: 'headline', label: 'Headline', icon: Sparkles },
              { key: 'company', label: 'Company', icon: Building2 },
              { key: 'email', label: 'Email', icon: Mail },
              { key: 'phone', label: 'Phone', icon: Phone },
              { key: 'linkedinProfileUrl', label: 'LinkedIn URL', icon: ExternalLink },
              { key: 'location', label: 'Location', icon: MapPin },
              { key: 'industry', label: 'Industry', icon: Briefcase },
            ].map((field) => (
              <div key={field.key}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <field.icon size={12} /> {field.label}
                </label>
                <input
                  type="text"
                  value={(newLead as any)[field.key]}
                  onChange={(e) => setNewLead({ ...newLead, [field.key]: e.target.value })}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: '10px',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#e5e5e5', fontSize: '0.85rem', outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'rgba(99,102,241,0.5)')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button
              onClick={() => setShowAddLead(false)}
              style={{ padding: '10px 20px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: 'none', color: '#94a3b8', cursor: 'pointer', fontWeight: 600 }}
            >
              Cancel
            </button>
            <button
              onClick={handleCreateLead}
              disabled={!newLead.name.trim()}
              style={{
                padding: '10px 24px', borderRadius: '10px',
                background: newLead.name.trim() ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.06)',
                border: 'none', color: '#fff', cursor: newLead.name.trim() ? 'pointer' : 'not-allowed',
                fontWeight: 600, fontSize: '0.85rem',
                boxShadow: newLead.name.trim() ? '0 4px 16px rgba(99,102,241,0.3)' : 'none',
              }}
            >
              Create Lead
            </button>
          </div>
        </Modal>
      )}

      {/* ============= CONNECTED ACCOUNT MODAL ============= */}
      {showConnectedAccountModal && connectedAccount && (
        <Modal title="My LinkedIn Profile" onClose={() => setShowConnectedAccountModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <img
                src={connectedAccount.profilePicture || connectedAccount.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(connectedAccount.name || connectedAccount.profileName)}`}
                alt="Profile"
                style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)' }}
              />
              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: '1.2rem', color: '#e5e5e5' }}>{connectedAccount.name || connectedAccount.profileName}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#22c55e', fontWeight: 600 }}>
                  <div style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 8px #22c55e' }} />
                  Connected & Active
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase' }}>Email Address</div>
                <div style={{ fontSize: '0.9rem', color: '#e5e5e5' }}>{connectedAccount.email || 'Not provided by LinkedIn'}</div>
              </div>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase' }}>LinkedIn ID</div>
                <div style={{ fontSize: '0.9rem', color: '#e5e5e5', fontFamily: 'monospace' }}>{connectedAccount.linkedinId || connectedAccount.id || 'Unknown'}</div>
              </div>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Building2 size={12} /> Connected Company Page / Organization
                </div>
                {connectedAccount.connectedOrganizationUrn ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(99,102,241,0.05)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(99,102,241,0.1)' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e5e5e5' }}>{connectedAccount.connectedOrganizationName}</div>
                      <div style={{ fontSize: '0.65rem', color: '#64748b', fontFamily: 'monospace', marginTop: '2px' }}>{connectedAccount.connectedOrganizationUrn}</div>
                    </div>
                    <button
                      onClick={() => dispatch(connectOrganization({ orgUrn: '', orgName: '' }))}
                      style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: '6px', padding: '6px 10px', color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Disconnect Page
                    </button>
                  </div>
                ) : (
                  <div>
                    <p style={{ margin: '0 0 10px', fontSize: '0.75rem', color: '#94a3b8' }}>
                      Connect a company page to publish posts and run ads as your business instead of your personal profile.
                    </p>
                    {orgsLoading ? (
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Loading organizations...</div>
                    ) : organizations && organizations.length > 0 ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <select
                          id="org-select"
                          style={{
                            flex: 1, padding: '8px 12px', borderRadius: '8px',
                            background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
                            color: '#fff', fontSize: '0.8rem', cursor: 'pointer', outline: 'none'
                          }}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val) {
                              const found = organizations.find((o: any) => o.urn === val);
                              if (found) {
                                dispatch(connectOrganization({ orgUrn: found.urn, orgName: found.name }));
                              }
                            }
                          }}
                          defaultValue=""
                        >
                          <option value="" disabled>Select a Company Page...</option>
                          {organizations.map((org: any) => (
                            <option key={org.urn} value={org.urn}>{org.name}</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.8rem', color: '#ef4444' }}>No administration pages found on LinkedIn.</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
              <div>
                <h4 style={{ margin: '0 0 10px', fontSize: '0.9rem', color: '#818cf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Briefcase size={16} /> Experience
                </h4>
                {connectedAccount.experience && Object.keys(connectedAccount.experience).length > 0 ? (
                  Array.isArray(connectedAccount.experience) && connectedAccount.experience.map((exp: any, i: number) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '8px' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e5e5e5' }}>{exp.title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '4px 0' }}>{exp.company}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{exp.dates}</div>
                    </div>
                  ))
                ) : (
                  <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e5e5e5' }}>No experience data available.</div>
                  </div>
                )}
              </div>

              <div>
                <h4 style={{ margin: '0 0 10px', fontSize: '0.9rem', color: '#818cf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Building2 size={16} /> Education
                </h4>
                {connectedAccount.education && Object.keys(connectedAccount.education).length > 0 ? (
                  Array.isArray(connectedAccount.education) && connectedAccount.education.map((edu: any, i: number) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '8px' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e5e5e5' }}>{edu.school}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '4px 0' }}>{edu.degree}</div>
                    </div>
                  ))
                ) : (
                  <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e5e5e5' }}>No education data available.</div>
                  </div>
                )}
              </div>
            </div>

            {(!connectedAccount.scraperStatus || connectedAccount.scraperStatus === 'pending' || connectedAccount.scraperStatus === 'failed') && (
              <div style={{ marginTop: '10px', padding: '16px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                <h4 style={{ margin: '0 0 10px', fontSize: '0.9rem', color: '#fcd34d' }}>Fetch Full Profile Data (Scraper)</h4>
                <p style={{ margin: '0 0 12px', fontSize: '0.8rem', color: '#94a3b8' }}>
                  To get real Education and Experience, we need your LinkedIn session cookie <code>li_at</code> to bypass API limits.
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="password"
                    placeholder="Paste li_at cookie here..."
                    value={liAtCookie}
                    onChange={(e) => setLiAtCookie(e.target.value)}
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: '0.85rem' }}
                  />
                  <button
                    onClick={handleTriggerScrape}
                    disabled={isScraping || !liAtCookie}
                    style={{
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      color: '#fff', border: 'none', borderRadius: '8px',
                      padding: '0 16px', fontSize: '0.85rem', fontWeight: 600,
                      cursor: (isScraping || !liAtCookie) ? 'not-allowed' : 'pointer',
                      opacity: (isScraping || !liAtCookie) ? 0.7 : 1
                    }}
                  >
                    {isScraping ? 'Starting...' : 'Start Scraper'}
                  </button>
                </div>
              </div>
            )}
            {connectedAccount.scraperStatus === 'active' && (
              <div style={{ marginTop: '10px', padding: '12px', borderRadius: '12px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', fontSize: '0.85rem', color: '#22c55e', textAlign: 'center' }}>
                Scraping in progress... Please wait. Data will appear shortly.
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ============= COMPOSE POST MODAL ============= */}
      {showComposePost && (
        <Modal title="Compose LinkedIn Post" onClose={() => setShowComposePost(false)}>
          <div style={{ marginBottom: '20px', background: 'rgba(99,102,241,0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(99,102,241,0.1)' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#818cf8', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={14} /> Generate with AI
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="E.g., Launch of our new AI CRM feature..."
                style={{
                  flex: 1, padding: '10px 12px', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#e5e5e5', fontSize: '0.85rem', outline: 'none',
                }}
              />
              <button
                onClick={handleGenerateAiPost}
                disabled={!aiPrompt.trim() || isGeneratingAi}
                style={{
                  padding: '0 16px', borderRadius: '8px',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  border: 'none', color: '#fff', cursor: (!aiPrompt.trim() || isGeneratingAi) ? 'not-allowed' : 'pointer',
                  fontWeight: 600, fontSize: '0.85rem', opacity: (!aiPrompt.trim() || isGeneratingAi) ? 0.6 : 1,
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                {isGeneratingAi ? <Loader2 size={14} className="spin" /> : 'Generate'}
              </button>
            </div>
          </div>
          {connectedAccount?.connectedOrganizationUrn && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', marginBottom: '8px', display: 'block' }}>
                Post As
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setPublishTarget('personal')}
                  style={{
                    flex: 1, padding: '8px 12px', borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: publishTarget === 'personal' ? 'rgba(0,119,181,0.15)' : 'rgba(255,255,255,0.02)',
                    color: publishTarget === 'personal' ? '#00A0DC' : '#94a3b8',
                    borderColor: publishTarget === 'personal' ? '#0077B5' : 'rgba(255,255,255,0.08)',
                    fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  Personal Profile ({connectedAccount.profileName})
                </button>
                <button
                  type="button"
                  onClick={() => setPublishTarget('company')}
                  style={{
                    flex: 1, padding: '8px 12px', borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: publishTarget === 'company' ? 'rgba(0,119,181,0.15)' : 'rgba(255,255,255,0.02)',
                    color: publishTarget === 'company' ? '#00A0DC' : '#94a3b8',
                    borderColor: publishTarget === 'company' ? '#0077B5' : 'rgba(255,255,255,0.08)',
                    fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  Company Page ({connectedAccount.connectedOrganizationName})
                </button>
              </div>
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', marginBottom: '8px', display: 'block' }}>
              Post Content
            </label>
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="Write your LinkedIn post here or use AI above..."
              rows={6}
              style={{
                width: '100%', padding: '14px', borderRadius: '12px', boxSizing: 'border-box',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#e5e5e5', fontSize: '0.95rem', outline: 'none', resize: 'none',
                fontFamily: 'inherit',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'rgba(0,119,181,0.5)')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
            />
          </div>
          <div style={{ marginBottom: '16px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: postImageUrl ? '16px' : '0' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
                  padding: '8px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)',
                  fontSize: '0.8rem', fontWeight: 600, color: '#e5e5e5', border: '1px solid rgba(255,255,255,0.1)',
                  transition: 'background 0.2s'
                }}>
                  <Image size={14} color="#0ea5e9" /> Upload Image
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                </label>
                
                <button
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImage || !aiPrompt.trim()}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px', cursor: (isGeneratingImage || !aiPrompt.trim()) ? 'not-allowed' : 'pointer',
                    padding: '8px 14px', borderRadius: '8px', background: 'rgba(139,92,246,0.15)',
                    fontSize: '0.8rem', fontWeight: 600, color: '#c084fc', border: '1px solid rgba(139,92,246,0.3)',
                    transition: 'all 0.2s', opacity: (isGeneratingImage || !aiPrompt.trim()) ? 0.6 : 1
                  }}
                >
                  {isGeneratingImage ? <Loader2 size={14} className="spin" /> : <Wand2 size={14} />}
                  {isGeneratingImage ? 'Generating...' : 'AI Generate Image'}
                </button>
              </div>
            </div>

            {postImageUrl && (
              <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                <img src={postImageUrl} alt="Post Attachment" style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '300px', objectFit: 'cover' }} />
                <button
                  onClick={() => setPostImageUrl(null)}
                  style={{
                    position: 'absolute', top: '8px', right: '8px',
                    background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%',
                    width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: '#fff'
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              onClick={() => {
                setShowComposePost(false);
                setPostImageUrl(null);
              }}
              style={{ padding: '10px 20px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: 'none', color: '#94a3b8', cursor: 'pointer', fontWeight: 600 }}
            >
              Cancel
            </button>
            <button
              onClick={handlePublishPost}
              disabled={!postContent.trim() && !postImageUrl}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 24px', borderRadius: '10px',
                background: (postContent.trim() || postImageUrl) ? 'linear-gradient(135deg, #0077B5, #00A0DC)' : 'rgba(255,255,255,0.06)',
                border: 'none', color: '#fff', cursor: (postContent.trim() || postImageUrl) ? 'pointer' : 'not-allowed',
                fontWeight: 600, fontSize: '0.85rem',
              }}
            >
              <Send size={16} /> Publish to LinkedIn
            </button>
          </div>
        </Modal>
      )}

      {/* ============= LEAD DETAIL PANEL ============= */}
      {showLeadDetail && selectedLead && (
        <LeadDetailPanel
          lead={selectedLead}
          onClose={() => { setShowLeadDetail(false); dispatch(setSelectedLead(null)); }}
          onStageChange={(stage) => handleStageChange(selectedLead._id, stage)}
          onAddNote={() => handleAddNote(selectedLead._id)}
          onDelete={() => handleDeleteLead(selectedLead._id)}
          newNote={newNote}
          setNewNote={setNewNote}
        />
      )}
    </div>
  );
};

// ==================== PIPELINE VIEW ====================

const PipelineView: React.FC<{
  leads: LinkedInLead[];
  onStageChange: (leadId: string, stage: string) => void;
  onLeadClick: (lead: LinkedInLead) => void;
}> = ({ leads, onStageChange: _onStageChange, onLeadClick }) => {
  return (
    <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '16px' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${PIPELINE_STAGES.length}, minmax(180px, 1fr))`,
        gap: '12px',
        minWidth: 'max-content',
      }}>
        {PIPELINE_STAGES.map((stage) => {
          const stageLeads = leads.filter((l) => l.stage === stage.key);
          const StageIcon = stage.icon;
          return (
            <div key={stage.key} style={{
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.06)',
              minHeight: '400px',
              display: 'flex',
              flexDirection: 'column',
            }}>
              {/* Stage Header */}
              <div style={{
                padding: '14px 16px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <StageIcon size={15} color={stage.color} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#e5e5e5' }}>{stage.label}</span>
                </div>
                <span style={{
                  background: `${stage.color}22`,
                  color: stage.color,
                  borderRadius: '8px',
                  padding: '2px 8px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                }}>
                  {stageLeads.length}
                </span>
              </div>

              {/* Lead Cards */}
              <div style={{ padding: '8px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {stageLeads.map((lead) => (
                  <div
                    key={lead._id}
                    onClick={() => onLeadClick(lead)}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: '12px',
                      padding: '12px',
                      cursor: 'pointer',
                      border: '1px solid rgba(255,255,255,0.06)',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = `${stage.color}44`;
                      e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '10px',
                        background: `${stage.color}15`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.75rem', fontWeight: 700, color: stage.color,
                      }}>
                        {lead.profileImageUrl ? (
                          <img src={lead.profileImageUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '10px', objectFit: 'cover' }} />
                        ) : (
                          lead.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e5e5e5', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {lead.name}
                        </div>
                        {lead.company && (
                          <div style={{ fontSize: '0.65rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {lead.company}
                          </div>
                        )}
                      </div>
                    </div>

                    {lead.headline && (
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {lead.headline}
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      {lead.aiLeadScore > 0 && (
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: '4px',
                          fontSize: '0.65rem', fontWeight: 600,
                          color: lead.aiLeadScore >= 70 ? '#22c55e' : lead.aiLeadScore >= 40 ? '#f59e0b' : '#64748b',
                        }}>
                          <Zap size={10} /> {lead.aiLeadScore}
                        </div>
                      )}
                      <div style={{
                        width: '8px', height: '8px', borderRadius: '50%',
                        background: PRIORITY_COLORS[lead.priority] || '#64748b',
                      }} title={`Priority: ${lead.priority}`} />
                    </div>

                    {lead.tags.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                        {lead.tags.slice(0, 2).map((tag) => (
                          <span key={tag} style={{
                            fontSize: '0.6rem', padding: '2px 6px', borderRadius: '6px',
                            background: 'rgba(99,102,241,0.1)', color: '#818cf8', fontWeight: 600,
                          }}>
                            {tag}
                          </span>
                        ))}
                        {lead.tags.length > 2 && (
                          <span style={{ fontSize: '0.6rem', color: '#64748b' }}>+{lead.tags.length - 2}</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {stageLeads.length === 0 && (
                  <div style={{
                    textAlign: 'center', padding: '30px 12px', color: '#475569',
                    fontSize: '0.75rem', fontStyle: 'italic',
                  }}>
                    No leads in this stage
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ==================== TABLE VIEW ====================

const TableView: React.FC<{
  leads: LinkedInLead[];
  onLeadClick: (lead: LinkedInLead) => void;
  onDelete: (leadId: string) => void;
}> = ({ leads, onLeadClick, onDelete }) => {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      borderRadius: '16px',
      border: '1px solid rgba(255,255,255,0.06)',
      overflow: 'hidden',
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
            {['Name', 'Company', 'Stage', 'AI Score', 'Priority', 'Tags', 'Source', 'Actions'].map((h) => (
              <th key={h} style={{
                padding: '12px 16px', textAlign: 'left',
                fontSize: '0.7rem', fontWeight: 700, color: '#64748b',
                textTransform: 'uppercase', letterSpacing: '0.06em',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => {
            const stageInfo = PIPELINE_STAGES.find((s) => s.key === lead.stage);
            return (
              <tr
                key={lead._id}
                onClick={() => onLeadClick(lead)}
                style={{ cursor: 'pointer', transition: 'background 0.15s' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '34px', height: '34px', borderRadius: '10px',
                      background: `${stageInfo?.color || '#6366f1'}15`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.8rem', fontWeight: 700, color: stageInfo?.color || '#6366f1',
                      flexShrink: 0,
                    }}>
                      {lead.profileImageUrl ? (
                        <img src={lead.profileImageUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '10px', objectFit: 'cover' }} />
                      ) : lead.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e5e5e5' }}>{lead.name}</div>
                      {lead.headline && <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{lead.headline.slice(0, 40)}{lead.headline.length > 40 ? '...' : ''}</div>}
                    </div>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.8rem', color: '#94a3b8' }}>
                  {lead.company || '—'}
                </td>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 600, padding: '4px 10px',
                    borderRadius: '8px', background: `${stageInfo?.color || '#64748b'}15`,
                    color: stageInfo?.color || '#64748b',
                  }}>
                    {stageInfo?.label || lead.stage}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    fontSize: '0.8rem', fontWeight: 700,
                    color: lead.aiLeadScore >= 70 ? '#22c55e' : lead.aiLeadScore >= 40 ? '#f59e0b' : '#64748b',
                  }}>
                    <Zap size={12} /> {lead.aiLeadScore}
                  </div>
                </td>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 600, padding: '3px 8px',
                    borderRadius: '6px',
                    background: `${PRIORITY_COLORS[lead.priority]}15`,
                    color: PRIORITY_COLORS[lead.priority],
                  }}>
                    {lead.priority}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {lead.tags.slice(0, 2).map((t) => (
                      <span key={t} style={{ fontSize: '0.6rem', padding: '2px 6px', borderRadius: '6px', background: 'rgba(99,102,241,0.1)', color: '#818cf8', fontWeight: 600 }}>{t}</span>
                    ))}
                  </div>
                </td>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.7rem', color: '#64748b' }}>
                  {lead.source}
                </td>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(lead._id); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {leads.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px', color: '#475569', fontSize: '0.9rem' }}>
          <Users size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
          <div>No leads found. Add your first lead to get started!</div>
        </div>
      )}
    </div>
  );
};

// ==================== LEAD DETAIL PANEL ====================

const LeadDetailPanel: React.FC<{
  lead: LinkedInLead;
  onClose: () => void;
  onStageChange: (stage: string) => void;
  onAddNote: () => void;
  onDelete: () => void;
  newNote: string;
  setNewNote: (note: string) => void;
}> = ({ lead, onClose, onStageChange, onAddNote, onDelete, newNote, setNewNote }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { leadPosts, leadPostsLoading } = useSelector((state: any) => state.linkedinCrm);
  const [activeTab, setActiveTab] = useState<'details' | 'posts'>('details');

  useEffect(() => {
    if (activeTab === 'posts') {
      dispatch(fetchLeadPosts(lead._id));
    }
  }, [activeTab, lead._id, dispatch]);

  const stageInfo = PIPELINE_STAGES.find((s) => s.key === lead.stage);

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0, width: '480px',
      background: '#0f1629', borderLeft: '1px solid rgba(255,255,255,0.08)',
      zIndex: 1000, overflowY: 'auto', boxShadow: '-8px 0 32px rgba(0,0,0,0.4)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', top: 0, left: 0, right: '480px', bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: -1,
        }}
      />

      {/* Header */}
      <div style={{
        padding: '20px 24px 0',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(255,255,255,0.02)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#e5e5e5' }}>Lead Details</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={onDelete} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', color: '#ef4444' }}>
              <Trash2 size={14} />
            </button>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', color: '#94a3b8' }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '20px' }}>
          <button
            onClick={() => setActiveTab('details')}
            style={{
              background: 'none', border: 'none', padding: '10px 0', cursor: 'pointer',
              color: activeTab === 'details' ? '#fff' : '#64748b',
              fontWeight: 600, fontSize: '0.85rem',
              borderBottom: activeTab === 'details' ? '2px solid #0ea5e9' : '2px solid transparent',
              transition: 'all 0.2s',
            }}
          >
            Profile & Info
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            style={{
              background: 'none', border: 'none', padding: '10px 0', cursor: 'pointer',
              color: activeTab === 'posts' ? '#fff' : '#64748b',
              fontWeight: 600, fontSize: '0.85rem',
              borderBottom: activeTab === 'posts' ? '2px solid #0ea5e9' : '2px solid transparent',
              transition: 'all 0.2s',
            }}
          >
            Recent Posts
          </button>
        </div>
      </div>

      <div style={{ padding: '24px', flex: 1 }}>
        {/* Profile Header (Always visible) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '14px',
            background: `${stageInfo?.color || '#6366f1'}15`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.3rem', fontWeight: 700, color: stageInfo?.color || '#6366f1',
          }}>
            {lead.profileImageUrl ? (
              <img src={lead.profileImageUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '14px', objectFit: 'cover' }} />
            ) : lead.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#e5e5e5' }}>{lead.name}</h4>
            {lead.headline && <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>{lead.headline}</p>}
          </div>
        </div>

        {/* === TAB CONTENT: DETAILS === */}
        {activeTab === 'details' && (
          <>
            {/* Quick Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              {[
                { icon: Building2, label: 'Company', value: lead.company },
                { icon: Mail, label: 'Email', value: lead.email },
                { icon: Phone, label: 'Phone', value: lead.phone },
                { icon: MapPin, label: 'Location', value: lead.location },
                { icon: Briefcase, label: 'Industry', value: lead.industry },
                { icon: ExternalLink, label: 'LinkedIn', value: lead.linkedinProfileUrl ? 'View Profile' : null },
              ].filter((f) => f.value).map((field) => (
                <div key={field.label} style={{
                  padding: '10px 12px', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <field.icon size={10} /> {field.label}
                  </div>
                  {field.label === 'LinkedIn' && lead.linkedinProfileUrl ? (
                    <a href={lead.linkedinProfileUrl} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: '0.8rem', color: '#0077B5', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      View <ExternalLink size={10} />
                    </a>
                  ) : (
                    <div style={{ fontSize: '0.8rem', color: '#e5e5e5', marginTop: '2px' }}>{field.value}</div>
                  )}
                </div>
              ))}
            </div>

            {/* AI Scores */}
            <div style={{
              padding: '16px', borderRadius: '14px', marginBottom: '20px',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.05))',
              border: '1px solid rgba(99,102,241,0.15)',
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#818cf8', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={14} /> AI INSIGHTS
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                {[
                  { label: 'Lead Score', value: lead.aiLeadScore, color: lead.aiLeadScore >= 70 ? '#22c55e' : lead.aiLeadScore >= 40 ? '#f59e0b' : '#64748b' },
                  { label: 'Networking', value: lead.networkingScore, color: '#0ea5e9' },
                  { label: 'Hiring', value: lead.hiringScore, color: '#ec4899' },
                ].map((score) => (
                  <div key={score.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: score.color }}>{score.value}</div>
                    <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>{score.label}</div>
                  </div>
                ))}
              </div>
              {lead.aiSummary && (
                <div style={{ marginTop: '12px', padding: '10px', borderRadius: '10px', background: 'rgba(0,0,0,0.2)', fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5 }}>
                  {lead.aiSummary}
                </div>
              )}
            </div>

            {/* Stage Selector */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '8px' }}>PIPELINE STAGE</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {PIPELINE_STAGES.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => onStageChange(s.key)}
                    style={{
                      padding: '6px 12px', borderRadius: '8px',
                      background: lead.stage === s.key ? `${s.color}22` : 'rgba(255,255,255,0.04)',
                      color: lead.stage === s.key ? s.color : '#64748b',
                      fontWeight: 600, fontSize: '0.7rem', cursor: 'pointer',
                      border: lead.stage === s.key ? `1px solid ${s.color}44` : '1px solid transparent',
                      transition: 'all 0.15s',
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            {lead.tags.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Tag size={12} /> TAGS
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {lead.tags.map((tag) => (
                    <span key={tag} style={{
                      fontSize: '0.7rem', padding: '4px 10px', borderRadius: '8px',
                      background: 'rgba(99,102,241,0.1)', color: '#818cf8', fontWeight: 600,
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Add Note */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MessageSquare size={12} /> ADD NOTE
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Write a note..."
                  onKeyDown={(e) => e.key === 'Enter' && onAddNote()}
                  style={{
                    flex: 1, padding: '10px 12px', borderRadius: '10px',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#e5e5e5', fontSize: '0.8rem', outline: 'none',
                  }}
                />
                <button
                  onClick={onAddNote}
                  style={{
                    padding: '10px 14px', borderRadius: '10px',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    border: 'none', color: '#fff', cursor: 'pointer',
                  }}
                >
                  <ArrowUpRight size={16} />
                </button>
              </div>
            </div>

            {/* Activity Log */}
            {lead.activityLog.length > 0 && (
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={12} /> ACTIVITY
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {lead.activityLog.slice(-5).reverse().map((log, i) => (
                    <div key={i} style={{
                      padding: '8px 12px', borderRadius: '8px',
                      background: 'rgba(255,255,255,0.02)',
                      borderLeft: '3px solid rgba(99,102,241,0.3)',
                    }}>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{log.details}</div>
                      <div style={{ fontSize: '0.65rem', color: '#475569', marginTop: '2px' }}>
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {lead.notes.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '8px' }}>NOTES</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {lead.notes.slice(-5).reverse().map((note, i) => (
                    <div key={i} style={{
                      padding: '10px 12px', borderRadius: '10px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}>
                      <div style={{ fontSize: '0.8rem', color: '#e5e5e5' }}>{note.message}</div>
                      <div style={{ fontSize: '0.65rem', color: '#475569', marginTop: '4px' }}>
                        {note.type} · {new Date(note.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* === TAB CONTENT: POSTS === */}
        {activeTab === 'posts' && (
          <div>
            {leadPostsLoading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                <Loader2 size={24} className="spin" style={{ marginBottom: '10px', animation: 'spin 1s linear infinite' }} />
                <div style={{ fontSize: '0.85rem' }}>Fetching recent posts from LinkedIn...</div>
              </div>
            ) : leadPosts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                <FileText size={32} style={{ marginBottom: '12px', opacity: 0.3 }} />
                <div style={{ fontSize: '0.85rem' }}>No recent posts found for this lead.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {leadPosts.map((post: any) => (
                  <div key={post.id} style={{
                    padding: '16px', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '8px' }}>
                      {new Date(post.date).toLocaleDateString()}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#e5e5e5', lineHeight: 1.5, marginBottom: '12px' }}>
                      {post.content}
                    </div>
                    <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#94a3b8' }}>
                        <ThumbsUp size={14} /> {post.likes}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#94a3b8' }}>
                        <MessageCircle size={14} /> {post.comments}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== MODAL ====================

const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => (
  <div style={{
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.6)', zIndex: 1000,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    <div style={{
      background: '#0f1629', borderRadius: '20px',
      border: '1px solid rgba(255,255,255,0.1)',
      padding: '28px', width: '560px', maxHeight: '80vh', overflowY: 'auto',
      boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#e5e5e5' }}>{title}</h3>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: '#94a3b8' }}>
          <X size={16} />
        </button>
      </div>
      {children}
    </div>
  </div>
);

// ==================== MY POSTS VIEW ====================
const MyPostsView: React.FC<{
  posts: any[];
  loading: boolean;
  account: any;
  events: any[];
  eventsLoading: boolean;
  onCreateEvent: (eventData: any) => void;
}> = ({ posts, loading, account, events, eventsLoading, onCreateEvent }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [subTab, setSubTab] = useState<'posts' | 'events'>('posts');
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    name: '',
    description: '',
    startsAt: '',
    onlineMeetingUrl: '',
    format: 'AUDIO', // 'AUDIO' or 'VIDEO'
  });

  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);

  const handlePostComment = (postId: string) => {
    const text = commentText[postId];
    if (text && text.trim()) {
      dispatch(addPostComment({ postId, text, author: account?.profileName || 'You' }));
      setCommentText(prev => ({ ...prev, [postId]: '' }));
    }
  };

  const handlePostReply = (postId: string, commentId: string) => {
    const text = replyText[commentId];
    if (text && text.trim()) {
      dispatch(addPostReply({ postId, commentId, text, author: account?.profileName || 'You' }));
      setReplyText(prev => ({ ...prev, [commentId]: '' }));
      setActiveReplyId(null);
    }
  };


  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', color: '#64748b' }}>
        <Loader2 size={32} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  // Dynamic data from API. Fallback to 0 if not present.
  const totalImpressions = posts.reduce((sum, p) => sum + (p.impressions || 0), 0);
  const totalEngagement = posts.reduce((sum, p) => sum + (p.likes || 0) + (p.comments || 0), 0);

  return (
    <div>
      {/* Profile Overview Banner */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '20px',
        background: 'rgba(255,255,255,0.03)', borderRadius: '16px',
        padding: '24px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '24px'
      }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {account?.profileImageUrl ? <img src={account.profileImageUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Users size={32} color="#64748b" />}
        </div>
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: '1.4rem', color: '#e5e5e5' }}>{account?.profileName || 'Your Profile'}</h2>
          <p style={{ margin: '0 0 12px', fontSize: '0.9rem', color: '#94a3b8' }}>{account?.headline || 'No headline available'}</p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span style={{ fontSize: '0.8rem', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '4px 10px', borderRadius: '20px', fontWeight: 600 }}>All-Star Profile</span>
            <span style={{ fontSize: '0.8rem', color: '#22c55e', background: 'rgba(34, 197, 94, 0.1)', padding: '4px 10px', borderRadius: '20px', fontWeight: 600 }}>Active Posting</span>
          </div>
        </div>
      </div>

      {/* Analytics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.1), rgba(14,165,233,0.02))', borderRadius: '16px', padding: '20px', border: '1px solid rgba(14,165,233,0.2)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <Eye size={14} color="#0ea5e9" /> TOTAL IMPRESSIONS (30d)
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0ea5e9' }}>
            {totalImpressions.toLocaleString()}
          </div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(245,158,11,0.02))', borderRadius: '16px', padding: '20px', border: '1px solid rgba(245,158,11,0.2)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <MessageCircle size={14} color="#f59e0b" /> TOTAL ENGAGEMENT
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b' }}>
            {totalEngagement.toLocaleString()}
          </div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(168,85,247,0.02))', borderRadius: '16px', padding: '20px', border: '1px solid rgba(168,85,247,0.2)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <TrendingUpIcon size={14} color="#a855f7" /> AVG ENGAGEMENT RATE
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#a855f7' }}>
            {totalImpressions > 0 ? ((totalEngagement / totalImpressions) * 100).toFixed(1) : 0}%
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <button
          onClick={() => setSubTab('posts')}
          style={{
            background: 'none', border: 'none', padding: '10px 4px', cursor: 'pointer',
            color: subTab === 'posts' ? '#e5e5e5' : '#64748b',
            fontWeight: 600, fontSize: '0.85rem',
            borderBottom: subTab === 'posts' ? '2px solid #00A0DC' : '2px solid transparent',
            transition: 'all 0.15s'
          }}
        >
          Recent Posts
        </button>
        <button
          onClick={() => setSubTab('events')}
          style={{
            background: 'none', border: 'none', padding: '10px 4px', cursor: 'pointer',
            color: subTab === 'events' ? '#e5e5e5' : '#64748b',
            fontWeight: 600, fontSize: '0.85rem',
            borderBottom: subTab === 'events' ? '2px solid #00A0DC' : '2px solid transparent',
            transition: 'all 0.15s'
          }}
        >
          LinkedIn Events
        </button>
      </div>

      {/* === SUB-TAB: POSTS === */}
      {subTab === 'posts' && (
        <div>
          <h3 style={{ margin: '0 0 16px', color: '#e5e5e5', fontSize: '1.1rem' }}>Your Recent Posts</h3>
          {posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <FileText size={32} color="#64748b" style={{ marginBottom: '16px' }} />
              <h4 style={{ margin: '0 0 8px', color: '#e5e5e5' }}>No Posts Found</h4>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8' }}>You haven't published any posts yet. Use the Compose Post button above.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {posts.map((post) => {
                const impressions = post.impressions || 0;
                const engRate = impressions > 0 ? ((post.likes + post.comments) / impressions) * 100 : 0;
                return (
                  <div key={post._id} style={{
                    background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '20px',
                    border: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '24px', flexWrap: 'wrap'
                  }}>
                    <div style={{ flex: '1 1 300px' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '8px', display: 'flex', gap: '12px' }}>
                        <span>{new Date(post.createdAt || Date.now()).toLocaleDateString()}</span>
                        {post.postType && <span style={{ textTransform: 'capitalize', color: '#818cf8' }}>{post.postType}</span>}
                      </div>
                      <p style={{ margin: '0 0 16px', fontSize: '0.95rem', lineHeight: '1.5', color: '#e5e5e5', whiteSpace: 'pre-wrap' }}>
                        {post.content}
                      </p>
                      {post.hashtags && post.hashtags.length > 0 && (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {post.hashtags.map((tag: string) => (
                            <span key={tag} style={{ fontSize: '0.75rem', color: '#0ea5e9', display: 'flex', alignItems: 'center', gap: '2px' }}>
                              <Hash size={12} />{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Display Image if it exists */}
                      {post.imageUrl && (
                        <div style={{ marginTop: '16px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <img src={post.imageUrl} alt="Post content" style={{ width: '100%', height: 'auto', display: 'block' }} />
                        </div>
                      )}
                    </div>

                    <div style={{ width: '250px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.03)' }}>
                      <h4 style={{ margin: '0 0 12px', fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase' }}>Performance Insights</h4>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Impressions</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e5e5e5' }}>{impressions.toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Likes</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e5e5e5' }}>{post.likes}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Comments</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e5e5e5' }}>{post.comments}</span>
                      </div>
                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Engagement Rate</span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: engRate > 3 ? '#22c55e' : '#f59e0b' }}>
                            {engRate.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* COMMENTS SECTION TOGGLE */}
                    <div style={{ width: '100%', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px', marginTop: '8px' }}>
                      <button
                        onClick={() => setExpandedComments(prev => ({ ...prev, [post._id]: !prev[post._id] }))}
                        style={{
                          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                          color: '#e5e5e5', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
                          fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px',
                          transition: 'all 0.2s', width: '100%', justifyContent: 'center'
                        }}
                      >
                        <MessageCircle size={14} />
                        {expandedComments[post._id] ? 'Hide Comments' : `View Comments (${post.liveComments?.length || 0})`}
                      </button>

                      {/* COMMENTS THREAD */}
                      {expandedComments[post._id] && (
                        <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>

                          {/* New Comment Input */}
                          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#1e293b', flexShrink: 0, overflow: 'hidden' }}>
                              {account?.profileImageUrl ? <img src={account.profileImageUrl} alt="You" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Users size={16} color="#64748b" style={{ margin: '8px' }} />}
                            </div>
                            <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
                              <input
                                type="text"
                                placeholder="Add a comment..."
                                value={commentText[post._id] || ''}
                                onChange={(e) => setCommentText(prev => ({ ...prev, [post._id]: e.target.value }))}
                                onKeyDown={(e) => e.key === 'Enter' && handlePostComment(post._id)}
                                style={{ flex: 1, padding: '10px 14px', borderRadius: '20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem', outline: 'none' }}
                              />
                              <button
                                onClick={() => handlePostComment(post._id)}
                                disabled={!commentText[post._id]?.trim()}
                                style={{ background: commentText[post._id]?.trim() ? '#00A0DC' : 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '20px', padding: '0 16px', cursor: commentText[post._id]?.trim() ? 'pointer' : 'not-allowed', fontSize: '0.8rem', fontWeight: 600 }}
                              >
                                Post
                              </button>
                            </div>
                          </div>

                          {/* Existing Comments */}
                          {post.liveComments && post.liveComments.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                              {post.liveComments.map((comment: any) => (
                                <div key={comment.id} style={{ display: 'flex', gap: '12px' }}>
                                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
                                    {comment.author.charAt(0)}
                                  </div>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '12px', display: 'inline-block' }}>
                                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e5e5e5', marginBottom: '2px' }}>{comment.author}</div>
                                      <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>{comment.text}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px', marginTop: '4px', paddingLeft: '4px' }}>
                                      <button onClick={() => setActiveReplyId(activeReplyId === comment.id ? null : comment.id)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}>Reply</button>
                                      <span style={{ color: '#64748b', fontSize: '0.75rem' }}>{new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>

                                    {/* Replies */}
                                    {comment.replies && comment.replies.length > 0 && (
                                      <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {comment.replies.map((reply: any) => (
                                          <div key={reply.id} style={{ display: 'flex', gap: '10px' }}>
                                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e', fontWeight: 700, fontSize: '0.7rem', flexShrink: 0 }}>
                                              {reply.author.charAt(0)}
                                            </div>
                                            <div>
                                              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '10px', display: 'inline-block' }}>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#e5e5e5', marginBottom: '2px' }}>{reply.author}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{reply.text}</div>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    {/* Reply Input Box */}
                                    {activeReplyId === comment.id && (
                                      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                        <input
                                          type="text"
                                          placeholder={`Reply to ${comment.author}...`}
                                          value={replyText[comment.id] || ''}
                                          onChange={(e) => setReplyText(prev => ({ ...prev, [comment.id]: e.target.value }))}
                                          onKeyDown={(e) => e.key === 'Enter' && handlePostReply(post._id, comment.id)}
                                          style={{ flex: 1, padding: '8px 12px', borderRadius: '16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.8rem', outline: 'none' }}
                                        />
                                        <button
                                          onClick={() => handlePostReply(post._id, comment.id)}
                                          disabled={!replyText[comment.id]?.trim()}
                                          style={{ background: replyText[comment.id]?.trim() ? '#22c55e' : 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '16px', padding: '0 12px', cursor: replyText[comment.id]?.trim() ? 'pointer' : 'not-allowed', fontSize: '0.75rem', fontWeight: 600 }}
                                        >
                                          Send
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div style={{ textAlign: 'center', padding: '20px', color: '#64748b', fontSize: '0.85rem' }}>
                              Be the first to comment on this post!
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* === SUB-TAB: EVENTS === */}
      {subTab === 'events' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, color: '#e5e5e5', fontSize: '1.1rem' }}>LinkedIn Virtual Events</h3>
            <button
              onClick={() => setShowCreateEvent(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'linear-gradient(135deg, #0077B5, #00A0DC)',
                color: '#fff', border: 'none', borderRadius: '10px',
                padding: '8px 16px', fontSize: '0.8rem', fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Calendar size={14} /> Create Event
            </button>
          </div>

          {eventsLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '150px' }}>
              <Loader2 size={24} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          ) : events && events.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              {events.map((evt: any) => {
                const isUpcoming = new Date(evt.startsAt || evt.startsAtTime).getTime() > Date.now();
                return (
                  <div key={evt.id || evt._id} style={{
                    background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '20px',
                    border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{
                          fontSize: '0.65rem', padding: '3px 8px', borderRadius: '8px', fontWeight: 700,
                          background: isUpcoming ? 'rgba(14,165,233,0.15)' : 'rgba(100,116,139,0.15)',
                          color: isUpcoming ? '#0ea5e9' : '#94a3b8'
                        }}>
                          {isUpcoming ? 'UPCOMING' : 'COMPLETED'}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Users size={12} /> {evt.attendees || 0} registered
                        </span>
                      </div>
                      <h4 style={{ margin: '0 0 8px', color: '#e5e5e5', fontSize: '0.95rem', fontWeight: 700 }}>{evt.name || evt.title}</h4>
                      <p style={{ margin: '0 0 14px', fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.4 }}>{evt.description || 'No description provided.'}</p>
                    </div>

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#cbd5e1' }}>
                        <Clock size={12} color="#818cf8" />
                        <span>{new Date(evt.startsAt || evt.startsAtTime).toLocaleString()}</span>
                      </div>
                      {evt.onlineMeetingUrl && (
                        <a href={evt.onlineMeetingUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: '#0ea5e9', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                          Join Event Link <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <Calendar size={28} color="#64748b" style={{ marginBottom: '12px', opacity: 0.5 }} />
              <h4 style={{ margin: '0 0 6px', color: '#e5e5e5', fontSize: '0.9rem' }}>No Virtual Events</h4>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>Create an audio or video event to connect with your LinkedIn audience.</p>
            </div>
          )}
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateEvent && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', zIndex: 2000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: '#0f1629', borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '28px', width: '500px', boxSizing: 'border-box',
            boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#e5e5e5' }}>Create LinkedIn Event</h3>
              <button onClick={() => setShowCreateEvent(false)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px', display: 'block' }}>Event Name *</label>
                <input
                  type="text"
                  placeholder="E.g., AI Marketing Workshop"
                  value={newEvent.name}
                  onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px', display: 'block' }}>Event Format</label>
                <select
                  value={newEvent.format}
                  onChange={(e) => setNewEvent({ ...newEvent, format: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem', cursor: 'pointer', boxSizing: 'border-box' }}
                >
                  <option value="AUDIO">LinkedIn Audio Event</option>
                  <option value="VIDEO">LinkedIn Live Video Event</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px', display: 'block' }}>Start Date & Time *</label>
                <input
                  type="datetime-local"
                  value={newEvent.startsAt}
                  onChange={(e) => setNewEvent({ ...newEvent, startsAt: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px', display: 'block' }}>Online Event / Meeting Link</label>
                <input
                  type="url"
                  placeholder="https://example.com/meeting"
                  value={newEvent.onlineMeetingUrl}
                  onChange={(e) => setNewEvent({ ...newEvent, onlineMeetingUrl: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px', display: 'block' }}>Description *</label>
                <textarea
                  placeholder="Describe what your event is about..."
                  rows={4}
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem', resize: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={() => setShowCreateEvent(false)}
                style={{ padding: '10px 20px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: 'none', color: '#94a3b8', cursor: 'pointer', fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!newEvent.name.trim() || !newEvent.startsAt || !newEvent.description.trim()) {
                    alert('Please fill in all required fields (*)');
                    return;
                  }
                  onCreateEvent({
                    name: newEvent.name,
                    description: newEvent.description,
                    startsAt: new Date(newEvent.startsAt).getTime(),
                    onlineMeetingUrl: newEvent.onlineMeetingUrl,
                    format: newEvent.format
                  });
                  setShowCreateEvent(false);
                  setNewEvent({ name: '', description: '', startsAt: '', onlineMeetingUrl: '', format: 'AUDIO' });
                }}
                disabled={!newEvent.name.trim() || !newEvent.startsAt || !newEvent.description.trim()}
                style={{
                  padding: '10px 24px', borderRadius: '10px',
                  background: (newEvent.name.trim() && newEvent.startsAt && newEvent.description.trim()) ? 'linear-gradient(135deg, #0077B5, #00A0DC)' : 'rgba(255,255,255,0.06)',
                  border: 'none', color: '#fff', cursor: (newEvent.name.trim() && newEvent.startsAt && newEvent.description.trim()) ? 'pointer' : 'not-allowed',
                  fontWeight: 600, fontSize: '0.85rem'
                }}
              >
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== ADS MANAGER VIEW ====================
const AdsManagerView: React.FC<{ campaigns: any[]; loading: boolean }> = ({ campaigns, loading }) => {
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', color: '#64748b' }}>
        <Loader2 size={32} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!campaigns || campaigns.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px', color: '#64748b', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
        <Megaphone size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
        <h3 style={{ margin: '0 0 8px', color: '#e5e5e5' }}>No Active Campaigns</h3>
        <p style={{ margin: 0, fontSize: '0.9rem' }}>You don't have any LinkedIn Ad Campaigns running right now.</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <DollarSign size={14} color="#22c55e" /> TOTAL SPEND
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#e5e5e5' }}>
            ${campaigns.reduce((sum, c) => sum + (c.metrics?.spend || 0), 0).toFixed(2)}
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <Activity size={14} color="#0ea5e9" /> TOTAL IMPRESSIONS
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#e5e5e5' }}>
            {campaigns.reduce((sum, c) => sum + (c.metrics?.impressions || 0), 0).toLocaleString()}
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <Target size={14} color="#f59e0b" /> CONVERSIONS
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#e5e5e5' }}>
            {campaigns.reduce((sum, c) => sum + (c.metrics?.conversions || 0), 0).toLocaleString()}
          </div>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <th style={{ padding: '16px', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>CAMPAIGN NAME</th>
              <th style={{ padding: '16px', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>STATUS</th>
              <th style={{ padding: '16px', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>OBJECTIVE</th>
              <th style={{ padding: '16px', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>SPEND</th>
              <th style={{ padding: '16px', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>IMPRESSIONS</th>
              <th style={{ padding: '16px', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>CLICKS</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => (
              <tr key={c.campaignId} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '16px', fontWeight: 600, fontSize: '0.85rem' }}>{c.name}</td>
                <td style={{ padding: '16px' }}>
                  <span style={{
                    padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700,
                    background: c.status === 'ACTIVE' ? 'rgba(34,197,94,0.15)' : 'rgba(100,116,139,0.15)',
                    color: c.status === 'ACTIVE' ? '#22c55e' : '#94a3b8'
                  }}>
                    {c.status}
                  </span>
                </td>
                <td style={{ padding: '16px', fontSize: '0.8rem', color: '#94a3b8' }}>{c.objectiveType.replace('_', ' ')}</td>
                <td style={{ padding: '16px', fontSize: '0.85rem', fontWeight: 600 }}>${c.metrics?.spend?.toFixed(2)}</td>
                <td style={{ padding: '16px', fontSize: '0.85rem', color: '#cbd5e1' }}>{c.metrics?.impressions?.toLocaleString()}</td>
                <td style={{ padding: '16px', fontSize: '0.85rem', color: '#cbd5e1' }}>{c.metrics?.clicks?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
