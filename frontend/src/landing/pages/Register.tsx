import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaFacebookF, FaGoogle } from "react-icons/fa";
import { auth, googleProvider, facebookProvider } from "../lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { api } from "../../api/axios";
import { saveAuthUser } from "../lib/auth";
import logo from '../../assets/fevicon.png';


function modeFromPath(pathname: string) {
  return pathname === "/login" ? "signin" : "signup";
}

/* ─── Inline styles / keyframes (no Tailwind needed for custom effects) ─── */
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:        #040407;
    --surface:   rgba(255,255,255,0.035);
    --border:    rgba(255,255,255,0.08);
    --border-hi: rgba(255,255,255,0.14);
    --accent:    #4f72ff;
    --accent2:   #7c3aed;
    --text:      #f0f0f6;
    --muted:     rgba(240,240,246,0.45);
    --danger:    rgba(239,68,68,0.85);
    --success:   rgba(52,211,153,0.85);
    --input-bg:  rgba(255,255,255,0.028);
    --radius:    14px;
    --card-r:    28px;
  }

  body { background: var(--bg); font-family: 'DM Sans', sans-serif; }

  @keyframes floatA {
    0%,100% { transform: translate(0,0) rotate(0deg); }
    33%      { transform: translate(14px,-18px) rotate(4deg); }
    66%      { transform: translate(-10px,10px) rotate(-3deg); }
  }
  @keyframes floatB {
    0%,100% { transform: translate(0,0) rotate(0deg); }
    50%      { transform: translate(-18px,12px) rotate(-5deg); }
  }
  @keyframes pulse-ring {
    0%   { box-shadow: 0 0 0 0 rgba(79,114,255,0.35); }
    70%  { box-shadow: 0 0 0 14px rgba(79,114,255,0); }
    100% { box-shadow: 0 0 0 0 rgba(79,114,255,0); }
  }
  @keyframes fade-up {
    from { opacity:0; transform:translateY(18px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  @keyframes spin-slow { to { transform:rotate(360deg); } }

  .fade-up { animation: fade-up 0.55s cubic-bezier(.22,1,.36,1) both; }
  .delay-1 { animation-delay:0.08s; }
  .delay-2 { animation-delay:0.16s; }
  .delay-3 { animation-delay:0.24s; }
  .delay-4 { animation-delay:0.32s; }

  /* ── Left panel decorative shapes ── */
  .shape {
    position: absolute;
    border-radius: 20px;
    border: 1px solid rgba(255,255,255,0.07);
    background: linear-gradient(135deg, rgba(79,114,255,0.12), rgba(124,58,237,0.06));
    backdrop-filter: blur(6px);
  }

  /* ── Input ── */
  .inp {
    width: 100%;
    height: 44px;
    border-radius: 50px;
    border: 1px solid var(--border);
    background: var(--input-bg);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    padding: 0 18px;
    outline: none;
    transition: border-color .2s, background .2s;
    backdrop-filter: blur(4px);
  }
  .inp::placeholder { color: var(--muted); }
  .inp:focus {
    border-color: var(--accent);
    background: rgba(79,114,255,0.05);
  }

  /* ── Primary button ── */
  .btn-primary {
    width: 100%;
    height: 44px;
    border-radius: var(--radius);
    border: none;
    background: linear-gradient(135deg, #2855e8, #7c3aed);
    color: #fff;
    font-family: 'Syne', sans-serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: .1em;
    text-transform: uppercase;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: opacity .2s, transform .15s;
  }
  .btn-primary::after {
    content:'';
    position:absolute;
    inset:0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
    background-size: 400px 100%;
    animation: shimmer 2.4s infinite;
  }
  .btn-primary:hover { opacity:.88; transform:scale(1.012); }
  .btn-primary:disabled { opacity:.5; transform:none; }

  /* ── Social button ── */
  .btn-social {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    height: 44px;
    border-radius: 50px;
    border: 1px solid var(--border-hi);
    background: var(--surface);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: background .2s, border-color .2s;
    backdrop-filter: blur(8px);
  }
  .btn-social:hover {
    background: rgba(255,255,255,0.06);
    border-color: rgba(255,255,255,0.22);
  }
  .btn-social:disabled { opacity:.5; }

  /* ── Divider ── */
  .divider {
    display: flex;
    align-items: center;
    gap: 12px;
    color: var(--muted);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: .04em;
  }
  .divider::before, .divider::after {
    content:'';
    flex:1;
    height:1px;
    background: var(--border);
  }

  /* ── Toggle ── */
  .toggle {
    position: relative;
    width: 30px;
    height: 16px;
    border-radius: 50px;
    cursor: pointer;
    border: none;
    transition: background .25s;
    flex-shrink: 0;
  }
  .toggle-thumb {
    position: absolute;
    top: 2px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #fff;
    transition: left .25s;
  }

  /* ── Label ── */
  .field-label {
    display: block;
    font-size: 11px;
    font-weight: 500;
    color: rgba(240,240,246,0.75);
    margin-bottom: 7px;
    letter-spacing: .02em;
  }

  /* ── Alert ── */
  .alert {
    border-radius: 10px;
    padding: 9px 13px;
    font-size: 11px;
    line-height: 1.5;
    text-align: left;
    margin-bottom: 4px;
  }
`;

function Register() {
  const location = useLocation();
  const [mode, setMode] = useState(() => modeFromPath(location.pathname));
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  useEffect(() => {
    if (localStorage.getItem("access_token")) {
      window.location.href = "http://localhost:5173/campaigns";
    }
    setAuthLoading(false);
  }, []);

  useEffect(() => {
    setMode(modeFromPath(location.pathname));
    setError(""); setSuccess("");
    setForm({ name: "", email: "", password: "" });
  }, [location.pathname]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(""); setSuccess("");
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const resetMessages = () => { setError(""); setSuccess(""); };

  const getFirebaseError = (code: string) => {
    const map: Record<string, string> = {
      "auth/email-already-in-use": "This email is already registered.",
      "auth/invalid-email": "Please enter a valid email address.",
      "auth/weak-password": "Password should be at least 6 characters.",
      "auth/user-not-found": "No account found with this email.",
      "auth/wrong-password": "Invalid email or password.",
      "auth/invalid-credential": "Invalid email or password.",
      "auth/popup-closed-by-user": "Login popup was closed before completing sign in.",
      "auth/account-exists-with-different-credential":
        "An account already exists with the same email using another login method.",
    };
    return map[code] ?? "Something went wrong. Please try again.";
  };

  const handleAuthSuccess = (data: { access_token: string; user: any }) => {
    localStorage.setItem("access_token", data.access_token);
    saveAuthUser({
      _id: data.user._id || data.user.id,
      name: data.user.name || "",
      email: data.user.email || "",
    });
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault(); resetMessages();
    const email = form.email.trim(), password = form.password.trim(), name = form.name.trim();
    if (!email || !password || (mode === "signup" && !name)) {
      setError("Please fill all required fields."); return;
    }
    try {
      setLoading(true);
      const endpoint = mode === "signup" ? "/auth/register" : "/auth/login";
      const payload  = mode === "signup" ? { email, password, name } : { email, password };
      const { data } = await api.post(endpoint, payload);
      handleAuthSuccess(data);
      setSuccess(mode === "signup" ? "Account created! Redirecting…" : "Signed in! Redirecting…");
      setTimeout(() => { window.location.href = "http://localhost:5173/campaigns"; }, 1000);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Invalid credentials.");
    } finally { setLoading(false); }
  };

  const socialAuth = async (provider: any, label: string) => {
    try {
      setLoading(true); resetMessages();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      const { data } = await api.post("/auth/firebase", { idToken });
      handleAuthSuccess(data);
      setSuccess(`Signed in with ${label}! Redirecting…`);
      setTimeout(() => { window.location.href = "http://localhost:5173/campaigns"; }, 1000);
    } catch (err: any) { setError(getFirebaseError(err.code)); }
    finally { setLoading(false); }
  };

  if (authLoading) return (
    <div style={{ minHeight:"100vh", background:"#040407", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <span style={{ color:"rgba(240,240,246,0.4)", fontSize:13, fontFamily:"DM Sans,sans-serif" }}>Loading…</span>
    </div>
  );

  const isSignIn = mode === "signin";

  return (
    <>
      <style>{globalStyles}</style>

      <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", overflow:"hidden", position:"relative" }}>

        {/* ── Global ambient glows ── */}
        <div style={{ position:"fixed", top:"-15%", left:"20%", width:500, height:500, borderRadius:"50%",
          background:"radial-gradient(circle, rgba(79,114,255,0.08) 0%, transparent 70%)", pointerEvents:"none" }} />
        <div style={{ position:"fixed", bottom:"-10%", right:"10%", width:400, height:400, borderRadius:"50%",
          background:"radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 70%)", pointerEvents:"none" }} />

        {/* ══════════════════════ LEFT PANEL ══════════════════════ */}
        <div style={{
          flex:1, display:"flex", flexDirection:"column", justifyContent:"center",
          padding:"60px 64px", position:"relative", overflow:"hidden",
          background:"linear-gradient(135deg, rgba(10,12,28,0.95) 0%, rgba(5,6,14,0.98) 100%)",
          borderRight:"1px solid rgba(255,255,255,0.05)"
        }} className="left-panel">

          {/* Decorative floating shapes */}
          <div className="shape" style={{ width:120, height:120, top:"12%", left:"8%",
            animation:"floatA 9s ease-in-out infinite" }} />
          <div className="shape" style={{ width:72, height:72, top:"28%", right:"14%",
            animation:"floatB 7s ease-in-out infinite", borderRadius:16 }} />
          <div className="shape" style={{ width:180, height:60, bottom:"22%", left:"6%",
            animation:"floatA 11s ease-in-out infinite reverse", borderRadius:12 }} />
          <div className="shape" style={{ width:56, height:56, bottom:"14%", right:"8%",
            animation:"floatB 8s ease-in-out infinite", borderRadius:"50%" }} />

          {/* Orbit ring */}
          <div style={{
            position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)",
            width:340, height:340, borderRadius:"50%",
            border:"1px dashed rgba(79,114,255,0.12)",
            animation:"spin-slow 40s linear infinite", pointerEvents:"none"
          }} />

          {/* Logo */}
          <div className="fade-up" style={{ marginBottom:48 }}>
      <div style={{ padding: '0 8px', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '3px' }}>
        <div style={{
          width: '70px', height: '70px', borderRadius: '10px',
          // background: 'var(--accent-gradient)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', color: '#fff',
          // boxShadow: '0 8px 16px rgba(112,51,245,0.25)', flexShrink: 0,
        }}>
          <div style={{
  width: '70px',
  height: '70px',
  borderRadius: '10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  flexShrink: 0,
}}>
  {<img
    src={logo}
    alt="logo"
    style={{
      width: '100%',
      height: '150%',
      objectFit: 'contain',
    }}
  /> }
</div>
        </div>
        <h2 style={{ fontSize: '3rem', fontWeight: 800, margin: 0, letterSpacing: '-0.8px', color: '#f5f5f5', fontFamily: 'Outfit', whiteSpace: 'nowrap' }}>
          heedle.Ai
        </h2>
      </div>
          </div>

          {/* Headline */}
          <div className="fade-up delay-1">
            <div style={{
              display:"inline-flex", alignItems:"center", gap:8, marginBottom:20,
              padding:"6px 14px", borderRadius:50,
              border:"1px solid rgba(79,114,255,0.25)",
              background:"rgba(79,114,255,0.08)",
              backdropFilter:"blur(8px)"
            }}>
              <span style={{ fontSize:9, color:"#a5b4fc", fontWeight:700, letterSpacing:".12em", textTransform:"uppercase" }}>
                ♻ Zero Barriers
              </span>
            </div>

            <h1 style={{
              fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:42, lineHeight:1.1,
              color:"var(--text)", letterSpacing:"-.03em", marginBottom:20
            }}>
              Not a co-pilot<br />
              for experts, but<br />
              <span style={{
                background:"linear-gradient(90deg, #4f72ff, #b9a5f5, #4f72ff)",
                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent"
              }}>the first fully<br />automated</span><br />
              advertising expert.
            </h1>

            <p style={{ fontSize:13, color:"var(--muted)", lineHeight:1.7, maxWidth:340, fontWeight:300 }}>
              AI-powered growth for every business — no expertise required.
              Launch, optimize, and scale campaigns automatically.
            </p>
          </div>

          {/* Stats row */}
          <div className="fade-up delay-2" style={{ display:"flex", gap:32, marginTop:44 }}>
            {[["10x","Faster campaigns"],["98%","Automation rate"],["$0","Setup cost"]].map(([val, label]) => (
              <div key={val}>
                <div style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:22, color:"var(--text)" }}>{val}</div>
                <div style={{ fontSize:10, color:"var(--muted)", marginTop:2, fontWeight:400 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════ RIGHT PANEL ══════════════════════ */}
        <div style={{
          width:640, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center",
          padding:"48px 40px", background:"rgba(255,255,255,0.012)", position:"relative"
        }}>

          <div style={{ width:"100%", maxWidth:400 }}>

            {/* Card */}
            <div className="fade-up" style={{
              borderRadius:28, border:"1px solid rgba(255,255,255,0.09)",
              background:"linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
              backdropFilter:"blur(32px) saturate(180%)",
              boxShadow:"0 0 0 1px rgba(255,255,255,0.03), 0 32px 80px rgba(0,0,0,0.7), 0 0 80px rgba(79,114,255,0.04)",
              padding:"36px 32px", position:"relative", overflow:"hidden"
            }}>

              {/* Card inner glow */}
              <div style={{
                position:"absolute", top:-60, left:-60, width:200, height:200, borderRadius:"50%",
                background:"radial-gradient(circle, rgba(79,114,255,0.1) 0%, transparent 70%)",
                pointerEvents:"none"
              }} />
              <div style={{
                position:"absolute", bottom:-40, right:-40, width:150, height:150, borderRadius:"50%",
                background:"radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)",
                pointerEvents:"none"
              }} />

              <div style={{ position:"relative", zIndex:1 }}>

                {/* Header */}
                <div style={{ marginBottom:28 }}>
                  <h2 style={{
                    fontFamily:"Syne,sans-serif", fontWeight:700, fontSize:22,
                    color:"var(--text)", letterSpacing:"-.02em", marginBottom:6
                  }}>
                    {isSignIn ? "Welcome back" : "Get started today"}
                  </h2>
                  <p style={{ fontSize:12, color:"var(--muted)", lineHeight:1.6 }}>
                    {isSignIn
                      ? <>Don't have an account? <Link to="/register" style={{ color:"#818cf8", fontWeight:500, textDecoration:"none" }}>Sign up for free</Link></>
                      : <>Already have an account? <Link to="/login" style={{ color:"#818cf8", fontWeight:500, textDecoration:"none" }}>Sign in</Link></>
                    }
                  </p>
                </div>

                {/* Alerts */}
                {error && (
                  <div className="alert" style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", color:"#fca5a5", marginBottom:16 }}>
                    {error}
                  </div>
                )}
                {success && (
                  <div className="alert" style={{ background:"rgba(52,211,153,0.08)", border:"1px solid rgba(52,211,153,0.2)", color:"#6ee7b7", marginBottom:16 }}>
                    {success}
                  </div>
                )}

                {/* Social buttons */}
                <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:20 }}>
                  <button className="btn-social" onClick={() => socialAuth(googleProvider, "Google")} disabled={loading}>
                    <FaGoogle style={{ fontSize:13, color:"#ea4335" }} />
                    Continue with Google
                  </button>
                  <button className="btn-social" onClick={() => socialAuth(facebookProvider, "Facebook")} disabled={loading}>
                    <FaFacebookF style={{ fontSize:13, color:"#1877f2" }} />
                    Continue with Facebook
                  </button>
                </div>

                {/* Divider */}
                <div className="divider" style={{ marginBottom:20 }}>Or</div>

                {/* Form */}
                <form onSubmit={handleEmailAuth} style={{ display:"flex", flexDirection:"column", gap:14 }}>
                  {!isSignIn && (
                    <div className="fade-up delay-1">
                      <label className="field-label">Full name</label>
                      <input className="inp" name="name" type="text" value={form.name}
                        onChange={handleChange} placeholder="Your full name" />
                    </div>
                  )}

                  <div>
                    <label className="field-label">Email</label>
                    <input className="inp" name="email" type="email" value={form.email}
                      onChange={handleChange} placeholder="your@email.com" />
                  </div>

                  <div>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:7 }}>
                      <label className="field-label" style={{ marginBottom:0 }}>Password</label>
                      {isSignIn && (
                        <a href="#" style={{ fontSize:10, color:"#818cf8", textDecoration:"none", fontWeight:500 }}>Forget?</a>
                      )}
                    </div>
                    <input className="inp" name="password" type="password" value={form.password}
                      onChange={handleChange} placeholder="••••••••" />
                  </div>

                  {/* Remember me */}
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <button type="button"
                      aria-pressed={remember}
                      onClick={() => setRemember(p => !p)}
                      className="toggle"
                      style={{ background: remember ? "linear-gradient(90deg,#4f72ff,#7c3aed)" : "rgba(255,255,255,0.12)" }}
                    >
                      <span className="toggle-thumb" style={{ left: remember ? 16 : 2 }} />
                    </button>
                    <span style={{ fontSize:11, color:"var(--muted)" }}>Remember me</span>
                  </div>

                  <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop:4 }}>
                    {loading ? "Please wait…" : isSignIn ? "Log In" : "Create Account"}
                  </button>
                </form>

                {/* Footer note */}
                <p style={{ marginTop:20, fontSize:10, color:"rgba(240,240,246,0.3)", textAlign:"center", lineHeight:1.7 }}>
                  Having trouble?{" "}
                  <a href="mailto:info@wheedletechnologies.ai" style={{ color:"rgba(240,240,246,0.5)", textDecoration:"underline" }}>
                    Send us an email.
                  </a>
                  <br />
                  By proceeding, you agree to our{" "}
                  <a href="#" style={{ color:"rgba(240,240,246,0.5)", textDecoration:"underline" }}>Terms</a>{" "}and{" "}
                  <a href="#" style={{ color:"rgba(240,240,246,0.5)", textDecoration:"underline" }}>Privacy Policy</a>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Register;