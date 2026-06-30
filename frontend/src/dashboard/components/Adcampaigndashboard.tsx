
import { useState, useCallback, useRef, useEffect } from "react";
import { useSelector } from "react-redux";

type PlatformId = "meta" | "google" | "x" | "linkedin";
type LoadingState = "publish" | "draft" | null;
type ToastType = "success" | "error" | "info";
type BillingCycle = "monthly" | "yearly";
type PlanId = "free" | "silver" | "gold";

interface BrandDetails {
  brand?: { name?: string };
  name?: string;
  logoUrl?: string;
  assets?: {
    favicon?: string;
    images?: string[];
    banners?: string[];
    thumbnails?: string[];
    websiteImages?: string[];
    [key: string]: any;
  };
}

interface PromoData {
  businessType?: string;
  adGoal?: string;
  businessGoal?: string;
  targetLocations?: string;
  targetLocation?: string;
  includeLocations?: string[];
  excludeLocations?: string[];
  platform?: string;
  platforms?: string[];
  promotionType?: string;
  dailyBudget?: string | number;
  budget?: string | number;
  currency?: string;
  finalUrl?: string;
  primaryTexts?: string[];
  headlines?: string[];
  callToAction?: string;
  objective?: string;
  event?: string;
  schedule?: string;
  advantagePlus?: boolean;
  estimatedAudience?: string;
}

/** Per-platform creative state */
interface PlatformCreative {
  headline: string;
  primaryText: string;
  cta: string;
  image: string | null;

  // Meta specific
  metaObjective?: string;
  metaBuyingType?: string;
  metaSpecialAdCategory?: string;
  metaPlacements?: string;

  // Google specific
  googleObjective?: string;
  googleNetworks?: string[];
  googleBiddingStrategy?: string;
  googleKeywords?: string[];

  // LinkedIn specific
  liObjective?: string;
  liAdFormat?: string;
  liJobTitles?: string[];
  liSeniority?: string[];
  liCompanySize?: string[];
}

interface Campaign {
  id: string;
  name: string;
  platformId: PlatformId;
}

interface Platform {
  id: PlatformId;
  name: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
}

interface ToastState {
  message: string;
  type: ToastType;
}

interface AdCopy {
  headlines: string[];
  primaryTexts: string[];
  callToAction: string;
}

interface Plan {
  id: PlanId;
  name: string;
  price: string;
  features: string[];
  color: string;
  popular?: boolean;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/* ─── GLOBAL STYLES ─────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');

  .dash-root {
    --blue:       #2563EB;
    --blue-lt:    #EFF6FF;
    --blue-mid:   #DBEAFE;
    --blue-bdr:   #BFDBFE;
    --blue-dark:  #1D4ED8;
    --white:      #FFFFFF;
    --surface:    #F8FAFF;
    --surface2:   #F1F5FE;
    --card:       #FFFFFF;
    --bdr:        #E2E8F4;
    --bdr2:       #C7D7F0;
    --t1:         #0F1733;
    --t2:         #4A5878;
    --t3:         #8A97B0;
    --green:      #059669;
    --green-lt:   #ECFDF5;
    --green-bdr:  #A7F3D0;
    --purple:     #7C3AED;
    --purple-lt:  #F5F3FF;
    --purple-bdr: #DDD6FE;
    --amber:      #D97706;
    --amber-lt:   #FFFBEB;
    --red:        #DC2626;
    --cyan:       #0891B2;
    font-family: 'DM Sans', system-ui, sans-serif;
    background: var(--surface);
    color: var(--t1);
    font-size: 13px;
    -webkit-font-smoothing: antialiased;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100vh;
    overflow: hidden;
  }

  .dash-inner { display: flex; flex: 1 1 0; min-height: 0; overflow: hidden; }

  .dash-sidebar {
    width: 200px; min-width: 200px; flex-shrink: 0;
    background: #fff; border-right: 1px solid var(--bdr);
    display: flex; flex-direction: column; overflow: hidden; height: 100%;
  }

  .dash-main {
    flex: 1 1 0; min-width: 0;
    display: flex; flex-direction: column; overflow: hidden; height: 100%;
  }

  .dash-scroll {
    flex: 1 1 0; min-height: 0; overflow-y: auto;
    padding: 14px 16px; background: var(--surface);
  }

  .dash-root * { box-sizing: border-box; }
  .dash-root ::-webkit-scrollbar { width: 4px; height: 4px; }
  .dash-root ::-webkit-scrollbar-track { background: transparent; }
  .dash-root ::-webkit-scrollbar-thumb { background: var(--blue-bdr); border-radius: 4px; }

  .sid-cam { cursor: pointer; transition: all .15s; }
  .sid-cam:hover { background: var(--blue-lt) !important; }
  .btn-back:hover { background: var(--surface2) !important; }
  .btn-pub:hover:not(:disabled) { background: var(--blue-dark) !important; box-shadow: 0 4px 14px #2563eb33; }
  .btn-draft:hover:not(:disabled) { background: var(--surface2) !important; }
  .gen-btn:hover:not(:disabled) { background: #6D28D9 !important; }
  .gen-btn:disabled { opacity: .45; cursor: not-allowed; }
  .tag-pill { cursor: pointer; transition: all .12s; }
  .tag-pill:hover { background: var(--blue-lt) !important; border-color: var(--blue-bdr) !important; }
  .tag-pill.on { background: var(--blue-lt) !important; border-color: var(--blue) !important; color: var(--blue) !important; }
  .img-th { cursor: pointer; transition: all .15s; }
  .img-th:hover { border-color: var(--blue) !important; transform: scale(1.04); }
  .img-th.sel { border-color: var(--blue) !important; box-shadow: 0 0 0 3px #2563eb18; }
  .hd-in:focus, .pt-ta:focus, .editable-input:focus { outline: none; border-color: var(--blue) !important; box-shadow: 0 0 0 3px #2563eb14; }
  .add-btn:hover { background: var(--blue-lt) !important; border-color: var(--blue-bdr) !important; }
  .tb-sel:hover { border-color: var(--blue-bdr) !important; }
  .plat-tab:hover { background: var(--blue-lt) !important; }
  .pub-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(37,99,235,.18); }
  .plan-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(37,99,235,.10); }
  .brand-asset-img { cursor: pointer; transition: all .15s; border-radius: 7px; overflow: hidden; border: 2px solid var(--bdr); }
  .brand-asset-img:hover { border-color: var(--blue) !important; transform: scale(1.04); }
  .brand-asset-img.sel { border-color: var(--blue) !important; box-shadow: 0 0 0 3px #2563eb18; }
  .section-tab { cursor: pointer; padding: 5px 12px; border-radius: 20px; font-size: 10px; font-weight: 700; border: 1px solid var(--bdr); background: var(--surface2); color: var(--t3); transition: all .15s; font-family: inherit; }
  .section-tab:hover { background: var(--blue-lt) !important; border-color: var(--blue-bdr) !important; color: var(--blue) !important; }
  .section-tab.active { background: var(--blue-lt) !important; border-color: var(--blue) !important; color: var(--blue) !important; }
  .editable-input { background: var(--surface); border: 1px solid var(--bdr); border-radius: 7px; padding: 6px 10px; color: var(--t1); font-size: 12px; font-family: inherit; transition: all .15s; width: 100%; }
  .plat-tab-disabled { opacity: 0.4; cursor: not-allowed !important; pointer-events: none; }

  .acd-toast { position: fixed; bottom: 24px; right: 24px; z-index: 99999; background: #059668; color: #FFFFFF; padding: 10px 18px; border: 1.5px solid #00c788cc; border-radius: 12px; font-size: 12px; font-weight: 600; box-shadow: 0 8px 32px rgba(37,99,235,.35); animation: acd-fi .2s ease; display: flex; align-items: center; gap: 8px; }
  .acd-toast.success { border-color: var(--green-bdr); }
  .acd-toast.error { background: var(--red); border-color: #FCA5A5; }
  .acd-toast.info { background: var(--blue); border-color: var(--blue-bdr); }
  @keyframes acd-fi { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:none } }

  @keyframes spin { to { transform: rotate(360deg) } }
  .spinner { width: 13px; height: 13px; border: 2px solid #2563eb44; border-top-color: var(--blue); border-radius: 50%; animation: spin .7s linear infinite; display: inline-block; }
  .spinner-white { width: 13px; height: 13px; border: 2px solid rgba(255,255,255,.3); border-top-color: var(--text-primary); border-radius: 50%; animation: spin .7s linear infinite; display: inline-block; }

  @keyframes pulse-dot { 0%,100% { opacity:1 } 50% { opacity:.4 } }
  .fb-post { background: #fff; border: 1px solid #E4E6EB; border-radius: 10px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,.05); }
  .google-ad { background: #fff; border: 1px solid #E4E6EB; border-radius: 10px; overflow: hidden; padding: 16px; box-shadow: 0 1px 4px rgba(0,0,0,.05); }
  .x-post { background: #fff; border: 1px solid #E4E6EB; border-radius: 10px; overflow: hidden; padding: 14px; box-shadow: 0 1px 4px rgba(0,0,0,.05); }
  .li-post { background: #fff; border: 1px solid #E4E6EB; border-radius: 10px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,.05); }

  @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
  .shimmer { background: linear-gradient(90deg,#F1F5FE 25%,#E8EFFA 50%,#F1F5FE 75%); background-size: 800px 100%; animation: shimmer 1.4s infinite; }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
  .nav-active { background: var(--blue-lt) !important; border-color: var(--blue-bdr) !important; }

  .gen-img-skeleton { aspect-ratio: 1; border-radius: 7px; border: 2px solid var(--bdr); overflow: hidden; position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; background: var(--surface2); }
  .gen-img-skeleton .skel-bar { height: 6px; border-radius: 4px; background: linear-gradient(90deg,#E2E8F4 25%,#BFDBFE 50%,#E2E8F4 75%); background-size: 800px 100%; animation: shimmer 1.4s infinite; }
  @keyframes loadbar { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }

  .loc-dropdown-item:hover {
    background: var(--blue-lt) !important;
    color: var(--blue) !important;
  }
  .loc-pill {
    transition: all 0.15s ease;
  }
  .loc-pill:hover {
    transform: scale(1.03);
  }
  .preset-btn:hover {
    border-color: var(--blue-bdr) !important;
    background: var(--blue-lt) !important;
    color: var(--blue) !important;
    transform: translateY(-1px);
    box-shadow: 0 2px 5px rgba(37,99,235,0.08);
  }
`;

/* ─── API ────────────────────────────────────────────────── */
const generateSocialMediaImages = async (campaignData: any) => {
  const response = await fetch(`${API_BASE}/platformposts/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(campaignData),
  });
  if (!response.ok) throw new Error("Failed to generate images");
  const data = await response.json();
  return data.images.map((item: any) => ({ ...item, preview: item.image }));
};

/* ─── PLATFORM PREVIEWS ──────────────────────────────────── */
interface PreviewProps {
  brandName: string; logoUrl?: string; caption: string; cta: string; imageUrl?: string | null;
}

function MetaPreview({ brandName, logoUrl, caption, cta, imageUrl }: PreviewProps) {
  return (
    <div className="fb-post">
      <div style={{ padding: "12px 14px 8px", display: "flex", alignItems: "center", gap: 9 }}>
        <div style={{ width: 38, height: 38, borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: "#EFF6FF", border: "2px solid #BFDBFE", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {logoUrl ? <img src={logoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 15, fontWeight: 700, color: "#2563EB" }}>{(brandName[0] ?? "B").toUpperCase()}</span>}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#0F1733" }}>{brandName}</div>
          <div style={{ fontSize: 10, color: "#8A97B0" }}>Sponsored · 🌐</div>
        </div>
        <div style={{ color: "#8A97B0", fontSize: 18 }}>···</div>
      </div>
      <div style={{ padding: "2px 14px 8px", fontSize: 13, color: "#0F1733", lineHeight: 1.6 }}>{caption}</div>
      <div style={{ width: "100%", aspectRatio: "1.91/1", background: "#EFF6FF", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {imageUrl ? <img src={imageUrl} alt="Ad" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> :
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none"><rect x="4" y="4" width="32" height="32" rx="4" stroke="#2563EB" strokeWidth="1.5" strokeDasharray="4 2" /><path d="M12 28l8-10 5 6 3-4 7 8" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><circle cx="15" cy="16" r="3" stroke="#2563EB" strokeWidth="1.5" /></svg>
            <span style={{ fontSize: 11, color: "#93C5FD" }}>Upload or generate image</span>
          </div>}
      </div>
      <div style={{ padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#F8FAFF", borderTop: "1px solid #E2E8F4" }}>
        <div style={{ fontSize: 11, color: "#8A97B0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>{caption}</div>
        <button style={{ background: "#2563EB", color: 'var(--text-primary)', border: "none", borderRadius: 6, padding: "6px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{cta}</button>
      </div>
      <div style={{ display: "flex", borderTop: "1px solid #E2E8F4" }}>
        {["👍 Like", "💬 Comment", "↗ Share"].map(l => (
          <button key={l} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12, color: "#8A97B0", fontWeight: 500, cursor: "pointer", padding: "10px 4px", background: "none", border: "none", fontFamily: "inherit" }}>{l}</button>
        ))}
      </div>
    </div>
  );
}

function GooglePreview({ brandName, caption, imageUrl }: PreviewProps) {
  return (
    <div className="google-ad">
      <div style={{ fontSize: 10, color: "#8A97B0", marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
        <span style={{ background: "#34a853", color: 'var(--text-primary)', fontSize: 9, padding: "1px 5px", borderRadius: 3, fontWeight: 700 }}>Ad</span>
        <span>{brandName}</span>
      </div>
      <div style={{ fontSize: 16, color: "#1558D6", fontWeight: 500, marginBottom: 4, lineHeight: 1.4 }}>{caption?.slice(0, 60) || "Powerful Solutions for Every Business"}</div>
      <div style={{ fontSize: 12, color: "#4A5878", lineHeight: 1.6, marginBottom: 12 }}>{caption || "Discover our latest campaign — built for results."}</div>
      {imageUrl && <img src={imageUrl} alt="Ad" style={{ width: "100%", aspectRatio: "1.91/1", objectFit: "cover", borderRadius: 8, marginBottom: 10 }} />}
      <div style={{ display: "flex", gap: 6 }}>
        {["Products", "About Us", "Contact"].map(l => (
          <span key={l} style={{ fontSize: 11, color: "#1558D6", border: "1px solid #BFDBFE", padding: "4px 10px", borderRadius: 20, cursor: "pointer" }}>{l}</span>
        ))}
      </div>
      <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {["Up to 50% Off", "Free Delivery"].map(b => (
          <div key={b} style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 8, padding: "8px 10px" }}>
            <div style={{ fontSize: 11, color: "#2563EB", fontWeight: 600 }}>{b}</div>
            <div style={{ fontSize: 10, color: "#8A97B0", marginTop: 2 }}>Limited time offer</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function XPreview({ brandName, logoUrl, caption, cta, imageUrl }: PreviewProps) {
  return (
    <div className="x-post">
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ width: 42, height: 42, borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {logoUrl ? <img src={logoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 16, fontWeight: 700, color: "#0F1733" }}>{(brandName[0] ?? "B").toUpperCase()}</span>}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#0F1733" }}>{brandName}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#1d9bf0"><path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91-1.01-1.01-2.52-1.27-3.91-.81-.67-1.31-1.91-2.19-3.34-2.19-1.43 0-2.67.88-3.34 2.19-1.39-.46-2.9-.2-3.91.81-1.01 1.01-1.27 2.52-.81 3.91C2.88 9.33 2 10.57 2 12c0 1.43.88 2.67 2.19 3.34-.46 1.39-.2 2.9.81 3.91 1.01 1.01 2.52 1.27 3.91.81.67 1.31 1.91 2.19 3.34 2.19 1.43 0 2.67-.88 3.34-2.19 1.39.46 2.9.2 3.91-.81 1.01-1.01 1.27-2.52.81-3.91C21.32 14.67 22.25 13.43 22.25 12z" /></svg>
            <span style={{ fontSize: 11, color: "#8A97B0" }}>· Promoted</span>
          </div>
          <div style={{ fontSize: 14, color: "#0F1733", lineHeight: 1.6, marginBottom: 10 }}>{caption}</div>
          {imageUrl ? <img src={imageUrl} alt="Ad" style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", borderRadius: 12, marginBottom: 10 }} /> :
            <div style={{ width: "100%", aspectRatio: "16/9", background: "#F1F5FE", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10, border: "1px solid #E2E8F4" }}>
              <span style={{ color: "#BFDBFE", fontSize: 24 }}>🖼</span>
            </div>}
          <div style={{ background: "#F8FAFF", border: "1px solid #E2E8F4", borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, color: "#8A97B0" }}>brandname.com</span>
            <button style={{ background: "#0F1733", color: 'var(--text-primary)', border: "none", borderRadius: 20, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{cta}</button>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
            {["💬 24", "🔁 89", "❤️ 412", "📤"].map(a => (
              <button key={a} style={{ background: "none", border: "none", color: "#8A97B0", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>{a}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LinkedInPreview({ brandName, logoUrl, caption, cta, imageUrl }: PreviewProps) {
  return (
    <div className="li-post">
      <div style={{ padding: "12px 14px 8px", display: "flex", alignItems: "center", gap: 9 }}>
        <div style={{ width: 48, height: 48, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: "#EFF6FF", border: "1px solid #BFDBFE", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {logoUrl ? <img src={logoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 18, fontWeight: 700, color: "#0a66c2" }}>{(brandName[0] ?? "B").toUpperCase()}</span>}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#0F1733" }}>{brandName}</div>
          <div style={{ fontSize: 11, color: "#8A97B0" }}>Sponsored · <span style={{ color: "#0a66c2" }}>Follow</span></div>
        </div>
      </div>
      <div style={{ padding: "4px 14px 10px", fontSize: 13, color: "#0F1733", lineHeight: 1.65 }}>{caption}</div>
      {imageUrl ? <img src={imageUrl} alt="Ad" style={{ width: "100%", aspectRatio: "1.91/1", objectFit: "cover", display: "block" }} /> :
        <div style={{ width: "100%", aspectRatio: "1.91/1", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: "#BFDBFE", fontSize: 32 }}>🖼</span>
        </div>}
      <div style={{ padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #E2E8F4" }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#0F1733" }}>{brandName}</div>
          <div style={{ fontSize: 11, color: "#8A97B0" }}>brandname.com</div>
        </div>
        <button style={{ background: "transparent", color: "#0a66c2", border: "1.5px solid #0a66c2", borderRadius: 20, padding: "6px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{cta}</button>
      </div>
      <div style={{ display: "flex", gap: 16, padding: "8px 14px 12px", borderTop: "1px solid #E2E8F4" }}>
        {["👍 Like", "💬 Comment", "↗ Share"].map(l => (
          <button key={l} style={{ background: "none", border: "none", color: "#8A97B0", fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}>{l}</button>
        ))}
      </div>
    </div>
  );
}

interface PlatformPreviewProps extends PreviewProps { platformId: PlatformId; estimatedAudience: string; }

function PlatformPreview({ platformId, brandName, logoUrl, caption, cta, estimatedAudience, imageUrl }: PlatformPreviewProps) {
  const previews: Record<PlatformId, React.ReactNode> = {
    meta: <MetaPreview brandName={brandName} logoUrl={logoUrl} caption={caption} cta={cta} imageUrl={imageUrl} />,
    google: <GooglePreview brandName={brandName} caption={caption} cta={cta} imageUrl={imageUrl} />,
    x: <XPreview brandName={brandName} logoUrl={logoUrl} caption={caption} cta={cta} imageUrl={imageUrl} />,
    linkedin: <LinkedInPreview brandName={brandName} logoUrl={logoUrl} caption={caption} cta={cta} imageUrl={imageUrl} />,
  };
  const platformMeta: Record<PlatformId, { label: string; color: string; bg: string }> = {
    meta: { label: "Meta Ads Feed Preview", color: "#2563eb", bg: "#EFF6FF" },
    google: { label: "Google Search Ad Preview", color: "#34a853", bg: "#ECFDF5" },
    x: { label: "X (Twitter) Promoted Post", color: "#0F1733", bg: "#F1F5FE" },
    linkedin: { label: "LinkedIn Sponsored Content", color: "#0a66c2", bg: "#EFF6FF" },
  };
  const meta = platformMeta[platformId];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: meta.color, display: "inline-block" }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: "var(--t2)", textTransform: "uppercase", letterSpacing: ".7px" }}>{meta.label}</span>
        </div>
        <span style={{ fontSize: 10, background: meta.bg, color: meta.color, padding: "2px 10px", borderRadius: 20, fontWeight: 700, border: `1px solid ${meta.color}30` }}>Ad 1</span>
      </div>
      {previews[platformId]}
      <div style={{ background: "#fff", border: "1px solid var(--bdr)", borderRadius: 10, padding: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--blue)", marginBottom: 6 }}>Est. audience: {estimatedAudience}</div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "var(--t3)", marginBottom: 5, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".5px" }}>
          <span>Narrow</span><span>Broad</span>
        </div>
        <div style={{ background: "#F1F5FE", borderRadius: 6, height: 6, overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: 6, background: `linear-gradient(90deg, var(--green), ${meta.color})`, width: "40%" }} />
        </div>
      </div>
    </div>
  );
}

/* ─── PLATFORM ICONS ─────────────────────────────────────── */
const MetaIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" style={{ flex: "none" }}>
    <title>Meta</title>
    <path d="M6.897 4h-.024l-.031 2.615h.022c1.715 0 3.046 1.357 5.94 6.246l.175.297.012.02 1.62-2.438-.012-.019a48.763 48.763 0 0 0-1.098-1.716 28.01 28.01 0 0 0-1.175-1.629C10.413 4.932 8.812 4 6.896 4z" fill="url(#mi-0)" />
    <path d="M6.873 4C4.95 4.01 3.247 5.258 2.02 7.17l-.01.017 2.254 1.231.011-.017c.718-1.083 1.61-1.774 2.568-1.785h.021L6.896 4h-.023z" fill="url(#mi-1)" />
    <path d="M2.019 7.17l-.011.017C1.2 8.447.598 9.995.274 11.664l-.005.022 2.534.6.004-.022c.27-1.467.786-2.828 1.456-3.845l.011-.017L2.02 7.17z" fill="url(#mi-2)" />
    <path d="M2.807 12.264l-2.533-.6-.005.022c-.177.918-.267 1.851-.269 2.786v.023l2.598.233v-.023a12.591 12.591 0 0 1 .21-2.44z" fill="url(#mi-3)" />
    <path d="M2.677 15.537a5.462 5.462 0 0 1-.079-.813v-.022L0 14.468v.024a8.89 8.89 0 0 0 .146 1.652l2.535-.585-.004-.022z" fill="url(#mi-4)" />
    <path d="M3.27 16.89c-.284-.31-.484-.756-.589-1.328l-.004-.021-2.535.585.004.021c.192 1.01.568 1.85 1.106 2.487l.014.017 2.018-1.745-.014-.016z" fill="url(#mi-5)" />
    <path d="M10.78 9.654c-1.528 2.35-2.454 3.825-2.454 3.825-2.035 3.2-2.739 3.917-3.871 3.917a1.545 1.545 0 0 1-1.186-.508l-2.017 1.744.014.017C2.01 19.518 3.058 20 4.356 20c1.963 0 3.374-.928 5.884-5.33l1.766-3.13a41.283 41.283 0 0 0-1.227-1.886z" fill="#0082FB" />
    <path d="M13.502 5.946l-.016.016c-.4.43-.786.908-1.16 1.416.378.483.768 1.024 1.175 1.63.48-.743.928-1.345 1.367-1.807l.016-.016-1.382-1.24z" fill="url(#mi-6)" />
    <path d="M20.918 5.713C19.853 4.633 18.583 4 17.225 4c-1.432 0-2.637.787-3.723 1.944l-.016.016 1.382 1.24.016-.017c.715-.747 1.408-1.12 2.176-1.12.826 0 1.6.39 2.27 1.075l.015.016 1.589-1.425-.016-.016z" fill="#0082FB" />
    <path d="M23.998 14.125c-.06-3.467-1.27-6.566-3.064-8.396l-.016-.016-1.588 1.424.015.016c1.35 1.392 2.277 3.98 2.361 6.971v.023h2.292v-.022z" fill="url(#mi-7)" />
    <path d="M23.998 14.15v-.023h-2.292v.022c.004.14.006.282.006.424 0 .815-.121 1.474-.368 1.95l-.011.022 1.708 1.782.013-.02c.62-.96.946-2.293.946-3.91 0-.083 0-.165-.002-.247z" fill="url(#mi-8)" />
    <path d="M21.344 16.52l-.011.02c-.214.402-.519.67-.917.787l.778 2.462c.155-.054.299-.114.438-.182a3.558 3.558 0 0 0 1.366-1.218l.044-.065.012-.02-1.71-1.784z" fill="url(#mi-9)" />
    <path d="M19.92 17.393c-.262 0-.492-.039-.718-.14l-.798 2.522c.449.153.927.222 1.46.222.492 0 .943-.073 1.352-.215l-.78-2.462c-.167.05-.341.075-.517.073z" fill="url(#mi-10)" />
    <path d="M18.323 16.534l-.014-.017-1.836 1.914.016.017c.637.682 1.246 1.105 1.937 1.337l.797-2.52c-.291-.125-.573-.353-.9-.731z" fill="url(#mi-11)" />
    <path d="M18.309 16.515c-.55-.642-1.232-1.712-2.303-3.44l-1.396-2.336-.011-.02-1.62 2.438.012.02.989 1.668c.959 1.61 1.74 2.774 2.493 3.585l.016.016 1.834-1.914-.014-.017z" fill="url(#mi-12)" />
    <defs>
      <linearGradient id="mi-0" x1="75.897%" x2="26.312%" y1="89.199%" y2="12.194%"><stop offset=".06%" stopColor="#0867DF" /><stop offset="45.39%" stopColor="#0668E1" /><stop offset="85.91%" stopColor="#0064E0" /></linearGradient>
      <linearGradient id="mi-1" x1="21.67%" x2="97.068%" y1="75.874%" y2="23.985%"><stop offset="13.23%" stopColor="#0064DF" /><stop offset="99.88%" stopColor="#0064E0" /></linearGradient>
      <linearGradient id="mi-2" x1="38.263%" x2="60.895%" y1="89.127%" y2="16.131%"><stop offset="1.47%" stopColor="#0072EC" /><stop offset="68.81%" stopColor="#0064DF" /></linearGradient>
      <linearGradient id="mi-3" x1="47.032%" x2="52.15%" y1="90.19%" y2="15.745%"><stop offset="7.31%" stopColor="#007CF6" /><stop offset="99.43%" stopColor="#0072EC" /></linearGradient>
      <linearGradient id="mi-4" x1="52.155%" x2="47.591%" y1="58.301%" y2="37.004%"><stop offset="7.31%" stopColor="#007FF9" /><stop offset="100%" stopColor="#007CF6" /></linearGradient>
      <linearGradient id="mi-5" x1="37.689%" x2="61.961%" y1="12.502%" y2="63.624%"><stop offset="7.31%" stopColor="#007FF9" /><stop offset="100%" stopColor="#0082FB" /></linearGradient>
      <linearGradient id="mi-6" x1="34.808%" x2="62.313%" y1="68.859%" y2="23.174%"><stop offset="27.99%" stopColor="#007FF8" /><stop offset="91.41%" stopColor="#0082FB" /></linearGradient>
      <linearGradient id="mi-7" x1="43.762%" x2="57.602%" y1="6.235%" y2="98.514%"><stop offset="0%" stopColor="#0082FB" /><stop offset="99.95%" stopColor="#0081FA" /></linearGradient>
      <linearGradient id="mi-8" x1="60.055%" x2="39.88%" y1="4.661%" y2="69.077%"><stop offset="6.19%" stopColor="#0081FA" /><stop offset="100%" stopColor="#0080F9" /></linearGradient>
      <linearGradient id="mi-9" x1="30.282%" x2="61.081%" y1="59.32%" y2="33.244%"><stop offset="0%" stopColor="#027AF3" /><stop offset="100%" stopColor="#0080F9" /></linearGradient>
      <linearGradient id="mi-10" x1="20.433%" x2="82.112%" y1="50.001%" y2="50.001%"><stop offset="0%" stopColor="#0377EF" /><stop offset="99.94%" stopColor="#0279F1" /></linearGradient>
      <linearGradient id="mi-11" x1="40.303%" x2="72.394%" y1="35.298%" y2="57.811%"><stop offset=".19%" stopColor="#0471E9" /><stop offset="100%" stopColor="#0377EF" /></linearGradient>
      <linearGradient id="mi-12" x1="32.254%" x2="68.003%" y1="19.719%" y2="84.908%"><stop offset="27.65%" stopColor="#0867DF" /><stop offset="100%" stopColor="#0471E9" /></linearGradient>
    </defs>
  </svg>
);
const GoogleIcon = () => (<svg width="18" height="18" viewBox="0 0 48 48"><path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.6h12.4c-.5 2.8-2.1 5.2-4.5 6.8v5.6h7.3c4.3-3.9 6.9-9.7 6.9-16.5z" /><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.3-5.6c-2.1 1.4-4.7 2.2-8.6 2.2-6.6 0-12.2-4.5-14.2-10.5H2.3v5.8C6.3 42.6 14.6 48 24 48z" /><path fill="#FBBC05" d="M9.8 28.3c-.5-1.4-.8-2.9-.8-4.3s.3-2.9.8-4.3v-5.8H2.3C.8 17.1 0 20.5 0 24s.8 6.9 2.3 10.1l7.5-5.8z" /><path fill="#EA4335" d="M24 9.5c3.7 0 7 1.3 9.6 3.8l7.2-7.2C36.9 2.1 31.5 0 24 0 14.6 0 6.3 5.4 2.3 13.9l7.5 5.8C11.8 14 17.4 9.5 24 9.5z" /></svg>);
const XIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="#0F1733"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>);
const LinkedInIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="#0a66c2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>);

const PLATFORMS: Platform[] = [
  { id: "meta", name: "Meta", icon: <MetaIcon />, color: "#2563eb", bg: "#EFF6FF" },
  { id: "google", name: "Google", icon: <GoogleIcon />, color: "#34a853", bg: "#ECFDF5" },
  { id: "x", name: "X", icon: <XIcon />, color: "#0F1733", bg: "#F1F5FE" },
  { id: "linkedin", name: "LinkedIn", icon: <LinkedInIcon />, color: "#0a66c2", bg: "#EFF6FF" },
];

/* ─── ICONS ─────────────────────────────────────────────── */
const I = {
  Settings: () => <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M8 10a2 2 0 100-4 2 2 0 000 4z" stroke="currentColor" strokeWidth="1.4" /><path d="M13.5 8a5.5 5.5 0 01-.1 1l1.4 1.1-1.5 2.6-1.7-.7a5.5 5.5 0 01-1.7 1l-.3 1.8h-3l-.3-1.8a5.5 5.5 0 01-1.7-1l-1.7.7L1.2 10.1 2.6 9A5.5 5.5 0 012.5 8a5.5 5.5 0 01.1-1L1.2 5.9l1.5-2.6 1.7.7a5.5 5.5 0 011.7-1L6.4 1.3h3l.3 1.7a5.5 5.5 0 011.7 1l1.7-.7 1.5 2.6-1.4 1.1a5.5 5.5 0 01.1 1z" stroke="currentColor" strokeWidth="1.3" /></svg>,
  Users: () => <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.4" /><path d="M2.5 14c0-3 2.5-5 5.5-5s5.5 2 5.5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>,
  Sparkle: () => <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M8 2v3M8 11v3M2 8h3M11 8h3M3.8 3.8l2 2M10.2 10.2l2 2M10.2 3.8l-2 2M5.8 10.2l-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>,
  Upload: () => <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 10V4M5.5 6.5L8 4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><rect x="2" y="12" width="12" height="1.5" rx=".75" fill="currentColor" /></svg>,
  Plus: () => <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>,
  Back: () => <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  Check: () => <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  Lock: () => <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="8" rx="2" stroke="currentColor" strokeWidth="1.4" /><path d="M5 7V5.5a3 3 0 016 0V7" stroke="currentColor" strokeWidth="1.4" /></svg>,
  Campaign: () => <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M2 5h12M2 8h8M2 11h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>,
  Image: () => <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" /><path d="M2 11l4-4 3 3 2-2 3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /><circle cx="5.5" cy="5.5" r="1" fill="currentColor" /></svg>,
  Edit: () => <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M11 2l3 3-8 8H3v-3l8-8z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>,
};

const card = (ex: React.CSSProperties = {}): React.CSSProperties => ({ background: "#fff", border: "1px solid var(--bdr)", borderRadius: 14, padding: 16, position: "relative", ...ex });
const sLabel = (color = "var(--t2)"): React.CSSProperties => ({ fontSize: 10, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: ".7px", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 });

/* ─── SIDEBAR ────────────────────────────────────────────── */
interface SidebarProps {
  platforms: Platform[]; campaigns: Campaign[];
  activePlatformId: PlatformId; activeCampaignId: string; enabledPlatforms: PlatformId[];
  onPlatformSwitch: (id: PlatformId) => void;
  onTogglePlatform: (id: PlatformId) => void;
  onSelectCampaign: (id: string) => void;
  onAddCampaign: (platformId: PlatformId) => void;
}

function Sidebar({ platforms, campaigns, activePlatformId, activeCampaignId, enabledPlatforms, onPlatformSwitch, onTogglePlatform, onSelectCampaign, onAddCampaign }: SidebarProps) {
  const ap = platforms.find(p => p.id === activePlatformId) || platforms[0];
  const aCamps = campaigns.filter(c => c.platformId === activePlatformId);
  return (
    <aside className="dash-sidebar">
      <div style={{ padding: "18px 16px 14px", borderBottom: "1px solid var(--bdr)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <div style={{ width: 28, height: 28, background: "var(--blue)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 4h10M3 8h7M3 12h9" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--t1)", fontFamily: "'Space Grotesk', sans-serif" }}>AdStudio</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {platforms.map(p => {
            const active = p.id === activePlatformId;
            const enabled = enabledPlatforms.includes(p.id);
            return (
              <div key={p.id}
                className={`plat-tab${active ? " nav-active" : ""}${!enabled ? " plat-tab-disabled" : ""}`}
                onClick={() => {
                  if (!enabled) onTogglePlatform(p.id);
                  else onPlatformSwitch(p.id);
                }}
                title={!enabled ? `Click to add ${p.name} to this campaign` : p.name}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "10px 4px", borderRadius: 10, border: `1px solid ${active ? "var(--blue-bdr)" : "var(--bdr)"}`, cursor: "pointer", transition: "all .15s", background: active ? "var(--blue-lt)" : "transparent", opacity: enabled ? 1 : 0.6, position: "relative" }}>

                <div style={{ position: "absolute", top: 6, left: 6 }}>
                  <input type="checkbox" checked={enabled} onChange={() => onTogglePlatform(p.id)} onClick={(e) => e.stopPropagation()} style={{ cursor: "pointer", transform: "scale(1.1)" }} />
                </div>

                <div style={{ width: 28, height: 28, borderRadius: 8, background: active ? p.bg : "var(--surface2)", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 4 }}>{p.icon}</div>
                <span style={{ fontSize: 10, color: active ? p.color : "var(--t3)", fontWeight: active ? 700 : 400 }}>{p.name}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--bdr)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: `${ap.color}12`, border: `1px solid ${ap.color}30`, borderRadius: 10 }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: ap.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{ap.icon}</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: ap.color }}>{ap.name}</div>
            <div style={{ fontSize: 9, color: "var(--t3)" }}>Active Platform</div>
          </div>
          <span style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: "var(--green)", animation: "pulse-dot 2s ease-in-out infinite" }} />
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 10px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 6px", marginBottom: 8 }}>
          <span style={{ fontSize: 9, color: "var(--t3)", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>Campaigns</span>
          <button className="add-btn" onClick={() => onAddCampaign(activePlatformId)} style={{ width: 20, height: 20, borderRadius: 5, border: "1px solid var(--bdr)", background: "var(--surface2)", color: "var(--t3)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0, transition: "all .15s" }}>
            <I.Plus />
          </button>
        </div>
        {aCamps.length === 0
          ? <div style={{ padding: "8px", fontSize: 11, color: "var(--t3)", textAlign: "center" }}>No campaigns. <span style={{ color: "var(--blue)", cursor: "pointer" }} onClick={() => onAddCampaign(activePlatformId)}>+ Add</span></div>
          : aCamps.map(c => {
            const a = c.id === activeCampaignId;
            return (
              <div key={c.id} className="sid-cam" onClick={() => onSelectCampaign(c.id)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 8px", borderRadius: 10, cursor: "pointer", marginBottom: 3, background: a ? "var(--blue-lt)" : "transparent", border: `1px solid ${a ? "var(--blue-bdr)" : "transparent"}`, transition: "all .15s" }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: a ? "var(--blue-mid)" : "var(--surface2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: a ? "var(--blue)" : "var(--t3)" }}><I.Campaign /></div>
                <span style={{ fontSize: 12, color: a ? "var(--blue)" : "var(--t2)", fontWeight: a ? 600 : 400, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
                {a && <span style={{ color: "var(--blue)" }}><I.Check /></span>}
              </div>
            );
          })}
      </div>
    </aside>
  );
}

/* ─── TOP BAR ─────────────────────────────────────────────── */
export const PLATFORM_FIELDS: Record<string, { label: string; placeholder: string }[]> = {
  meta: [{ label: "Business", placeholder: "Select business" }, { label: "Ad Account", placeholder: "Select ad account" }, { label: "Facebook Page", placeholder: "Select page" }, { label: "Pixel", placeholder: "Select pixel" }],
  google: [], // SaaS model: Accounts are auto-provisioned via MCC, no user selection needed.
  linkedin: [{ label: "Company Page", placeholder: "Select page" }, { label: "Ad Account", placeholder: "Select account" }, { label: "Insight Tag", placeholder: "Select tag" }],
  x: [{ label: "Ad Account", placeholder: "Select account" }, { label: "X Profile", placeholder: "Select profile" }, { label: "Pixel", placeholder: "Select pixel" }],
};

interface TopBarProps {
  activePlatformId: PlatformId;
  isEnabled: boolean;
  selectedMetaPage: string;
  setSelectedMetaPage: (v: string) => void;
  selectedMetaPixel: string;
  setSelectedMetaPixel: (v: string) => void;
  selectedMetaBusiness: string;
  setSelectedMetaBusiness: (v: string) => void;
  selectedGoogleAccount: string;
  setSelectedGoogleAccount: (v: string) => void;
}

export function TopBar({
  activePlatformId,
  isEnabled,
  selectedMetaPage,
  setSelectedMetaPage,
  selectedMetaPixel,
  setSelectedMetaPixel,
  selectedMetaBusiness,
  setSelectedMetaBusiness,
  selectedGoogleAccount,
  setSelectedGoogleAccount,
}: TopBarProps) {
  const { user } = useSelector((state: any) => state.auth);
  const fields = PLATFORM_FIELDS[activePlatformId] || [];

  const [metaPages, setMetaPages] = useState<any[]>([]);
  const [metaPixels, setMetaPixels] = useState<any[]>([]);
  const [metaBusinesses, setMetaBusinesses] = useState<any[]>([]);
  const [googleAccounts, setGoogleAccounts] = useState<any[]>([]);

  // Local states for X (Twitter) dropdown choices
  const [selectedXAccount, setSelectedXAccount] = useState<string>("");
  const [selectedXProfile, setSelectedXProfile] = useState<string>("");
  const [selectedXPixel, setSelectedXPixel] = useState<string>("");

  const [xAccounts, setXAccounts] = useState<any[]>([]);

  // Local states for LinkedIn dropdown choices
  const [selectedLiPage, setSelectedLiPage] = useState<string>("");
  const [selectedLiTag, setSelectedLiTag] = useState<string>("");

  const [liPages, setLiPages] = useState<any[]>([]);

  // Real connected account profile data
  const [xProfile, setXProfile] = useState<any>(null);
  const [liProfile, setLiProfile] = useState<any>(null);

  useEffect(() => {
    if (activePlatformId === 'meta' && user?.metaAccessToken) {
      import('../../api/axios').then(({ api }) => {
        api.get('/auth/meta/pages').then(res => {
          if (res.data?.data) setMetaPages(res.data.data);
        }).catch(e => console.error("Pages error", e));

        api.get('/auth/meta/pixels').then(res => {
          if (res.data?.data) setMetaPixels(res.data.data);
        }).catch(e => console.error("Pixels error", e));

        api.get('/auth/meta/businesses').then(res => {
          if (res.data?.data) setMetaBusinesses(res.data.data);
        }).catch(e => console.error("Businesses error", e));
      });
    }

    if (activePlatformId === 'google' && user?.googleAccessToken) {
      import('../../api/axios').then(({ api }) => {
        api.get('/auth/google/check-accounts').then(res => {
          if (res.data?.data?.resourceNames) {
            const accounts = res.data.data.resourceNames.map((r: string) => {
              const id = r.split('/')[1];
              return { id, name: `Account ${id}` };
            });
            setGoogleAccounts(accounts);
          }
        }).catch(e => console.error("Google accounts error", e));
      });
    }

    if (activePlatformId === 'x' && user?.twitterAccessToken) {
      import('../../api/axios').then(({ api }) => {
        api.get('/auth/x/profile').then(res => {
          if (res.data?.connected) setXProfile(res.data);
        }).catch(e => console.error('X profile error', e));

        api.get('/auth/x/ad-accounts').then(res => {
          if (res.data && Array.isArray(res.data)) {
            setXAccounts(res.data);
          }
        }).catch(e => console.error('X ad accounts error', e));
      });
    }

    if (activePlatformId === 'linkedin' && user?.linkedinAccessToken) {
      import('../../api/axios').then(({ api }) => {
        // Fetch real LinkedIn profile name
        api.get('/auth/linkedin/profile').then(res => {
          if (res.data?.connected) setLiProfile(res.data);
        }).catch(e => console.error('LinkedIn profile error', e));

        api.get('/linkedin-crm/organizations').then(res => {
          if (res.data && Array.isArray(res.data)) {
            const pages = res.data.map((org: any) => ({
              id: org.urn,
              name: org.name || `LinkedIn Page (${org.urn.split(':').pop()})`
            }));
            setLiPages(pages);
          }
        }).catch(e => console.error("LinkedIn pages error", e));
      });
    }
  }, [activePlatformId, user?.metaAccessToken, user?.googleAccessToken, user?.linkedinAccessToken, user?.twitterAccessToken]);

  const isNotConnected = (
    (activePlatformId === 'meta' && !user?.metaAccessToken) ||
    (activePlatformId === 'google' && !user?.googleAccessToken) ||
    (activePlatformId === 'linkedin' && !user?.linkedinAccessToken) ||
    (activePlatformId === 'x' && !user?.twitterAccessToken)
  );

  const getPlatformName = () => {
    if (activePlatformId === 'meta') return 'Meta Ads';
    if (activePlatformId === 'google') return 'Google Ads';
    if (activePlatformId === 'linkedin') return 'LinkedIn Ads';
    if (activePlatformId === 'x') return 'X Ads';
    return 'Ads';
  };

  const handleConnect = async () => {
    try {
      const { api } = await import('../../api/axios');
      let endpoint = '';
      if (activePlatformId === 'meta') endpoint = '/auth/meta';
      else if (activePlatformId === 'google') endpoint = '/auth/google';
      else if (activePlatformId === 'x') endpoint = '/auth/x';
      else if (activePlatformId === 'linkedin') endpoint = '/linkedin-crm/oauth/url';

      if (endpoint) {
        const response = await api.get(endpoint);
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Failed to initiate connection', error);
    }
  };

  const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>, platform: string, fieldLabel: string) => {
    const val = e.target.value;
    if (val === 'create') {
      if (platform === 'meta') {
        window.open('https://business.facebook.com/', '_blank');
      } else if (platform === 'google') {
        if (fieldLabel.includes('GA4')) {
          window.open('https://analytics.google.com/', '_blank');
        } else {
          window.open('https://ads.google.com/', '_blank');
        }
      } else if (platform === 'linkedin') {
        window.open('https://business.linkedin.com/marketing-solutions/ads', '_blank');
      } else if (platform === 'x' || platform === 'twitter') {
        if (fieldLabel === 'X Profile') {
          handleConnect();
        } else {
          window.open('https://ads.x.com/', '_blank');
        }
      }
      e.target.value = '';
      return;
    }

    if (platform === 'meta') {
      if (fieldLabel === 'Facebook Page') setSelectedMetaPage(val);
      else if (fieldLabel === 'Pixel') setSelectedMetaPixel(val);
      else if (fieldLabel === 'Business') setSelectedMetaBusiness(val);
    } else if (platform === 'google') {
      if (fieldLabel === 'Google Ads Account' || fieldLabel === 'Manager Account') {
        setSelectedGoogleAccount(val);
      }
    } else if (platform === 'x') {
      if (fieldLabel === 'Ad Account') setSelectedXAccount(val);
      else if (fieldLabel === 'X Profile') setSelectedXProfile(val);
      else if (fieldLabel === 'Pixel') setSelectedXPixel(val);
    } else if (platform === 'linkedin') {
      if (fieldLabel === 'Company Page') setSelectedLiPage(val);
      else if (fieldLabel === 'Insight Tag') setSelectedLiTag(val);
    }
  };

  const getDropdownContent = (f: any) => {
    if (activePlatformId === 'meta') {
      if (f.label === 'Business') {
        return (
          <select value={selectedMetaBusiness} onChange={(e) => handleDropdownChange(e, activePlatformId, f.label)} style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: 12, color: '#111', cursor: 'pointer', appearance: 'none' }}>
            <option value="">{f.placeholder}</option>
            {metaBusinesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            <option value="create">+ Create New {f.label}</option>
          </select>
        );
      }
      if (f.label === 'Ad Account') {
        const adAccountName = user?.metaAdAccountName || user?.metaAdAccountId;
        return (
          <select onChange={(e) => handleDropdownChange(e, activePlatformId, f.label)} style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: 12, color: adAccountName ? '#111' : 'var(--t3)', cursor: 'pointer', appearance: 'none' }}>
            <option value="">{adAccountName || f.placeholder}</option>
            <option value="create">+ Create New {f.label}</option>
          </select>
        );
      }
      if (f.label === 'Facebook Page') {
        return (
          <select value={selectedMetaPage} onChange={(e) => handleDropdownChange(e, activePlatformId, f.label)} style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: 12, color: '#111', cursor: 'pointer', appearance: 'none' }}>
            <option value="">{f.placeholder}</option>
            {metaPages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            <option value="create">+ Create New {f.label}</option>
          </select>
        );
      }
      if (f.label === 'Pixel') {
        return (
          <select value={selectedMetaPixel} onChange={(e) => handleDropdownChange(e, activePlatformId, f.label)} style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: 12, color: '#111', cursor: 'pointer', appearance: 'none' }}>
            <option value="">{metaPixels.length === 0 ? 'No pixels found' : f.placeholder}</option>
            {metaPixels.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            <option value="create">+ Create New {f.label}</option>
          </select>
        );
      }
    }

    if (activePlatformId === 'google') {
      if (f.label === 'Google Ads Account' || f.label === 'Manager Account') {
        const hasAccounts = googleAccounts.length > 0;
        return (
          <select value={selectedGoogleAccount} onChange={(e) => handleDropdownChange(e, activePlatformId, f.label)} style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: 12, color: (user?.googleCustomerId || hasAccounts) ? '#111' : 'var(--t3)', cursor: 'pointer', appearance: 'none' }}>
            <option value="">{user?.googleCustomerId || f.placeholder}</option>
            {googleAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
            <option value="create">+ Create New {f.label}</option>
          </select>
        );
      }
    }

    if (activePlatformId === 'x') {
      if (f.label === 'X Profile') {
        // Show the real connected Twitter handle fetched from the new /auth/x/profile endpoint
        const profileLabel = xProfile?.displayLabel || null;
        const profileId = xProfile?.username || xProfile?.userId || '';
        return (
          <select value={selectedXProfile} onChange={(e) => handleDropdownChange(e, activePlatformId, f.label)} style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: 12, color: profileLabel ? '#111' : 'var(--t3)', cursor: 'pointer', appearance: 'none' }}>
            <option value="">{profileLabel || (user?.twitterAccessToken ? 'Loading profile...' : f.placeholder)}</option>
            {profileLabel && <option value={profileId}>{profileLabel}</option>}
            <option value="create">+ Connect X Account</option>
          </select>
        );
      }

      if (f.label === 'Ad Account') {
        const hasAccounts = xAccounts.length > 0;
        return (
          <select value={selectedXAccount} onChange={(e) => handleDropdownChange(e, activePlatformId, f.label)} style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: 12, color: hasAccounts ? '#111' : 'var(--t3)', cursor: 'pointer', appearance: 'none' }}>
            <option value="">{hasAccounts ? f.placeholder : 'No ad accounts found'}</option>
            {xAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
          </select>
        );
      }

      if (f.label === 'Pixel (Optional)') {
        const hasAccounts = xAccounts.length > 0;
        return (
          <select value={selectedXPixel} onChange={(e) => handleDropdownChange(e, activePlatformId, f.label)} style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: 12, color: hasAccounts ? '#111' : 'var(--t3)', cursor: 'pointer', appearance: 'none' }}>
            <option value="">{hasAccounts ? f.placeholder : 'Select an Ad Account first'}</option>
            {hasAccounts && <option value="default_pixel">Default X Pixel</option>}
          </select>
        );
      }
    }

    if (activePlatformId === 'linkedin') {
      if (f.label === 'Company Page') {
        const hasPages = liPages.length > 0;
        const profileName = liProfile?.name;

        if (!hasPages) {
          // Show reconnect UI with real connected name
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%' }}>
              <span style={{ fontSize: 11, color: 'var(--t3)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {profileName ? `${profileName} — no pages` : 'No pages found'}
              </span>
              <span
                onClick={async () => {
                  const { api } = await import('../../api/axios');
                  const res = await api.get('/linkedin-crm/oauth/url');
                  if (res.data?.url) window.location.href = res.data.url;
                }}
                style={{ fontSize: 10, color: 'var(--blue)', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', textDecoration: 'underline', flexShrink: 0 }}
              >
                Reconnect ↗
              </span>
            </div>
          );
        }

        return (
          <select value={selectedLiPage} onChange={(e) => handleDropdownChange(e, activePlatformId, f.label)} style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: 12, color: '#111', cursor: 'pointer', appearance: 'none' }}>
            <option value="">{f.placeholder}</option>
            {liPages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        );
      }
      if (f.label === 'Insight Tag') {
        // Insight Tag requires LinkedIn Marketing API access — show informational placeholder
        return (
          <select disabled style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: 12, color: 'var(--t3)', cursor: 'not-allowed', appearance: 'none' }}>
            <option>Requires Marketing API access</option>
          </select>
        );
      }
    }

    return (
      <select onChange={(e) => handleDropdownChange(e, activePlatformId, f.label)} style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: 12, color: 'var(--t3)', cursor: 'pointer', appearance: 'none' }}>
        <option value="">{f.placeholder}</option>
        <option value="create">+ Create New {f.label}</option>
      </select>
    );
  };

  return (
    <div style={{ display: "flex", gap: 8, padding: "10px 16px", borderBottom: "1px solid var(--bdr)", background: "#fff", alignItems: "flex-end", flexWrap: "wrap", flexShrink: 0, position: "relative" }}>
      {isNotConnected ? (
        <div style={{ flex: 1, display: "flex", justifyContent: "center", padding: "5px 0" }}>
          <div onClick={handleConnect} className="tb-sel" style={{ background: "linear-gradient(135deg, #1877f2, #0e5a8a)", border: "none", borderRadius: 8, padding: "8px 20px", color: 'var(--text-primary)', fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontWeight: 600 }}>
            Connect {getPlatformName()}
          </div>
        </div>
      ) : (
        fields.map(f => (
          <div key={f.label} style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1, minWidth: 130, opacity: isEnabled ? 1 : .35, pointerEvents: isEnabled ? "auto" : "none", transition: "opacity .2s" }}>
            <span style={{ fontSize: 9, color: "var(--blue)", fontWeight: 700, letterSpacing: ".5px", textTransform: "uppercase" }}>{f.label}</span>
            <div className="tb-sel" style={{ background: "var(--surface)", border: "1px solid var(--bdr)", borderRadius: 8, padding: "7px 10px", color: "var(--t3)", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", transition: "border-color .15s", overflow: "hidden" }}>
              {getDropdownContent(f)}
              {(!getDropdownContent(f).props || getDropdownContent(f).type !== 'select') && (
                <span style={{ fontSize: 10, pointerEvents: 'none', marginLeft: 4 }}>▾</span>
              )}
            </div>
          </div>
        ))
      )}
      {!isEnabled && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 11, color: "var(--t3)", background: "rgba(248,250,255,.85)", backdropFilter: "blur(2px)", zIndex: 2 }}>
          <I.Lock /> This platform is not included in your campaign
        </div>
      )}
    </div>
  );
}

/* ─── AD SETTING CARD ─────────────────────────────────────── */
interface AdSettingCardProps { event: string; budget: string; schedule: string; finalUrl: string; enabled: boolean; onEventChange: (v: string) => void; onBudgetChange: (v: string) => void; onScheduleChange: (v: string) => void; onFinalUrlChange: (v: string) => void; }

function AdSettingCard({ event, budget, schedule, finalUrl, enabled, onEventChange, onBudgetChange, onScheduleChange, onFinalUrlChange }: AdSettingCardProps) {
  return (
    <div style={{ ...card(), borderTop: "3px solid var(--blue)" }}>
      <div style={sLabel("var(--blue)")}><I.Settings /> Ad Setting</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 10, color: "var(--t3)", marginBottom: 4, fontWeight: 500 }}><I.Edit /> Event</div>
          <input className="editable-input" value={event} onChange={e => onEventChange(e.target.value)} placeholder="e.g. Purchase" />
        </div>
        <div>
          <div style={{ fontSize: 10, color: "var(--t3)", marginBottom: 4, fontWeight: 500 }}><I.Edit /> Budget</div>
          <input className="editable-input" value={budget} onChange={e => onBudgetChange(e.target.value)} placeholder="e.g. 35 USD/day" style={{ color: "var(--blue)", fontWeight: 700 }} />
        </div>
      </div>
      <div style={{ borderTop: "1px solid var(--bdr)", margin: "10px 0" }} />
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 10, color: "var(--t3)", marginBottom: 4, fontWeight: 500 }}><I.Edit /> Schedule</div>
        <input className="editable-input" value={schedule} onChange={e => onScheduleChange(e.target.value)} placeholder="e.g. May 08, 2026" />
      </div>
      <div>
        <div style={{ fontSize: 10, color: "var(--t3)", marginBottom: 4, fontWeight: 500 }}><I.Edit /> Final URL</div>
        <input className="editable-input" value={finalUrl} onChange={e => onFinalUrlChange(e.target.value)} placeholder="https://yourbrand.com" style={{ color: "var(--cyan)", fontSize: 11 }} />
      </div>
      {!enabled && <DisabledOverlay />}
    </div>
  );
}

/* ─── TARGET AUDIENCE CARD ───────────────────────────────── */
interface TargetAudienceCardProps {
  includeLocations: string[];
  excludeLocations: string[];
  advantagePlus: boolean;
  enabled: boolean;
  onIncludeLocationsChange: (v: string[]) => void;
  onExcludeLocationsChange: (v: string[]) => void;
  onAdvantageToggle: () => void;
}

const LOCATION_SUGGESTIONS = [
  'India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
  'Maharashtra', 'Karnataka', 'Delhi', 'California', 'New York', 'Texas',
  'Mumbai', 'Bangalore', 'London', 'Dubai'
];

function TargetAudienceCard({
  includeLocations,
  excludeLocations,
  advantagePlus,
  enabled,
  onIncludeLocationsChange,
  onExcludeLocationsChange,
  onAdvantageToggle
}: TargetAudienceCardProps) {
  const [incQuery, setIncQuery] = useState('');
  const [excQuery, setExcQuery] = useState('');
  const [showIncDrop, setShowIncDrop] = useState(false);
  const [showExcDrop, setShowExcDrop] = useState(false);

  const incRef = useRef<HTMLDivElement>(null);
  const excRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (incRef.current && !incRef.current.contains(e.target as Node)) setShowIncDrop(false);
      if (excRef.current && !excRef.current.contains(e.target as Node)) setShowExcDrop(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addInclude = (loc: string) => {
    const clean = loc.trim();
    if (!clean || includeLocations.includes(clean)) return;
    onIncludeLocationsChange([...includeLocations, clean]);
    setIncQuery('');
    setShowIncDrop(false);
  };

  const removeInclude = (loc: string) => {
    onIncludeLocationsChange(includeLocations.filter(l => l !== loc));
  };

  const addExclude = (loc: string) => {
    const clean = loc.trim();
    if (!clean || excludeLocations.includes(clean)) return;
    onExcludeLocationsChange([...excludeLocations, clean]);
    setExcQuery('');
    setShowExcDrop(false);
  };

  const removeExclude = (loc: string) => {
    onExcludeLocationsChange(excludeLocations.filter(l => l !== loc));
  };

  const filteredIncSuggestions = LOCATION_SUGGESTIONS.filter(l =>
    l.toLowerCase().includes(incQuery.toLowerCase()) && !includeLocations.includes(l)
  );

  const filteredExcSuggestions = LOCATION_SUGGESTIONS.filter(l =>
    l.toLowerCase().includes(excQuery.toLowerCase()) && !excludeLocations.includes(l)
  );

  const presets = ['India', 'Maharashtra', 'Delhi', 'Mumbai', 'Bangalore'];

  return (
    <div style={{ ...card(), borderTop: "3px solid var(--green)", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={sLabel("var(--green)")}><I.Users /> Target Audience</div>

      {/* Target Inclusion */}
      <div ref={incRef} style={{ position: "relative" }}>
        <div style={{ fontSize: 10, color: "var(--t3)", marginBottom: 4, fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "var(--blue)" }} />
          Target Locations (Include)
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ position: "relative" }}>
            <input
              className="editable-input"
              value={incQuery}
              onChange={e => { setIncQuery(e.target.value); setShowIncDrop(true); }}
              onFocus={() => setShowIncDrop(true)}
              onKeyDown={e => { if (e.key === 'Enter') { addInclude(incQuery); } }}
              placeholder="Search or type target location..."
              style={{ paddingRight: 30 }}
            />
            {incQuery && (
              <button 
                onClick={() => setIncQuery('')} 
                style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", border: "none", background: "transparent", color: "var(--t3)", fontSize: 11, cursor: "pointer" }}
              >
                ✕
              </button>
            )}
          </div>

          {showIncDrop && filteredIncSuggestions.length > 0 && (
            <div className="loc-dropdown" style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: "1px solid var(--bdr)", borderRadius: 8, zIndex: 100, maxHeight: 150, overflowY: "auto", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginTop: 4 }}>
              {filteredIncSuggestions.map(loc => (
                <div key={loc} onClick={() => addInclude(loc)} className="loc-dropdown-item" style={{ padding: "8px 12px", cursor: "pointer", fontSize: 12, transition: "background .15s" }}>
                  {loc}
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {includeLocations.length === 0 ? (
              <div style={{ fontSize: 10, color: "var(--t3)", fontStyle: "italic" }}>No targeted locations. All regions targeted by default.</div>
            ) : (
              includeLocations.map(loc => (
                <div key={loc} className="loc-pill include-pill" style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.25)", color: "var(--blue)", padding: "3px 8px", borderRadius: 20, fontSize: 11, fontWeight: 500 }}>
                  {loc}
                  <button onClick={() => removeInclude(loc)} style={{ border: "none", background: "transparent", color: "var(--blue)", cursor: "pointer", padding: 0, fontSize: 10, display: "flex", alignItems: "center" }}>✕</button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Target Exclusion */}
      <div ref={excRef} style={{ position: "relative" }}>
        <div style={{ fontSize: 10, color: "var(--t3)", marginBottom: 4, fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "var(--red)" }} />
          Exclude Locations
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ position: "relative" }}>
            <input
              className="editable-input"
              value={excQuery}
              onChange={e => { setExcQuery(e.target.value); setShowExcDrop(true); }}
              onFocus={() => setShowExcDrop(true)}
              onKeyDown={e => { if (e.key === 'Enter') { addExclude(excQuery); } }}
              placeholder="Search or type excluded location..."
              style={{ paddingRight: 30 }}
            />
            {excQuery && (
              <button 
                onClick={() => setExcQuery('')} 
                style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", border: "none", background: "transparent", color: "var(--t3)", fontSize: 11, cursor: "pointer" }}
              >
                ✕
              </button>
            )}
          </div>

          {showExcDrop && filteredExcSuggestions.length > 0 && (
            <div className="loc-dropdown" style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: "1px solid var(--bdr)", borderRadius: 8, zIndex: 100, maxHeight: 150, overflowY: "auto", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginTop: 4 }}>
              {filteredExcSuggestions.map(loc => (
                <div key={loc} onClick={() => addExclude(loc)} className="loc-dropdown-item" style={{ padding: "8px 12px", cursor: "pointer", fontSize: 12, transition: "background .15s" }}>
                  {loc}
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {excludeLocations.length === 0 ? (
              <div style={{ fontSize: 10, color: "var(--t3)", fontStyle: "italic" }}>No exclusions.</div>
            ) : (
              excludeLocations.map(loc => (
                <div key={loc} className="loc-pill exclude-pill" style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "var(--red)", padding: "3px 8px", borderRadius: 20, fontSize: 11, fontWeight: 500 }}>
                  {loc}
                  <button onClick={() => removeExclude(loc)} style={{ border: "none", background: "transparent", color: "var(--red)", cursor: "pointer", padding: 0, fontSize: 10, display: "flex", alignItems: "center" }}>✕</button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Preset suggestions */}
      <div>
        <div style={{ fontSize: 9, fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>Popular Presets</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {presets.map(loc => {
            const isIncluded = includeLocations.includes(loc);
            const isExcluded = excludeLocations.includes(loc);
            return (
              <button
                key={loc}
                onClick={() => {
                  if (isIncluded) {
                    removeInclude(loc);
                  } else {
                    addInclude(loc);
                    if (isExcluded) removeExclude(loc);
                  }
                }}
                className={`preset-btn ${isIncluded ? 'active' : ''}`}
                style={{
                  fontSize: 10,
                  padding: "4px 8px",
                  borderRadius: 6,
                  border: isIncluded ? "1px solid var(--blue-bdr)" : "1px solid var(--bdr)",
                  background: isIncluded ? "var(--blue-lt)" : "var(--surface2)",
                  color: isIncluded ? "var(--blue)" : "var(--t2)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontWeight: isIncluded ? 600 : 400,
                  transition: "all 0.15s"
                }}
              >
                {isIncluded ? `✓ ${loc}` : `+ ${loc}`}
              </button>
            );
          })}
        </div>
      </div>

      <div onClick={onAdvantageToggle} style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: advantagePlus ? "var(--green)" : "var(--t3)", background: advantagePlus ? "var(--green-lt)" : "var(--surface2)", border: `1px solid ${advantagePlus ? "var(--green-bdr)" : "var(--bdr)"}`, padding: "5px 12px", borderRadius: 20, cursor: "pointer", transition: "all .2s", userSelect: "none" }}>
        {advantagePlus ? "✦" : "○"} Advantage+ {advantagePlus ? "on" : "off"}
        <span style={{ width: 15, height: 15, borderRadius: "50%", border: `1px solid ${advantagePlus ? "var(--green-bdr)" : "var(--bdr)"}`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 8 }}>i</span>
      </div>
      {!enabled && <DisabledOverlay />}
    </div>
  );
}

function DisabledOverlay() {
  return (
    <div style={{ position: "absolute", inset: 0, background: "rgba(248,250,255,.92)", borderRadius: "inherit", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, zIndex: 5, backdropFilter: "blur(3px)" }}>
      <span style={{ color: "var(--t3)" }}><I.Lock /></span>
      <span style={{ fontSize: 11, color: "var(--t3)", fontWeight: 500, textAlign: "center", lineHeight: 1.6, padding: "0 16px" }}>Platform not<br />included in campaign</span>
    </div>
  );
}

/* ─── PLATFORM SPECIFIC SETTINGS CARD ────────────────────── */
interface PlatformSpecificSettingsCardProps {
  activePlatformId: PlatformId;
  creative: PlatformCreative;
  onCreativeChange: (patch: Partial<PlatformCreative>) => void;
  enabled: boolean;
}

function PlatformSpecificSettingsCard({ activePlatformId, creative, onCreativeChange, enabled }: PlatformSpecificSettingsCardProps) {
  if (activePlatformId === 'meta') {
    return (
      <div style={{ ...card(), borderTop: "3px solid #2563eb", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={sLabel("#2563eb")}><I.Settings /> Meta Ads Settings</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div>
            <div style={{ fontSize: 10, color: "var(--t3)", marginBottom: 4, fontWeight: 500 }}>Objective</div>
            <select className="editable-input" value={creative.metaObjective || "SALES"} onChange={e => onCreativeChange({ metaObjective: e.target.value })}>
              <option value="AWARENESS">Awareness</option>
              <option value="TRAFFIC">Traffic</option>
              <option value="ENGAGEMENT">Engagement</option>
              <option value="LEADS">Leads</option>
              <option value="APP_PROMOTION">App Promotion</option>
              <option value="SALES">Sales</option>
            </select>
          </div>
          <div>
            <div style={{ fontSize: 10, color: "var(--t3)", marginBottom: 4, fontWeight: 500 }}>Buying Type</div>
            <select className="editable-input" value={creative.metaBuyingType || "AUCTION"} onChange={e => onCreativeChange({ metaBuyingType: e.target.value })}>
              <option value="AUCTION">Auction</option>
              <option value="RESERVATION">Reservation</option>
            </select>
          </div>
          <div>
            <div style={{ fontSize: 10, color: "var(--t3)", marginBottom: 4, fontWeight: 500 }}>Special Ad Category</div>
            <select className="editable-input" value={creative.metaSpecialAdCategory || "NONE"} onChange={e => onCreativeChange({ metaSpecialAdCategory: e.target.value })}>
              <option value="NONE">None</option>
              <option value="CREDIT">Credit</option>
              <option value="EMPLOYMENT">Employment</option>
              <option value="HOUSING">Housing</option>
              <option value="ISSUES_ELECTIONS_POLITICS">Social Issues, Elections or Politics</option>
            </select>
          </div>
          <div>
            <div style={{ fontSize: 10, color: "var(--t3)", marginBottom: 4, fontWeight: 500 }}>Placements</div>
            <select className="editable-input" value={creative.metaPlacements || "ADVANTAGE_PLUS"} onChange={e => onCreativeChange({ metaPlacements: e.target.value })}>
              <option value="ADVANTAGE_PLUS">Advantage+ Placements</option>
              <option value="MANUAL">Manual Placements</option>
            </select>
          </div>
        </div>
        {!enabled && <DisabledOverlay />}
      </div>
    );
  }
  if (activePlatformId === 'google') {
    return (
      <div style={{ ...card(), borderTop: "3px solid #34a853", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={sLabel("#34a853")}><I.Settings /> Google Ads Settings</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div>
            <div style={{ fontSize: 10, color: "var(--t3)", marginBottom: 4, fontWeight: 500 }}>Objective</div>
            <select className="editable-input" value={creative.googleObjective || "SALES"} onChange={e => onCreativeChange({ googleObjective: e.target.value })}>
              <option value="SALES">Sales</option>
              <option value="LEADS">Leads</option>
              <option value="WEBSITE_TRAFFIC">Website Traffic</option>
              <option value="BRAND_AWARENESS">Brand Awareness</option>
              <option value="APP_PROMOTION">App Promotion</option>
            </select>
          </div>
          <div>
            <div style={{ fontSize: 10, color: "var(--t3)", marginBottom: 4, fontWeight: 500 }}>Bidding Strategy</div>
            <select className="editable-input" value={creative.googleBiddingStrategy || "MAXIMIZE_CONVERSIONS"} onChange={e => onCreativeChange({ googleBiddingStrategy: e.target.value })}>
              <option value="MAXIMIZE_CLICKS">Maximize Clicks</option>
              <option value="MAXIMIZE_CONVERSIONS">Maximize Conversions</option>
              <option value="TARGET_CPA">Target CPA</option>
              <option value="TARGET_ROAS">Target ROAS</option>
              <option value="MANUAL_CPC">Manual CPC</option>
            </select>
          </div>
          <div>
            <div style={{ fontSize: 10, color: "var(--t3)", marginBottom: 4, fontWeight: 500 }}>Networks</div>
            <input className="editable-input" value={(creative.googleNetworks || ["SEARCH"]).join(', ')} onChange={e => onCreativeChange({ googleNetworks: e.target.value.split(',').map(s=>s.trim()).filter(Boolean) })} placeholder="SEARCH, DISPLAY" />
          </div>
          <div>
            <div style={{ fontSize: 10, color: "var(--t3)", marginBottom: 4, fontWeight: 500 }}>Keywords</div>
            <input className="editable-input" value={(creative.googleKeywords || []).join(', ')} onChange={e => onCreativeChange({ googleKeywords: e.target.value.split(',').map(s=>s.trim()).filter(Boolean) })} placeholder="e.g. digital marketing, software" />
          </div>
        </div>
        {!enabled && <DisabledOverlay />}
      </div>
    );
  }
  if (activePlatformId === 'linkedin') {
    return (
      <div style={{ ...card(), borderTop: "3px solid #0a66c2", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={sLabel("#0a66c2")}><I.Settings /> LinkedIn Ads Settings</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div>
            <div style={{ fontSize: 10, color: "var(--t3)", marginBottom: 4, fontWeight: 500 }}>Objective</div>
            <select className="editable-input" value={creative.liObjective || "BRAND_AWARENESS"} onChange={e => onCreativeChange({ liObjective: e.target.value })}>
              <option value="BRAND_AWARENESS">Brand Awareness</option>
              <option value="WEBSITE_VISITS">Website Visits</option>
              <option value="ENGAGEMENT">Engagement</option>
              <option value="VIDEO_VIEWS">Video Views</option>
              <option value="LEAD_GENERATION">Lead Generation</option>
              <option value="WEBSITE_CONVERSIONS">Website Conversions</option>
            </select>
          </div>
          <div>
            <div style={{ fontSize: 10, color: "var(--t3)", marginBottom: 4, fontWeight: 500 }}>Ad Format</div>
            <select className="editable-input" value={creative.liAdFormat || "SINGLE_IMAGE"} onChange={e => onCreativeChange({ liAdFormat: e.target.value })}>
              <option value="SINGLE_IMAGE">Single Image Ad</option>
              <option value="CAROUSEL">Carousel Image Ad</option>
              <option value="VIDEO">Video Ad</option>
              <option value="TEXT">Text Ad</option>
              <option value="SPOTLIGHT">Spotlight Ad</option>
            </select>
          </div>
          <div>
            <div style={{ fontSize: 10, color: "var(--t3)", marginBottom: 4, fontWeight: 500 }}>Job Titles (Comma separated)</div>
            <input className="editable-input" value={(creative.liJobTitles || []).join(', ')} onChange={e => onCreativeChange({ liJobTitles: e.target.value.split(',').map(s=>s.trim()).filter(Boolean) })} placeholder="e.g. Marketing Manager, CEO" />
          </div>
          <div>
            <div style={{ fontSize: 10, color: "var(--t3)", marginBottom: 4, fontWeight: 500 }}>Seniority (Comma separated)</div>
            <input className="editable-input" value={(creative.liSeniority || []).join(', ')} onChange={e => onCreativeChange({ liSeniority: e.target.value.split(',').map(s=>s.trim()).filter(Boolean) })} placeholder="e.g. CXO, Director, Manager" />
          </div>
        </div>
        {!enabled && <DisabledOverlay />}
      </div>
    );
  }
  return null;
}

/* ─── BRAND IMAGE SKELETONS ──────────────────────────────── */
function BrandImageSkeletons({ count = 4 }: { count?: number }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="gen-img-skeleton">
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,#F1F5FE 25%,#E8EFFA 50%,#F1F5FE 75%)", backgroundSize: "800px 100%", animation: "shimmer 1.4s infinite" }} />
          <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" opacity={0.3}><rect x="3" y="3" width="18" height="18" rx="3" stroke="#2563EB" strokeWidth="1.5" strokeDasharray="3 2" /><path d="M3 16l5-6 4 4 3-3 6 5" stroke="#2563EB" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /><circle cx="8" cy="9" r="1.5" stroke="#2563EB" strokeWidth="1.3" /></svg>
            <div className="skel-bar" style={{ width: "55%" }} />
            <div className="skel-bar" style={{ width: "35%" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── CREATIVE STUDIO ─────────────────────────────────────── */
interface CreativeStudioProps {
  adCopy: AdCopy;
  activePlatformId: PlatformId;
  isEnabled: boolean;
  brandAssetImages: string[];
  generatingImages: boolean;
  creative: PlatformCreative;
  onCreativeChange: (patch: Partial<PlatformCreative>) => void;
}

type ImageTab = "brand" | "ai" | "upload";

function CreativeStudio({ adCopy, activePlatformId, isEnabled, brandAssetImages, generatingImages, creative, onCreativeChange }: CreativeStudioProps) {
  const [sIdx, setSIdx] = useState<number>(0);
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [aiImgs, setAiImgs] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [aiErr, setAiErr] = useState<string | null>(null);
  const [imgTab, setImgTab] = useState<ImageTab>("brand");
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadedImgs, setUploadedImgs] = useState<string[]>([]);

  // Sync headline/cta from adCopy defaults when platform changes
  useEffect(() => {
    setSIdx(0);
  }, [activePlatformId]);

  const pickS = (s: string, i: number) => { setSIdx(i); onCreativeChange({ primaryText: s }); };
  const pickImg = (url: string) => { onCreativeChange({ image: url }); };

  const generate = async () => {
    if (!aiPrompt.trim()) return;
    setLoading(true); setAiErr(null);
    try {
      const key = (window as any).__OPENAI_KEY || "";
      if (!key) throw new Error("No OpenAI key — set window.__OPENAI_KEY");
      const r = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({ model: "dall-e-3", prompt: aiPrompt, n: 1, size: "1024x1024" }),
      });
      if (!r.ok) { const e = await r.json(); throw new Error(e.error?.message || `API ${r.status}`); }
      const d = await r.json();
      const url: string = d.data[0]?.url || "";
      if (url) { setAiImgs(p => [url, ...p].slice(0, 6)); pickImg(url); }
    } catch (e) { setAiErr(e instanceof Error ? e.message : String(e)); }
    finally { setLoading(false); }
  };

  const upload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const url = URL.createObjectURL(f);
    setUploadedImgs(p => [url, ...p].slice(0, 6)); pickImg(url); setImgTab("upload");
  };

  const emptyMsg = imgTab === "brand" ? "No brand assets found." : imgTab === "ai" ? "Generate an image above." : "Upload an image above.";

  return (
    <div style={{ ...card({ padding: 0 }), borderTop: "3px solid var(--purple)", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid var(--bdr)", flexShrink: 0 }}>
        <div style={sLabel("var(--purple)")}><I.Sparkle /> Creative Studio</div>
        <div style={{ fontSize: 11, color: "var(--t3)" }}>Edit copy · Choose visuals</div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Headline */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--t2)", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 8 }}><I.Edit /> Headline</div>
          <input className="hd-in" value={creative.headline}
            onChange={e => onCreativeChange({ headline: e.target.value })}
            style={{ width: "100%", background: "var(--surface)", border: "1px solid var(--bdr)", borderRadius: 8, padding: "9px 12px", color: "var(--t1)", fontSize: 13, fontWeight: 600, fontFamily: "inherit", transition: "all .15s" }}
            placeholder="Enter headline…" />
          <div style={{ fontSize: 10, color: "var(--t3)", marginTop: 3 }}>{creative.headline.length}/125</div>
        </div>

        <div style={{ borderTop: "1px solid var(--bdr)" }} />

        {/* Primary Text */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--t2)", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 8 }}><I.Edit /> Primary Text</div>
          <div style={{ display: "flex", gap: 5, marginBottom: 8, flexWrap: "wrap" }}>
            {adCopy.primaryTexts.map((s, i) => (
              <button key={i} className={`tag-pill${sIdx === i ? " on" : ""}`} onClick={() => pickS(s, i)}
                style={{ fontSize: 10, padding: "3px 10px", borderRadius: 20, border: "1px solid var(--bdr)", background: "var(--surface2)", color: "var(--t2)", fontFamily: "inherit" }}>P{i + 1}</button>
            ))}
          </div>
          <textarea className="pt-ta" value={creative.primaryText}
            onChange={e => onCreativeChange({ primaryText: e.target.value })}
            rows={3}
            style={{ width: "100%", background: "var(--surface)", border: "1px solid var(--bdr)", borderRadius: 8, padding: "9px 12px", color: "var(--t1)", fontSize: 12, lineHeight: 1.65, resize: "vertical", fontFamily: "inherit", transition: "all .15s" }}
            placeholder="Enter primary text…" />
          <div style={{ fontSize: 10, color: "var(--t3)", marginTop: 3 }}>{creative.primaryText.length}/500</div>
        </div>

        <div style={{ borderTop: "1px solid var(--bdr)" }} />

        {/* CTA */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--t2)", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 8 }}><I.Edit /> Call to Action</div>
          <input className="hd-in" value={creative.cta}
            onChange={e => onCreativeChange({ cta: e.target.value })}
            style={{ width: "100%", background: "var(--surface)", border: "1px solid var(--bdr)", borderRadius: 8, padding: "9px 12px", color: "var(--blue)", fontSize: 13, fontWeight: 700, fontFamily: "inherit", transition: "all .15s" }}
            placeholder="e.g. Shop Now" />
        </div>

        <div style={{ borderTop: "1px solid var(--bdr)" }} />

        {/* Ad Creative */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--t2)", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 10 }}><I.Image /> Ad Creative</div>
          <div style={{ display: "flex", gap: 6, marginBottom: 12, alignItems: "center" }}>
            {([
              { id: "brand" as ImageTab, label: generatingImages ? "Brand (loading…)" : `Brand (${brandAssetImages.length})` },
              { id: "ai" as ImageTab, label: "AI Gen" },
              { id: "upload" as ImageTab, label: "Uploaded" },
            ]).map(t => (
              <button key={t.id} className={`section-tab${imgTab === t.id ? " active" : ""}`} onClick={() => setImgTab(t.id)} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                {t.id === "brand" && generatingImages && <span style={{ width: 8, height: 8, border: "1.5px solid var(--blue-bdr)", borderTopColor: "var(--blue)", borderRadius: "50%", animation: "spin .7s linear infinite", display: "inline-block", flexShrink: 0 }} />}
                {t.label}
              </button>
            ))}
          </div>

          {imgTab === "brand" && (
            <>
              {generatingImages ? (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, background: "var(--blue-lt)", border: "1px solid var(--blue-bdr)", borderRadius: 8, padding: "7px 10px" }}>
                    <span style={{ width: 8, height: 8, border: "1.5px solid var(--blue-bdr)", borderTopColor: "var(--blue)", borderRadius: "50%", animation: "spin .7s linear infinite", display: "inline-block", flexShrink: 0 }} />
                    <span style={{ fontSize: 10, color: "var(--blue)", fontWeight: 600 }}>Generating images from your brand assets…</span>
                  </div>
                  <BrandImageSkeletons count={4} />
                </div>
              ) : brandAssetImages.length === 0 ? (
                <div style={{ background: "var(--surface2)", border: "1.5px dashed var(--bdr2)", borderRadius: 10, padding: "20px 14px", textAlign: "center", color: "var(--t3)", fontSize: 11, lineHeight: 1.7 }}>
                  <I.Image /><div style={{ marginTop: 8 }}>{emptyMsg}</div>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 }}>
                  {brandAssetImages.map((url, i) => (
                    <div key={i} className={`brand-asset-img${creative.image === url ? " sel" : ""}`} onClick={() => pickImg(url)} style={{ aspectRatio: "1", position: "relative", overflow: "hidden", border: `2px solid ${creative.image === url ? "var(--blue)" : "var(--bdr)"}`, cursor: "pointer" }}>
                      <img src={url} alt={`Brand asset ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      {creative.image === url && (
                        <div style={{ position: "absolute", inset: 0, background: "#2563eb1a", display: "flex", alignItems: "flex-start", justifyContent: "flex-end", padding: 4 }}>
                          <div style={{ width: 18, height: 18, borderRadius: "50%", background: "var(--blue)", display: "flex", alignItems: "center", justifyContent: "center" }}><I.Check /></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {imgTab === "ai" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ background: "var(--purple-lt)", border: "1px solid var(--purple-bdr)", borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--purple)", marginBottom: 7, display: "flex", alignItems: "center", gap: 5, textTransform: "uppercase", letterSpacing: ".5px" }}><I.Sparkle /> AI Image Generator</div>
                <textarea className="pt-ta" value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} placeholder={`e.g. "Solar panels on a rooftop at golden hour"`} rows={2} style={{ width: "100%", background: "#fff", border: "1px solid var(--purple-bdr)", borderRadius: 7, padding: "8px 10px", color: "var(--t1)", fontSize: 11, lineHeight: 1.5, resize: "vertical", fontFamily: "inherit" }} />
                {aiErr && <div style={{ fontSize: 10, color: "var(--red)", marginTop: 5, background: "#FEF2F2", padding: "5px 8px", borderRadius: 6, lineHeight: 1.4, border: "1px solid #FCA5A5" }}>{aiErr}</div>}
                <button className="gen-btn" onClick={generate} disabled={loading || !aiPrompt.trim()} style={{ marginTop: 8, width: "100%", background: "var(--purple)", color: 'var(--text-primary)', border: "none", borderRadius: 7, padding: "8px 0", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  {loading ? <><span className="spinner" /><span>Generating…</span></> : <><I.Sparkle /><span>Generate Image</span></>}
                </button>
              </div>
              {(aiImgs.length > 0 || loading) && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 }}>
                  {loading && <div className="shimmer" style={{ aspectRatio: "1", borderRadius: 7, border: "1px solid var(--bdr)" }} />}
                  {aiImgs.map((url, i) => (
                    <div key={i} className={`img-th${creative.image === url ? " sel" : ""}`} onClick={() => pickImg(url)} style={{ aspectRatio: "1", borderRadius: 7, overflow: "hidden", border: `2px solid ${creative.image === url ? "var(--blue)" : "var(--bdr)"}`, position: "relative" }}>
                      <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      {creative.image === url && <div style={{ position: "absolute", top: 4, right: 4, width: 16, height: 16, borderRadius: "50%", background: "var(--blue)", display: "flex", alignItems: "center", justifyContent: "center" }}><I.Check /></div>}
                    </div>
                  ))}
                </div>
              )}
              {aiImgs.length === 0 && !loading && <div style={{ fontSize: 11, color: "var(--t3)", textAlign: "center", paddingTop: 4 }}>{emptyMsg}</div>}
            </div>
          )}

          {imgTab === "upload" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={upload} />
              <button onClick={() => fileRef.current?.click()} style={{ width: "100%", background: "var(--surface)", border: "1.5px dashed var(--bdr2)", borderRadius: 9, padding: "14px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, cursor: "pointer", color: "var(--t2)", fontSize: 12, fontWeight: 600, fontFamily: "inherit" }}>
                <I.Upload /> Upload from folder
              </button>
              {uploadedImgs.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 }}>
                  {uploadedImgs.map((url, i) => (
                    <div key={i} className={`img-th${creative.image === url ? " sel" : ""}`} onClick={() => pickImg(url)} style={{ aspectRatio: "1", borderRadius: 7, overflow: "hidden", border: `2px solid ${creative.image === url ? "var(--blue)" : "var(--bdr)"}`, position: "relative" }}>
                      <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      {creative.image === url && <div style={{ position: "absolute", top: 4, right: 4, width: 16, height: 16, borderRadius: "50%", background: "var(--blue)", display: "flex", alignItems: "center", justifyContent: "center" }}><I.Check /></div>}
                    </div>
                  ))}
                </div>
              )}
              {uploadedImgs.length === 0 && <div style={{ fontSize: 11, color: "var(--t3)", textAlign: "center", paddingTop: 4 }}>{emptyMsg}</div>}
            </div>
          )}
        </div>
      </div>

      {!isEnabled && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(248,250,255,.93)", borderRadius: "inherit", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, zIndex: 10, backdropFilter: "blur(4px)" }}>
          <I.Lock />
          <span style={{ fontSize: 12, color: "var(--t3)", fontWeight: 500, textAlign: "center", padding: "0 24px", lineHeight: 1.7 }}>This platform is not included<br />in your campaign's platforms list.</span>
        </div>
      )}
    </div>
  );
}

/* ─── PUBLISH PLAN MODAL ─────────────────────────────────── */
interface PublishPlanModalProps { isOpen: boolean; onClose: () => void; onSelectPlan: (planId: PlanId) => void; }

function PublishPlanModal({ isOpen, onClose, onSelectPlan }: PublishPlanModalProps) {
  const [billing, setBilling] = useState<BillingCycle>("monthly");
  const plans: Plan[] = [
    { id: "free", name: "3-Day Trial", price: "$0", features: ["Valid for 3 days only", "1 campaign/month", "Basic analytics", "Standard publishing", "Limited AI images"], color: 'var(--text-dim)' },
    { id: "silver", name: "Silver", price: billing === "monthly" ? "$29" : "$290", features: ["10 campaigns/month", "Advanced analytics", "Priority support", "Scheduled publishing", "Unlimited AI images", "A/B testing"], color: "#2563EB", popular: true },
    { id: "gold", name: "Gold", price: billing === "monthly" ? "$79" : "$790", features: ["Unlimited campaigns", "Real-time analytics", "24/7 support", "Advanced scheduling", "Unlimited AI images", "A/B testing", "Multi-platform", "Custom integrations"], color: "#D97706" },
  ];
  if (!isOpen) return null;
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15,23,51,.65)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999999, animation: "fadeIn .2s ease" }} onClick={onClose}>
      <div style={{ background: "#fff", border: "1px solid var(--bdr)", borderRadius: 20, maxWidth: 860, width: "92%", maxHeight: "90vh", overflowY: "auto", padding: 28, position: "relative", animation: "slideUp .25s ease", boxShadow: "0 20px 60px rgba(0,0,0,.3)" }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "var(--surface2)", border: "1px solid var(--bdr)", color: "var(--t3)", width: 32, height: 32, borderRadius: 8, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--t1)", marginBottom: 6, fontFamily: "'Space Grotesk', sans-serif" }}>Choose Publishing Plan</h2>
          <p style={{ fontSize: 13, color: "var(--t2)" }}>Select the plan that fits your campaign needs</p>
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
          <div style={{ display: "flex", background: "var(--surface2)", borderRadius: 40, padding: 4, border: "1px solid var(--bdr)" }}>
            {(["monthly", "yearly"] as BillingCycle[]).map(b => (
              <button key={b} onClick={() => setBilling(b)} style={{ padding: "7px 22px", borderRadius: 32, border: "none", background: billing === b ? "var(--blue)" : "transparent", color: billing === b ? "#fff" : "var(--t2)", fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all .2s", fontFamily: "inherit", position: "relative" }}>
                {b.charAt(0).toUpperCase() + b.slice(1)}
                {b === "yearly" && <span style={{ position: "absolute", top: -8, right: -8, background: "var(--green)", color: 'var(--text-primary)', fontSize: 9, padding: "2px 5px", borderRadius: 10, fontWeight: 700 }}>-20%</span>}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
          {plans.map(plan => (
            <div key={plan.id} className="plan-card" onClick={() => onSelectPlan(plan.id)} style={{ border: `${plan.popular ? "2px" : "1px"} solid ${plan.popular ? plan.color + "44" : "var(--bdr)"}`, borderRadius: 16, padding: 22, background: plan.popular ? `${plan.color}08` : "var(--surface)", cursor: "pointer", transition: "all .2s", position: "relative" }}>
              {plan.popular && <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: plan.color, color: 'var(--text-primary)', padding: "3px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>Most Popular</div>}
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--t1)", marginBottom: 6, fontFamily: "'Space Grotesk', sans-serif" }}>{plan.name}</div>
                <div><span style={{ fontSize: 32, fontWeight: 800, color: plan.color }}>{plan.price}</span><span style={{ fontSize: 12, color: "var(--t3)" }}>/{billing === "monthly" ? "mo" : "yr"}</span></div>
              </div>
              <ul style={{ listStyle: "none", margin: "0 0 20px", borderTop: "1px solid var(--bdr)", paddingTop: 14 }}>
                {plan.features.map((f, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "var(--t2)", marginBottom: 10 }}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-7" stroke={plan.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button style={{ width: "100%", padding: "9px", borderRadius: 8, border: `1.5px solid ${plan.color}`, background: plan.popular ? plan.color : "transparent", color: plan.popular ? "#fff" : plan.color, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                {plan.id === 'free' ? 'Start 3-Day Free Trial' : `Select ${plan.name}`}
              </button>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", fontSize: 11, color: "var(--t3)" }}>All plans include basic support. Upgrade anytime. No long-term contracts.</div>
      </div>
    </div>
  );
}

/* ─── BOTTOM BAR ─────────────────────────────────────────── */
interface BottomBarProps { onBack: () => void; onPublish: () => void; onSaveDraft: () => void; loading: LoadingState; activePlatformName: string; }

function BottomBar({ onBack, onPublish, onSaveDraft, loading, activePlatformName }: BottomBarProps) {
  return (
    <div style={{ background: "#fff", borderTop: "1px solid var(--bdr)", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
      <button className="btn-back" onClick={onBack} style={{ background: "var(--surface)", border: "1px solid var(--bdr)", color: "var(--t2)", padding: "8px 16px", borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
        <I.Back /> Back
      </button>
      <div style={{ fontSize: 11, color: "var(--t3)" }}>Publishing to <span style={{ color: "var(--blue)", fontWeight: 600 }}>{activePlatformName}</span></div>
      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn-pub" onClick={onPublish} disabled={!!loading} style={{ background: "var(--blue)", color: "#fff", border: "none", padding: "8px 26px", borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: loading ? .7 : 1, display: "flex", alignItems: "center", gap: 6 }}>
          {loading === "publish" ? <><span className="spinner-white" />Publishing…</> : "Publish"}
        </button>
        <button className="btn-draft" onClick={onSaveDraft} disabled={!!loading} style={{ background: "var(--surface)", border: "1px solid var(--bdr)", color: "var(--t2)", padding: "8px 16px", borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: loading ? .7 : 1, display: "flex", alignItems: "center", gap: 6 }}>
          {loading === "draft" ? <><span className="spinner" />Saving…</> : "Save Draft"}
        </button>
      </div>
    </div>
  );
}

/* ─── TOAST ─────────────────────────────────────────────── */
function Toast({ message, type }: { message: string; type: ToastType }) {
  const dot = type === "success" ? "var(--green)" : type === "error" ? "var(--red)" : "var(--blue)";
  return <div className={`acd-toast ${type}`}><span style={{ width: 7, height: 7, borderRadius: "50%", background: dot, display: "inline-block" }} />{message}</div>;
}

/* ─── SEED DATA ─────────────────────────────────────────── */
const SEED = {
  event: "Purchase", budget: "5.83 USD/day", schedule: "May 08, 2026",
  location: "India", advantagePlus: true,
  cta: "Shop Now",
  estimatedAudience: "394,400,000 – 464,000,000+",
  headlines: ["Powerful Solutions for Every Business", "Grow Your Brand Today", "Results That Matter"],
  primaryTexts: ["Discover our latest campaign — built for results.", "Affordable and eco-friendly solutions for homes and businesses."],
};

/* ─── HELPERS ───────────────────────────────────────────── */
function resolveEnabledPlatforms(promoData?: PromoData): PlatformId[] {
  const VALID: PlatformId[] = ["meta", "google", "x", "linkedin"];
  const alias: Record<string, PlatformId> = { twitter: "x" };
  const raw: string[] = (promoData?.platforms && promoData.platforms.length > 0)
    ? promoData.platforms
    : promoData?.platform ? [promoData.platform] : [];
  const resolved = raw.map(p => { const l = p.toLowerCase(); return alias[l] ?? l; }).filter((p): p is PlatformId => VALID.includes(p as PlatformId));
  return resolved.length > 0 ? resolved : VALID;
}

/* ─── MAIN COMPONENT ────────────────────────────────────── */
interface AdCampaignDashboardProps {
  brandDetails?: BrandDetails;
  promoData?: PromoData;
  campaignId?: string;
  onBack?: () => void;
  onPublish?: (result: { success: boolean }, planId: PlanId) => void;
  onSaveDraft?: (result: { success: boolean }) => void;
  initialDraftData?: Record<string, any>;
}

export default function AdCampaignDashboard({ brandDetails, promoData, campaignId, onBack = () => { }, onPublish = () => { }, onSaveDraft = () => { }, initialDraftData }: AdCampaignDashboardProps) {

  const brandName = brandDetails?.brand?.name || brandDetails?.name || "Brand";
  const logoUrl = brandDetails?.logoUrl || brandDetails?.assets?.logoUrl || brandDetails?.assets?.logoPreview || brandDetails?.assets?.favicon || "";
  const { user } = useSelector((state: any) => state.auth);
  const userId = user?._id || "";

  const [enabledPlatforms, setEnabledPlatforms] = useState<PlatformId[]>(() => {
    if (initialDraftData && Object.keys(initialDraftData).length > 0) {
      const valid = Object.keys(initialDraftData).filter(k => PLATFORMS.some(p => p.id === k)) as PlatformId[];
      if (valid.length > 0) return valid;
    }
    return resolveEnabledPlatforms(promoData);
  });

  /* ── Collect static brand images ── */
  const collectBrandImages = (): string[] => {
    if (!brandDetails?.assets) return [];
    const assets = brandDetails.assets;
    const collected: string[] = [];
    if (Array.isArray(assets.websiteImages)) collected.push(...assets.websiteImages.filter(Boolean));
    if (Array.isArray(assets.images)) collected.push(...assets.images.filter(Boolean));
    if (Array.isArray(assets.banners)) collected.push(...assets.banners.filter(Boolean));
    if (Array.isArray(assets.thumbnails)) collected.push(...assets.thumbnails.filter(Boolean));
    Object.entries(assets).forEach(([key, val]) => {
      if (key !== "favicon" && key !== "websiteImages" && Array.isArray(val)) {
        val.forEach(v => { if (typeof v === "string" && (v.startsWith("http") || v.startsWith("data:")) && !collected.includes(v)) collected.push(v); });
      }
      if (typeof val === "string" && key !== "favicon" && (val.startsWith("http") || val.startsWith("data:")) && !collected.includes(val)) collected.push(val);
    });
    return collected;
  };

  /* ── Budget / location defaults ── */
  const budgetVal = promoData?.dailyBudget ?? promoData?.budget;
  const budgetStr = budgetVal !== undefined ? `${budgetVal} ${promoData?.currency ?? "USD"}/day` : SEED.budget;
  const locationStr = promoData?.targetLocations || promoData?.targetLocation || SEED.location;

  /* ── Shared ad settings (same across all platforms) ── */
  const globalDraftData = initialDraftData ? (initialDraftData[enabledPlatforms[0]] || initialDraftData) : null;
  const [adEvent, setAdEvent] = useState<string>(globalDraftData?.event || promoData?.event || promoData?.adGoal || SEED.event);
  const [adBudget, setAdBudget] = useState<string>(globalDraftData?.budget || budgetStr);
  const [adSchedule, setAdSchedule] = useState<string>(globalDraftData?.schedule || promoData?.schedule || SEED.schedule);
  const [adFinalUrl, setAdFinalUrl] = useState<string>(globalDraftData?.finalUrl || promoData?.finalUrl || "");
  const [adIncludeLocations, setAdIncludeLocations] = useState<string[]>(() => {
    if (globalDraftData?.includeLocations) return globalDraftData.includeLocations;
    if (promoData?.includeLocations) return promoData.includeLocations;
    const loc = globalDraftData?.location || locationStr || "";
    return loc ? loc.split(',').map((s: string) => s.trim()).filter(Boolean) : ["India"];
  });
  const [adExcludeLocations, setAdExcludeLocations] = useState<string[]>(() => {
    if (globalDraftData?.excludeLocations) return globalDraftData.excludeLocations;
    if (promoData?.excludeLocations) return promoData.excludeLocations;
    return [];
  });
  const [adAdvantage, setAdAdvantage] = useState<boolean>(globalDraftData?.advantagePlus ?? promoData?.advantagePlus ?? SEED.advantagePlus);
  const [adEstimated] = useState<string>(promoData?.estimatedAudience || SEED.estimatedAudience);

  const [selectedMetaPage, setSelectedMetaPage] = useState<string>("");
  const [selectedMetaPixel, setSelectedMetaPixel] = useState<string>("");
  const [selectedMetaBusiness, setSelectedMetaBusiness] = useState<string>("");
  const [selectedGoogleAccount, setSelectedGoogleAccount] = useState<string>("");

  /* ─────────────────────────────────────────────────────────
   * PER-PLATFORM CREATIVE STATE
   * Each enabled platform gets its own headline/primaryText/cta/image
   * ───────────────────────────────────────────────────────── */
  const defaultHeadline = promoData?.headlines?.[0] || SEED.headlines[0];
  const defaultPrimaryText = promoData?.primaryTexts?.[0] || SEED.primaryTexts[0];
  const defaultCta = promoData?.callToAction || SEED.cta;

  const buildDefaultCreative = (draftPlatformData?: any): PlatformCreative => ({
    headline: draftPlatformData?.headline || defaultHeadline,
    primaryText: draftPlatformData?.primaryText || draftPlatformData?.caption || defaultPrimaryText,
    cta: draftPlatformData?.cta || defaultCta,
    image: draftPlatformData?.image || draftPlatformData?.imageUrl || null,

    metaObjective: draftPlatformData?.metaObjective || "SALES",
    metaBuyingType: draftPlatformData?.metaBuyingType || "AUCTION",
    metaSpecialAdCategory: draftPlatformData?.metaSpecialAdCategory || "NONE",
    metaPlacements: draftPlatformData?.metaPlacements || "ADVANTAGE_PLUS",

    googleObjective: draftPlatformData?.googleObjective || "SALES",
    googleNetworks: draftPlatformData?.googleNetworks || ["SEARCH"],
    googleBiddingStrategy: draftPlatformData?.googleBiddingStrategy || "MAXIMIZE_CONVERSIONS",
    googleKeywords: draftPlatformData?.googleKeywords || [],

    liObjective: draftPlatformData?.liObjective || "BRAND_AWARENESS",
    liAdFormat: draftPlatformData?.liAdFormat || "SINGLE_IMAGE",
    liJobTitles: draftPlatformData?.liJobTitles || [],
    liSeniority: draftPlatformData?.liSeniority || [],
    liCompanySize: draftPlatformData?.liCompanySize || [],
  });

  const [platformCreatives, setPlatformCreatives] = useState<Record<string, PlatformCreative>>(() => {
    const init: Record<string, PlatformCreative> = {};
    enabledPlatforms.forEach(pid => {
      init[pid] = buildDefaultCreative(initialDraftData?.[pid] || (initialDraftData?.platform === pid ? initialDraftData : null));
    });
    return init;
  });

  const updateCreative = useCallback((pid: PlatformId, patch: Partial<PlatformCreative>) => {
    setPlatformCreatives(prev => ({
      ...prev,
      [pid]: { ...(prev[pid] ?? buildDefaultCreative()), ...patch },
    }));
  }, []);

  const handleTogglePlatform = (id: PlatformId) => {
    setEnabledPlatforms(prev => {
      if (prev.includes(id)) {
        if (prev.length === 1) {
          showToast("At least one platform must be selected.", "info");
          return prev;
        }
        const next = prev.filter(p => p !== id);
        if (activePid === id) setActivePid(next[0]);
        return next;
      } else {
        setActivePid(id);
        return [...prev, id];
      }
    });
  };

  /* ── Active platform state ── */
  const [activePid, setActivePid] = useState<PlatformId>(enabledPlatforms[0] ?? "meta");
  const [loading, setLoading] = useState<LoadingState>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [showPlanModal, setShowPlanModal] = useState<boolean>(false);

  const sid = campaignId || "cam_01";
  const [campaigns, setCampaigns] = useState<Campaign[]>([{ id: sid, name: `${brandName}_Campaign_01`, platformId: activePid }]);
  const [activeCid, setActiveCid] = useState<string>(sid);

  // const [generatedImages,  setGeneratedImages]  = useState<string[]>([]);
  const [generatedImages, setGeneratedImages] = useState<string[]>(
    (brandDetails as any)?.generatedImages ?? []
  );

  const [generatingImages, setGeneratingImages] = useState<boolean>(false);

  const activePlat = PLATFORMS.find(p => p.id === activePid) || PLATFORMS[0];
  const isCurrentPlatformEnabled = enabledPlatforms.includes(activePid);
  const activeCreative = platformCreatives[activePid] ?? buildDefaultCreative();
  const brandAssetImages = [...collectBrandImages(), ...generatedImages];

  /* ── Fetch generated images on mount ── */
  useEffect(() => {
    if (!brandDetails) return;
    if (generatedImages.length > 0) return;   // ← already restored from saved draft
    setGeneratingImages(true);
    generateSocialMediaImages(brandDetails)
      .then((formatted: any[]) => {
        const urls = formatted.map((item: any) => item.preview || item.image).filter((u: any): u is string => typeof u === "string" && u.length > 0);
        setGeneratedImages(urls);
      })
      .catch((err: unknown) => console.error("Image generation failed:", err))
      .finally(() => setGeneratingImages(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Helpers ── */
  const showToast = useCallback((msg: string, type: ToastType = "info") => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3200);
  }, []);

  const switchPlat = useCallback((pid: PlatformId) => {
    if (!enabledPlatforms.includes(pid)) return;
    setActivePid(pid);
    const f = campaigns.find(c => c.platformId === pid);
    if (f) setActiveCid(f.id);
    showToast(`Switched to ${PLATFORMS.find(p => p.id === pid)?.name} — preview updated`, "info");
  }, [campaigns, enabledPlatforms, showToast]);

  const addCampaign = useCallback((pid: PlatformId) => {
    const p = PLATFORMS.find(x => x.id === pid);
    const n = campaigns.filter(c => c.platformId === pid).length + 1;
    const id = `${pid}_${Date.now()}`;
    setCampaigns(prev => [...prev, { id, name: `${p?.name || pid} Campaign ${String(n).padStart(2, "0")}`, platformId: pid }]);
    setActivePid(pid);
    setActiveCid(id);
    showToast(`Campaign added to ${p?.name || pid}`, "success");
  }, [campaigns, showToast]);

  const handlePublish = useCallback(() => { setShowPlanModal(true); }, []);
  const handleSelectPlan = useCallback(async (planId: PlanId) => {
    setShowPlanModal(false);
    setLoading("publish");
    try {
      const activePlatData = platformCreatives[activePid];
      let targetCid = campaignId || activeCid;
      if (targetCid && (activePid as string) !== 'All' && !targetCid.endsWith(`_${activePid}`)) {
        targetCid = `${targetCid}_${activePid}`;
      }

      const payload = {
        userId,
        campaignId: targetCid,
        campaignName: `${brandName}_${activePid}_Campaign`,
        dailyBudget: parseInt(adBudget) || 10,
        objective: adEvent,
        finalUrl: adFinalUrl,
        headline: activePlatData?.headline,
        caption: activePlatData?.primaryText || '',
        imageUrl: activePlatData?.image || '',
        pageId: selectedMetaPage,
        pixelId: selectedMetaPixel,
        googleAccountId: selectedGoogleAccount,
        location: adIncludeLocations.join(', '),
        includeLocations: adIncludeLocations,
        excludeLocations: adExcludeLocations,
        metaObjective: activePlatData?.metaObjective,
        metaBuyingType: activePlatData?.metaBuyingType,
        metaSpecialAdCategory: activePlatData?.metaSpecialAdCategory,
        metaPlacements: activePlatData?.metaPlacements,
        googleObjective: activePlatData?.googleObjective,
        googleNetworks: activePlatData?.googleNetworks,
        googleBiddingStrategy: activePlatData?.googleBiddingStrategy,
        googleKeywords: activePlatData?.googleKeywords,
        liObjective: activePlatData?.liObjective,
        liAdFormat: activePlatData?.liAdFormat,
        liJobTitles: activePlatData?.liJobTitles,
        liSeniority: activePlatData?.liSeniority,
        liCompanySize: activePlatData?.liCompanySize,
      };

      const { api } = await import('../../api/axios');
      if (activePid === 'google') {
        const res = await api.post('/campaign/google/publish', payload);
        if (res.data?.success === false) {
          showToast(`❌ Google Ads: ${res.data?.error || res.data?.message || 'Publish failed. Check your Google Ads credentials.'}`, 'error');
          return;
        }
        showToast(res.data?.message || '✅ Published to Google Ads successfully!', 'success');
      } else if (activePid === 'meta') {
        const res = await api.post('/campaign/meta/publish', payload);
        showToast(res.data?.message || '✅ Published to Meta Ads successfully!', 'success');
      } else if (activePid === 'linkedin') {
        const res = await api.post('/campaign/linkedin/publish', payload);
        if (res.data?.success === false) {
          showToast(`❌ LinkedIn: ${res.data?.error || res.data?.message || 'Publish failed. Check your LinkedIn connection.'}`, 'error');
          return;
        }
        showToast(res.data?.message || '✅ Published to LinkedIn successfully!', 'success');
      } else {
        const res = await api.post('/campaign/publish', { ...payload, platform: activePid });
        showToast(res.data?.message || `✅ Published with ${planId.charAt(0).toUpperCase() + planId.slice(1)} plan!`, 'success');
      }
      setTimeout(() => onPublish({ success: true }, planId), 1500);
    } catch (err: any) {
      console.error('Publish error:', err);
      showToast(err.response?.data?.message || 'Failed to publish campaign', "error");
    } finally {
      setLoading(null);
    }
  }, [onPublish, showToast, activePid, platformCreatives, userId, campaignId, activeCid, brandName, adBudget, adEvent, adFinalUrl, selectedMetaPage, selectedMetaPixel, selectedGoogleAccount, adIncludeLocations, adExcludeLocations]);

  const campaignTitle = `${brandName}_${promoData?.businessGoal || promoData?.objective || "OUTCOME_SALES"}_${activePlat.name}_${new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}`;

  /* ──────────────────────────────────────────────────────────
   * SAVE DRAFT — nested per-platform structure
   * ────────────────────────────────────────────────────────── */
  const handleDraft = useCallback(async () => {
    setLoading("draft");
    try {
      const perPlatformData: Record<string, object> = {};
      enabledPlatforms.forEach(pid => {
        const c = platformCreatives[pid] ?? buildDefaultCreative();
        perPlatformData[pid] = {
          headline: c.headline,
          primaryText: c.primaryText,
          cta: c.cta,
          image: c.image,
          budget: adBudget,
          event: adEvent,
          schedule: adSchedule,
          finalUrl: adFinalUrl,
          location: adIncludeLocations.join(', '),
          includeLocations: adIncludeLocations,
          excludeLocations: adExcludeLocations,
          advantagePlus: adAdvantage,
          metaObjective: c.metaObjective,
          metaBuyingType: c.metaBuyingType,
          metaSpecialAdCategory: c.metaSpecialAdCategory,
          metaPlacements: c.metaPlacements,
          googleObjective: c.googleObjective,
          googleNetworks: c.googleNetworks,
          googleBiddingStrategy: c.googleBiddingStrategy,
          googleKeywords: c.googleKeywords,
          liObjective: c.liObjective,
          liAdFormat: c.liAdFormat,
          liJobTitles: c.liJobTitles,
          liSeniority: c.liSeniority,
          liCompanySize: c.liCompanySize,
        };
      });

      const payload = {
        // ── Identity ───────────────────────────────────────────────────
        userId,
        campaignId: campaignId || activeCid,   // outer campaignId prop + internal activeCid

        // ── Campaign meta ──────────────────────────────────────────────
        name: campaignTitle,
        platforms: enabledPlatforms,

        // ── Brand snapshot (so edit view needs no extra fetch) ─────────
        brand: {
          name: brandName,
          logoUrl: logoUrl,
          assets: brandDetails?.assets ?? {},
        },

        // ── Promo / targeting context ──────────────────────────────────
        promoContext: {
          businessType: promoData?.businessType,
          adGoal: promoData?.adGoal,
          businessGoal: promoData?.businessGoal,
          objective: promoData?.objective,
          promotionType: promoData?.promotionType,
          targetLocations: adIncludeLocations.join(', '),
          includeLocations: adIncludeLocations,
          excludeLocations: adExcludeLocations,
          estimatedAudience: adEstimated,
          originalHeadlines: promoData?.headlines ?? SEED.headlines,
          originalPrimaryTexts: promoData?.primaryTexts ?? SEED.primaryTexts,
        },

        // ── Per-platform creatives + ad settings ───────────────────────
        audienceId: null,
        data: perPlatformData,
      };

      console.log("Draft payload:", JSON.stringify(payload, null, 2));

      const response = await fetch(`${API_BASE}/campaign/draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to save draft");
      showToast(result.message || "Draft saved!", "success");
      setTimeout(() => onSaveDraft({ success: true }), 1500);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Failed to save draft", "error");
      onSaveDraft({ success: false });
    } finally {
      setLoading(null);
    }
  }, [
    enabledPlatforms, platformCreatives,
    adBudget, adEvent, adSchedule, adFinalUrl, adIncludeLocations, adExcludeLocations, adAdvantage, adEstimated,
    campaignTitle, userId, campaignId, activeCid,
    brandName, logoUrl, brandDetails,
    promoData,
    onSaveDraft, showToast,
  ]);

  const adCopy: AdCopy = {
    headlines: promoData?.headlines?.length ? promoData.headlines : SEED.headlines,
    primaryTexts: promoData?.primaryTexts?.length ? promoData.primaryTexts : SEED.primaryTexts,
    callToAction: activeCreative.cta,
  };

  /* ─── RENDER ─────────────────────────────────────────── */
  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div className="dash-root">
        <TopBar
          activePlatformId={activePid}
          isEnabled={isCurrentPlatformEnabled}
          selectedMetaPage={selectedMetaPage}
          setSelectedMetaPage={setSelectedMetaPage}
          selectedMetaPixel={selectedMetaPixel}
          setSelectedMetaPixel={setSelectedMetaPixel}
          selectedMetaBusiness={selectedMetaBusiness}
          setSelectedMetaBusiness={setSelectedMetaBusiness}
          selectedGoogleAccount={selectedGoogleAccount}
          setSelectedGoogleAccount={setSelectedGoogleAccount}
        />

        <div className="dash-inner">
          <Sidebar
            platforms={PLATFORMS} campaigns={campaigns}
            activePlatformId={activePid} activeCampaignId={activeCid}
            enabledPlatforms={enabledPlatforms}
            onPlatformSwitch={switchPlat} onTogglePlatform={handleTogglePlatform} onSelectCampaign={setActiveCid} onAddCampaign={addCampaign}
          />

          <div className="dash-main">
            <div className="dash-scroll">

              {/* Campaign title bar */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, padding: "9px 14px", background: "#fff", border: "1px solid var(--bdr)", borderRadius: 10, borderLeft: `4px solid ${activePlat.color}`, boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M2 8h12M8 2l6 6-6 6" stroke={activePlat.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--t2)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{campaignTitle}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  {generatingImages && (
                    <div style={{ display: "flex", alignItems: "center", gap: 5, background: "var(--blue-lt)", border: "1px solid var(--blue-bdr)", borderRadius: 20, padding: "3px 10px" }}>
                      <span style={{ width: 8, height: 8, border: "1.5px solid var(--blue-bdr)", borderTopColor: "var(--blue)", borderRadius: "50%", animation: "spin .7s linear infinite", display: "inline-block" }} />
                      <span style={{ fontSize: 10, color: "var(--blue)", fontWeight: 600 }}>Generating brand images…</span>
                    </div>
                  )}
                  {enabledPlatforms.map(pid => {
                    const p = PLATFORMS.find(x => x.id === pid);
                    if (!p) return null;
                    return <span key={pid} style={{ fontSize: 10, background: `${p.color}14`, color: p.color, padding: "2px 10px", borderRadius: 20, fontWeight: 700, border: `1px solid ${p.color}28` }}>{p.name}</span>;
                  })}
                  <span style={{ fontSize: 10, color: "var(--t3)", fontFamily: "monospace" }}>ID: {activeCid}</span>
                </div>
              </div>

              {/* 3-col layout */}
              <div style={{ display: "grid", gridTemplateColumns: "minmax(200px,1fr) minmax(260px,1.1fr) minmax(200px,1fr)", gap: 14, alignItems: "start" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <AdSettingCard
                    event={adEvent} budget={adBudget} schedule={adSchedule} finalUrl={adFinalUrl}
                    enabled={isCurrentPlatformEnabled}
                    onEventChange={setAdEvent} onBudgetChange={setAdBudget}
                    onScheduleChange={setAdSchedule} onFinalUrlChange={setAdFinalUrl}
                  />
                  <TargetAudienceCard
                    includeLocations={adIncludeLocations}
                    excludeLocations={adExcludeLocations}
                    advantagePlus={adAdvantage}
                    enabled={isCurrentPlatformEnabled}
                    onIncludeLocationsChange={setAdIncludeLocations}
                    onExcludeLocationsChange={setAdExcludeLocations}
                    onAdvantageToggle={() => setAdAdvantage(p => !p)}
                  />
                  <PlatformSpecificSettingsCard
                    activePlatformId={activePid}
                    creative={activeCreative}
                    onCreativeChange={patch => updateCreative(activePid, patch)}
                    enabled={isCurrentPlatformEnabled}
                  />
                </div>

                <PlatformPreview
                  platformId={activePid} brandName={brandName} logoUrl={logoUrl}
                  caption={activeCreative.primaryText}
                  cta={activeCreative.cta}
                  estimatedAudience={adEstimated}
                  imageUrl={activeCreative.image}
                />

                <CreativeStudio
                  adCopy={adCopy}
                  activePlatformId={activePid}
                  isEnabled={isCurrentPlatformEnabled}
                  brandAssetImages={brandAssetImages}
                  generatingImages={generatingImages}
                  creative={activeCreative}
                  onCreativeChange={patch => updateCreative(activePid, patch)}
                />
              </div>
            </div>

            <BottomBar onBack={onBack} onPublish={handlePublish} onSaveDraft={handleDraft} loading={loading} activePlatformName={activePlat.name} />
          </div>
        </div>
        {toast && <Toast message={toast.message} type={toast.type} />}
        <PublishPlanModal isOpen={showPlanModal} onClose={() => setShowPlanModal(false)} onSelectPlan={handleSelectPlan} />
      </div>
    </>
  );
}