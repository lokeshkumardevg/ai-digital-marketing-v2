import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  CreditCard, Zap, Crown, TrendingUp, ArrowUpRight, ArrowDownLeft,
  RefreshCw, CheckCircle, Sparkles, Shield, Rocket, Building2,
  ChevronLeft, ChevronRight, AlertTriangle, X, Wallet, BarChart2,
  Activity, DollarSign, Clock, Ban
} from 'lucide-react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

// ─────────────────────────────────────────────────────────────
// API CONFIG
// ─────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL;

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token') || '';
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'API error');
  }
  return res.json();
}

const api = {
  get:  <T,>(path: string)                 => apiFetch<T>(path),
  post: <T,>(path: string, body: unknown)  => apiFetch<T>(path, { method: 'POST', body: JSON.stringify(body) }),
};

// ─────────────────────────────────────────────────────────────
// Types — aligned 1-to-1 with what the backend actually returns
// ─────────────────────────────────────────────────────────────

/** GET /billing/wallet/balance/:userId */
interface WalletBalance { balance: number }

/** GET /billing/subscription/:userId */
interface Subscription {
  plan: string;
  status: string;
  aiTokensUsedCurrentBillingCycle: number;
  aiTokenLimit: number;
  currentPeriodEnd: string;
  cancelledAt?: string;           // present when status === 'cancelled'
  cancelAtPeriodEnd?: boolean;    // optional flag (if you add it later)
}

/** GET /billing/plans — returns { free: Plan, pro: Plan, enterprise: Plan } */
interface Plan { name: string; price: number; limit: number; features: string[] }
type PlansMap = Record<string, Plan>;

/** GET /billing/wallet/transactions/:userId */
interface Transaction {
  _id: string;
  createdAt: string;
  description: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
}
interface TxnResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  totalPages: number;
}

/**
 * GET /billing/analytics/:userId
 * Backend returns: Array<{ month: string; spend: number; roi: number }>
 * (last 6 months in chronological order)
 */
interface AnalyticsMonth { month: string; spend: number; roi: number }
type AnalyticsResponse = AnalyticsMonth[];

/** Derived analytics we compute client-side from raw data */
interface DerivedAnalytics {
  monthlySpend: number;          // current month spend from analytics array
  totalSpend: number;            // sum of all 6 months spend
  avgRoi: number;                // average ROI across months
  chartLabels: string[];
  chartSpend: number[];
  chartRoi: number[];
}

type TxnFilter = 'all' | 'CREDIT' | 'DEBIT';
type ChartRange = '1m' | '3m' | '6m';

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

.bl {
  --bg-base: var(--bg-primary);
  --bg-1: var(--bg-card);
  --bg-2: var(--bg-elevated);
  --bg-3: var(--bg-elevated);
  --bg-4: var(--glass-border);
  --border: var(--glass-border);
  --border2: var(--glass-border);
  --border3: var(--glass-border);
  --blue:      #3b82f6;
  --blue-dim:  #1d4ed8;
  --blue-glow: rgba(59,130,246,.18);
  --blue-soft: rgba(59,130,246,.08);
  --cyan:      #22d3ee;
  --green:     #10b981;
  --green-soft:rgba(16,185,129,.1);
  --red:       #ef4444;
  --red-soft:  rgba(239,68,68,.1);
  --amber:     #f59e0b;
  --amber-soft:rgba(245,158,11,.1);
  --text: var(--text-primary);
  --text2: var(--text-secondary);
  --text3: var(--text-dim);
  --r:         10px;
  --r-lg:      14px;
  --r-xl:      18px;
  --glow:      0 0 32px rgba(59,130,246,.12);
  --glow-sm:   0 0 16px rgba(59,130,246,.08);
}

.bl * { box-sizing: border-box; margin: 0; padding: 0; }
.bl {
  font-family: 'Outfit', sans-serif;
  background: var(--bg-base);
  min-height: 100vh;
  color: var(--text);
  padding: 36px 32px 60px;
  max-width: 1320px;
  margin: 0 auto;
}

.bl-header {
  display: flex; justify-content: space-between; align-items: flex-end;
  margin-bottom: 40px; padding-bottom: 24px;
  border-bottom: 1px solid var(--border2);
}
.bl-title {
  font-size: 2.6rem; font-weight: 800; line-height: 1.06;
  letter-spacing: -0.03em; color: var(--text);
}
.bl-title span {
  background: linear-gradient(135deg, #3b82f6 0%, #22d3ee 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}
.bl-subtitle { color: var(--text2); font-size: 0.87rem; margin-top: 6px; font-weight: 300; }
.bl-header-right { display: flex; align-items: center; gap: 10px; }

.bl-sec {
  display: flex; align-items: center; gap: 8px;
  font-size: 0.66rem; font-weight: 700; letter-spacing: .15em;
  text-transform: uppercase; color: var(--text3); margin-bottom: 16px;
}
.bl-sec::after { content: ''; flex: 1; height: 1px; background: var(--border); }

.bl-card { background: var(--bg-1); border: 1px solid var(--border); border-radius: var(--r-lg); }

.bl-metrics { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-bottom: 36px; }
.bl-metric {
  background: var(--bg-1); border: 1px solid var(--border);
  border-radius: var(--r-lg); padding: 20px 22px;
  transition: border-color .2s, box-shadow .2s;
  position: relative; overflow: hidden;
}
.bl-metric::before {
  content: ''; position: absolute; top: -30px; right: -30px;
  width: 100px; height: 100px; border-radius: 50%;
  background: var(--blue-glow); pointer-events: none; opacity: 0; transition: opacity .3s;
}
.bl-metric:hover { border-color: var(--border2); box-shadow: var(--glow-sm); }
.bl-metric:hover::before { opacity: 1; }
.bl-metric-icon {
  width: 34px; height: 34px; border-radius: var(--r);
  display: flex; align-items: center; justify-content: center;
  background: var(--blue-soft); border: 1px solid var(--border2); margin-bottom: 14px;
}
.bl-metric-label { font-size: .71rem; font-weight: 500; color: var(--text3); letter-spacing: .04em; margin-bottom: 6px; }
.bl-metric-value { font-size: 1.9rem; font-weight: 700; line-height: 1; letter-spacing: -0.02em; color: var(--text); }
.bl-metric-sub   { font-size: .74rem; color: var(--text2); margin-top: 6px; font-weight: 300; }

.bl-progress-track { height: 4px; background: var(--bg-3); border-radius: 2px; overflow: hidden; margin-top: 8px; }
.bl-progress-fill  { height: 100%; border-radius: 2px; transition: width .9s cubic-bezier(.4,0,.2,1); }

.bl-badge {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: .62rem; font-weight: 700; letter-spacing: .06em;
  padding: 3px 9px; border-radius: 50px; text-transform: uppercase; margin-top: 10px;
}
.bl-badge-green  { background: var(--green-soft); color: var(--green); border: 1px solid rgba(16,185,129,.2); }
.bl-badge-blue   { background: var(--blue-soft);  color: var(--blue);  border: 1px solid var(--border2); }
.bl-badge-amber  { background: var(--amber-soft); color: var(--amber); border: 1px solid rgba(245,158,11,.2); }
.bl-badge-red    { background: var(--red-soft);   color: var(--red);   border: 1px solid rgba(239,68,68,.2); }

.bl-chart-card {
  background: var(--bg-1); border: 1px solid var(--border);
  border-radius: var(--r-xl); padding: 26px; margin-bottom: 36px;
}
.bl-chart-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  margin-bottom: 20px; flex-wrap: wrap; gap: 12px;
}
.bl-chart-title { font-size: 1rem; font-weight: 700; color: var(--text); }
.bl-chart-meta  { font-size: .78rem; color: var(--text2); margin-top: 3px; font-weight: 300; }
.bl-tabs { display: flex; gap: 4px; }
.bl-tab {
  font-size: .7rem; font-weight: 700; padding: 5px 14px;
  border-radius: 50px; border: 1px solid var(--border);
  background: transparent; color: var(--text3); cursor: pointer;
  transition: all .15s; letter-spacing: .04em;
}
.bl-tab:hover  { border-color: var(--border2); color: var(--text2); }
.bl-tab.active { background: var(--blue); color: #fff; border-color: var(--blue); box-shadow: 0 0 12px rgba(59,130,246,.35); }
.bl-chart-legend { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 16px; }
.bl-legend-item  { display: flex; align-items: center; gap: 6px; font-size: .73rem; color: var(--text2); }
.bl-legend-dot   { width: 10px; height: 10px; border-radius: 2px; flex-shrink: 0; }

.bl-plans { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; margin-bottom: 36px; }
.bl-plan {
  background: var(--bg-1); border: 1px solid var(--border);
  border-radius: var(--r-xl); padding: 24px; position: relative;
  transition: border-color .2s, box-shadow .2s;
}
.bl-plan:hover:not(.bl-plan-current) { border-color: var(--border2); box-shadow: var(--glow-sm); }
.bl-plan-current {
  border: 1px solid var(--blue);
  box-shadow: 0 0 0 1px rgba(59,130,246,.2), var(--glow-sm);
  background: linear-gradient(160deg, rgba(59,130,246,.05) 0%, var(--bg-1) 60%);
}
.bl-plan-popular { border: 1px solid rgba(34,211,238,.4); box-shadow: 0 0 0 1px rgba(34,211,238,.1), 0 0 24px rgba(34,211,238,.06); }
.bl-plan-icon {
  width: 38px; height: 38px; border-radius: var(--r);
  display: flex; align-items: center; justify-content: center; margin-bottom: 14px;
}
.bl-plan-name  { font-size: 1rem; font-weight: 700; color: var(--text); margin-bottom: 4px; }
.bl-plan-price { font-size: 2.1rem; font-weight: 800; letter-spacing: -0.03em; line-height: 1; margin-bottom: 16px; }
.bl-plan-price span { font-size: .85rem; font-weight: 400; color: var(--text2); }
.bl-plan-features { list-style: none; display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
.bl-plan-features li {
  display: flex; align-items: flex-start; gap: 8px;
  font-size: .8rem; color: var(--text2); font-weight: 300; line-height: 1.5;
}
.bl-plan-tag {
  position: absolute; top: 14px; right: 14px;
  font-size: .6rem; font-weight: 700; letter-spacing: .08em;
  text-transform: uppercase; padding: 3px 10px; border-radius: 50px;
}
.bl-plan-tag-blue { background: var(--blue-soft); color: var(--blue);  border: 1px solid var(--border2); }
.bl-plan-tag-cyan { background: rgba(34,211,238,.08); color: var(--cyan); border: 1px solid rgba(34,211,238,.25); }

.bl-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 7px;
  font-family: 'Outfit', sans-serif; font-weight: 700; font-size: .78rem;
  letter-spacing: .04em; border: none; cursor: pointer;
  border-radius: var(--r); transition: all .18s; padding: 10px 18px; width: 100%;
}
.bl-btn-primary { background: var(--blue); color: #fff; box-shadow: 0 0 0 0 rgba(59,130,246,.4); }
.bl-btn-primary:hover:not(:disabled) { background: #2563eb; transform: translateY(-1px); box-shadow: 0 4px 18px rgba(59,130,246,.45); }
.bl-btn-cyan { background: linear-gradient(135deg,#0891b2,#22d3ee); color: #fff; }
.bl-btn-cyan:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 18px rgba(34,211,238,.35); }
.bl-btn-danger { background: var(--red-soft); color: var(--red); border: 1px solid rgba(239,68,68,.25); }
.bl-btn-danger:hover:not(:disabled) { background: rgba(239,68,68,.18); }
.bl-btn-ghost  { background: transparent; color: var(--text2); border: 1px solid var(--border); }
.bl-btn-ghost:hover:not(:disabled) { border-color: var(--border2); color: var(--text); }
.bl-btn-outline{ background: transparent; color: var(--text); border: 1px solid var(--border2); }
.bl-btn-outline:hover:not(:disabled) { border-color: var(--blue); color: var(--blue); }
.bl-btn:disabled { opacity: .38; cursor: not-allowed; transform: none !important; box-shadow: none !important; }
.bl-btn-sm { padding: 7px 14px; font-size: .72rem; }

.bl-wallet {
  background: var(--bg-elevated); border: 1px solid var(--accent-primary);
  border: 1px solid var(--border2); border-radius: var(--r-xl); padding: 26px;
  display: flex; flex-direction: column; gap: 22px;
  position: relative; overflow: hidden;
}
.bl-wallet::before {
  content: ''; position: absolute; top: -70px; right: -70px;
  width: 200px; height: 200px; border-radius: 50%;
  background: radial-gradient(circle, rgba(59,130,246,.15) 0%, transparent 70%); pointer-events: none;
}
.bl-wallet::after {
  content: ''; position: absolute; bottom: -50px; left: -30px;
  width: 140px; height: 140px; border-radius: 50%;
  background: radial-gradient(circle, rgba(34,211,238,.07) 0%, transparent 70%); pointer-events: none;
}
.bl-wallet-label { font-size: .68rem; letter-spacing: .12em; text-transform: uppercase; color: var(--text3); display: flex; align-items: center; gap: 6px; }
.bl-wallet-amount { font-size: 2.8rem; font-weight: 800; letter-spacing: -0.03em; line-height: 1; color: var(--text); }
.bl-wallet-amount span { font-size: 1.2rem; color: var(--blue); }
.bl-wallet-sub { font-size: .72rem; color: var(--text3); margin-top: 4px; }
.bl-pills { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; }
.bl-pill {
  padding: 8px 4px; border-radius: var(--r); border: 1px solid var(--border);
  background: var(--bg-3); color: var(--text2); font-size: .75rem; font-weight: 600;
  cursor: pointer; transition: all .14s; text-align: center;
}
.bl-pill:hover { border-color: var(--border2); color: var(--text); }
.bl-pill.sel { border-color: var(--blue); background: var(--blue-soft); color: var(--blue); box-shadow: 0 0 10px rgba(59,130,246,.2); }
.bl-recharge-btn {
  width: 100%; padding: 13px;
  background: linear-gradient(135deg, #2563eb, #3b82f6); color: #fff;
  font-family: 'Outfit', sans-serif; font-weight: 700; font-size: .85rem;
  border: none; border-radius: var(--r); cursor: pointer;
  transition: all .18s; display: flex; align-items: center; justify-content: center;
  gap: 8px; letter-spacing: .03em;
}
.bl-recharge-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(59,130,246,.45); }
.bl-recharge-btn:disabled { opacity: .45; cursor: not-allowed; transform: none; }
.bl-wallet-secure { font-size: .66rem; color: var(--text3); text-align: center; letter-spacing: .04em; }

.bl-two-col { display: grid; grid-template-columns: 270px 1fr; gap: 18px; margin-bottom: 36px; }

.bl-txn-card { background: var(--bg-1); border: 1px solid var(--border); border-radius: var(--r-xl); overflow: hidden; }
.bl-txn-header {
  padding: 16px 22px; border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
}
.bl-txn-title { font-size: .9rem; font-weight: 700; color: var(--text); }
.bl-txn-controls { display: flex; align-items: center; gap: 8px; }
.bl-filter-select {
  font-family: 'Outfit', sans-serif; font-size: .72rem; color: var(--text2);
  background: var(--bg-3); border: 1px solid var(--border);
  padding: 5px 12px; border-radius: 50px; cursor: pointer; outline: none; transition: border-color .15s;
}
.bl-filter-select:hover { border-color: var(--border2); }
.bl-table-wrap { overflow-x: auto; }
table.bl-table { width: 100%; border-collapse: collapse; }
.bl-table th {
  font-size: .63rem; letter-spacing: .1em; text-transform: uppercase;
  color: var(--text3); font-weight: 700; padding: 10px 22px;
  text-align: left; border-bottom: 1px solid var(--border); white-space: nowrap;
}
.bl-table td {
  padding: 13px 22px; font-size: .82rem; font-weight: 300;
  border-bottom: 1px solid var(--border); vertical-align: middle; color: var(--text2);
}
.bl-table tr:last-child td { border-bottom: none; }
.bl-table tr:hover td { background: var(--bg-2); }
.bl-type-pill {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 3px 10px; border-radius: 50px; font-size: .65rem; font-weight: 700; letter-spacing: .05em;
}
.bl-amount { font-family: 'JetBrains Mono', monospace; font-weight: 500; font-size: .83rem; }
.bl-amount.credit { color: var(--green); }
.bl-amount.debit  { color: var(--red); }

.bl-pagination {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 22px; border-top: 1px solid var(--border);
}
.bl-page-info { font-size: .74rem; color: var(--text3); font-weight: 300; }
.bl-page-btns { display: flex; gap: 4px; }
.bl-page-btn {
  width: 30px; height: 30px; border-radius: var(--r); border: 1px solid var(--border);
  background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all .12s; color: var(--text2); font-size: .74rem; font-weight: 700;
}
.bl-page-btn:hover:not(:disabled) { border-color: var(--blue); color: var(--blue); }
.bl-page-btn:disabled { opacity: .25; cursor: not-allowed; }
.bl-page-btn.active { background: var(--blue); color: #fff; border-color: var(--blue); }

.bl-analytics { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; margin-bottom: 36px; }
.bl-analytic { background: var(--bg-1); border: 1px solid var(--border); border-radius: var(--r-lg); padding: 18px 20px; }
.bl-analytic-label { font-size: .68rem; color: var(--text3); font-weight: 500; letter-spacing: .04em; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
.bl-analytic-value { font-size: 1.5rem; font-weight: 700; color: var(--text); line-height: 1; }
.bl-analytic-sub   { font-size: .72rem; color: var(--text2); margin-top: 5px; }

.bl-toast {
  position: fixed; bottom: 28px; right: 28px;
  background: var(--bg-2); color: var(--text);
  padding: 13px 18px; border-radius: var(--r);
  font-size: .82rem; box-shadow: 0 8px 32px rgba(0,0,0,.5), 0 0 0 1px var(--border2);
  display: flex; align-items: center; gap: 10px;
  z-index: 9999; animation: blUp .22s ease; max-width: 340px; font-weight: 300;
}
.bl-toast.success { border-left: 3px solid var(--green); }
.bl-toast.error   { border-left: 3px solid var(--red); }
@keyframes blUp { from{transform:translateY(16px);opacity:0} to{transform:translateY(0);opacity:1} }

.bl-spinner {
  width: 14px; height: 14px; border: 2px solid rgba(255,255,255,.2);
  border-top-color: var(--text-primary); border-radius: 50%; animation: blSpin .65s linear infinite; display: inline-block;
}
@keyframes blSpin { to{transform:rotate(360deg)} }
.bl-skeleton {
  background: linear-gradient(90deg, var(--bg-card) 25%, var(--bg-elevated) 50%, var(--bg-card) 75%);
  background-size: 200% 100%; animation: blShim 1.5s infinite; border-radius: 12px;
}
@keyframes blShim { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
.bl-empty { text-align: center; padding: 44px 0; color: var(--text3); font-size: .85rem; font-weight: 300; }

.bl-dot-pulse { display: flex; gap: 4px; }
.bl-dot-pulse span {
  width: 5px; height: 5px; border-radius: 50%; background: var(--blue); display: inline-block;
  animation: blDot 1.2s ease-in-out infinite;
}
.bl-dot-pulse span:nth-child(2) { animation-delay: .2s; }
.bl-dot-pulse span:nth-child(3) { animation-delay: .4s; }
@keyframes blDot { 0%,80%,100%{opacity:.2;transform:scale(.9)} 40%{opacity:1;transform:scale(1)} }

.bl-modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.7); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; z-index: 10000; animation: blFade .18s ease;
}
@keyframes blFade { from{opacity:0} to{opacity:1} }
.bl-modal {
  background: var(--bg-2); border: 1px solid var(--border2); border-radius: var(--r-xl);
  padding: 30px; width: 420px; box-shadow: 0 24px 60px rgba(0,0,0,.6);
}
.bl-modal-title  { font-size: 1.1rem; font-weight: 700; margin-bottom: 10px; color: var(--text); }
.bl-modal-body   { font-size: .85rem; color: var(--text2); line-height: 1.6; margin-bottom: 24px; }
.bl-modal-footer { display: flex; gap: 10px; }

@media(max-width:1100px) {
  .bl-metrics   { grid-template-columns: repeat(2,1fr); }
  .bl-plans     { grid-template-columns: 1fr; }
  .bl-analytics { grid-template-columns: repeat(2,1fr); }
}
@media(max-width:800px) {
  .bl-two-col { grid-template-columns: 1fr; }
  .bl-title   { font-size: 2rem; }
}
@media(max-width:560px) {
  .bl { padding: 20px 16px 48px; }
  .bl-metrics   { grid-template-columns: 1fr; }
  .bl-analytics { grid-template-columns: 1fr; }
}
`;

// ─────────────────────────────────────────────────────────────
// Utils
// ─────────────────────────────────────────────────────────────
const fmtINR  = (n: number) => '$' + (n ?? 0).toLocaleString('en-IN');
const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' });
const fmtTime = (d: string) => new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
const fmtK    = (n: number) => n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + 'M' : n >= 1000 ? (n / 1000).toFixed(0) + 'K' : String(n);

/**
 * Derive client-side analytics from the backend's monthly array.
 * Backend: Array<{ month: string; spend: number; roi: number }> — last 6 months
 */
function deriveAnalytics(raw: AnalyticsResponse): DerivedAnalytics {
  const totalSpend   = raw.reduce((s, m) => s + m.spend, 0);
  const monthlySpend = raw.length > 0 ? raw[raw.length - 1].spend : 0; // current month is last item
  const avgRoi       = raw.length > 0 ? raw.reduce((s, m) => s + m.roi, 0) / raw.length : 0;
  return {
    totalSpend,
    monthlySpend,
    avgRoi,
    chartLabels: raw.map(m => m.month),
    chartSpend:  raw.map(m => m.spend),
    chartRoi:    raw.map(m => m.roi),
  };
}

// ─────────────────────────────────────────────────────────────
// Toast
// ─────────────────────────────────────────────────────────────
const Toast: React.FC<{ msg: string; type: 'success' | 'error'; onClose: () => void }> = ({ msg, type, onClose }) => (
  <div className={`bl-toast ${type}`}>
    {type === 'success' ? <CheckCircle size={14} color="#10b981" /> : <AlertTriangle size={14} color="#ef4444" />}
    <span style={{ flex: 1 }}>{msg}</span>
    <X size={13} style={{ cursor: 'pointer', opacity: .5 }} onClick={onClose} />
  </div>
);

// ─────────────────────────────────────────────────────────────
// Cancel Modal
// ─────────────────────────────────────────────────────────────
const CancelModal: React.FC<{ loading: boolean; onConfirm: () => void; onClose: () => void }> = ({ loading, onConfirm, onClose }) => (
  <div className="bl-modal-overlay" onClick={onClose}>
    <div className="bl-modal" onClick={e => e.stopPropagation()}>
      <div className="bl-modal-title">Cancel subscription?</div>
      <div className="bl-modal-body">
        Your plan will remain active until the end of the current billing period.
        After that, you'll be moved to the free Hobbyist plan and lose access to
        premium features and increased token limits.
      </div>
      <div className="bl-modal-footer">
        <button className="bl-btn bl-btn-danger" onClick={onConfirm} disabled={loading} style={{ flex: 1 }}>
          {loading ? <><span className="bl-spinner" />Cancelling…</> : <><Ban size={13} />Confirm cancel</>}
        </button>
        <button className="bl-btn bl-btn-ghost" onClick={onClose} style={{ flex: 1 }}>Keep plan</button>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Spend Chart — driven purely by backend analytics array
// ─────────────────────────────────────────────────────────────
const SpendChart: React.FC<{ derived: DerivedAnalytics | null }> = ({ derived }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef  = useRef<Chart | null>(null);
  const [range, setRange] = useState<ChartRange>('6m');

  // Slice data based on selected range
  const sliced = useCallback((d: DerivedAnalytics, r: ChartRange) => {
    const n = r === '1m' ? 1 : r === '3m' ? 3 : 6;
    return {
      labels: d.chartLabels.slice(-n),
      spend:  d.chartSpend.slice(-n),
      roi:    d.chartRoi.slice(-n),
    };
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    const empty = { labels: ['No data'], spend: [0], roi: [0] };
    const d = derived ? sliced(derived, range) : empty;

    if (chartRef.current) chartRef.current.destroy();

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels: d.labels,
        datasets: [
          {
            label: 'Monthly spend',
            data: d.spend,
            backgroundColor: 'rgba(59,130,246,.75)',
            borderRadius: 5,
            borderSkipped: false as const,
            yAxisID: 'ySpend',
          },
          {
            label: 'ROI',
            data: d.roi,
            backgroundColor: 'rgba(34,211,238,.55)',
            type: 'line' as const,
            yAxisID: 'yRoi',
            tension: 0.4,
            pointBackgroundColor: '#22d3ee',
            pointRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#111827',
            borderColor: 'rgba(59,130,246,.3)',
            borderWidth: 1,
            callbacks: {
              label: c =>
                c.dataset.label === 'ROI'
                  ? ` ROI: ${(c.parsed.y as number).toFixed(1)}x`
                  : ` ${fmtINR(c.parsed.y as number)}`,
            },
          },
        },
        scales: {
          x: {
            ticks: { color: '#4b5a72', font: { size: 10 } },
            grid:  { display: false },
            border:{ color: 'rgba(59,130,246,.1)' },
          },
          ySpend: {
            position: 'left',
            ticks: { color: '#4b5a72', font: { size: 10 }, callback: v => '$' + fmtK(Number(v)) },
            grid:  { color: 'rgba(59,130,246,.06)' },
            border:{ color: 'transparent' },
          },
          yRoi: {
            position: 'right',
            ticks: { color: '#22d3ee', font: { size: 10 }, callback: v => `${Number(v).toFixed(1)}x` },
            grid:  { display: false },
            border:{ color: 'transparent' },
          },
        },
      },
    });

    return () => { chartRef.current?.destroy(); };
  }, [range, derived, sliced]);

  return (
    <div className="bl-chart-card">
      <div className="bl-chart-header">
        <div>
          <div className="bl-chart-title">Monthly spend &amp; ROI</div>
          <div className="bl-chart-meta">
            {range === '1m' ? 'Last 1 month' : range === '3m' ? 'Last 3 months' : 'Last 6 months'}
            &nbsp;·&nbsp;{fmtINR(derived?.totalSpend ?? 0)} total
          </div>
        </div>
        <div className="bl-tabs">
          {(['1m', '3m', '6m'] as ChartRange[]).map(r => (
            <button key={r} className={`bl-tab${range === r ? ' active' : ''}`} onClick={() => setRange(r)}>
              {r === '1m' ? '1 mo' : r === '3m' ? '3 mo' : '6 mo'}
            </button>
          ))}
        </div>
      </div>
      <div style={{ position: 'relative', width: '100%', height: 230 }}>
        <canvas ref={canvasRef} role="img" aria-label="Bar chart showing monthly spend and ROI" />
      </div>
      <div className="bl-chart-legend">
        <span className="bl-legend-item"><span className="bl-legend-dot" style={{ background: 'rgba(59,130,246,.75)' }} />Monthly spend</span>
        <span className="bl-legend-item"><span className="bl-legend-dot" style={{ background: 'rgba(34,211,238,.55)' }} />ROI (right axis)</span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Plan Card
// ─────────────────────────────────────────────────────────────
const PlanCard: React.FC<{
  planId: string; plan: Plan; currentPlan: string; isCancelled: boolean;
  loadingUpgrade: string; loadingCancel: boolean;
  onUpgrade: (id: string) => void; onCancel: () => void;
}> = ({ planId, plan, currentPlan, isCancelled, loadingUpgrade, loadingCancel, onUpgrade, onCancel }) => {
  const isCurrent = currentPlan === planId;
  const isEnt     = planId === 'enterprise';
  const isPro     = planId === 'pro';
  const isFree    = planId === 'free';

  const iconBg    = isEnt ? 'rgba(34,211,238,.1)' : isPro ? 'rgba(59,130,246,.1)' : 'rgba(75,90,114,.15)';
  const iconColor = isEnt ? '#22d3ee' : isPro ? '#3b82f6' : '#4b5a72';
  const IconComp  = isEnt ? Building2 : isPro ? Rocket : Shield;

  return (
    <div className={`bl-plan ${isCurrent ? 'bl-plan-current' : ''} ${isEnt && !isCurrent ? 'bl-plan-popular' : ''}`}>
      {isCurrent && !isCancelled && <span className="bl-plan-tag bl-plan-tag-blue">Current</span>}
      {isCurrent && isCancelled  && <span className="bl-plan-tag bl-plan-tag-cyan">Cancelled</span>}
      {isEnt && !isCurrent       && <span className="bl-plan-tag bl-plan-tag-cyan">Popular</span>}

      <div className="bl-plan-icon" style={{ background: iconBg }}>
        <IconComp size={16} color={iconColor} />
      </div>
      <div className="bl-plan-name">{plan.name}</div>
      <div className="bl-plan-price">
        {plan.price === 0 ? 'Free' : `$${plan.price}`}
        {plan.price > 0 && <span>/mo</span>}
      </div>
      <ul className="bl-plan-features">
        {plan.features.map(f => (
          <li key={f}>
            <CheckCircle size={11} color={isEnt ? '#22d3ee' : isPro ? '#3b82f6' : '#4b5a72'} style={{ flexShrink: 0, marginTop: 2 }} />
            {f}
          </li>
        ))}
      </ul>

      {isCurrent ? (
        !isFree && !isCancelled ? (
          <button className="bl-btn bl-btn-danger bl-btn-sm" onClick={onCancel} disabled={loadingCancel}>
            {loadingCancel ? <><span className="bl-spinner" />…</> : <><Ban size={11} />Cancel plan</>}
          </button>
        ) : (
          <button className="bl-btn bl-btn-ghost bl-btn-sm" disabled>
            {isCancelled ? 'Subscription cancelled' : 'Current plan'}
          </button>
        )
      ) : (
        <button
          className={`bl-btn ${isEnt ? 'bl-btn-cyan' : isFree ? 'bl-btn-ghost' : 'bl-btn-primary'} bl-btn-sm`}
          disabled={loadingUpgrade !== '' || isCancelled}
          onClick={() => onUpgrade(planId)}
        >
          {loadingUpgrade === planId
            ? <><span className="bl-spinner" />Processing…</>
            : isEnt ? 'Contact Sales'
            : isFree ? 'Downgrade'
            : 'Upgrade'}
        </button>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────
const Billing: React.FC = () => {
  const userId = localStorage.getItem('userId') || (window as any).__userId || 'demo-user';

  // ── State ──────────────────────────────────────────────────
  const [sub,     setSub]     = useState<Subscription | null>(null);
  const [plans,   setPlans]   = useState<PlansMap>({});
  const [balance, setBalance] = useState(0);
  // Raw analytics from backend: Array<{ month, spend, roi }>
  const [rawAnalytics, setRawAnalytics] = useState<AnalyticsResponse>([]);
  // Derived once from raw
  const derived: DerivedAnalytics | null = rawAnalytics.length > 0 ? deriveAnalytics(rawAnalytics) : null;

  const [txns,       setTxns]       = useState<Transaction[]>([]);
  const [txnTotal,   setTxnTotal]   = useState(0);
  const [txnPage,    setTxnPage]    = useState(1);
  const [txnPages,   setTxnPages]   = useState(1);
  // NOTE: backend /wallet/transactions does NOT support ?type filter.
  // Filtering is done client-side from the full page result.
  const [txnFilter,  setTxnFilter]  = useState<TxnFilter>('all');
  const [txnLoading, setTxnLoading] = useState(false);

  const [rechargeAmt,     setRechargeAmt]     = useState(1000);
  const [loadingUpgrade,  setLoadingUpgrade]  = useState('');
  const [loadingCancel,   setLoadingCancel]   = useState(false);
  const [loadingRecharge, setLoadingRecharge] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [coreLoading,     setCoreLoading]     = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const PAGE_SIZE = 10;

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3800);
  };

  // ── Fetch core data ────────────────────────────────────────
  // Calls: GET /billing/subscription/:userId
  //        GET /billing/plans
  //        GET /billing/wallet/balance/:userId
  //        GET /billing/analytics/:userId
  const fetchCore = useCallback(async () => {
    setCoreLoading(true);
    try {
      const [subRes, plansRes, balRes, analyticsRes] = await Promise.all([
        api.get<Subscription>(`/billing/subscription/${userId}`),
        api.get<PlansMap>('/billing/plans'),
        api.get<WalletBalance>(`/billing/wallet/balance/${userId}`),
        api.get<AnalyticsResponse>(`/billing/analytics/${userId}`),
      ]);
      setSub(subRes);
      setPlans(plansRes);
      setBalance(balRes.balance ?? 0);
      // Backend returns Array<{ month, spend, roi }> — store as-is
      setRawAnalytics(Array.isArray(analyticsRes) ? analyticsRes : []);
    } catch (err: any) {
      showToast(err.message || 'Failed to load billing data.', 'error');
    } finally {
      setCoreLoading(false);
    }
  }, [userId]);

  // ── Fetch transactions ─────────────────────────────────────
  // Calls: GET /billing/wallet/transactions/:userId?page=X&limit=Y
  // Client-side filter is applied after fetch since backend has no ?type param
  const fetchTxns = useCallback(async (page: number) => {
    setTxnLoading(true);
    try {
      const res = await api.get<TxnResponse>(
        `/billing/wallet/transactions/${userId}?page=${page}&limit=${PAGE_SIZE}`
      );
      setTxns(res.transactions ?? []);
      setTxnTotal(res.total ?? 0);
      setTxnPages(res.totalPages ?? 1);
    } catch (err: any) {
      showToast(err.message || 'Failed to load transactions.', 'error');
      setTxns([]);
    } finally {
      setTxnLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchCore(); }, [fetchCore]);
  useEffect(() => { fetchTxns(txnPage); }, [fetchTxns, txnPage]);

  // Client-side filter — no extra API call needed
  const visibleTxns = txnFilter === 'all' ? txns : txns.filter(t => t.type === txnFilter);

  // ── Upgrade subscription ───────────────────────────────────
  // Calls: POST /billing/subscription/upgrade { userId, planId, successUrl, cancelUrl }
  const handleUpgrade = async (planId: string) => {
    setLoadingUpgrade(planId);
    try {
      const data = await api.post<{ id: string; url: string; plan: Plan }>(
        '/billing/subscription/upgrade',
        {
          userId,
          planId,
          successUrl: `${window.location.origin}/billing?success=true`,
          cancelUrl:  `${window.location.origin}/billing`,
        }
      );
      // When real Stripe is wired, data.url will be the checkout URL.
      // Until then, the backend echoes successUrl — show toast instead of redirect.
      if (data.url && !data.url.includes(window.location.origin)) {
        window.location.href = data.url;
      } else {
        showToast(`Plan upgrade initiated for ${plans[planId]?.name ?? planId}!`);
        fetchCore();
      }
    } catch (err: any) {
      showToast(err.message || 'Checkout failed.', 'error');
    } finally {
      setLoadingUpgrade('');
    }
  };

  // ── Cancel subscription ────────────────────────────────────
  // Calls: POST /billing/subscription/cancel { userId }
  const handleCancelConfirm = async () => {
    setLoadingCancel(true);
    try {
      const res = await api.post<{ message: string }>('/billing/subscription/cancel', { userId });
      showToast(res.message || 'Subscription cancelled successfully.');
      setShowCancelModal(false);
      fetchCore();
    } catch (err: any) {
      showToast(err.message || 'Cancellation failed.', 'error');
    } finally {
      setLoadingCancel(false);
    }
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRecharge = async () => {
    setLoadingRecharge(true);
    try {
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        throw new Error('Razorpay SDK failed to load. Are you online?');
      }

      // 1. Create Order
      const orderRes = await api.post<any>('/wallet/razorpay/create-order', {
        amountInRupees: rechargeAmt,
      });

      // 2. Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_dummy', // Set this in your frontend .env
        amount: orderRes.amount,
        currency: orderRes.currency,
        name: 'Digital Ads Dashboard',
        description: 'Wallet Recharge for Ads',
        order_id: orderRes.id,
        handler: async function (response: any) {
          try {
            // 3. Verify Payment
            const verifyRes = await api.post<any>('/wallet/razorpay/verify', {
              userId,
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              amountInRupees: rechargeAmt,
            });
            setBalance(verifyRes.balance);
            showToast(`${fmtINR(rechargeAmt)} added to your wallet successfully!`);
            setTxnPage(1);
            fetchTxns(1);
          } catch (err: any) {
            showToast('Payment verification failed.', 'error');
          }
        },
        prefill: {
          name: 'Dashboard User',
        },
        theme: {
          color: '#3b82f6',
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        showToast(response.error.description || 'Payment failed', 'error');
      });
      rzp.open();
    } catch (err: any) {
      showToast(err.message || 'Recharge failed.', 'error');
    } finally {
      setLoadingRecharge(false);
    }
  };

  // ── Success redirect from Stripe ───────────────────────────
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('success') === 'true') {
      showToast('Subscription upgraded successfully! 🎉');
      window.history.replaceState({}, '', window.location.pathname);
      fetchCore();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Skeleton ───────────────────────────────────────────────
  if (coreLoading) {
    return (
      <>
        <style>{STYLES}</style>
        <div className="bl">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="bl-skeleton" style={{ height: 80 }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
              {[1, 2, 3, 4].map(i => <div key={i} className="bl-skeleton" style={{ height: 120 }} />)}
            </div>
            <div className="bl-skeleton" style={{ height: 280 }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
              {[1, 2, 3].map(i => <div key={i} className="bl-skeleton" style={{ height: 260 }} />)}
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Computed values ────────────────────────────────────────
  const usagePct      = sub ? Math.min((sub.aiTokensUsedCurrentBillingCycle / sub.aiTokenLimit) * 100, 100) : 0;
  const isDanger      = usagePct > 85;
  const progressColor = isDanger ? '#ef4444' : usagePct > 65 ? '#f59e0b' : '#3b82f6';
  const currentPlanName = plans[sub?.plan ?? '']?.name ?? '—';
  // Subscription is cancelled when status === 'cancelled' (set by backend on cancel)
  const isCancelled   = sub?.status === 'cancelled';
  const periodLabel   = isCancelled ? 'Cancelled on' : 'Renews';
  const periodDate    = isCancelled && sub?.cancelledAt
    ? new Date(sub.cancelledAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : sub?.currentPeriodEnd
    ? new Date(sub.currentPeriodEnd).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  return (
    <>
      <style>{STYLES}</style>
      <div className="bl">

        {/* ── Header ──────────────────────────────────────── */}
        <div className="bl-header">
          <div>
            <h1 className="bl-title">Billing &amp; <span>Wallet</span></h1>
            <p className="bl-subtitle">Manage your plan, tokens and prepaid credits · {userId}</p>
          </div>
          <div className="bl-header-right">
            <button className="bl-btn bl-btn-outline bl-btn-sm" style={{ width: 'auto' }} onClick={fetchCore}>
              <RefreshCw size={12} /> Refresh
            </button>
          </div>
        </div>

        {/* ── Metric cards ────────────────────────────────── */}
        <div className="bl-sec"><Sparkles size={10} /> Overview</div>
        <div className="bl-metrics">

          <div className="bl-metric">
            <div className="bl-metric-icon"><Crown size={15} color="#3b82f6" /></div>
            <div className="bl-metric-label">Active plan</div>
            <div className="bl-metric-value" style={{ fontSize: '1.25rem' }}>{currentPlanName}</div>
            {sub && <div className="bl-metric-sub">{periodLabel} {periodDate}</div>}
            <div className={`bl-badge ${isDanger ? 'bl-badge-red' : isCancelled ? 'bl-badge-amber' : 'bl-badge-green'}`}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
              {sub?.status?.toUpperCase() ?? 'UNKNOWN'}
            </div>
          </div>

          <div className="bl-metric">
            <div className="bl-metric-icon"><Zap size={15} color="#3b82f6" /></div>
            <div className="bl-metric-label">Monthly tokens</div>
            {sub ? (
              <>
                <div className="bl-metric-value" style={{ fontSize: '1.4rem' }}>
                  {fmtK(sub.aiTokensUsedCurrentBillingCycle)}
                  <span style={{ fontSize: '.95rem', color: 'var(--text2)', fontWeight: 300 }}> / {fmtK(sub.aiTokenLimit)}</span>
                </div>
                <div className="bl-progress-track">
                  <div className="bl-progress-fill" style={{ width: `${usagePct}%`, background: progressColor }} />
                </div>
                <div className="bl-metric-sub">
                  {usagePct.toFixed(1)}% used
                  {isDanger && <span style={{ color: 'var(--red)', marginLeft: 8 }}>— Upgrade soon</span>}
                </div>
              </>
            ) : <div className="bl-metric-sub">Loading…</div>}
          </div>

          <div className="bl-metric">
            <div className="bl-metric-icon"><Wallet size={15} color="#3b82f6" /></div>
            <div className="bl-metric-label">Wallet balance</div>
            <div className="bl-metric-value" style={{ color: '#3b82f6' }}>{fmtINR(balance)}</div>
            <div className="bl-metric-sub">Available for campaigns</div>
            <div className="bl-badge bl-badge-blue"><TrendingUp size={9} /> Prepaid</div>
          </div>

          <div className="bl-metric">
            <div className="bl-metric-icon"><BarChart2 size={15} color="#3b82f6" /></div>
            <div className="bl-metric-label">Current month spend</div>
            {/* monthlySpend comes from the last entry in the analytics array */}
            <div className="bl-metric-value">{fmtINR(derived?.monthlySpend ?? 0)}</div>
            <div className="bl-metric-sub">Avg ROI: {derived ? `${derived.avgRoi.toFixed(1)}x` : '—'}</div>
            <div className="bl-badge bl-badge-amber"><Activity size={9} /> Active</div>
          </div>
        </div>

        {/* ── Analytics strip ─────────────────────────────── */}
        <div className="bl-sec"><Activity size={10} /> Analytics</div>
        <div className="bl-analytics">
          <div className="bl-analytic">
            <div className="bl-analytic-label"><DollarSign size={11} /> 6-month total spend</div>
            <div className="bl-analytic-value">{fmtINR(derived?.totalSpend ?? 0)}</div>
            <div className="bl-analytic-sub">Cumulative across last 6 months</div>
          </div>
          <div className="bl-analytic">
            <div className="bl-analytic-label"><TrendingUp size={11} /> Average ROI</div>
            {/* ROI is returned by backend — show average across months */}
            <div className="bl-analytic-value">{derived ? `${derived.avgRoi.toFixed(1)}x` : '—'}</div>
            <div className="bl-analytic-sub">Mean return across billing periods</div>
          </div>
          <div className="bl-analytic">
            <div className="bl-analytic-label"><Clock size={11} /> Best month</div>
            {/* Find month with highest ROI from the analytics array */}
            <div className="bl-analytic-value" style={{ fontSize: '1.1rem' }}>
              {rawAnalytics.length > 0
                ? rawAnalytics.reduce((best, m) => m.roi > best.roi ? m : best).month
                : '—'}
            </div>
            <div className="bl-analytic-sub">Highest ROI month</div>
          </div>
        </div>

        {/* ── Spend chart ─────────────────────────────────── */}
        <div className="bl-sec"><TrendingUp size={10} /> Monthly spend &amp; ROI</div>
        <SpendChart derived={derived} />

        {/* ── Plans ───────────────────────────────────────── */}
        <div className="bl-sec"><Crown size={10} /> Subscription plans</div>
        <div className="bl-plans">
          {Object.entries(plans).length > 0
            ? Object.entries(plans).map(([id, plan]) => (
                <PlanCard
                  key={id}
                  planId={id}
                  plan={plan}
                  currentPlan={sub?.plan ?? ''}
                  isCancelled={isCancelled}
                  loadingUpgrade={loadingUpgrade}
                  loadingCancel={loadingCancel}
                  onUpgrade={handleUpgrade}
                  onCancel={() => setShowCancelModal(true)}
                />
              ))
            : [1, 2, 3].map(i => <div key={i} className="bl-skeleton" style={{ height: 280 }} />)
          }
        </div>

        {/* ── Wallet + Transactions ────────────────────────── */}
        <div className="bl-sec"><CreditCard size={10} /> Wallet &amp; Transactions</div>
        <div className="bl-two-col">

          {/* Wallet recharge card */}
          <div className="bl-wallet">
            <div>
              <div className="bl-wallet-label"><Wallet size={11} /> Prepaid wallet</div>
              <div className="bl-wallet-amount">
                <span>$</span>{(balance ?? 0).toLocaleString('en-IN')}
              </div>
              <div className="bl-wallet-sub">Available for campaigns</div>
            </div>

            <div>
              <div style={{ fontSize: '.67rem', color: 'var(--text3)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 10 }}>
                Add credits
              </div>
              <div className="bl-pills">
                {[500, 1000, 2000, 5000, 10000, 25000].map(amt => (
                  <div
                    key={amt}
                    className={`bl-pill ${rechargeAmt === amt ? 'sel' : ''}`}
                    onClick={() => setRechargeAmt(amt)}
                  >
                    {amt >= 1000 ? `$${amt / 1000}K` : `$${amt}`}
                  </div>
                ))}
              </div>
            </div>

            <button className="bl-recharge-btn" onClick={handleRecharge} disabled={loadingRecharge}>
              {loadingRecharge
                ? <><span className="bl-spinner" style={{ borderTopColor: '#fff' }} /> Processing…</>
                : <><ArrowUpRight size={15} /> Add {fmtINR(rechargeAmt)}</>}
            </button>
            <div className="bl-wallet-secure">🔒 Secured via Razorpay · Stripe</div>
          </div>

          {/* Transaction table */}
          <div className="bl-txn-card">
            <div className="bl-txn-header">
              <span className="bl-txn-title">All transactions</span>
              <div className="bl-txn-controls">
                {txnLoading && <div className="bl-dot-pulse"><span /><span /><span /></div>}
                {/* Filter is client-side — no extra API call */}
                <select
                  className="bl-filter-select"
                  value={txnFilter}
                  onChange={e => setTxnFilter(e.target.value as TxnFilter)}
                >
                  <option value="all">All types</option>
                  <option value="CREDIT">Credits only</option>
                  <option value="DEBIT">Debits only</option>
                </select>
              </div>
            </div>

            <div className="bl-table-wrap">
              {visibleTxns.length === 0 && !txnLoading ? (
                <div className="bl-empty">No transactions found.</div>
              ) : (
                <table className="bl-table">
                  <thead>
                    <tr>
                      <th>Date &amp; Time</th>
                      <th>Description</th>
                      <th>Type</th>
                      <th style={{ textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleTxns.map(tx => (
                      <tr key={tx._id}>
                        <td>
                          <div style={{ fontWeight: 500, fontSize: '.82rem', color: 'var(--text)' }}>{fmtDate(tx.createdAt)}</div>
                          <div style={{ color: 'var(--text3)', fontSize: '.7rem', fontFamily: "'JetBrains Mono',monospace" }}>{fmtTime(tx.createdAt)}</div>
                        </td>
                        <td style={{ maxWidth: 200 }}>
                          <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text)' }}>
                            {tx.description || '—'}
                          </span>
                        </td>
                        <td>
                          <span className={`bl-type-pill ${tx.type === 'CREDIT' ? 'bl-badge-green' : 'bl-badge-red'}`}>
                            {tx.type === 'CREDIT' ? <ArrowUpRight size={10} /> : <ArrowDownLeft size={10} />}
                            {tx.type}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span className={`bl-amount ${tx.type.toLowerCase()}`}>
                            {tx.type === 'CREDIT' ? '+' : '-'}{fmtINR(tx.amount)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {txnPages > 1 && (
              <div className="bl-pagination">
                <span className="bl-page-info">
                  {((txnPage - 1) * PAGE_SIZE) + 1}–{Math.min(txnPage * PAGE_SIZE, txnTotal)} of {txnTotal}
                </span>
                <div className="bl-page-btns">
                  <button className="bl-page-btn" disabled={txnPage === 1} onClick={() => setTxnPage(p => p - 1)}>
                    <ChevronLeft size={13} />
                  </button>
                  {Array.from({ length: Math.min(txnPages, 5) }, (_, i) => {
                    const pg = txnPage <= 3 ? i + 1
                      : txnPage >= txnPages - 2 ? txnPages - 4 + i
                      : txnPage - 2 + i;
                    return pg > 0 && pg <= txnPages ? (
                      <button key={pg} className={`bl-page-btn ${pg === txnPage ? 'active' : ''}`} onClick={() => setTxnPage(pg)}>
                        {pg}
                      </button>
                    ) : null;
                  })}
                  <button className="bl-page-btn" disabled={txnPage === txnPages} onClick={() => setTxnPage(p => p + 1)}>
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {showCancelModal && (
        <CancelModal
          loading={loadingCancel}
          onConfirm={handleCancelConfirm}
          onClose={() => setShowCancelModal(false)}
        />
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
};

export default Billing;