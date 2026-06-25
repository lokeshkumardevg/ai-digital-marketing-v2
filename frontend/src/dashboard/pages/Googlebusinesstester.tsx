import { useState, useCallback } from "react";

// ─── Config ───────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL;

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  // ✅ FIXED: was localStorage.getItem("token") — your app uses "access_token"
  const token = localStorage.getItem("access_token") || "";
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "API error");
  }
  return res.json();
}

// ─── Types ────────────────────────────────────────────────────────────────────
type StarRating = "ONE" | "TWO" | "THREE" | "FOUR" | "FIVE";
interface ReviewReply { comment: string; }
interface Reviewer    { displayName?: string; }
interface Review {
  name?: string;
  starRating: StarRating;
  reviewer?: Reviewer;
  comment?: string;
  reviewReply?: ReviewReply;
}
interface StatusState { type: "idle" | "loading" | "success" | "error"; msg: string; }
type StepStateValue = "idle" | "active" | "done";
type StepId = 2 | 3 | 4 | 5 | 6;

const STAR_MAP: Record<StarRating, number> = { ONE:1, TWO:2, THREE:3, FOUR:4, FIVE:5 };

// ─── StatusBadge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status?: StatusState }) {
  if (!status) return null;
  const styles = {
    idle:    { bg:"#F1EFE8", color:"#444441", icon:"○" },
    loading: { bg:"#E6F1FB", color:"#185FA5", icon:"⟳" },
    success: { bg:"#EAF3DE", color:"#27500A", icon:"✓" },
    error:   { bg:"#FCEBEB", color:"#791F1F", icon:"✕" },
  };
  const s = styles[status.type] ?? styles.idle;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"2px 8px",
      borderRadius:6, fontSize:11, fontWeight:500, background:s.bg, color:s.color }}>
      {s.icon} {status.msg}
    </span>
  );
}

// ─── ResBox ───────────────────────────────────────────────────────────────────
function ResBox({ data }: { data?: unknown }) {
  if (!data) return null;
  return (
    <pre style={{ marginTop:10, background:"#F7F6F3", border:"0.5px solid #E0DDD6",
      borderRadius:8, padding:"10px 12px", fontSize:11, fontFamily:"monospace",
      color:"#5F5E5A", maxHeight:200, overflowY:"auto", whiteSpace:"pre-wrap", wordBreak:"break-all" }}>
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

// ─── StepCard ─────────────────────────────────────────────────────────────────
function StepCard({ num, title, subtitle, children, isOpen, onToggle, stepState }: {
  num: number; title: string; subtitle: string; children: React.ReactNode;
  isOpen: boolean; onToggle: () => void; stepState?: StepStateValue;
}) {
  const numStyles = {
    idle:   { bg:"#F1EFE8", border:"#B4B2A9", color:"#5F5E5A" },
    active: { bg:"#EEEDFE", border:"#AFA9EC", color:"#3C3489" },
    done:   { bg:"#EAF3DE", border:"#97C459", color:"#27500A" },
  };
  const ns = numStyles[stepState ?? "idle"];
  return (
    <div style={{ background:"#fff", border:"0.5px solid #E0DDD6", borderRadius:12,
      marginBottom:10, overflow:"hidden" }}>
      <div onClick={onToggle} style={{ display:"flex", alignItems:"center", gap:10,
        padding:"12px 16px", cursor:"pointer", userSelect:"none" }}>
        <div style={{ width:26, height:26, borderRadius:"50%", background:ns.bg,
          border:`0.5px solid ${ns.border}`, color:ns.color, fontSize:11, fontWeight:500,
          display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          {stepState === "done" ? "✓" : num}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ margin:0, fontSize:14, fontWeight:500, color:"#1a1a1a" }}>{title}</p>
          <p style={{ margin:0, fontSize:11, color:"#888780", whiteSpace:"nowrap",
            overflow:"hidden", textOverflow:"ellipsis" }}>{subtitle}</p>
        </div>
        <span style={{ fontSize:14, color:"#888780",
          transform:isOpen ? "rotate(180deg)" : "none", transition:"transform .2s" }}>▾</span>
      </div>
      {isOpen && (
        <div style={{ padding:"0 16px 16px", borderTop:"0.5px solid #F1EFE8" }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, type="text", multiline }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; multiline?: boolean;
}) {
  const base: React.CSSProperties = { width:"100%", boxSizing:"border-box", fontSize:13,
    padding:"7px 10px", border:"0.5px solid #D3D1C7", borderRadius:6,
    outline:"none", background:"#fff", color:"#1a1a1a", fontFamily:"inherit" };
  return (
    <div style={{ marginBottom:10 }}>
      <label style={{ display:"block", fontSize:11, color:"#888780", marginBottom:3 }}>{label}</label>
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)}
            placeholder={placeholder} rows={3}
            style={{ ...base, resize:"vertical" }} />
        : <input type={type} value={value} onChange={e => onChange(e.target.value)}
            placeholder={placeholder} style={base} />}
    </div>
  );
}

// ─── Btn ──────────────────────────────────────────────────────────────────────
function Btn({ onClick, children, disabled }: {
  onClick: () => void; children: React.ReactNode; disabled?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ padding:"7px 14px", fontSize:13, border:"0.5px solid #D3D1C7", borderRadius:6,
        background:disabled ? "#F1EFE8" : "#fff", color:disabled ? "#B4B2A9" : "#1a1a1a",
        cursor:disabled ? "not-allowed" : "pointer", fontFamily:"inherit", fontWeight:500 }}>
      {children}
    </button>
  );
}

// ─── ReviewCard ───────────────────────────────────────────────────────────────
function ReviewCard({ review, onReply }: { review: Review; onReply: (r: Review) => void }) {
  const stars = STAR_MAP[review.starRating] ?? 0;
  return (
    <div style={{ background:"#F7F6F3", border:"0.5px solid #E0DDD6",
      borderRadius:8, padding:"10px 12px", marginBottom:8 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
        <span style={{ fontSize:13, fontWeight:500, color:"#1a1a1a" }}>
          {review.reviewer?.displayName ?? "Anonymous"}
        </span>
        <span style={{ color:"#BA7517", fontSize:13 }}>
          {"★".repeat(stars)}{"☆".repeat(5 - stars)}
        </span>
      </div>
      <p style={{ margin:"0 0 8px", fontSize:12, color:"#5F5E5A" }}>
        {review.comment ?? "(no comment)"}
      </p>
      {review.reviewReply && (
        <p style={{ margin:"0 0 8px", fontSize:11, color:"#3B6D11",
          background:"#EAF3DE", borderRadius:4, padding:"4px 8px" }}>
          ↩ {review.reviewReply.comment}
        </p>
      )}
      <button onClick={() => onReply(review)}
        style={{ fontSize:11, padding:"3px 10px", border:"0.5px solid #D3D1C7",
          borderRadius:4, background:"#fff", cursor:"pointer",
          color:"#1a1a1a", fontFamily:"inherit" }}>
        Reply ↗
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function GoogleBusinessTester() {
  const [open, setOpen] = useState<Record<StepId, boolean>>({
    2:true, 3:false, 4:false, 5:false, 6:false
  });
  const [stepState, setStepState] = useState<Partial<Record<StepId, StepStateValue>>>({});
  const [status,    setStatus]    = useState<Partial<Record<StepId, StatusState>>>({});
  const [res,       setRes]       = useState<Partial<Record<StepId, unknown>>>({});

  // ✅ FIXED: userId auto-read from JWT — no manual input needed
  const getUserId = () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return "";
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.sub || payload.userId || payload._id || "";
    } catch {
      return "";
    }
  };

  const [accountId,    setAccountId]    = useState("");
  const [locationId,   setLocationId]   = useState("");
  const [reviewId,     setReviewId]     = useState("");
  const [replyComment, setReplyComment] = useState("");
  const [reviews,      setReviews]      = useState<Review[]>([]);
  const [connected,    setConnected]    = useState(false);

  // ✅ userId from JWT automatically
  const userId = getUserId();

  const toggle = (n: StepId) => setOpen(o => ({ ...o, [n]: !o[n] }));
  const setS   = (n: StepId, type: StatusState["type"], msg: string) =>
    setStatus(s => ({ ...s, [n]: { type, msg } }));
  const setR   = (n: StepId, data: unknown) => setRes(r => ({ ...r, [n]: data }));
  const setSt  = (n: StepId, st: StepStateValue) => setStepState(s => ({ ...s, [n]: st }));

  // ── Step 2: GET /google-business/accounts ────────────────────────────────────
  const step2 = useCallback(async () => {
    if (!userId) return setS(2, "error", "Not logged in — please login first");
    setS(2, "loading", "fetching...");
    try {
      // ✅ FIXED: no userId in query — backend reads it from JWT
      const data = await apiFetch<any[]>(`/google-business/accounts`);
      setR(2, data);
      if (data?.length) {
        const firstId = (data[0].name ?? "").replace("accounts/", "");
        if (firstId) setAccountId(firstId);
        setS(2, "success", `${data.length} account(s)`);
        setSt(2, "done");
        setConnected(true);
      } else {
        setS(2, "error", "no accounts returned");
      }
    } catch (e: any) {
      setS(2, "error", e.message);
    }
  }, [userId]);

  // ── Step 3: GET /google-business/locations ───────────────────────────────────
  const step3 = useCallback(async () => {
    if (!accountId) return setS(3, "error", "need accountId — run step 2 first");
    setS(3, "loading", "fetching...");
    try {
      // ✅ FIXED: only accountId in query — userId from JWT
      const data = await apiFetch<any[]>(
        `/google-business/locations?accountId=${accountId}`
      );
      setR(3, data);
      if (data?.length) {
        const firstId = (data[0].name ?? "").replace(`accounts/${accountId}/locations/`, "");
        if (firstId) setLocationId(firstId);
        setS(3, "success", `${data.length} location(s)`);
        setSt(3, "done");
      } else {
        setS(3, "error", "no locations returned");
      }
    } catch (e: any) {
      setS(3, "error", e.message);
    }
  }, [accountId]);

  // ── Step 4: GET /google-business/reviews ─────────────────────────────────────
  const step4 = useCallback(async () => {
    if (!accountId || !locationId)
      return setS(4, "error", "need accountId + locationId");
    setS(4, "loading", "fetching...");
    try {
      // ✅ FIXED: userId from JWT
      const data = await apiFetch<Review[]>(
        `/google-business/reviews?accountId=${accountId}&locationId=${locationId}`
      );
      setR(4, data);
      if (data?.length) {
        setReviews(data);
        const firstRid = (data[0].name ?? "").split("/").pop() ?? "";
        if (firstRid) setReviewId(firstRid);
        setS(4, "success", `${data.length} review(s)`);
        setSt(4, "done");
      } else {
        setS(4, "error", "no reviews returned");
      }
    } catch (e: any) {
      setS(4, "error", e.message);
    }
  }, [accountId, locationId]);

  // ── Step 5: POST /google-business/reviews/reply ───────────────────────────────
  const step5 = useCallback(async () => {
    if (!accountId || !locationId || !reviewId || !replyComment)
      return setS(5, "error", "fill all fields");
    setS(5, "loading", "sending reply...");
    try {
      // ✅ FIXED: no userId in body — backend reads from JWT
      const data = await apiFetch<unknown>("/google-business/reviews/reply", {
        method: "POST",
        body: JSON.stringify({
          accountId,
          locationId,
          reviewId,
          comment: replyComment,
        }),
      });
      setR(5, data);
      setS(5, "success", "reply sent ✓");
      setSt(5, "done");
    } catch (e: any) {
      setS(5, "error", e.message);
    }
  }, [accountId, locationId, reviewId, replyComment]);

  // ── Step 6: Token check ────────────────────────────────────────────────────
  const step6 = useCallback(async () => {
    if (!userId) return setS(6, "error", "Not logged in");
    setS(6, "loading", "refreshing...");
    try {
      const data = await apiFetch<any[]>(`/google-business/accounts`);
      setR(6, data);
      setS(6, "success", "token valid / refreshed");
      setSt(6, "done");
    } catch (e: any) {
      setS(6, "error", e.message);
    }
  }, [userId]);

  const prefillReply = (review: Review) => {
    const rid = (review.name ?? "").split("/").pop() ?? "";
    setReviewId(rid);
    setOpen(o => ({ ...o, 5: true }));
    setTimeout(() => {
      document.getElementById("reply-comment-field")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <div style={{ maxWidth:680, margin:"0 auto", padding:"1rem 0",
      fontFamily:"-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
        <div style={{ width:36, height:36, borderRadius:8, background:"#E6F1FB",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:18, fontWeight:700, color:"#185FA5" }}>G</div>
        <div style={{ flex:1 }}>
          <p style={{ margin:0, fontSize:16, fontWeight:500, color:"#1a1a1a" }}>
            Google Business — API Tester
          </p>
          <p style={{ margin:0, fontSize:12, color:"#888780" }}>
            Calls your NestJS backend → Google APIs
          </p>
        </div>
        <span style={{ padding:"3px 10px", borderRadius:6, fontSize:11, fontWeight:500,
          background: connected ? "#EAF3DE" : "#F1EFE8",
          color:      connected ? "#27500A" : "#5F5E5A" }}>
          {connected ? "✓ connected" : "○ not connected"}
        </span>
      </div>

      {/* ✅ FIXED: User info auto-read from JWT — no manual input */}
      <div style={{ background:"#F7F6F3", border:"0.5px solid #E0DDD6",
        borderRadius:10, padding:"12px 14px", marginBottom:14 }}>
        <p style={{ margin:"0 0 8px", fontSize:11, fontWeight:600, color:"#888780",
          textTransform:"uppercase", letterSpacing:"0.06em" }}>Session info</p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          <div>
            <p style={{ margin:"0 0 3px", fontSize:11, color:"#888780" }}>User ID (from JWT)</p>
            <p style={{ margin:0, fontSize:12, fontFamily:"monospace", color:"#1a1a1a",
              background:"#fff", border:"0.5px solid #D3D1C7", borderRadius:6,
              padding:"7px 10px", wordBreak:"break-all" }}>
              {userId || "⚠ Not logged in"}
            </p>
          </div>
          <div>
            <p style={{ margin:"0 0 3px", fontSize:11, color:"#888780" }}>Backend URL</p>
            <p style={{ margin:0, fontSize:12, fontFamily:"monospace", color:"#1a1a1a",
              background:"#fff", border:"0.5px solid #D3D1C7", borderRadius:6,
              padding:"7px 10px" }}>{API_BASE}</p>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:4 }}>
          <Field label="Account ID (auto-filled after step 2)"
            value={accountId} onChange={setAccountId}
            placeholder="Auto-filled after step 2" />
          <Field label="Location ID (auto-filled after step 3)"
            value={locationId} onChange={setLocationId}
            placeholder="Auto-filled after step 3" />
        </div>
        {!userId && (
          <p style={{ margin:"8px 0 0", fontSize:11, color:"#A32D2D",
            background:"#FCEBEB", padding:"6px 10px", borderRadius:6 }}>
            ⚠ No JWT found in localStorage. Please login first.
          </p>
        )}
      </div>

      {/* Step 2 — Get Accounts */}
      <StepCard num={2} title="Get accounts"
        subtitle="GET /google-business/accounts"
        isOpen={open[2]} onToggle={() => toggle(2)} stepState={stepState[2]}>
        <div style={{ marginTop:12 }}>
          <p style={{ margin:"0 0 10px", fontSize:12, color:"#888780" }}>
            Backend reads your Google tokens from DB using your JWT,
            auto-refreshes if expired, then calls Google Account Management API.
          </p>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <Btn onClick={step2} disabled={!userId}>Fetch accounts ↗</Btn>
            <StatusBadge status={status[2]} />
          </div>
          <ResBox data={res[2]} />
        </div>
      </StepCard>

      {/* Step 3 — Get Locations */}
      <StepCard num={3} title="Get locations"
        subtitle={`GET /google-business/locations?accountId=${accountId || "{accountId}"}`}
        isOpen={open[3]} onToggle={() => toggle(3)} stepState={stepState[3]}>
        <div style={{ marginTop:12 }}>
          <p style={{ margin:"0 0 10px", fontSize:12, color:"#888780" }}>
            Fetches all business locations. accountId auto-filled from step 2.
          </p>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <Btn onClick={step3} disabled={!accountId}>Fetch locations ↗</Btn>
            <StatusBadge status={status[3]} />
          </div>
          <ResBox data={res[3]} />
        </div>
      </StepCard>

      {/* Step 4 — Get Reviews */}
      <StepCard num={4} title="Get reviews"
        subtitle={`GET /google-business/reviews?accountId=...&locationId=${locationId || "{locationId}"}`}
        isOpen={open[4]} onToggle={() => toggle(4)} stepState={stepState[4]}>
        <div style={{ marginTop:12 }}>
          <p style={{ margin:"0 0 10px", fontSize:12, color:"#888780" }}>
            Fetches all reviews for this location. Click Reply ↗ to pre-fill step 5.
          </p>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <Btn onClick={step4} disabled={!accountId || !locationId}>
              Fetch reviews ↗
            </Btn>
            <StatusBadge status={status[4]} />
          </div>
          <ResBox data={res[4]} />
          {reviews.length > 0 && (
            <div style={{ marginTop:14 }}>
              <p style={{ margin:"0 0 8px", fontSize:11, fontWeight:600, color:"#888780",
                textTransform:"uppercase", letterSpacing:"0.06em" }}>
                {reviews.length} review(s) from Google
              </p>
              {reviews.map((r, i) => (
                <ReviewCard key={i} review={r} onReply={prefillReply} />
              ))}
            </div>
          )}
        </div>
      </StepCard>

      {/* Step 5 — Reply */}
      <StepCard num={5} title="Reply to review"
        subtitle="POST /google-business/reviews/reply"
        isOpen={open[5]} onToggle={() => toggle(5)} stepState={stepState[5]}>
        <div style={{ marginTop:12 }}>
          <Field label="Review ID (auto-filled from step 4)"
            value={reviewId} onChange={setReviewId}
            placeholder="Click Reply ↗ on a review above" />
          <div id="reply-comment-field">
            <Field label="Your reply comment" value={replyComment}
              onChange={setReplyComment}
              placeholder="Thank you for your feedback!" multiline />
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <Btn onClick={step5}
              disabled={!accountId || !locationId || !reviewId || !replyComment}>
              Send reply ↗
            </Btn>
            <StatusBadge status={status[5]} />
          </div>
          <ResBox data={res[5]} />
        </div>
      </StepCard>

      {/* Step 6 — Token check */}
      <StepCard num={6} title="Refresh token"
        subtitle="Triggers getValidToken() on backend — refreshes if expired"
        isOpen={open[6]} onToggle={() => toggle(6)} stepState={stepState[6]}>
        <div style={{ marginTop:12 }}>
          <p style={{ margin:"0 0 10px", fontSize:12, color:"#888780" }}>
            Token refresh is automatic on every API call. Use this to manually
            verify the token is valid or force a refresh cycle.
          </p>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <Btn onClick={step6} disabled={!userId}>Check / refresh token ↗</Btn>
            <StatusBadge status={status[6]} />
          </div>
          <ResBox data={res[6]} />
        </div>
      </StepCard>

      <p style={{ fontSize:11, color:"#B4B2A9", marginTop:10 }}>
        All calls → <code>{API_BASE}/google-business/*</code> &nbsp;·&nbsp;
        JWT from <code>localStorage.access_token</code> &nbsp;·&nbsp;
        Token refresh handled server-side
      </p>
    </div>
  );
}