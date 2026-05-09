/**
 * AdCampaignDashboard
 * ─────────────────────────────────────────────────────────
 * A single self-contained component. Drop it anywhere in
 * your project and call it like:
 *
 *   import AdCampaignDashboard from './AdCampaignDashboard';
 *   <AdCampaignDashboard />
 *
 * Or pass your own data:
 *   <AdCampaignDashboard campaignData={myData} />
 *
 * No external dependencies — just React.
 * ─────────────────────────────────────────────────────────
 */

import React, { useState } from 'react';

/* ─── GLOBAL STYLES ─────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

  .acd-root *, .acd-root *::before, .acd-root *::after {
    box-sizing: border-box; margin: 0; padding: 0;
  }
  .acd-root {
    --bg:    #060b18; --bg2: #0b1120; --bg3: #0e1628;
    --bg4:   #111d34; --bg5: #162240;
    --a1:    #2563eb; --a2:  #3b82f6; --a3: #60a5fa; --a4: #93c5fd;
    --g1:    #10b981; --g2:  #34d399;
    --yl:    #f59e0b;
    --bdr:   #1a2744; --bdr2: #223160; --bdr3: #2d4080;
    --t1:    #f0f6ff; --t2:  #94a3b8; --t3: #4a6080;
    --radius: 12px;
    --font:  'DM Sans', 'Segoe UI', system-ui, sans-serif;
    --mono:  'DM Mono', monospace;
    background: var(--bg);
    color: var(--t1);
    font-family: var(--font);
    font-size: 13px;
    -webkit-font-smoothing: antialiased;
    display: flex;
    height: 100vh;
    min-height: 600px;
  }
  .acd-root ::-webkit-scrollbar { width: 4px; height: 4px; }
  .acd-root ::-webkit-scrollbar-track { background: var(--bg2); }
  .acd-root ::-webkit-scrollbar-thumb { background: var(--bdr2); border-radius: 4px; }

  /* card top accents */
  .acd-card-blue::before  { background: var(--a1) !important; }
  .acd-card-green::before { background: var(--g1) !important; }
  .acd-card-amber::before { background: var(--yl) !important; }

  /* hover states via CSS */
  .acd-cam-item:hover   { background: var(--bg4) !important; }
  .acd-plat-row:hover   { background: var(--bg4) !important; }
  .acd-act-btn:hover    { background: var(--bg4) !important; color: var(--t2) !important; }
  .acd-ai-btn:hover     { background: #12274d !important; }
  .acd-up-btn:hover     { background: var(--bg4) !important; }
  .acd-tb-select:hover  { border-color: var(--bdr3) !important; }
  .acd-btn-back:hover   { background: var(--bg3) !important; color: var(--t1) !important; }
  .acd-btn-pub:hover    { background: #1d51cc !important; }
  .acd-btn-draft:hover  { background: var(--bg3) !important; }
`;

/* ─── DEFAULT DATA ───────────────────────────────────────── */
const DEFAULT_DATA = {
  campaigns: [
    'Campaign 01', 'Campaign 02', 'Campaign 03',
    'Campaign 04', 'Campaign 05', 'Campaign 06',
  ],
  platforms: [
    { name: 'Google', letter: 'G', bg: '#0d3320', color: '#34d399' },
    { name: 'TikTok', letter: 'T', bg: '#1a0d30', color: '#a78bfa' },
    { name: 'Bing',   letter: 'b', bg: '#0d1e40', color: '#60a5fa' },
  ],
  topbarFields: [
    { label: '* Meta AD Account', placeholder: 'Select account' },
    { label: '* Page',            placeholder: 'Select page' },
    { label: 'Instagram Account', placeholder: 'Select' },
    { label: 'Pixel',             placeholder: 'Select pixel' },
  ],
  campaignTitle: 'savorka_OUTCOME_SALES_Advantage+_05/08/2026',
  adSetting: {
    event: 'Purchase', budget: '5.83 USD',
    schedule: 'May 08, 2026', finalUrl: 'https://www.savorka.in/',
  },
  audience: { location: 'India', advantagePlus: true },
  preview: {
    adNumber: 1, brandName: 'Savorka',
    caption: 'अब सौर ऊर्जा अपनाएं और खुद की बचत करें। भविष्य को सुरक्षित बनाएं!',
    headline: 'Sustainable Solar\nEnergy Solutions\nfor Homes & Businesses',
    subText: 'Renewable solar energy · Eco-friendly power · Cost-effective systems',
    cta: 'Shop Now', estimatedAudience: '394,400,000 – 464,000,000+',
  },
  adCopy: {
    headlines: [
      'सौर ऊर्जा से बिजली बिल घटाएं और भविष्य की और बढ़ें',
      'Sustainable Solar Solutions for Every Home',
      'Go Solar, Save More Every Month',
    ],
    primaryTexts: [
      'अब सौर ऊर्जा अपनाएं और खुद की बचत करें।',
      'Harness the power of the sun and reduce your electricity bills today.',
    ],
    callToAction: 'Shop Now',
  },
  creatives: { used: 2, max: 10, thumbnails: ['#122050', '#0d2a40'] },
};

/* ─── SHARED STYLE HELPERS ──────────────────────────────── */
const card = (extra = {}) => ({
  background: 'var(--bg2)', border: '1px solid var(--bdr)',
  borderRadius: 'var(--radius)', padding: 14,
  position: 'relative', overflow: 'hidden', ...extra,
});
const topAccent = { position:'absolute', top:0, left:0, right:0, height:2, borderRadius:'12px 12px 0 0', background:'var(--a1)' };
const cardHd = { fontSize:10, color:'var(--t3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:11, display:'flex', alignItems:'center', gap:6 };
const fp    = { display:'flex', flexDirection:'column', gap:3 };
const fpL   = { fontSize:10, color:'var(--t3)' };
const fpV   = { fontSize:13, fontWeight:600, color:'var(--t1)' };
const fpVB  = { fontSize:13, fontWeight:600, color:'var(--a3)' };
const divider = { border:'none', borderTop:'1px solid var(--bdr)', margin:'9px 0' };

/* ─── SVG ICONS ─────────────────────────────────────────── */
const Icon = {
  Grid:   () => <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{color:'var(--a3)',flexShrink:0}}><rect x="2" y="2" width="5" height="5" rx="1.5" fill="currentColor"/><rect x="9" y="2" width="5" height="5" rx="1.5" fill="currentColor"/><rect x="2" y="9" width="5" height="5" rx="1.5" fill="currentColor"/><rect x="9" y="9" width="5" height="5" rx="1.5" fill="currentColor"/></svg>,
  User:   () => <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{color:'var(--g2)',flexShrink:0}}><circle cx="8" cy="6" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M2 14c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  Text:   () => <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{color:'var(--yl)',flexShrink:0}}><rect x="2" y="3" width="12" height="2" rx="1" fill="currentColor"/><rect x="2" y="7" width="9" height="2" rx="1" fill="currentColor"/><rect x="2" y="11" width="11" height="2" rx="1" fill="currentColor"/></svg>,
  Image:  () => <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{color:'var(--a3)',flexShrink:0}}><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M2 10.5l3.5-3.5 2.5 2.5 3-3.5L15 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="5.5" cy="6" r="1.5" fill="currentColor"/></svg>,
  Arrow:  () => <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{color:'var(--a3)',flexShrink:0}}><path d="M2 8h12M8 2l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Like:   () => <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M14 7c0 4-6 7-6 7S2 11 2 7a4 4 0 018 0z" stroke="currentColor" strokeWidth="1.5"/></svg>,
  Comment:() => <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M13 10c0 1.1-.9 2-2 2H5l-3 3V4c0-1.1.9-2 2-2h7c1.1 0 2 .9 2 2v6z" stroke="currentColor" strokeWidth="1.5"/></svg>,
  Share:  () => <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M11 10l3-3-3-3M14 7H6c-1.7 0-3 1.3-3 3v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  Upload: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 11V5M5 8l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><rect x="2" y="13" width="12" height="1.5" rx=".75" fill="currentColor"/></svg>,
  AiCircle: () => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" stroke="#3b82f6" strokeWidth="1.5"/><path d="M6 9l2 2 4-4" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};

/* ══════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ══════════════════════════════════════════════════════════ */

/* ── Sidebar ─────────────────────────────────────────────── */
function Sidebar({ campaigns, platforms, activeCampaign, onSelect }) {
  return (
    <aside style={{width:196,minWidth:196,background:'var(--bg2)',borderRight:'1px solid var(--bdr)',display:'flex',flexDirection:'column',height:'100%'}}>
      {/* Brand */}
      <div style={{padding:'16px 14px 12px',borderBottom:'1px solid var(--bdr)'}}>
        <div style={{display:'flex',alignItems:'center',gap:9,marginBottom:10}}>
          <div style={{width:30,height:30,background:'var(--a1)',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:13,color:'#fff'}}>M</div>
          <span style={{fontSize:13,fontWeight:700,color:'var(--t1)'}}>Meta</span>
          <span style={{fontSize:10,background:'#1e3565',color:'var(--a4)',padding:'2px 7px',borderRadius:20,marginLeft:'auto',fontWeight:600}}>1 / {campaigns.length}</span>
        </div>
        <div style={{display:'inline-flex',alignItems:'center',gap:5,fontSize:10,color:'var(--a3)',background:'#0e2040',border:'1px solid #1a3560',padding:'4px 9px',borderRadius:20}}>
          <span style={{width:5,height:5,borderRadius:'50%',background:'var(--g2)',display:'inline-block'}}/>
          Daily Budget: 5.83 USD
        </div>
      </div>

      {/* Campaigns */}
      <div style={{flex:1,overflowY:'auto',padding:'10px 8px'}}>
        <div style={{fontSize:9,color:'var(--t3)',textTransform:'uppercase',letterSpacing:1,padding:'0 6px',marginBottom:6,fontWeight:600}}>Campaigns</div>
        {campaigns.map((name, i) => {
          const active = activeCampaign === i;
          return (
            <div key={name} className="acd-cam-item"
              onClick={() => onSelect(i)}
              style={{display:'flex',alignItems:'center',gap:8,padding:'8px 8px',borderRadius:9,cursor:'pointer',marginBottom:2,transition:'background 0.12s',background:active?'#1a3565':'transparent',border:active?'1px solid #2545a0':'1px solid transparent'}}>
              {active
                ? <span style={{width:3,height:18,background:'var(--a2)',borderRadius:2,flexShrink:0}}/>
                : <span style={{width:7,height:7,borderRadius:'50%',border:'1.5px solid var(--bdr2)',flexShrink:0}}/>
              }
              <span style={{fontSize:12,color:active?'var(--t1)':'var(--t2)',fontWeight:active?600:400}}>{name}</span>
            </div>
          );
        })}
      </div>

      {/* Platforms */}
      <div style={{padding:'8px 8px 14px',borderTop:'1px solid var(--bdr)'}}>
        <div style={{fontSize:9,color:'var(--t3)',textTransform:'uppercase',letterSpacing:1,padding:'0 6px',marginBottom:6,fontWeight:600}}>Other Platforms</div>
        {platforms.map((p) => (
          <div key={p.name} className="acd-plat-row"
            style={{display:'flex',alignItems:'center',gap:9,padding:'8px 8px',borderRadius:9,cursor:'pointer',marginBottom:2,transition:'background 0.12s'}}>
            <div style={{width:22,height:22,borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,background:p.bg,color:p.color}}>{p.letter}</div>
            <span style={{fontSize:12,color:'var(--t2)'}}>{p.name}</span>
            <span style={{marginLeft:'auto',color:'var(--t3)',fontSize:11}}>›</span>
          </div>
        ))}
      </div>
    </aside>
  );
}

/* ── TopBar ──────────────────────────────────────────────── */
function TopBar({ fields }) {
  return (
    <div style={{display:'flex',gap:10,padding:'12px 16px',borderBottom:'1px solid var(--bdr)',background:'var(--bg2)',alignItems:'flex-end',flexWrap:'wrap',flexShrink:0}}>
      {fields.map((f) => (
        <div key={f.label} style={{display:'flex',flexDirection:'column',gap:4,flex:1,minWidth:110}}>
          <span style={{fontSize:10,color:'var(--a3)',fontWeight:700,letterSpacing:'0.3px'}}>{f.label}</span>
          <div className="acd-tb-select"
            style={{background:'var(--bg3)',border:'1px solid var(--bdr2)',borderRadius:8,padding:'7px 10px',color:'var(--t3)',fontSize:12,display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer',transition:'border-color 0.15s'}}>
            <span>{f.placeholder}</span>
            <span style={{color:'var(--a3)'}}>▾</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── AdSettingCard ───────────────────────────────────────── */
function AdSettingCard({ event, budget, schedule, finalUrl }) {
  return (
    <div style={card()} className="acd-card-blue">
      <div style={topAccent}/>
      <div style={cardHd}><Icon.Grid/> Ad Setting</div>
      <div style={{display:'flex',justifyContent:'space-between',gap:8,marginBottom:9}}>
        <div style={fp}><span style={fpL}>Event</span><span style={fpV}>{event}</span></div>
        <div style={{...fp,textAlign:'right'}}><span style={fpL}>Budget</span><span style={fpVB}>{budget}</span></div>
      </div>
      <hr style={divider}/>
      <div style={{...fp,marginBottom:9}}><span style={fpL}>Schedule</span><span style={fpV}>{schedule}</span></div>
      <div style={fp}><span style={fpL}>Final URL</span><span style={{...fpVB,fontSize:11}}>{finalUrl}</span></div>
    </div>
  );
}

/* ── TargetAudienceCard ──────────────────────────────────── */
function TargetAudienceCard({ location, advantagePlus }) {
  return (
    <div style={card()} className="acd-card-green">
      <div style={{...topAccent,background:'var(--g1)'}}/>
      <div style={cardHd}><Icon.User/> Target Audience</div>
      <div style={{...fp,marginBottom:11}}><span style={fpL}>Locations</span><span style={fpV}>{location}</span></div>
      <div style={{display:'flex',alignItems:'center',gap:6}}>
        {advantagePlus && (
          <div style={{display:'inline-flex',alignItems:'center',gap:5,fontSize:10,fontWeight:600,color:'#34d399',background:'#06291a',border:'1px solid #0f4a2a',padding:'4px 10px',borderRadius:20}}>
            <span style={{width:6,height:6,borderRadius:'50%',background:'var(--g2)',display:'inline-block'}}/>
            Advantage+ on
          </div>
        )}
        <span style={{width:16,height:16,borderRadius:'50%',border:'1px solid var(--bdr2)',display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:9,color:'var(--t3)',cursor:'pointer'}}>i</span>
      </div>
    </div>
  );
}

/* ── AdPreviewCard ───────────────────────────────────────── */
function AdPreviewCard({ adNumber, brandName, caption, headline, subText, cta, estimatedAudience }) {
  return (
    <div style={{background:'var(--bg2)',border:'1px solid var(--bdr)',borderRadius:'var(--radius)',overflow:'hidden'}}>
      {/* header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'9px 12px',borderBottom:'1px solid var(--bdr)',background:'var(--bg3)'}}>
        <div style={{fontSize:10,fontWeight:700,color:'var(--t3)',textTransform:'uppercase',letterSpacing:'0.8px',display:'flex',alignItems:'center',gap:6}}>
          <span style={{width:6,height:6,borderRadius:'50%',background:'var(--a2)',display:'inline-block'}}/>
          Ad Preview
        </div>
        <span style={{background:'var(--a1)',color:'#fff',fontSize:10,fontWeight:700,padding:'3px 10px',borderRadius:20}}>Ad {adNumber}</span>
      </div>

      {/* body */}
      <div style={{padding:'11px 12px'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:9}}>
          <div style={{width:33,height:33,background:'#1a3565',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,color:'var(--a3)',border:'1px solid var(--bdr2)',flexShrink:0}}>{brandName[0]}</div>
          <div>
            <div style={{fontSize:12,fontWeight:700,color:'var(--t1)'}}>{brandName}</div>
            <div style={{fontSize:10,color:'var(--t3)'}}>Sponsored</div>
          </div>
          <div style={{marginLeft:'auto',color:'var(--t3)',letterSpacing:2,fontSize:14,cursor:'pointer'}}>···</div>
          <span style={{color:'var(--t3)',cursor:'pointer',fontSize:13,marginLeft:4}}>✕</span>
        </div>

        <div style={{fontSize:11,color:'var(--t2)',lineHeight:1.5,marginBottom:9}}>{caption}</div>

        {/* image box */}
        <div style={{background:'var(--bg4)',borderRadius:9,padding:'16px 12px',marginBottom:9,border:'1px solid var(--bdr)',textAlign:'center'}}>
          <div style={{fontSize:15,fontWeight:800,color:'#fff',lineHeight:1.3,marginBottom:10,whiteSpace:'pre-line'}}>{headline}</div>
          <div style={{background:'#fff',borderRadius:6,padding:'3px 8px',fontSize:11,fontWeight:900,color:'#1a3a8f',letterSpacing:1,display:'inline-block',marginBottom:8}}>{brandName.toUpperCase()}</div>
          <div style={{fontSize:9,color:'var(--a4)',lineHeight:1.6,marginBottom:10}}>{subText}</div>
          <button style={{background:'var(--g1)',color:'#fff',border:'none',borderRadius:6,padding:'6px 16px',fontSize:11,fontWeight:700,cursor:'pointer'}}>Learn more</button>
        </div>

        {/* CTA row */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 0',borderTop:'1px solid var(--bdr)'}}>
          <div>
            <div style={{fontSize:12,fontWeight:700,color:'var(--t1)'}}>{brandName}</div>
            <div style={{fontSize:10,color:'var(--t3)',maxWidth:130,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{caption}</div>
          </div>
          <button style={{background:'var(--bg4)',border:'1px solid var(--bdr2)',color:'var(--t1)',fontSize:11,fontWeight:700,padding:'6px 13px',borderRadius:7,cursor:'pointer'}}>{cta}</button>
        </div>

        {/* actions */}
        <div style={{display:'flex',borderTop:'1px solid var(--bdr)',paddingTop:8,marginTop:2}}>
          {[{icon:<Icon.Like/>,label:'Like'},{icon:<Icon.Comment/>,label:'Comment'},{icon:<Icon.Share/>,label:'Share'}].map(({icon,label})=>(
            <button key={label} className="acd-act-btn"
              style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:5,fontSize:11,color:'var(--t3)',cursor:'pointer',padding:3,borderRadius:7,background:'none',border:'none',transition:'background 0.12s',fontFamily:'inherit'}}>
              {icon} {label}
            </button>
          ))}
        </div>
      </div>

      {/* audience */}
      <div style={{padding:'9px 12px',borderTop:'1px solid var(--bdr)',background:'var(--bg3)'}}>
        <div style={{fontSize:12,fontWeight:700,color:'var(--a3)',marginBottom:5}}>Estimated audience: {estimatedAudience}</div>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:9,color:'var(--t3)',marginBottom:4,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.5px'}}><span>Narrow</span><span>Broad</span></div>
        <div style={{background:'var(--bg4)',borderRadius:6,height:5,border:'1px solid var(--bdr)'}}>
          <div style={{height:'100%',borderRadius:6,background:'var(--a2)',width:'32%'}}/>
        </div>
      </div>
    </div>
  );
}

/* ── AdCopyCard ──────────────────────────────────────────── */
function AdCopyCard({ headlines, primaryTexts, callToAction }) {
  const [showH, setShowH] = useState(false);
  const [showP, setShowP] = useState(false);
  return (
    <div style={card()} className="acd-card-amber">
      <div style={{...topAccent,background:'var(--yl)'}}/>
      <div style={cardHd}><Icon.Text/> Ad Copy</div>

      <div style={{marginBottom:10}}>
        <div style={{fontSize:10,color:'var(--t3)',marginBottom:3,display:'flex',justifyContent:'space-between',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.5px'}}>
          Headlines <span style={{color:'var(--a3)'}}>1/{headlines.length}</span>
        </div>
        <div style={{fontSize:12,color:'var(--t2)',lineHeight:1.5}}>{showH ? headlines.join(' · ') : headlines[0]}</div>
        <button onClick={()=>setShowH(p=>!p)} style={{fontSize:10,color:'var(--a3)',cursor:'pointer',marginTop:2,background:'none',border:'none',padding:0,fontFamily:'inherit'}}>
          {showH ? 'Show Less ∧' : 'Show More ∨'}
        </button>
      </div>

      <hr style={divider}/>

      <div style={{marginBottom:10}}>
        <div style={{fontSize:10,color:'var(--t3)',marginBottom:3,display:'flex',justifyContent:'space-between',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.5px'}}>
          Primary text <span style={{color:'var(--a3)'}}>1/{primaryTexts.length}</span>
        </div>
        <div style={{fontSize:12,color:'var(--t2)',lineHeight:1.5}}>{showP ? primaryTexts.join(' ') : primaryTexts[0]}</div>
        <button onClick={()=>setShowP(p=>!p)} style={{fontSize:10,color:'var(--a3)',cursor:'pointer',marginTop:2,background:'none',border:'none',padding:0,fontFamily:'inherit'}}>
          {showP ? 'Show Less ∧' : 'Show More ∨'}
        </button>
      </div>

      <hr style={divider}/>

      <div>
        <div style={{fontSize:10,color:'var(--t3)',marginBottom:6,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.5px'}}>Call to Action</div>
        <span style={{display:'inline-block',background:'var(--a1)',color:'#fff',fontSize:11,fontWeight:700,padding:'5px 14px',borderRadius:7,letterSpacing:'0.3px'}}>{callToAction}</span>
      </div>
    </div>
  );
}

/* ── AdCreativesCard ─────────────────────────────────────── */
function AdCreativesCard({ used, max, thumbnails }) {
  return (
    <div style={card()}>
      <div style={topAccent}/>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
        <div style={cardHd}><Icon.Image/> * Ad Creatives</div>
        <span style={{fontSize:10,color:'var(--a3)',fontWeight:700,background:'#0e2040',padding:'2px 8px',borderRadius:20}}>{used} / {max}</span>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
        <button className="acd-ai-btn" style={{background:'#0d1e40',border:'1px solid var(--bdr2)',borderRadius:9,height:64,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:4,cursor:'pointer',color:'var(--a3)',fontSize:10,fontWeight:600,transition:'background 0.12s',fontFamily:'inherit'}}>
          <Icon.AiCircle/> AI Generation
        </button>
        <button className="acd-up-btn" style={{background:'var(--bg3)',border:'1.5px dashed var(--bdr2)',borderRadius:9,height:64,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:4,cursor:'pointer',color:'var(--t3)',fontSize:10,transition:'background 0.12s',fontFamily:'inherit'}}>
          <Icon.Upload/> Upload
        </button>
      </div>
      <div style={{display:'flex',gap:5}}>
        {thumbnails.map((bg, i) => (
          <div key={i} style={{width:34,height:34,borderRadius:6,border:'1px solid var(--bdr)',background:bg}}/>
        ))}
      </div>
    </div>
  );
}

/* ── BottomBar ───────────────────────────────────────────── */
function BottomBar({ onPrevious, onPublish, onSaveDraft }) {
  return (
    <div style={{background:'var(--bg2)',borderTop:'1px solid var(--bdr)',padding:'10px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
      <button className="acd-btn-back" onClick={onPrevious}
        style={{background:'none',border:'1px solid var(--bdr2)',color:'var(--t2)',padding:'8px 18px',borderRadius:8,fontSize:12,fontWeight:600,cursor:'pointer',transition:'all 0.12s',fontFamily:'inherit'}}>
        ← Previous
      </button>
      <div style={{fontSize:11,color:'var(--t3)'}}>
        No ad account?{' '}
        <span style={{color:'var(--a3)',textDecoration:'underline',cursor:'pointer'}}>Publish with adsgo account →</span>
      </div>
      <div style={{display:'flex',gap:8}}>
        <button className="acd-btn-pub" onClick={onPublish}
          style={{background:'var(--a1)',color:'#fff',border:'none',padding:'8px 26px',borderRadius:8,fontSize:12,fontWeight:700,cursor:'pointer',letterSpacing:'0.3px',transition:'background 0.12s',fontFamily:'inherit'}}>
          Publish
        </button>
        <button className="acd-btn-draft" onClick={onSaveDraft}
          style={{background:'none',border:'1px solid var(--bdr2)',color:'var(--t2)',padding:'8px 16px',borderRadius:8,fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit',transition:'background 0.12s'}}>
          Save draft
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN EXPORT — AdCampaignDashboard
   ══════════════════════════════════════════════════════════ */

/**
 * @param {object}   props
 * @param {object}   [props.campaignData]   - Override default data (see DEFAULT_DATA shape above)
 * @param {function} [props.onPublish]      - Called when Publish is clicked
 * @param {function} [props.onSaveDraft]    - Called when Save draft is clicked
 * @param {function} [props.onPrevious]     - Called when Previous is clicked
 */
export default function AdCampaignDashboard({
  campaignData = DEFAULT_DATA,
  onPublish    = () => console.log('Publish clicked'),
  onSaveDraft  = () => console.log('Save draft clicked'),
  onPrevious   = () => console.log('Previous clicked'),
}) {
  const [activeCampaign, setActiveCampaign] = useState(0);
  const d = { ...DEFAULT_DATA, ...campaignData };

  return (
    <>
      {/* Inject scoped global styles once */}
      <style>{GLOBAL_CSS}</style>

      <div className="acd-root">
        <Sidebar
          campaigns={d.campaigns}
          platforms={d.platforms}
          activeCampaign={activeCampaign}
          onSelect={setActiveCampaign}
        />

        <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',minWidth:0}}>
          <TopBar fields={d.topbarFields} />

          <div style={{flex:1,overflowY:'auto',padding:'14px 16px'}}>
            {/* Campaign title bar */}
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14,padding:'8px 12px',background:'var(--bg3)',border:'1px solid var(--bdr)',borderRadius:9,borderLeft:'3px solid var(--a1)'}}>
              <Icon.Arrow/>
              <span style={{fontSize:12,fontWeight:600,color:'var(--t2)',letterSpacing:'0.2px',fontFamily:'var(--mono)'}}>{d.campaignTitle}</span>
            </div>

            {/* 3-column grid */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1.15fr 1fr',gap:13}}>
              {/* Col 1 */}
              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                <AdSettingCard      {...d.adSetting} />
                <TargetAudienceCard {...d.audience} />
              </div>
              {/* Col 2 */}
              <div>
                <AdPreviewCard {...d.preview} />
              </div>
              {/* Col 3 */}
              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                <AdCopyCard       {...d.adCopy} />
                <AdCreativesCard  {...d.creatives} />
              </div>
            </div>
          </div>

          <BottomBar
            onPrevious={onPrevious}
            onPublish={onPublish}
            onSaveDraft={onSaveDraft}
          />
        </div>
      </div>
    </>
  );
}