import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginUser, registerUser } from "../../store/slices/authSlice";
import { FaFacebookF, FaGoogle } from "react-icons/fa";
import { auth, googleProvider, facebookProvider } from "../lib/firebase";
import { signInWithPopup } from "firebase/auth";
import worldMap from "../assets/images/worldmap.png";

function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [mode, setMode] = useState("signup");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [user, setUser] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    // If the token is already locally present, navigate straight to Dashboard
    if (localStorage.getItem("access_token")) {
      navigate("/crm");
    }
    setAuthLoading(false);
  }, [navigate]);

  const handleChange = (e) => {
    setError("");
    setSuccess("");
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const resetMessages = () => {
    setError("");
    setSuccess("");
  };

  const getFirebaseError = (code) => {
    switch (code) {
      case "auth/email-already-in-use":
        return "This email is already registered.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/weak-password":
        return "Password should be at least 6 characters.";
      case "auth/user-not-found":
        return "No account found with this email.";
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "Invalid email or password.";
      case "auth/popup-closed-by-user":
        return "Login popup was closed before completing sign in.";
      case "auth/account-exists-with-different-credential":
        return "An account already exists with the same email using another login method.";
      default:
        return "Something went wrong. Please try again.";
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    resetMessages();

    const email = form.email.trim();
    const password = form.password.trim();
    const name = form.name.trim();

    if (!email || !password || (mode === "signup" && !name)) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);

      if (mode === "signup") {
        await dispatch(registerUser({ email, password, name })).unwrap();
        setSuccess("Account created successfully. Redirecting to dashboard...");
        setTimeout(() => navigate("/crm"), 1000);
      } else {
        await dispatch(loginUser({ email, password })).unwrap();
        setSuccess("Signed in successfully. Redirecting to dashboard...");
        setTimeout(() => navigate("/crm"), 1000);
      }
    } catch (err) {
      setError(err?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      resetMessages();
      await signInWithPopup(auth, googleProvider);
      setSuccess("Signed in with Google.");
    } catch (err) {
      setError(getFirebaseError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookAuth = async () => {
    try {
      setLoading(true);
      resetMessages();
      await signInWithPopup(auth, facebookProvider);
      setSuccess("Signed in with Facebook.");
    } catch (err) {
      setError(getFirebaseError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      setSuccess("Logged out successfully.");
      setMode("signin");
    } catch {
      setError("Failed to log out.");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError("");
    setSuccess("");
    setForm({
      name: "",
      email: "",
      password: "",
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-sm text-white/70">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden bg-black text-white">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="h-px w-full bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.08),transparent)]" />
      </div>

      <main className="relative flex min-h-screen items-center justify-center px-4 py-10">
        {/* world map */}
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
          <img
            src={worldMap}
            alt="World map"
            className="w-[920px] max-w-[180%] brightness-100"
          />
        </div>

        {/* subtle top/bottom frame lines */}
        <div className="pointer-events-none absolute top-16 left-0 right-0 mx-auto h-px max-w-[1280px] bg-[linear-gradient(to_right,transparent,rgba(29,62,218,0.18),transparent)]" />
        <div className="pointer-events-none absolute bottom-16 left-0 right-0 mx-auto h-px max-w-[1280px] bg-[linear-gradient(to_right,transparent,rgba(29,62,218,0.12),transparent)]" />

        <section className="relative z-10 flex w-full justify-center">
          <div className="w-full max-w-[430px] text-center">
            <h1 className="text-[30px] font-semibold leading-tight sm:text-[34px]">
              Get Started Today
            </h1>

            {mode === "signin" ? (
              <p className="mt-2 text-[12px] text-white/70">
                Have an account, login here:
              </p>
            ) : (
              <p className="mt-2 text-[12px] leading-5 text-white/70">
                Create your account and unlock smarter,
                <br />
                AI-powered growth for your business.
              </p>
            )}

            <div className="relative mx-auto mt-8 w-full max-w-[390px] rounded-[26px] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-5 py-6 sm:px-6 backdrop-blur-[18px] shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_25px_80px_rgba(0,0,0,0.6)]">
              <div className="pointer-events-none absolute inset-0 rounded-[26px] bg-[radial-gradient(circle_at_25%_30%,rgba(255,255,255,0.06),transparent_25%),radial-gradient(circle_at_75%_72%,rgba(255,255,255,0.04),transparent_22%)]" />

              <div className="relative z-10">
                {mode === "signup" && (
                  <>
                    <h2 className="text-[14px] font-semibold text-white">
                      Register with
                    </h2>

                    <div className="mt-4 flex items-center justify-center gap-4">
                      <button
                        type="button"
                        onClick={handleFacebookAuth}
                        disabled={loading}
                        className="flex h-[46px] w-[46px] items-center justify-center rounded-[13px] border border-white/20 bg-white/[0.03] text-white transition hover:bg-white/[0.06] disabled:opacity-60"
                      >
                        <FaFacebookF className="text-[15px]" />
                      </button>

                      <button
                        type="button"
                        onClick={handleGoogleAuth}
                        disabled={loading}
                        className="flex h-[46px] w-[46px] items-center justify-center rounded-[13px] border border-white/20 bg-white/[0.03] text-white transition hover:bg-white/[0.06] disabled:opacity-60"
                      >
                        <FaGoogle className="text-[15px]" />
                      </button>
                    </div>

                    <p className="mt-4 text-[12px] font-semibold text-white/85">or</p>
                  </>
                )}

                {error && (
                  <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-left text-[11px] text-red-300">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-left text-[11px] text-emerald-300">
                    {success}
                  </div>
                )}

                <form
                  onSubmit={handleEmailAuth}
                  className={mode === "signup" ? "mt-4 space-y-3" : "space-y-3"}
                >
                  {mode === "signup" && (
                    <div className="text-left">
                      <label className="mb-1.5 block text-[11px] font-medium text-white">
                        Name
                      </label>
                      <input
                        name="name"
                        type="text"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Your full name"
                        className="h-[40px] w-full rounded-full border border-white/22 bg-[rgba(255,255,255,0.02)] px-4 text-[11px] text-white outline-none placeholder:text-white/35 focus:border-[#4f72ff]"
                      />
                    </div>
                  )}

                  <div className="text-left">
                    <label className="mb-1.5 block text-[11px] font-medium text-white">
                      Email
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Your email address"
                      className="h-[40px] w-full rounded-full border border-white/22 bg-[rgba(255,255,255,0.02)] px-4 text-[11px] text-white outline-none placeholder:text-white/35 focus:border-[#4f72ff]"
                    />
                  </div>

                  <div className="text-left">
                    <label className="mb-1.5 block text-[11px] font-medium text-white">
                      Password
                    </label>
                    <input
                      name="password"
                      type="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Your password"
                      className="h-[40px] w-full rounded-full border border-white/22 bg-[rgba(255,255,255,0.02)] px-4 text-[11px] text-white outline-none placeholder:text-white/35 focus:border-[#4f72ff]"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      aria-pressed={remember}
                      onClick={() => setRemember((prev) => !prev)}
                      className={`relative h-[15px] w-[28px] rounded-full transition ${
                        remember ? "bg-[#1681ff]" : "bg-white/20"
                      }`}
                    >
                      <span
                        className={`absolute top-[2px] h-[11px] w-[11px] rounded-full bg-white transition-all ${
                          remember ? "right-[2px]" : "left-[2px]"
                        }`}
                      />
                    </button>

                    <span className="text-[10px] text-white/70">Remember me</span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 h-[38px] w-full rounded-[8px] bg-[#1437d6] text-[10px] font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#1c44f5] disabled:opacity-60"
                  >
                    {loading
                      ? "Please wait..."
                      : mode === "signup"
                      ? "SIGN UP"
                      : "LOG IN"}
                  </button>
                </form>

                {mode === "signin" && (
                  <>
                    <h3 className="mt-6 text-[14px] font-semibold text-white">
                      Login with
                    </h3>

                    <div className="mt-4 flex items-center justify-center gap-4">
                      <button
                        type="button"
                        onClick={handleFacebookAuth}
                        disabled={loading}
                        className="flex h-[46px] w-[46px] items-center justify-center rounded-[13px] border border-white/20 bg-white/[0.03] text-white transition hover:bg-white/[0.06] disabled:opacity-60"
                      >
                        <FaFacebookF className="text-[15px]" />
                      </button>

                      <button
                        type="button"
                        onClick={handleGoogleAuth}
                        disabled={loading}
                        className="flex h-[46px] w-[46px] items-center justify-center rounded-[13px] border border-white/20 bg-white/[0.03] text-white transition hover:bg-white/[0.06] disabled:opacity-60"
                      >
                        <FaGoogle className="text-[15px]" />
                      </button>
                    </div>

                    <p className="mt-4 text-[12px] font-semibold text-white/85">or</p>
                  </>
                )}

                <p className="mt-6 text-center text-[10px] text-white/65">
                  {mode === "signup" ? "Already have an account? " : "Don't have an account? "}
                  <button
                    type="button"
                    onClick={() =>
                      switchMode(mode === "signup" ? "signin" : "signup")
                    }
                    className="font-semibold text-white"
                  >
                    {mode === "signup" ? "Sign in" : "Sign up"}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="h-px w-full bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.08),transparent)]" />
      </div>
    </div>
  );
}

export default Register;