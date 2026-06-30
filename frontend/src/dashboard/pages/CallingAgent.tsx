import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Phone, Users, FileText, PlayCircle, Loader2, StopCircle } from 'lucide-react';

interface CallCampaign {
  _id: string;
  name: string;
  totalContacts: number;
  completedCalls: number;
  status: string;
  createdAt: string;
}

interface CallRecord {
  _id: string;
  customerName: string;
  customerPhone: string;
  status: string;
  duration: number;
  recordingUrl: string;
  transcript: string;
  summary: string;
}

export const CallingAgent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  const [campaignName, setCampaignName] = useState('');
  const [prompt, setPrompt] = useState('You are an expert sales representative for our company. Your goal is to qualify the lead and book a follow-up appointment.');
  const [contactsInput, setContactsInput] = useState('John Doe, +1234567890\nJane Smith, +0987654321');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [campaigns, setCampaigns] = useState<CallCampaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [records, setRecords] = useState<CallRecord[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const fetchCampaigns = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/calling/campaigns`);
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRecords = async (campaignId: string) => {
    setIsLoadingRecords(true);
    setSelectedCampaign(campaignId);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/calling/campaigns/${campaignId}/records`);
      if (res.ok) {
        const data = await res.json();
        setRecords(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingRecords(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      fetchCampaigns();
    }
  }, [activeTab]);

  const handleStartCampaign = async () => {
    if (!campaignName) return toast.error('Please enter a campaign name');
    
    // Parse contacts
    const lines = contactsInput.split('\n').filter(l => l.trim());
    const contacts = lines.map(line => {
      const parts = line.split(',');
      return {
        name: parts[0]?.trim() || 'Customer',
        phone: parts[1]?.trim() || ''
      };
    }).filter(c => c.phone);

    if (contacts.length === 0) return toast.error('Please enter valid contacts (Name, Phone)');

    setIsSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/calling/campaign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: campaignName, prompt, contacts })
      });
      
      if (res.ok) {
        toast.success(`Campaign started with ${contacts.length} calls!`);
        setCampaignName('');
        setActiveTab('history');
      } else {
        toast.error('Failed to start campaign');
      }
    } catch (e) {
      toast.error('Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const playAudio = (url: string) => {
    if (audioElement) {
      audioElement.pause();
    }
    if (playingAudio === url) {
      setPlayingAudio(null);
      setAudioElement(null);
      return;
    }
    const audio = new Audio(url);
    audio.play();
    audio.onended = () => {
      setPlayingAudio(null);
    };
    setAudioElement(audio);
    setPlayingAudio(url);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-2 flex items-center">
          <Phone className="w-8 h-8 mr-3 text-blue-600" />
          AI Voice Calling Agent
        </h1>
        <p className="text-gray-600 text-lg">Deploy an AI agent to simultaneously call 100+ customers, hold intelligent conversations, and record transcripts.</p>
      </div>

      <div className="flex space-x-4 mb-6 border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('new')}
          className={`pb-3 px-4 text-sm font-medium transition-colors ${activeTab === 'new' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Launch New Campaign
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-4 text-sm font-medium transition-colors ${activeTab === 'history' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Call History & Transcripts
        </button>
      </div>

      {activeTab === 'new' && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-6 md:p-8 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Campaign Name</label>
              <input 
                type="text" 
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                placeholder="e.g., Summer Lead Reactivation"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">AI Agent System Prompt</label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
                placeholder="Describe how the AI should act on the phone..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Contact List (Name, Phone)</label>
              <p className="text-xs text-gray-500 mb-2">Paste up to 100 contacts here. One per line.</p>
              <textarea 
                value={contactsInput}
                onChange={(e) => setContactsInput(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none font-mono text-sm"
              />
            </div>

            <button 
              onClick={handleStartCampaign}
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.01] flex justify-center items-center"
            >
              {isSubmitting ? (
                <><Loader2 className="w-6 h-6 mr-2 animate-spin" /> Starting Calls...</>
              ) : (
                <><Phone className="w-6 h-6 mr-2" /> Launch Simultaneous Calls</>
              )}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden h-[600px] flex flex-col">
            <div className="p-4 bg-gray-50 border-b font-semibold text-gray-700 flex items-center">
              <Users className="w-5 h-5 mr-2" /> Campaigns
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {campaigns.length === 0 ? (
                <p className="text-center text-gray-500 mt-10">No campaigns yet.</p>
              ) : (
                campaigns.map(camp => (
                  <div 
                    key={camp._id} 
                    onClick={() => fetchRecords(camp._id)}
                    className={`p-4 mb-2 rounded-xl cursor-pointer transition-all ${selectedCampaign === camp._id ? 'bg-blue-50 border-blue-200 border' : 'hover:bg-gray-50 border border-transparent'}`}
                  >
                    <h3 className="font-semibold text-gray-800">{camp.name}</h3>
                    <div className="text-xs text-gray-500 mt-1 flex justify-between">
                      <span>{new Date(camp.createdAt).toLocaleDateString()}</span>
                      <span className={`px-2 py-0.5 rounded-full ${camp.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {camp.completedCalls}/{camp.totalContacts} {camp.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="md:col-span-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden h-[600px] flex flex-col">
             <div className="p-4 bg-gray-50 border-b font-semibold text-gray-700 flex items-center">
              <FileText className="w-5 h-5 mr-2" /> Call Records & Transcripts
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {!selectedCampaign ? (
                <div className="flex items-center justify-center h-full text-gray-400">Select a campaign to view records</div>
              ) : isLoadingRecords ? (
                <div className="flex justify-center mt-10"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
              ) : records.length === 0 ? (
                <p className="text-center text-gray-500 mt-10">No records found.</p>
              ) : (
                records.map(record => (
                  <div key={record._id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-lg text-gray-800">{record.customerName}</h4>
                        <p className="text-sm text-gray-500">{record.customerPhone}</p>
                      </div>
                      <div className="flex flex-col items-end">
                         <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                           record.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                           record.status === 'Failed' ? 'bg-red-100 text-red-700' : 
                           'bg-yellow-100 text-yellow-700'
                         }`}>
                           {record.status}
                         </span>
                         {record.duration > 0 && <span className="text-xs text-gray-400 mt-1">{record.duration}s</span>}
                      </div>
                    </div>

                    {record.recordingUrl && (
                      <div className="mb-4 bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 flex items-center">
                          <PlayCircle className="w-4 h-4 mr-2" /> Call Recording
                        </span>
                        <button 
                          onClick={() => playAudio(record.recordingUrl)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          {playingAudio === record.recordingUrl ? <StopCircle className="w-6 h-6" /> : <PlayCircle className="w-6 h-6" />}
                        </button>
                      </div>
                    )}

                    {record.transcript && (
                      <div className="mt-4">
                        <h5 className="text-sm font-semibold text-gray-700 mb-2">Transcript</h5>
                        <div className="bg-gray-50 p-4 rounded-xl text-sm font-mono text-gray-600 max-h-40 overflow-y-auto whitespace-pre-wrap">
                          {record.transcript}
                        </div>
                      </div>
                    )}

                    {record.summary && (
                      <div className="mt-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
                        <h5 className="text-xs font-bold text-blue-800 mb-1">AI Summary</h5>
                        <p className="text-sm text-blue-900">{record.summary}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
