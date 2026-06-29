import React, { useState } from 'react';

interface EditGoogleCampaignModalProps {
  campaign: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedData: any) => Promise<void>;
}

export const EditGoogleCampaignModal: React.FC<EditGoogleCampaignModalProps> = ({
  campaign,
  isOpen,
  onClose,
  onSave
}) => {
  if (!isOpen) return null;

  const [campaignName, setCampaignName] = useState(campaign?.data?.campaignName || campaign?.name || '');
  const [dailyBudget, setDailyBudget] = useState(campaign?.data?.dailyBudget || '');
  const [headline, setHeadline] = useState(campaign?.data?.headline || '');
  const [caption, setCaption] = useState(campaign?.data?.caption || '');
  const [finalUrl, setFinalUrl] = useState(campaign?.data?.finalUrl || '');
  
  // New States: Status dropdown, Start/End Dates (calendars), and Keywords
  const [status, setStatus] = useState(campaign?.status || campaign?.data?.status || 'PAUSED');
  const [startDate, setStartDate] = useState(() => {
    if (campaign?.data?.startDate) return campaign.data.startDate;
    return '';
  });
  const [endDate, setEndDate] = useState(() => {
    if (campaign?.data?.endDate) return campaign.data.endDate;
    return '';
  });
  const [googleKeywords, setGoogleKeywords] = useState(() => {
    const kws = campaign?.data?.googleKeywords || [];
    return Array.isArray(kws) ? kws.join(', ') : '';
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await onSave({
        campaignName,
        dailyBudget,
        headline,
        caption,
        finalUrl,
        status,
        startDate,
        endDate,
        googleKeywords: googleKeywords.split(',').map(s => s.trim()).filter(Boolean)
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#0f0f13] border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl my-8">
        <h2 className="text-2xl font-bold text-white mb-4">Edit Google Campaign</h2>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Campaign Name</label>
              <input 
                type="text" 
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-[#4B83F3]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Status</label>
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-[#1b1b22] border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-[#4B83F3]"
              >
                <option value="ACTIVE">Active (Running)</option>
                <option value="PAUSED">Paused</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Daily Budget ($)</label>
              <input 
                type="number" 
                value={dailyBudget}
                onChange={(e) => setDailyBudget(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-[#4B83F3]"
                min="10"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Final URL</label>
              <input 
                type="url" 
                value={finalUrl}
                onChange={(e) => setFinalUrl(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-[#4B83F3]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Start Date</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-[#4B83F3]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">End Date</label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-[#4B83F3]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Keywords (comma-separated)</label>
            <input 
              type="text" 
              value={googleKeywords}
              onChange={(e) => setGoogleKeywords(e.target.value)}
              placeholder="e.g. digital marketing, software, solar power"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-[#4B83F3]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Headline (Max 30 chars)</label>
            <input 
              type="text" 
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              maxLength={30}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-[#4B83F3]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Description (Max 90 chars)</label>
            <textarea 
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={90}
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-[#4B83F3] resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-white/70 hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-[#4B83F3] text-white hover:bg-[#3b6bd6] transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
