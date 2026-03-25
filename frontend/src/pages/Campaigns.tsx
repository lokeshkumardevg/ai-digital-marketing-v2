import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { GlassCard } from '../components/GlassCard';
import { LayoutTemplate } from 'lucide-react';
import { fetchCampaigns, createCampaign } from '../store/slices/campaignsSlice';
import { SmartTable } from '../components/SmartTable';
import type { AppDispatch } from '../store';
import toast from 'react-hot-toast';

export const Campaigns: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { campaigns, status, generating } = useSelector((state: any) => state.campaigns);
  
  // Also hook into CRM audiences natively from Redux! No redundant fetches!
  const audiences = useSelector((state: any) => state.crm.audiences);

  const [campaignName, setCampaignName] = useState('');
  const [selectedAudience, setSelectedAudience] = useState('');
  const [platform, setPlatform] = useState('meta'); // meta | google | tiktok
  const [budget, setBudget] = useState('500');

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchCampaigns());
    }
  }, [status, dispatch]);

  const handleCreateCampaign = async () => {
    if (!campaignName || !selectedAudience) {
      toast.error('Name & Audience are required parameters!');
      return;
    }

    try {
      const promise = dispatch(createCampaign({ 
        name: campaignName, 
        audienceId: selectedAudience, 
        platform: platform.toUpperCase(),
        budget 
      })).unwrap();
      toast.promise(promise, {
        loading: 'Generating ads...',
        success: 'Campaign created successfully!',
        error: 'Failed to create campaign.'
      });
      await promise;
      setCampaignName('');
      setSelectedAudience('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>
           Automated <span className="text-gradient">Campaigns</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Create automated ad campaigns using AI.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1.2fr) 2fr', gap: '24px' }}>
        {/* Ad Builder UI */}
        <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: 'fit-content' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Campaign Settings</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Set up your new ad campaign.</p>
          </div>

          <div className="input-group">
            <label>Campaign Name</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="e.g. Q4 Real Estate Sweep"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              disabled={generating}
            />
          </div>

          <div className="input-group">
            <label>Select Target Audience</label>
            <select 
              className="input-field" 
              value={selectedAudience} 
              onChange={(e) => setSelectedAudience(e.target.value)}
              disabled={generating}
            >
              <option value="">-- Connect Audience Profile --</option>
              {audiences.map((aud: any) => (
                <option key={aud._id} value={aud._id}>{aud.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ fontSize: '0.85rem' }}>Select Advertising Network</label>
            <div style={{ display: 'flex', gap: '8px' }}>
               {['meta', 'google', 'tiktok'].map(p => (
                 <button 
                  key={p} 
                  onClick={() => setPlatform(p)}
                  style={{ 
                    flex: 1, padding: '10px', borderRadius: '8px', 
                    background: platform === p ? 'var(--accent-primary)' : 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--glass-border)', color: '#fff', cursor: 'pointer',
                    textTransform: 'capitalize', fontSize: '0.8rem', transition: '0.2s'
                  }}
                 >
                   {p}
                 </button>
               ))}
            </div>
          </div>

          <div className="input-group">
            <label>Daily AI Budget Allocation ($)</label>
            <input type="number" className="input-field" value={budget} onChange={e => setBudget(e.target.value)} />
          </div>

          <button 
            className="btn btn-primary" 
            onClick={handleCreateCampaign} 
            disabled={generating}
            style={{ display: 'flex', justifyContent: 'center' }}
          >
            {generating ? 'Creating campaign...' : 'Create Campaign'}
          </button>
        </GlassCard>

        {/* Generated Campaigns Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', overflowX: 'auto' }}>
          {status === 'loading' && campaigns.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading campaigns...</div>
          ) : (
            <SmartTable 
              title="Global Ad Campaigns"
              searchPlaceholder="Search campaign ads..."
              columns={[
                {
                  key: 'name',
                  label: 'Campaign Name',
                  sortable: true,
                  render: (row) => (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ fontWeight: 600 }}>{row.name}</div>
                      <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', fontSize: '0.65rem', padding: '2px 8px', borderRadius: '12px', border: '1px solid var(--success)' }}>
                         LIVE
                      </span>
                    </div>
                  )
                },
                {
                  key: 'platform',
                  label: 'Platform',
                  sortable: true,
                  render: (row) => (
                    <div style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600, color: row.platform === 'GOOGLE' ? 'var(--warning)' : row.platform === 'META' ? 'var(--info)' : 'var(--accent-primary)' }}>
                      {row.platform || 'META'}
                    </div>
                  )
                },
                {
                  key: 'audienceId',
                  label: 'Target Audience',
                  render: (row) => <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{row.audienceId || 'Dynamic'}</div>
                },
                {
                   key: 'budget',
                   label: 'Daily Budget',
                   sortable: true,
                   render: (row) => <div style={{ fontWeight: 500 }}>${row.budget || '500'}</div>
                }
              ]}
              data={campaigns}
              actions={() => <button className="btn btn-secondary" style={{ padding: '6px' }}><LayoutTemplate size={14} /></button>}
            />
          )}
        </div>
      </div>
    </div>
  );
};
