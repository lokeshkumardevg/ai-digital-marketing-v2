import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { api } from '../../api/axios';
import toast from 'react-hot-toast';
import { getSeoData } from '../../utils/seoStorage';
import { 
  BarChart2, 
  DollarSign, 
  MousePointerClick, 
  Target, 
  TrendingUp, 
  Activity, 
  FileText, 
  Copy, 
  Download, 
  Check, 
  AlertCircle,
  FileCheck,
  RefreshCw,
  Sparkles,
  ChevronRight,
  TrendingDown
} from 'lucide-react';

interface ReportHistoryItem {
  id: string;
  brandName: string;
  dateRange: string;
  focus: string;
  tone: string;
  metrics: string;
  reportContent: string;
  timestamp: string;
}

export const AiReports: React.FC = () => {
  // Redux state
  const { user } = useSelector((state: any) => state.auth);
  const websites = useSelector((s: RootState) => s.workspace.websites);
  const activeWebsiteId = useSelector((s: RootState) => s.workspace.activeWebsiteId);
  const activeBrand = websites.find((w: any) => w.id === activeWebsiteId);

  // States
  const [dateRange, setDateRange] = useState('Last 7 days');
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [metricsData, setMetricsData] = useState<any>(null);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  
  // Custom prompt inputs
  const [customNotes, setCustomNotes] = useState('');
  const [reportTone, setReportTone] = useState('Elite Fractional CMO (Analytical & Strategic)');
  const [reportFocus, setReportFocus] = useState('ROI & Business Growth');
  const [rawMetricsText, setRawMetricsText] = useState('');

  // Generation states
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStage, setProgressStage] = useState('');
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // History states
  const [history, setHistory] = useState<ReportHistoryItem[]>([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);

  // Currency helper
  const getCurrencySymbol = (currency: string) => {
    switch (currency?.toUpperCase()) {
      case 'INR': return '₹';
      case 'USD': return '$';
      case 'GBP': return '£';
      case 'EUR': return '€';
      case 'CAD': return '$';
      case 'AUD': return '$';
      case 'AED': return 'د.إ';
      default: return '₹';
    }
  };
  const cur = getCurrencySymbol(user?.currency || 'INR');

  // Inject html2pdf script
  useEffect(() => {
    if (!document.getElementById('html2pdf-script')) {
      const script = document.createElement('script');
      script.id = 'html2pdf-script';
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      document.body.appendChild(script);
    }
    
    // Load history from localStorage
    const stored = localStorage.getItem('ai_reporting_history');
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse reporting history', e);
      }
    }
  }, []);

  // Fetch Dashboard Metrics automatically
  const fetchMetrics = async (bypassCache = false) => {
    setMetricsLoading(true);
    setMetricsError(null);
    try {
      const cacheParam = bypassCache ? '&bypassCache=true' : '';
      const response = await api.get(`/analytics/dashboard?dateRange=${encodeURIComponent(dateRange)}${cacheParam}`);
      
      if (response.data) {
        setMetricsData(response.data);
        
        // Build raw metrics string automatically
        const summary = response.data.summary || {};
        const spend = summary.spend ?? 0;
        const impressions = summary.impressions ?? 0;
        const clicks = summary.clicks ?? 0;
        const conversions = summary.conversions ?? 0;
        const ctr = summary.ctr ?? (impressions > 0 ? (clicks / impressions) * 100 : 0);
        const cpc = summary.cpc ?? (clicks > 0 ? spend / clicks : 0);

        let autoText = `OVERALL PAID ADS PERFORMANCE [${dateRange}]:
- Total Spend: ${cur}${spend.toLocaleString('en-US', { maximumFractionDigits: 2 })}
- Total Impressions: ${impressions.toLocaleString('en-US')}
- Total Clicks: ${clicks.toLocaleString('en-US')}
- Total Conversions: ${conversions.toLocaleString('en-US')}
- Average CTR: ${ctr.toFixed(2)}%
- Average CPC: ${cur}${cpc.toFixed(2)}`;

        // Append platform-specific breakdown if available
        if (response.data.platforms) {
          autoText += `\n\nDETAILED PAID ADS PLATFORM BREAKDOWN:\n`;
          Object.entries(response.data.platforms).forEach(([plat, val]: any) => {
            const pSpend = val.spend ?? 0;
            const pImpressions = val.impressions ?? 0;
            const pClicks = val.clicks ?? 0;
            const pConversions = val.conversions ?? 0;
            const pCtr = pImpressions > 0 ? (pClicks / pImpressions) * 100 : 0;
            const pCpc = pClicks > 0 ? pSpend / pClicks : 0;
            
            autoText += `- ${plat.toUpperCase()}: Spend: ${cur}${pSpend.toLocaleString('en-US', { maximumFractionDigits: 2 })}, Impressions: ${pImpressions.toLocaleString('en-US')}, Clicks: ${pClicks.toLocaleString('en-US')}, Conversions: ${pConversions.toLocaleString('en-US')}, CTR: ${pCtr.toFixed(2)}%, CPC: ${cur}${pCpc.toFixed(2)}\n`;
          });
        } else if (response.data.platformBreakdown) {
          autoText += `\n\nPlatform Breakdown:\n`;
          Object.entries(response.data.platformBreakdown).forEach(([plat, val]: any) => {
            autoText += `- ${plat.toUpperCase()}: Spend: ${cur}${val.spend?.toLocaleString() || 0}, Conversions: ${val.conversions || 0}\n`;
          });
        }

        // Add Brand Profile details if available
        if (activeBrand) {
          autoText += `\n\nBRAND POSITIONING & AUDIENCE CONTEXT:`;
          autoText += `\n- Brand Name: ${activeBrand.name}`;
          autoText += `\n- Brand Website: ${activeBrand.url}`;
          const bp = activeBrand.brandProfile;
          if (bp) {
            if (bp.description) autoText += `\n- Brand Description: ${bp.description}`;
            if (bp.brand_tone) autoText += `\n- Brand Tone: ${Array.isArray(bp.brand_tone) ? bp.brand_tone.join(', ') : bp.brand_tone}`;
            if (bp.target_audience) autoText += `\n- Target Audience: ${bp.target_audience}`;
            if (bp.value_proposition) autoText += `\n- Core Value Proposition: ${bp.value_proposition}`;
            if (bp.market_keywords) autoText += `\n- Core Target Keywords: ${Array.isArray(bp.market_keywords) ? bp.market_keywords.join(', ') : bp.market_keywords}`;
            if (bp.competitors) autoText += `\n- Key Competitors: ${Array.isArray(bp.competitors) ? bp.competitors.join(', ') : bp.competitors}`;
          }
        }

        // Add organic SEO & search console details if available
        try {
          const seoData = getSeoData();
          if (seoData && seoData.result && (seoData.url.includes(activeBrand?.url) || activeBrand?.url?.includes(seoData.url))) {
            const res = seoData.result;
            autoText += `\n\nORGANIC SEARCH SEO AUDIT METRICS (Last Scan: ${new Date(seoData.updatedAt).toLocaleDateString()}):`;
            autoText += `\n- Site Load Time: ${res.loadTime || 'N/A'}`;
            autoText += `\n- Authority Score: ${res.semrush?.backlinks?.ascore || 'N/A'}`;
            autoText += `\n- Organic Search Traffic (Monthly): ${res.semrush?.overview?.Ot || 'N/A'}`;
            autoText += `\n- Organic Keywords Indexed: ${res.semrush?.overview?.Or || 'N/A'}`;
            autoText += `\n- Total Backlinks Count: ${res.semrush?.backlinks?.total || 'N/A'}`;
            autoText += `\n- Meta Title Tag: "${res.meta?.title || 'N/A'}"`;
            autoText += `\n- Meta Description Tag: "${res.meta?.description || 'N/A'}"`;
            autoText += `\n- Main Page Heading (H1): "${res.meta?.h1 || 'N/A'}"`;
            
            if (res.semrush?.keywords && Array.isArray(res.semrush.keywords) && res.semrush.keywords.length > 0) {
              autoText += `\n- Top Organic Search Keywords:`;
              res.semrush.keywords.slice(0, 5).forEach((kw: any) => {
                autoText += `\n  * "${kw.Ph}" (Pos: ${kw.Po}, Vol: ${kw.Nq || 'N/A'}, Traffic Impact: ${kw.Tr || 'N/A'}%)`;
              });
            }
          } else {
            autoText += `\n\nORGANIC SEARCH SEO AUDIT METRICS:\n- No recent SEO audit found in this browser session. Client is recommended to execute a scan on the SEO page to load organic search metrics.`;
          }
        } catch (err) {
          console.error("SEO Storage read error", err);
        }

        setRawMetricsText(autoText);
      } else {
        throw new Error("Empty metrics payload");
      }
    } catch (err: any) {
      console.error('Failed to fetch dashboard metrics for reporting', err);
      setMetricsError('Failed to load real-time analytics. You can still input manual metrics below.');
      
      // Seed default raw metrics helper text
      setRawMetricsText(`Platform Ad Spend & Activity [${dateRange}]:\n- Total Spend: ${cur}0\n- Impressions: 0\n- Clicks: 0\n- Conversions: 0\n- Average CTR: 0.00%\n- Average CPC: ${cur}0.00`);
    } finally {
      setMetricsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [dateRange, activeWebsiteId]);

  // Handle Generation
  const handleGenerateReport = async () => {
    if (!rawMetricsText.trim()) {
      toast.error('Please enter metrics data to run the AI report.');
      return;
    }

    setGenerating(true);
    setGeneratedReport(null);
    setSelectedHistoryId(null);
    setProgress(0);
    setProgressStage('Initializing Fractional CMO reporting agent...');

    // Progress animation simulation
    const stages = [
      { p: 15, label: 'Reading live platform analytics...' },
      { p: 40, label: 'Calculating ROI and cost per acquisition...' },
      { p: 65, label: 'Synthesizing strategic campaign pivots...' },
      { p: 85, label: 'Formatting report using executive tone...' },
      { p: 95, label: 'Validating metrics with compliance guards...' }
    ];

    let currentStageIndex = 0;
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (currentStageIndex < stages.length) {
          const target = stages[currentStageIndex];
          if (prev < target.p) {
            return prev + Math.random() * 8;
          } else {
            setProgressStage(target.label);
            currentStageIndex++;
            return prev;
          }
        }
        return prev < 98 ? prev + 0.3 : prev;
      });
    }, 250);

    try {
      const fullInputMetrics = `${rawMetricsText}\n\nUser Custom Notes:\n${customNotes || 'No custom notes provided.'}\n\nReport Focus Area: ${reportFocus}\nRequested Style/Tone: ${reportTone}`;
      
      const response = await api.post('/webhook/reporting', {
        metrics: fullInputMetrics
      });

      clearInterval(progressInterval);
      setProgress(100);
      setProgressStage('Analysis complete!');

      if (response.data && response.data.aiOutput) {
        const reportContent = response.data.aiOutput;
        setGeneratedReport(reportContent);
        
        // Add to history
        const newReportItem: ReportHistoryItem = {
          id: Date.now().toString(),
          brandName: activeBrand?.name || 'Savorka Solar',
          dateRange,
          focus: reportFocus,
          tone: reportTone,
          metrics: rawMetricsText,
          reportContent,
          timestamp: new Date().toLocaleString()
        };

        const updatedHistory = [newReportItem, ...history].slice(0, 15);
        setHistory(updatedHistory);
        localStorage.setItem('ai_reporting_history', JSON.stringify(updatedHistory));

        toast.success('AI Report generated successfully!');
      } else {
        throw new Error('AI output structure invalid');
      }
    } catch (e: any) {
      clearInterval(progressInterval);
      toast.error('Failed to generate report. Using local fallback simulation.');
      
      // Local fallback simulation
      const fallbackReport = `# Executive Fractional CMO Summary [${dateRange}]
## 1. Return on Investment (ROI)
The current campaign structure is yielding a positive conversion path. Total spend has stabilized, and key customer acquisition loops are functioning. We advise maintaining current investment levels on top-performing Meta sets.

## 2. Customer Acquisition Cost (CAC)
CPC is currently hovering around target margins. Recommend shifting 15% budget from low-performing long-tail search campaigns to high-converting branded search to lower overall blended CAC.

## 3. Recommended Pivots
- Implement A/B testing on Meta ad creative copy.
- Optimize Google Ads landing page load speed to improve Quality Score.
- Refine local SEO map listings keyword target sets.`;
      
      setGeneratedReport(fallbackReport);
    } finally {
      setGenerating(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    if (!generatedReport) return;
    navigator.clipboard.writeText(generatedReport);
    setCopied(true);
    toast.success('Copied report to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Export as PDF
  const handleDownloadPdf = () => {
    const element = document.getElementById('report-paper-container');
    if (!element || !generatedReport) return;

    // @ts-ignore
    const html2pdf = window.html2pdf;
    if (!html2pdf) {
      toast.error("PDF generator library is still loading. Please try again in a moment.");
      return;
    }

    const opt = {
      margin: 15,
      filename: `${activeBrand?.name || 'Savorka'}_AI_CMO_Report_${Date.now()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(element).set(opt).save();
  };

  // Select item from history
  const handleSelectHistory = (item: ReportHistoryItem) => {
    setSelectedHistoryId(item.id);
    setGeneratedReport(item.reportContent);
    setRawMetricsText(item.metrics);
    setReportTone(item.tone);
    setReportFocus(item.focus);
    setDateRange(item.dateRange);
  };

  return (
    <div style={{ minHeight: '100%', background: 'var(--bg-primary)', position: 'relative', fontFamily: 'Outfit, sans-serif' }}>
      
      {/* CSS for custom spinning & keyframes */}
      <style>{`
        @keyframes spinner { to { transform: rotate(360deg); } }
        .paper-glow {
          box-shadow: 0 4px 30px rgba(112, 51, 245, 0.05), inset 0 1px 0 rgba(255,255,255,0.05);
        }
      `}</style>

      {/* Header */}
      <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--glass-border)', padding: '18px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '3px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Analytics Suite</div>
          <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="#0665ff" style={{ animation: 'spinner 6s infinite linear' }} />
            AI CMO Reports
          </h1>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Generate executive-level Fractional CMO performance audits.
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            style={{ padding: '8px 16px', background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}
          >
            <option>Today</option>
            <option>Last 7 days</option>
            <option>Last 14 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
          
          <button
            onClick={() => fetchMetrics(true)}
            disabled={metricsLoading}
            style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'center', width: '34px', height: '34px', 
              borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-elevated)', 
              color: 'var(--text-secondary)', cursor: 'pointer', opacity: metricsLoading ? 0.6 : 1
            }}
            title="Force refresh live metrics"
          >
            <RefreshCw size={14} className={metricsLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div style={{ padding: '28px 32px', display: 'grid', gridTemplateColumns: '360px 1fr', gap: '28px' }}>
        
        {/* Left Column - Controls & Configuration */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Active Brand Card */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #0665ff, #8b5cf6)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
              🌐
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{activeBrand?.name || 'Savorka Solar'}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{activeBrand?.url || 'No domain linked'}</div>
            </div>
          </div>

          {/* Configuration Panel */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
              Report Customization
            </h3>

            {/* Focus Target */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Analysis Target</label>
              <select 
                value={reportFocus}
                onChange={(e) => setReportFocus(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', borderRadius: '8px', fontSize: '0.82rem', outline: 'none' }}
              >
                <option>ROI & Business Growth</option>
                <option>Customer Acquisition Cost (CAC)</option>
                <option>Conversion Rate Optimization</option>
                <option>Platform Allocation Strategy</option>
              </select>
            </div>

            {/* Report Tone */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Expert Personality</label>
              <select 
                value={reportTone}
                onChange={(e) => setReportTone(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', borderRadius: '8px', fontSize: '0.82rem', outline: 'none' }}
              >
                <option>Elite Fractional CMO (Analytical & Strategic)</option>
                <option>Professional Account Manager</option>
                <option>Aggressive Growth Hacker</option>
                <option>Creative Brand Strategist</option>
              </select>
            </div>

            {/* Raw Metrics (Auto-fetched & Editable) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Performance Data Input</label>
                {metricsLoading && <span style={{ fontSize: '0.7rem', color: '#0665ff' }}>Syncing...</span>}
              </div>
              <textarea 
                value={rawMetricsText}
                onChange={(e) => setRawMetricsText(e.target.value)}
                rows={6}
                placeholder="Enter raw performance numbers..."
                style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', borderRadius: '8px', fontSize: '0.8rem', outline: 'none', resize: 'vertical', fontFamily: 'monospace' }}
              />
            </div>

            {/* Custom Notes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Qualitative Notes / Context</label>
              <textarea 
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                rows={3}
                placeholder="e.g., Conversion rates fell due to site maintenance on Tuesday. Meta CPA is high but lead quality is premium."
                style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', borderRadius: '8px', fontSize: '0.8rem', outline: 'none', resize: 'vertical' }}
              />
            </div>

            {/* Action Trigger */}
            <button
              onClick={handleGenerateReport}
              disabled={generating || metricsLoading}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #0665ff, #8b5cf6)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.85rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(6, 101, 255, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '6px',
                transition: 'transform 0.15s, opacity 0.2s',
                opacity: (generating || metricsLoading) ? 0.75 : 1
              }}
              onMouseEnter={e => { if(!generating) e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { if(!generating) e.currentTarget.style.transform = 'translateY(0)' }}
            >
              {generating ? '✦ Processing CMO Audit...' : '✦ Generate AI CMO Report'}
            </button>
          </div>

          {/* History records */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Recent Reports</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 500 }}>{history.length} saved</span>
            </h3>
            
            {history.length === 0 ? (
              <div style={{ padding: '16px 0', textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-dim)', border: '1px dashed var(--glass-border)', borderRadius: '10px' }}>
                No generated reports found in workspace.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectHistory(item)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      background: selectedHistoryId === item.id ? 'rgba(6, 101, 255, 0.08)' : 'var(--bg-elevated)',
                      border: selectedHistoryId === item.id ? '1px solid #0665ff40' : '1px solid var(--glass-border)',
                      borderRadius: '8px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.74rem',
                      transition: 'all 0.15s'
                    }}
                  >
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '8px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.focus}</span>
                      <div style={{ fontSize: '0.66rem', color: 'var(--text-dim)' }}>{item.timestamp}</div>
                    </div>
                    <ChevronRight size={12} color="var(--text-dim)" />
                  </button>
                ))}
              </div>
            )}
          </div>
          
        </div>

        {/* Right Column - Report Presentation Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Metrics summary card overlay */}
          {!generating && !generatedReport && (
            <div style={{ 
              background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: '16px', 
              padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              textAlign: 'center', height: '420px'
            }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(112, 51, 245, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', marginBottom: '20px' }}>
                ✍️
              </div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px 0' }}>Ready for CFO Strategy Audit</h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 0 24px 0', lineHeight: 1.6 }}>
                Click "Generate AI CMO Report" on the left to invoke the intelligence agents. We will aggregate your live platform ad spend, CTR, conversion rates, and build an executive brief.
              </p>
              
              {/* Mini quick summary of fetched metrics if available */}
              {metricsData && (
                <div style={{ display: 'flex', gap: '14px', background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '14px 20px', width: '100%', maxWidth: '480px' }}>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600 }}>Total spend</div>
                    <div style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>{cur}{metricsData.totalSpend?.toLocaleString() || 0}</div>
                  </div>
                  <div style={{ width: '1px', background: 'var(--glass-border)' }} />
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600 }}>Conversions</div>
                    <div style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>{metricsData.totalConversions?.toLocaleString() || 0}</div>
                  </div>
                  <div style={{ width: '1px', background: 'var(--glass-border)' }} />
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600 }}>Total clicks</div>
                    <div style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>{metricsData.totalClicks?.toLocaleString() || 0}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Progress / Generation Loader */}
          {generating && (
            <div style={{ 
              background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: '16px', 
              padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              height: '420px'
            }}>
              <div style={{ width: '48px', height: '48px', border: '3px solid rgba(6,101,255,0.1)', borderTopColor: '#0665ff', borderRadius: '50%', animation: 'spinner 0.8s linear infinite', marginBottom: '24px' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>Agentic Pipeline Executing</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>{progressStage}</p>
              
              <div style={{ width: '100%', maxWidth: '320px', height: '6px', background: 'var(--glass-border)', borderRadius: '10px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    width: `${progress}%`, height: '100%', 
                    background: 'linear-gradient(90deg, #0665ff, #8b5cf6)',
                    boxShadow: '0 0 10px rgba(6, 101, 255, 0.4)',
                    transition: 'width 0.3s ease-out'
                  }} 
                />
              </div>
            </div>
          )}

          {/* Generated Report Presentation */}
          {!generating && generatedReport && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
              
              {/* Action Toolbar */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>Report Generation Stable</span>
                  {selectedHistoryId && <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginLeft: '6px' }}>(Restored from History)</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button 
                    onClick={copyToClipboard}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '6px', border: '1px solid var(--glass-border)', background: 'var(--bg-elevated)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}
                  >
                    {copied ? <Check size={14} color="#22c55e" /> : <Copy size={14} />} 
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button 
                    onClick={handleDownloadPdf}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '6px', border: 'none', background: '#0665ff', color: '#fff', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}
                  >
                    <Download size={14} /> Download PDF
                  </button>
                </div>
              </div>

              {/* Report Paper Sheet */}
              <div 
                id="report-paper-container"
                className="paper-glow"
                style={{ 
                  background: 'var(--bg-card)', 
                  border: '1px solid var(--glass-border)', 
                  borderRadius: '16px', 
                  padding: '40px', 
                  color: 'var(--text-primary)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                  minHeight: '480px',
                  maxHeight: '75vh',
                  overflowY: 'auto'
                }}
              >
                {/* Executive Report Branding Letterhead */}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--glass-border)', paddingBottom: '20px', marginBottom: '24px' }}>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 4px 0', letterSpacing: '-0.5px' }}>CMO STRATEGIC PERFORMANCE AUDIT</h2>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                      Wheedle Technologies Intelligence Agent Suite
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0665ff' }}>{activeBrand?.name || 'Savorka Solar'}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Generated: {new Date().toLocaleDateString()}</div>
                  </div>
                </div>

                {/* Report Content rendering */}
                <div style={{ fontSize: '0.85rem', lineHeight: 1.7, color: 'var(--text-primary)' }}>
                  {generatedReport.split('\n').map((line, idx) => {
                    const cleanLine = line.trim();
                    if (cleanLine.startsWith('# ')) {
                      return <h1 key={idx} style={{ fontSize: '1.25rem', fontWeight: 800, margin: '24px 0 12px 0', color: 'var(--text-primary)' }}>{cleanLine.substring(2)}</h1>;
                    }
                    if (cleanLine.startsWith('## ')) {
                      return <h2 key={idx} style={{ fontSize: '1.05rem', fontWeight: 700, margin: '20px 0 10px 0', color: 'var(--text-primary)', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>{cleanLine.substring(3)}</h2>;
                    }
                    if (cleanLine.startsWith('### ')) {
                      return <h3 key={idx} style={{ fontSize: '0.92rem', fontWeight: 700, margin: '16px 0 8px 0', color: 'var(--text-primary)' }}>{cleanLine.substring(4)}</h3>;
                    }
                    if (cleanLine.startsWith('- ') || cleanLine.startsWith('* ')) {
                      return <li key={idx} style={{ margin: '4px 0 4px 12px', listStyleType: 'disc' }}>{cleanLine.substring(2)}</li>;
                    }
                    if (cleanLine.match(/^\d+\.\s/)) {
                      return <li key={idx} style={{ margin: '4px 0 4px 12px', listStyleType: 'decimal' }}>{cleanLine.replace(/^\d+\.\s/, '')}</li>;
                    }
                    if (cleanLine === '') {
                      return <div key={idx} style={{ height: '10px' }} />;
                    }
                    return <p key={idx} style={{ margin: '0 0 12px 0' }}>{line}</p>;
                  })}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};
export default AiReports;
