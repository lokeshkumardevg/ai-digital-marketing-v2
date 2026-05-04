import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Bell, Search as SearchIcon, LogOut, CheckCircle2, AlertCircle,
  X, Sparkles, Wallet, RefreshCw, Globe, PlusCircle, ChevronDown
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';
import { setActiveWebsite, addWebsite } from '../../store/slices/workspaceSlice';
import { markAllAsRead } from '../../store/slices/notificationSlice';
import toast from 'react-hot-toast';
import axios from 'axios';
import './Header.css';

const API_BASE = 'http://localhost:3000';

type PayStep = 'select' | 'qr' | 'url' | 'card' | 'upi' | 'processing' | 'success';
type PayMethod = 'qr' | 'url' | 'card' | 'upi';

export const Header: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.auth);
  const { websites, activeWebsiteId } = useSelector((state: any) => state.workspace);
  const { items, unreadCount } = useSelector((state: any) => state.notifications);

  // ── Existing state ──
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAddWebsite, setShowAddWebsite] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [addFundsAmount, setAddFundsAmount] = useState(1000);
  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteUrl, setNewSiteUrl] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  // ── Payment gateway state ──
  const [payStep, setPayStep] = useState<PayStep>('select');
  const [payMethod, setPayMethod] = useState<PayMethod>('qr');
  const [cardNum, setCardNum] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [payError, setPayError] = useState('');
  const [countdown, setCountdown] = useState(300);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const walletDropdownRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Wallet balance ──
  const fetchWalletBalance = useCallback(async () => {
    if (!user?.id) return;
    setIsLoadingBalance(true);
    try {
      const res = await axios.get(`${API_BASE}/wallet/balance/${user.id}`);
      setWalletBalance(res.data.balance);
    } catch {
      toast.error('Failed to load wallet balance');
    } finally {
      setIsLoadingBalance(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) fetchWalletBalance();
  }, [user?.id, fetchWalletBalance]);

  // ── Click outside to close dropdowns ──
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setShowNotifications(false);
      if (walletDropdownRef.current && !walletDropdownRef.current.contains(e.target as Node)) {
        setShowWalletModal(false);
        resetPay();
      }
    };
    if (showNotifications || showWalletModal)
      document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications, showWalletModal]);

  // ── Cleanup timer on unmount ──
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  // ── Payment helpers ──
  const fmtCard = (v: string) =>
    v.replace(/\D/g, '').substring(0, 16).replace(/(.{4})/g, '$1 ').trim();

  const fmtExp = (v: string) => {
    const n = v.replace(/\D/g, '');
    return n.length >= 2 ? n.slice(0, 2) + ' / ' + n.slice(2, 4) : n;
  };

  const startTimer = () => {
    setCountdown(300);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timerRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

const processPayment = async () => {
  if (!user?.id) return;

  try {
    setPayStep('processing');

    const res = await axios.post(`${API_BASE}/wallet/credit`, {
      userId: user.id,
      amount: addFundsAmount,
      description: `Wallet topup via ${payMethod}`
    });

    setWalletBalance(res.data.balance);

    setPayStep('success');

  } catch (err) {
    toast.error('Payment failed');
    setPayStep('select');
  }
};

const spendFromWallet = async (amount: number, description = 'Usage') => {
  try {
    const res = await axios.post(`${API_BASE}/wallet/debit`, {
      userId: user.id,
      amount,
      description,
    });

    setWalletBalance(res.data.balance);

  } catch (err: any) {
    toast.error(err?.response?.data?.message || 'Insufficient balance');
  }
};

  const resetPay = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPayStep('select');
    setPayMethod('qr');
    setCardNum(''); setCardExp(''); setCardCvc(''); setCardName('');
    setUpiId(''); setPayError('');
  };

  const handleContinue = () => {
    if (!addFundsAmount || addFundsAmount <= 0) { toast.error('Enter a valid amount'); return; }
    if (payMethod === 'qr') startTimer();
    setPayStep(payMethod);
  };

  // ── Existing handlers ──
  const handleAddWebsite = () => {
    if (!newSiteName || !newSiteUrl) { toast.error('Both Name and URL are required!'); return; }
    dispatch(addWebsite({ name: newSiteName, url: newSiteUrl }));
    toast.success('Website added system-wide!');
    setShowAddWebsite(false);
    setNewSiteName('');
    setNewSiteUrl('');
  };

  const handleLogout = () => { dispatch(logout()); navigate('/login'); };

  const handleBellClick = () => {
    setShowNotifications(prev => !prev);
    if (unreadCount > 0) dispatch(markAllAsRead());
  };

  // ── Shared inline styles ──
  const fieldStyle: React.CSSProperties = {
    width: '100%',
    border: '0.5px solid var(--color-border-secondary, #ddd)',
    borderRadius: 8,
    padding: '8px 10px',
    fontSize: 13,
    background: 'var(--color-background-primary)',
    color: 'var(--color-text-primary)',
    marginBottom: 8,
    outline: 'none',
    boxSizing: 'border-box',
  };

  const methodCardStyle = (active: boolean): React.CSSProperties => ({
    border: active ? '1.5px solid #635bff' : '0.5px solid var(--color-border-secondary, #ddd)',
    borderRadius: 8,
    padding: '10px 8px',
    cursor: 'pointer',
    textAlign: 'center',
    background: active ? '#f0effe' : 'var(--color-background-primary)',
    transition: 'all 0.15s',
  });

  const backBtnStyle: React.CSSProperties = {
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: 13, color: 'var(--color-text-secondary)',
    marginBottom: 10, display: 'flex', alignItems: 'center', gap: 4,
  };

  const secondaryBtnStyle: React.CSSProperties = {
    width: '100%', padding: '8px', borderRadius: 8,
    border: '0.5px solid var(--color-border-secondary, #ddd)',
    background: 'none', color: 'var(--color-text-secondary)',
    fontSize: 13, cursor: 'pointer', marginTop: 6,
  };

  const urlBoxStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 8,
    background: 'var(--color-background-secondary)',
    borderRadius: 8, padding: '8px 10px', marginBottom: 8,
  };

  return (
    <>
      <header className="app-header">

        {/* Search */}
        <div className="header-search">
          <span className="header-search__icon"><SearchIcon size={16} /></span>
          <input
            type="text"
            className="header-search__input"
            placeholder="Search campaigns, settings, analytics..."
          />
        </div>

        {/* Right side actions */}
        <div className="header-actions">

          {/* ── Wallet ── */}
          <div className="wallet-dropdown-wrapper" ref={walletDropdownRef}>
            <div className="wallet-trigger" onClick={() => setShowWalletModal(prev => !prev)}>
              <span className="wallet-trigger__icon"><Wallet size={16} /></span>
              <div className="wallet-trigger__text">
                <span className="wallet-trigger__label">Available Balance</span>
                <span className="wallet-trigger__amount">
                  {isLoadingBalance ? '…' : `$${walletBalance.toLocaleString()}`}
                </span>
              </div>
              <span className="wallet-trigger__chevron"><ChevronDown size={13} /></span>
            </div>

            {showWalletModal && (
              <div className="wallet-dropdown">
                <div className="wallet-dropdown__inner">

                  {/* Header */}
                  <div className="wallet-dropdown__header">
                    <h3 className="wallet-dropdown__title">
                      {payStep === 'select' ? 'Add Funds' : payStep === 'success' ? 'Payment Successful' : 'Add Funds'}
                    </h3>
                    <button className="wallet-dropdown__close" onClick={() => { setShowWalletModal(false); resetPay(); }}>
                      <X size={16} />
                    </button>
                  </div>

                  {/* Balance band — always visible */}
                  <div className="wallet-dropdown__balance-card">
                    <div className="wallet-dropdown__balance-label">Current Balance</div>
                    <div className="wallet-dropdown__balance-amount">${walletBalance.toLocaleString()}</div>
                  </div>

                  {/* ── STEP 1: Amount + Method select ── */}
                  {payStep === 'select' && (
                    <>
                      <span className="wallet-dropdown__add-label">Select amount</span>
                      <div className="wallet-dropdown__preset-grid">
                        {[500, 1000, 5000, 10000].map(amount => (
                          <button
                            key={amount}
                            className={`wallet-dropdown__preset-btn${addFundsAmount === amount ? ' wallet-dropdown__preset-btn--active' : ''}`}
                            onClick={() => setAddFundsAmount(amount)}
                          >
                            ${amount >= 1000 ? `${amount / 1000}k` : amount}
                          </button>
                        ))}
                      </div>

                      <input
                        type="number"
                        className="wallet-dropdown__custom-input"
                        value={addFundsAmount}
                        onChange={e => setAddFundsAmount(Number(e.target.value))}
                        placeholder="Custom amount"
                      />

                      <span className="wallet-dropdown__add-label" style={{ marginTop: 4 }}>Payment method</span>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                        {([
                          ['qr',   '⊞', 'QR Code',       'Scan to pay'],
                          ['url',  '🔗', 'Payment link',  'Share URL'],
                          ['card', '💳', 'Credit / Debit','Enter card'],
                          ['upi',  '⚡', 'UPI / Wallet',  'Instant pay'],
                        ] as [PayMethod, string, string, string][]).map(([id, icon, title, sub]) => (
                          <div key={id} style={methodCardStyle(payMethod === id)} onClick={() => setPayMethod(id)}>
                            <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
                            <div style={{ fontSize: 13, fontWeight: 500, color: "black" }}>{title}</div>
                            <div style={{ fontSize: 11, color: "gray", marginTop: 2 }}>{sub}</div>
                          </div>
                        ))}
                      </div>

                      <button className="wallet-dropdown__add-btn" onClick={handleContinue}>
                        Continue
                      </button>

                      <button className="wallet-dropdown__refresh-btn" onClick={fetchWalletBalance}>
                        <RefreshCw size={13} /> Refresh Balance
                      </button>
                    </>
                  )}

                  {/* ── STEP 2A: QR Code ── */}
                  {payStep === 'qr' && (
                    <>
                      <button style={backBtnStyle} onClick={resetPay}>← Back</button>

                      <div style={{ background: 'var(--color-background-secondary)', borderRadius: 8, padding: 16, textAlign: 'center', marginBottom: 10 }}>
                        {/* QR pattern — replace with a real QR library (e.g. qrcode.react) in production */}
                        <svg width="140" height="140" viewBox="0 0 140 140" style={{ display: 'block', margin: '0 auto 10px' }}>
                          {/* Top-left finder */}
                          <rect x="4" y="4" width="44" height="44" rx="4" fill="var(--color-text-primary)" />
                          <rect x="10" y="10" width="32" height="32" rx="2" fill="var(--color-background-secondary)" />
                          <rect x="16" y="16" width="20" height="20" rx="1" fill="var(--color-text-primary)" />
                          {/* Top-right finder */}
                          <rect x="92" y="4" width="44" height="44" rx="4" fill="var(--color-text-primary)" />
                          <rect x="98" y="10" width="32" height="32" rx="2" fill="var(--color-background-secondary)" />
                          <rect x="104" y="16" width="20" height="20" rx="1" fill="var(--color-text-primary)" />
                          {/* Bottom-left finder */}
                          <rect x="4" y="92" width="44" height="44" rx="4" fill="var(--color-text-primary)" />
                          <rect x="10" y="98" width="32" height="32" rx="2" fill="var(--color-background-secondary)" />
                          <rect x="16" y="104" width="20" height="20" rx="1" fill="var(--color-text-primary)" />
                          {/* Data modules (static pattern) */}
                          {[
                            [56,4],[62,4],[68,4],[56,10],[68,10],[62,16],[56,22],[68,22],
                            [56,56],[62,56],[68,56],[74,56],[80,56],[56,62],[80,62],
                            [56,68],[62,68],[74,68],[80,68],[56,74],[68,74],[80,74],
                            [56,80],[62,80],[68,80],[74,80],
                            [92,56],[98,56],[104,56],[110,56],[116,56],[122,56],[128,56],
                            [92,62],[104,62],[116,62],[128,62],
                            [92,68],[98,68],[104,68],[110,68],[122,68],[128,68],
                            [92,74],[110,74],[128,74],
                            [92,80],[98,80],[104,80],[116,80],[122,80],[128,80],
                            [4,56],[10,56],[16,56],[22,56],[28,56],[34,56],[40,56],
                            [4,62],[16,62],[28,62],[40,62],
                            [4,68],[10,68],[22,68],[34,68],[40,68],
                            [4,74],[28,74],[34,74],
                            [4,80],[10,80],[16,80],[22,80],[40,80],
                          ].map(([x, y], i) => (
                            <rect key={i} x={x} y={y} width="5" height="5" rx="1" fill="var(--color-text-primary)" />
                          ))}
                        </svg>
                        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Scan with any UPI or payment app</div>
                        <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--color-text-primary)', margin: '4px 0' }}>
                          ${addFundsAmount.toLocaleString()}
                        </div>
                        {/* Timer bar */}
                        <div style={{ height: 3, background: 'var(--color-border-tertiary, #eee)', borderRadius: 2, margin: '8px 0 4px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', background: '#635bff', width: `${(countdown / 300) * 100}%`, transition: 'width 1s linear' }} />
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                          {countdown > 0
                            ? `Expires in ${Math.floor(countdown / 60)}:${String(countdown % 60).padStart(2, '0')}`
                            : 'QR expired — go back to refresh'}
                        </div>
                      </div>

                      <div style={urlBoxStyle}>
                        <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', flex: 1, fontFamily: 'monospace', wordBreak: 'break-all' }}>
                          pay.stripe.com/test/qr/{addFundsAmount}
                        </span>
                        <button onClick={() => toast.success('Link copied!')}
                          style={{ border: '0.5px solid var(--color-border-secondary,#ddd)', borderRadius: 6, padding: '3px 8px', fontSize: 11, background: 'var(--color-background-primary)', cursor: 'pointer', color: 'var(--color-text-primary)' }}>
                          Copy
                        </button>
                      </div>

                      <button className="wallet-dropdown__add-btn" onClick={processPayment}>
                        Simulate payment received
                      </button>
                      <button style={secondaryBtnStyle} onClick={resetPay}>Cancel</button>
                    </>
                  )}

                  {/* ── STEP 2B: Payment Link / URL ── */}
                  {payStep === 'url' && (
                    <>
                      <button style={backBtnStyle} onClick={resetPay}>← Back</button>

                      <div style={{ textAlign: 'center', marginBottom: 12 }}>
                        <div style={{ display: 'inline-block', fontSize: 10, padding: '2px 10px', borderRadius: 20, background: 'var(--color-background-info)', color: 'var(--color-text-info)', marginBottom: 6 }}>
                          Link generated
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Share to collect</div>
                        <div style={{ fontSize: 20, fontWeight: 500, color: 'var(--color-text-primary)', marginTop: 2 }}>
                          ${addFundsAmount.toLocaleString()}
                        </div>
                      </div>

                      {[
                        `https://pay.stripe.com/test/link/xK9mZ3pQ-${addFundsAmount}`,
                        `https://rzp.io/l/wallet-topup-${addFundsAmount}`,
                      ].map((url, i) => (
                        <div key={i} style={urlBoxStyle}>
                          <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', flex: 1, fontFamily: 'monospace', wordBreak: 'break-all' }}>{url}</span>
                          <button onClick={() => toast.success('Copied!')}
                            style={{ border: '0.5px solid var(--color-border-secondary,#ddd)', borderRadius: 6, padding: '3px 8px', fontSize: 11, background: 'var(--color-background-primary)', cursor: 'pointer', whiteSpace: 'nowrap', color: 'var(--color-text-primary)' }}>
                            Copy
                          </button>
                        </div>
                      ))}

                      <div style={{ background: 'var(--color-background-secondary)', borderRadius: 8, padding: '10px 12px', marginBottom: 10 }}>
                        {[
                          ['Amount',  `$${addFundsAmount.toLocaleString()}`],
                          ['Status',  'Active'],
                          ['Expires', '24 hours'],
                        ].map(([k, v]) => (
                          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                            <span style={{ color: 'var(--color-text-secondary)' }}>{k}</span>
                            <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{v}</span>
                          </div>
                        ))}
                      </div>

                      <button className="wallet-dropdown__add-btn" onClick={processPayment}>
                        Simulate payment received
                      </button>
                      <button style={secondaryBtnStyle} onClick={resetPay}>Cancel</button>
                    </>
                  )}

                  {/* ── STEP 2C: Card ── */}
                  {payStep === 'card' && (
                    <>
                      <button style={backBtnStyle} onClick={resetPay}>← Back</button>

                      <input style={fieldStyle} placeholder="Card number"
                        value={cardNum} maxLength={19}
                        onChange={e => setCardNum(fmtCard(e.target.value))} />

                      <div style={{ display: 'flex', gap: 8 }}>
                        <input style={{ ...fieldStyle, flex: 1 }} placeholder="MM / YY"
                          value={cardExp} maxLength={7}
                          onChange={e => setCardExp(fmtExp(e.target.value))} />
                        <input style={{ ...fieldStyle, flex: 1 }} placeholder="CVC"
                          value={cardCvc} maxLength={3}
                          onChange={e => setCardCvc(e.target.value.replace(/\D/g, ''))} />
                      </div>

                      <input style={fieldStyle} placeholder="Name on card"
                        value={cardName}
                        onChange={e => setCardName(e.target.value)} />

                      {payError && (
                        <p style={{ color: 'var(--color-text-danger, red)', fontSize: 12, marginBottom: 8 }}>{payError}</p>
                      )}

                      <button className="wallet-dropdown__add-btn" onClick={() => {
                        if (cardNum.replace(/\s/g, '').length < 16 || !cardExp || cardCvc.length < 3 || !cardName.trim()) {
                          setPayError('Please fill in all card details.'); return;
                        }
                        setPayError('');
                      }}>
                        Pay ${addFundsAmount.toLocaleString()}
                      </button>
                      <p style={{ fontSize: 11, textAlign: 'center', color: 'var(--color-text-secondary)', marginTop: 6 }}>
                        Test card: 4242 4242 4242 4242 · 12/28 · 123
                      </p>
                    </>
                  )}

                  {/* ── STEP 2D: UPI ── */}
                  {payStep === 'upi' && (
                    <>
                      <button style={backBtnStyle} onClick={resetPay}>← Back</button>

                      <input style={fieldStyle} placeholder="yourname@upi or phone@paytm"
                        value={upiId}
                        onChange={e => setUpiId(e.target.value)} />
                      <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 10 }}>
                        e.g. 9876543210@ybl · name@okaxis
                      </p>

                      <div style={{ background: 'var(--color-background-secondary)', borderRadius: 8, padding: '10px 12px', marginBottom: 10 }}>
                        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 8 }}>Or choose app</div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {([
                            ['PhonePe', 'name@ybl'],
                            ['Google Pay', 'name@okaxis'],
                            ['Paytm', 'name@paytm'],
                          ] as [string, string][]).map(([label, id]) => (
                            <button key={label} onClick={() => setUpiId(id)}
                              style={{ flex: 1, border: '0.5px solid var(--color-border-secondary,#ddd)', borderRadius: 8, padding: '7px 4px', background: 'var(--color-background-primary)', cursor: 'pointer', fontSize: 11, color: 'var(--color-text-primary)' }}>
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {payError && (
                        <p style={{ color: 'var(--color-text-danger, red)', fontSize: 12, marginBottom: 8 }}>{payError}</p>
                      )}

                      <button className="wallet-dropdown__add-btn" onClick={() => {
                        if (!upiId.includes('@')) { setPayError('Enter a valid UPI ID.'); return; }
                        setPayError('');
                      }}>
                        Pay ${addFundsAmount.toLocaleString()}
                      </button>
                    </>
                  )}

                  {/* ── STEP 3: Processing ── */}
                  {payStep === 'processing' && (
                    <div style={{ textAlign: 'center', padding: '28px 0' }}>
                      <div style={{
                        width: 28, height: 28,
                        border: '2.5px solid var(--color-border-tertiary, #eee)',
                        borderTopColor: '#635bff',
                        borderRadius: '50%',
                        margin: '0 auto 12px',
                        animation: 'wallet-spin 0.8s linear infinite',
                      }} />
                      <style>{`@keyframes wallet-spin { to { transform: rotate(360deg); } }`}</style>
                      <div style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>Processing payment…</div>
                    </div>
                  )}

                  {/* ── STEP 4: Success ── */}
                  {payStep === 'success' && (
                    <div style={{ textAlign: 'center', padding: '12px 0' }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: '50%',
                        background: 'var(--color-background-success)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 10px',
                      }}>
                        <CheckCircle2 size={22} color="var(--color-text-success)" />
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 4 }}>
                        Payment successful
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                        Wallet topped up
                      </div>
                      <div style={{ fontSize: 26, fontWeight: 500, color: 'var(--color-text-success)', marginBottom: 4 }}>
                        +${addFundsAmount.toLocaleString()}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 14 }}>
                        New balance: ${walletBalance.toLocaleString()}
                      </div>
                      <div style={{ background: 'var(--color-background-secondary)', borderRadius: 8, padding: '8px 12px', marginBottom: 12, fontSize: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--color-text-secondary)' }}>Transaction ID</span>
                          <span style={{ fontFamily: 'monospace', color: 'var(--color-text-secondary)' }}>
                            TXN{Math.random().toString(36).substring(2, 8).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <button className="wallet-dropdown__add-btn" onClick={() => { resetPay(); setShowWalletModal(false); }}>
                        Done
                      </button>
                    </div>
                  )}

                </div>
              </div>
            )}
          </div>

          {/* ── Site Switcher ── */}
          {/* <div className="site-switcher">
            <span className="site-switcher__globe"><Globe size={15} /></span>
            <div className="site-switcher__select-wrapper">
              <select
                className="site-switcher__select"
                value={activeWebsiteId || ''}
                onChange={e => dispatch(setActiveWebsite(e.target.value))}
              >
                {websites.map((site: any) => (
                  <option key={site.id} value={site.id}>{site.name}</option>
                ))}
              </select>
              <span className="site-switcher__chevron"><ChevronDown size={13} /></span>
            </div>
            <div className="site-switcher__divider" />
            <button className="site-switcher__add-btn" onClick={() => setShowAddWebsite(true)} title="Add New Domain">
              <PlusCircle size={15} />
            </button>
          </div> */}

          {/* ── Ask AI ── */}
          <button className="btn-ask-ai" onClick={() => navigate('/chatbot')}>
            <Sparkles size={15} />
            <span>Ask AI</span>
          </button>

          {/* ── Bell + User ── */}
          <div className="header-right-group">
            <div className="notif-bell-wrapper" ref={dropdownRef}>
              <button className="notif-bell" onClick={handleBellClick}>
                <Bell size={19} color="var(--accent-primary)" />
                {unreadCount > 0 && <span className="notif-bell__badge">{unreadCount}</span>}
              </button>

              {showNotifications && (
                <div className="notif-dropdown">
                  <div className="notif-dropdown__header">
                    <span className="notif-dropdown__title">Notifications</span>
                    <div className="notif-dropdown__header-actions">
                      <button className="notif-dropdown__mark-read" onClick={() => dispatch(markAllAsRead())}>
                        Mark all read
                      </button>
                      <button className="notif-dropdown__close" onClick={() => setShowNotifications(false)}>
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="notif-dropdown__list">
                    {items.length === 0 ? (
                      <div className="notif-dropdown__empty">No new updates</div>
                    ) : (
                      items.map((notif: any) => (
                        <div key={notif.id} className={`notif-item${notif.read ? ' notif-item--read' : ''}`}>
                          <div className="notif-item__icon">
                            {notif.type === 'success'
                              ? <CheckCircle2 size={15} color="var(--success)" />
                              : <AlertCircle size={15} color="var(--info)" />}
                          </div>
                          <div className="notif-item__body">
                            <span className="notif-item__title">{notif.title}</span>
                            <span className="notif-item__message">{notif.message}</span>
                            <span className="notif-item__time">{new Date(notif.time).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User */}
            <div className="header-user">
              <div className="header-user__info">
                <div className="header-user__name">{user?.name || 'Administrator'}</div>
                <div className="header-user__tier">{user?.subscriptionTier || 'Free'}</div>
              </div>
              <div className="header-user__avatar">{user?.name?.charAt(0) || 'A'}</div>
              <button className="header-user__logout" onClick={handleLogout} title="Log Out">
                <LogOut size={15} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Add Website Modal ── */}
      {/* {showAddWebsite && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowAddWebsite(false); }}>
          <div className="modal-panel">
            <div className="modal-panel__header">
              <h2 className="modal-panel__title">
                Sync <span className="text-gradient">Website</span>
              </h2>
              <button className="modal-panel__close" onClick={() => setShowAddWebsite(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="input-group">
              <label>Project Name</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Acme Global Store"
                value={newSiteName}
                onChange={e => setNewSiteName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="input-group">
              <label>Project URL</label>
              <input
                type="text"
                className="input-field"
                placeholder="https://acme-store.com"
                value={newSiteUrl}
                onChange={e => setNewSiteUrl(e.target.value)}
              />
            </div>
            <button className="btn-primary" onClick={handleAddWebsite}>
              Start AI Inception
            </button>
          </div>
        </div>
      )} */}
    </>
  );
};