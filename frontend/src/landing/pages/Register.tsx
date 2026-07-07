import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaFacebookF } from "react-icons/fa";
import { auth, facebookProvider } from "../lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { api } from "../../api/axios";
import { saveAuthUser } from "../lib/auth";
import logo from "../../assets/fevicon.png";
// @ts-ignore
import BotSVG from "../components/Bot";
import { useGoogleLogin } from '@react-oauth/google';

function modeFromPath(pathname: string) {
  return pathname === "/login" ? "signin" : "signup";
}

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Figtree:wght@300;400;500;600;700;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:        #07070C;
    --border:    rgba(255,255,255,0.07);
    --border-hi: rgba(255,255,255,0.14);
    --accent:    #5B6EF5;
    --text:      #EEEEF5;
    --muted:     rgba(238,238,245,0.42);
    --input-bg:  rgba(255,255,255,0.03);
    --radius:    16px;
  }

  html, body { height: 100%; }
  body { background: var(--bg); font-family: 'Figtree', sans-serif; -webkit-text-size-adjust: 100%; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes drift {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50%       { transform: translateY(-10px) rotate(2deg); }
  }
  @keyframes shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position:  600px 0; }
  }
  @keyframes orbitSpin {
    to { transform: translate(-50%, -50%) rotate(360deg); }
  }

  .fade-up  { animation: fadeUp 0.55s cubic-bezier(.22,1,.36,1) both; }
  .delay-1  { animation-delay: 0.08s; }
  .delay-2  { animation-delay: 0.16s; }
  .delay-3  { animation-delay: 0.24s; }

  .grid-bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-image:
      linear-gradient(rgba(91,110,245,0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(91,110,245,0.06) 1px, transparent 1px);
    background-size: 40px 40px;
    mask-image: radial-gradient(ellipse 80% 80% at 40% 50%, black 40%, transparent 100%);
    -webkit-mask-image: radial-gradient(ellipse 80% 80% at 40% 50%, black 40%, transparent 100%);
  }

  .bot-float {
    animation: drift 2s ease-in-out infinite;
    filter: drop-shadow(0 0 24px rgba(91,110,245,0.4));
    position: relative;
    z-index: 2;
  }

  .orbit-ring {
    position: absolute;
    border-radius: 50%;
    border: 1px dashed rgba(91,110,245,0.15);
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    animation: orbitSpin 25s linear infinite;
    pointer-events: none;
  }
  .static-ring {
    position: absolute;
    border-radius: 50%;
    border: 1px solid rgba(91,110,245,0.1);
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }

  .auth-page {
    min-height: 100vh;
    min-height: 100dvh;
    background: var(--bg);
    display: flex;
    flex-direction: column;
    position: relative;
    overflow-x: hidden;
  }

  .auth-left { display: none; }

  .auth-right {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 20px 16px 40px;
    position: relative;
    z-index: 1;
  }

  .auth-right-inner {
    width: 70%;
    max-width: 560px;
    display: flex;
    flex-direction: column;
  }
  @media (max-width: 900px) {
    .auth-right-inner { width: 100%; }
  }
  @media (min-width: 1024px) {
    .auth-right-inner { max-width: 640px; }
  }
  @media (min-width: 1280px) {
    .auth-right-inner { max-width: 700px; }
  }

  .mobile-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    width: 100%;
  }

  @media (min-width: 768px) {
    .auth-page { flex-direction: row; min-height: 100vh; }
    .auth-left {
      display: flex;
      flex-direction: column;
      flex: 0 0 40%;
      width: 40%;
      min-width: 0;
      padding: 32px 28px;
      position: relative;
      overflow: hidden;
      background: linear-gradient(135deg, rgba(91,110,245,0.07) 0%, transparent 60%);
      border-right: 1px solid rgba(255,255,255,0.06);
    }
    .auth-right { flex: 0 0 60%; width: 60%; padding: 36px 24px; justify-content: center; overflow-y: auto; }
    .mobile-topbar { display: none; }
    .left-headline { font-size: clamp(16px, 1.8vw, 24px) !important; }
    .left-desc     { font-size: 11px !important; }
    .bot-ring-wrap { width: 120px !important; height: 120px !important; }
    .bot-static-ring { width: 136px !important; height: 136px !important; }
    .bot-orbit-ring  { width: 100px !important; height: 100px !important; }
  }

  @media (min-width: 1024px) {
    .auth-left  { padding: 40px 36px; }
    .auth-right { padding: 48px 40px; }
    .left-headline { font-size: clamp(20px, 2vw, 30px) !important; }
    .left-desc     { font-size: 12px !important; }
    .bot-ring-wrap { width: 150px !important; height: 150px !important; }
    .bot-static-ring { width: 168px !important; height: 168px !important; }
    .bot-orbit-ring  { width: 124px !important; height: 124px !important; }
  }

  @media (min-width: 1280px) {
    .auth-left  { padding: 48px 44px; }
    .auth-right { padding: 48px 60px; }
    .left-headline { font-size: clamp(24px, 2.2vw, 34px) !important; }
    .left-desc     { font-size: 13px !important; }
    .bot-ring-wrap { width: 180px !important; height: 180px !important; }
    .bot-static-ring { width: 200px !important; height: 200px !important; }
    .bot-orbit-ring  { width: 150px !important; height: 150px !important; }
  }

  @media (min-width: 1440px) {
    .auth-left  { padding: 56px 52px; }
    .auth-right { padding: 56px 80px; }
    .left-headline { font-size: clamp(28px, 2.4vw, 38px) !important; }
    .bot-ring-wrap { width: 200px !important; height: 200px !important; }
    .bot-static-ring { width: 220px !important; height: 220px !important; }
    .bot-orbit-ring  { width: 170px !important; height: 170px !important; }
  }

  .logo-wordmark {
    font-family: 'Figtree', sans-serif;
    font-size: 18px;
    font-weight: 800;
    letter-spacing: -0.3px;
    background: linear-gradient(90deg, #fff, rgba(255,255,255,0.7));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  @media (min-width: 768px) { .logo-wordmark { font-size: 20px; } }

  .btn-home {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 32px;
    padding: 0 12px;
    border-radius: 50px;
    border: 1px solid rgba(255,255,255,0.12);
    background: rgba(255,255,255,0.04);
    color: rgba(238,238,245,0.65);
    font-family: 'Figtree', sans-serif;
    font-size: 11px;
    font-weight: 500;
    cursor: pointer;
    text-decoration: none;
    transition: background .2s, border-color .2s, color .2s, transform .15s;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .btn-home:hover {
    background: rgba(255,255,255,0.08);
    border-color: rgba(255,255,255,0.22);
    color: var(--text);
    transform: translateX(-2px);
  }
  .btn-home svg { transition: transform .2s; flex-shrink: 0; }
  .btn-home:hover svg { transform: translateX(-2px); }

  .auth-card {
    border-radius: 20px;
    border: 1px solid rgba(255,255,255,0.1);
    background: linear-gradient(160deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.022) 100%);
    backdrop-filter: blur(40px) saturate(180%);
    -webkit-backdrop-filter: blur(40px) saturate(180%);
    box-shadow: 0 0 0 1px rgba(255,255,255,0.03), 0 24px 64px rgba(0,0,0,0.7), 0 0 60px rgba(91,110,245,0.05);
    padding: 84px 18px;
    position: relative;
    overflow: hidden;
    width: 100%;
  }
  @media (min-width: 400px) { .auth-card { padding: 28px 22px; } }
  @media (min-width: 768px) { .auth-card { padding: 32px 28px; border-radius: 24px; } }

  .card-heading {
    font-size: 24px;
    font-weight: 400;
    color: var(--text);
    letter-spacing: -0.3px;
    margin-bottom: 6px;
    line-height: 1.2;
  }
  @media (min-width: 480px) { .card-heading { font-size: 26px; } }
  @media (min-width: 768px) { .card-heading { font-size: 28px; } }

  .inp {
    width: 100%;
    height: 44px;
    border-radius: 50px;
    border: 1px solid var(--border);
    background: var(--input-bg);
    color: var(--text);
    font-family: 'Figtree', sans-serif;
    font-size: 16px;
    padding: 0 18px;
    outline: none;
    transition: border-color .2s, background .2s;
    -webkit-appearance: none;
    appearance: none;
  }
  @media (min-width: 768px) { .inp { height: 42px; font-size: 13px; } }
  .inp::placeholder { color: var(--muted); }
  .inp:focus { border-color: var(--accent); background: rgba(91,110,245,0.06); }

  .btn-primary {
    width: 100%;
    height: 46px;
    border-radius: var(--radius);
    border: none;
    background: linear-gradient(135deg, #0665ff 50%, #22d3ee 100%);
    color: #fff;
    font-family: 'Figtree', sans-serif;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: .08em;
    text-transform: uppercase;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: opacity .2s, transform .15s;
    -webkit-tap-highlight-color: transparent;
  }
  @media (min-width: 768px) { .btn-primary { height: 44px; font-size: 12px; } }
  .btn-primary::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    background-size: 600px 100%;
    animation: shimmer 2.5s infinite;
  }
  .btn-primary:hover   { opacity: .88; transform: scale(1.01); }
  .btn-primary:disabled { opacity: .5; transform: none; cursor: not-allowed; }

  .btn-social {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    height: 44px;
    border-radius: 50px;
    border: 1px solid var(--border-hi);
    background: rgba(255,255,255,0.04);
    color: var(--text);
    font-family: 'Figtree', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background .2s, border-color .2s;
    -webkit-tap-highlight-color: transparent;
  }
  @media (min-width: 768px) { .btn-social { height: 42px; font-size: 12px; } }
  .btn-social:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.22); }
  .btn-social:disabled { opacity: .5; cursor: not-allowed; }

  .divider {
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--muted);
    font-size: 10px;
    font-weight: 500;
    letter-spacing: .05em;
  }
  .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: var(--border); }

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

  .field-label {
    display: block;
    font-size: 10px;
    font-weight: 600;
    color: rgba(238,238,245,0.6);
    margin-bottom: 6px;
    letter-spacing: .04em;
    text-transform: uppercase;
  }

  .auth-alert {
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 12px;
    line-height: 1.5;
    text-align: left;
    margin-bottom: 14px;
    word-break: break-word;
  }

  .glow-tl {
    position: fixed;
    top: -15%; left: 18%;
    width: clamp(260px, 35vw, 500px);
    height: clamp(260px, 35vw, 500px);
    border-radius: 50%;
    background: radial-gradient(circle, rgba(91,110,245,0.07) 0%, transparent 70%);
    pointer-events: none;
  }
  .glow-br {
    position: fixed;
    bottom: -10%; right: 12%;
    width: clamp(200px, 28vw, 380px);
    height: clamp(200px, 28vw, 380px);
    border-radius: 50%;
    background: radial-gradient(circle, rgba(155,107,240,0.06) 0%, transparent 70%);
    pointer-events: none;
  }

  .stats-row {
    display: flex;
    gap: 28px;
    margin-top: 32px;
    flex-wrap: wrap;
  }
  @media (min-width: 1024px) { .stats-row { gap: 36px; margin-top: 40px; } }

  .no-scroll-x { overflow-x: hidden; }
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
      window.location.href = "/campaigns";
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
      "auth/account-exists-with-different-credential": "An account already exists with the same email using another login method.",
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
      const payload = mode === "signup" ? { email, password, name } : { email, password };
      const { data } = await api.post(endpoint, payload);
      handleAuthSuccess(data);
      setSuccess(mode === "signup" ? "Account created! Redirecting…" : "Signed in! Redirecting…");
      setTimeout(() => { window.location.href = "/campaigns"; }, 1000);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Invalid credentials.");
    } finally { setLoading(false); }
  };

  // ✅ UPDATED: auth-code flow with business.manage scope
  const handleGoogleAuth = useGoogleLogin({
    flow: 'auth-code',
    scope: [
      'openid',
      'email',
      'profile',
    ].join(' '),
    onSuccess: async (codeResponse) => {
      try {
        setLoading(true);
        resetMessages();
        const { data } = await api.post("/auth/google/login", {
          code: codeResponse.code,
        });
        handleAuthSuccess(data);
        setSuccess("Signed in with Google! Redirecting…");
        setTimeout(() => { window.location.href = "/campaigns"; }, 1000);
      } catch (err: any) {
        setError(err?.response?.data?.message || err?.message || "Google login failed.");
      } finally {
        setLoading(false);
      }
    },
    onError: (error) => {
      console.error('Google login failed', error);
      setError('Google login was closed or failed.');
    },
  });

  const socialAuth = async (provider: any, label: string) => {
    try {
      setLoading(true); resetMessages();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      const { data } = await api.post("/auth/firebase", { idToken });
      handleAuthSuccess(data);
      setSuccess(`Signed in with ${label}! Redirecting…`);
      setTimeout(() => { window.location.href = "/campaigns"; }, 1000);
    } catch (err: any) { setError(getFirebaseError(err.code)); }
    finally { setLoading(false); }
  };

  if (authLoading) return (
    <div style={{
      minHeight: "100vh", background: "#07070C",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <span style={{ color: "rgba(238,238,245,0.4)", fontSize: 13, fontFamily: "Figtree, sans-serif" }}>
        Loading…
      </span>
    </div>
  );

  const isSignIn = mode === "signin";

  const LogoBar = () => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", minWidth: 0 }}>
        <div style={{
          width: 46, height: 46, borderRadius: 8,
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden", flexShrink: 0,
        }}>
          <img src={logo} alt="heedle logo" style={{ width: "100%", height: "200%", objectFit: "contain" }} />
        </div>
        <span className="logo-wordmark">heedleTechnologies.Ai</span>
      </div>
      <a href="/" className="btn-home">
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
          <path d="M8.5 3L4.5 7L8.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to home
      </a>
    </div>
  );

  return (
    <>
      <style>{globalStyles}</style>
      <div className="auth-page">
        <div className="glow-tl" />
        <div className="glow-br" />

        {/* LEFT PANEL */}
        <div className="auth-left">
          <div className="grid-bg" />
          <div className="fade-up" style={{ position: "relative", zIndex: 2 }}>
            <LogoBar />
          </div>
          <div style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative", padding: "16px 0",
          }}>
            <div className="bot-ring-wrap" style={{
              position: "relative", width: 200, height: 200,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <div className="static-ring bot-static-ring" style={{ width: 220, height: 220 }} />
              <div className="orbit-ring bot-orbit-ring" style={{ width: 170, height: 170 }} />
              <div className="bot-float"><BotSVG /></div>
            </div>
          </div>
          <div className="fade-up delay-1" style={{ position: "relative", zIndex: 2 }}>
            <h1 className="left-headline" style={{
              fontSize: 38, fontWeight: 400, lineHeight: 1.15,
              color: "var(--text)", letterSpacing: "-0.5px", marginBottom: 14,
            }}>
              Not a co-pilot<br />for experts, but the{" "}
              <em style={{
                fontStyle: "italic",
                background: "linear-gradient(135deg, #0665ff 0%, #22d3ee 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>
                first fully automated
              </em>{" "}
              advertising expert.
            </h1>
            <p className="left-desc" style={{
              fontSize: 13, color: "var(--muted)", lineHeight: 1.7, maxWidth: 340, fontWeight: 300,
            }}>
              AI-powered growth for every business — no expertise required.
              Launch, optimize, and scale campaigns automatically.
            </p>
          </div>
          <div className="fade-up delay-2 stats-row">
            {[["10×", "Faster campaigns"], ["98%", "Automation rate"], ["$0", "Setup cost"]].map(([val, label]) => (
              <div key={val}>
                <div style={{ fontWeight: 700, fontSize: 22, color: "var(--text)" }}>{val}</div>
                <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="auth-right">
          <div className="auth-right-inner">
            <div className="mobile-topbar fade-up"><LogoBar /></div>

            <div className="auth-card fade-up">
              <div style={{
                position: "absolute", top: -80, left: -80, width: 220, height: 220,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(91,110,245,0.12) 0%, transparent 70%)",
                pointerEvents: "none",
              }} />
              <div style={{
                position: "absolute", bottom: -40, right: -40, width: 160, height: 160,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(155,107,240,0.08) 0%, transparent 70%)",
                pointerEvents: "none",
              }} />

              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ marginBottom: 20 }}>
                  <h2 className="card-heading">
                    {isSignIn ? "Welcome back" : "Get started today"}
                  </h2>
                  <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6 }}>
                    {isSignIn ? (
                      <>Don't have an account?{" "}
                        <Link to="/register" style={{ color: "#0095ff", fontWeight: 500, textDecoration: "none" }}>
                          Sign up for free
                        </Link>
                      </>
                    ) : (
                      <>Already have an account?{" "}
                        <Link to="/login" style={{ color: "#0095f2", fontWeight: 500, textDecoration: "none" }}>
                          Sign in
                        </Link>
                      </>
                    )}
                  </p>
                </div>

                {error && (
                  <div className="auth-alert" style={{
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.18)",
                    color: "#fca5a5",
                  }}>{error}</div>
                )}
                {success && (
                  <div className="auth-alert" style={{
                    background: "rgba(52,211,153,0.08)",
                    border: "1px solid rgba(52,211,153,0.18)",
                    color: "#6ee7b7",
                  }}>{success}</div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
                  <button className="btn-social" onClick={() => handleGoogleAuth()} disabled={loading}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
                      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                    </svg>
                    Continue with Google
                  </button>

                  <button className="btn-social" onClick={() => socialAuth(facebookProvider, "Facebook")} disabled={loading}>
                    <FaFacebookF style={{ fontSize: 20, color: "#004fb7", flexShrink: 0 }} />
                    Continue with Facebook
                  </button>
                </div>

                <div className="divider" style={{ marginBottom: 18 }}>Or continue with email</div>

                <form onSubmit={handleEmailAuth} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {!isSignIn && (
                    <div className="fade-up delay-1">
                      <label className="field-label">Full name</label>
                      <input
                        className="inp" name="name" type="text"
                        value={form.name} onChange={handleChange}
                        placeholder="Your full name" autoComplete="name"
                      />
                    </div>
                  )}
                  <div>
                    <label className="field-label">Email</label>
                    <input
                      className="inp" name="email" type="email"
                      value={form.email} onChange={handleChange}
                      placeholder="your@email.com" autoComplete="email" inputMode="email"
                    />
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <label className="field-label" style={{ marginBottom: 0 }}>Password</label>
                      {isSignIn && (
                        <a href="#" style={{ fontSize: 10, color: "#0665ff", textDecoration: "none", fontWeight: 500 }}>
                          Forgot?
                        </a>
                      )}
                    </div>
                    <input
                      className="inp" name="password" type="password"
                      value={form.password} onChange={handleChange}
                      placeholder="••••••••"
                      autoComplete={isSignIn ? "current-password" : "new-password"}
                    />
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button
                      type="button" aria-pressed={remember}
                      onClick={() => setRemember(p => !p)}
                      className="toggle"
                      style={{ background: remember ? "linear-gradient(90deg, #3b82f6, #22d3ee)" : "rgba(255,255,255,0.12)" }}
                    >
                      <span className="toggle-thumb" style={{ left: remember ? 16 : 2 }} />
                    </button>
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>Remember me</span>
                  </div>

                  <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 4 }}>
                    {loading ? "Please wait…" : isSignIn ? "Log In" : "Create Account"}
                  </button>
                </form>

                <p style={{
                  marginTop: 18, fontSize: 10,
                  color: "rgba(238,238,245,0.28)", textAlign: "center", lineHeight: 1.8,
                }}>
                  Having trouble?{" "}
                  <a href="mailto:info@wheedletechnologies.ai" style={{ color: "rgba(238,238,245,0.48)", textDecoration: "underline" }}>
                    Send us an email.
                  </a>
                  <br />
                  By proceeding, you agree to our{" "}
                  <a href="#" style={{ color: "rgba(238,238,245,0.48)", textDecoration: "underline" }}>Terms</a>
                  {" "}and{" "}
                  <a href="#" style={{ color: "rgba(238,238,245,0.48)", textDecoration: "underline" }}>Privacy Policy</a>.
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