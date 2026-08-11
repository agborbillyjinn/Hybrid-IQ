import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import StatCard from "@/components/intelligence/StatCard";
import { ConfidenceBadge, PriorityBadge } from "@/components/intelligence/Badges";
import { formatCurrency, formatDate, timeAgo } from "@/lib/format";
import { Link } from "react-router-dom";
import { Building2, Target, Crosshair, Gauge, TrendingUp, AlertTriangle, Clock, ArrowRight, Radar } from "lucide-react";
import DemoAccountsSection from "@/components/dashboard/DemoAccountsSection";

export default function Dashboard() {
  const [accounts, setAccounts] = useState([]);
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const accs = await base44.entities.Account.list("-last_analysed", 100);
        setAccounts(accs);
        const sigs = await base44.entities.Signal.list("-created_date", 12);
        setSignals(sigs);
      } catch (e) {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const kpis = computeKpis(accounts);
  const recent = accounts.slice(0, 8);
  const priority = [...accounts].sort((a, b) => (b.transformation_probability || 0) - (a.transformation_probability || 0)).slice(0, 5);

  const togglePin = async (account) => {
    const demoCount = accounts.filter((a) => a.is_demo_account).length;
    if (!account.is_demo_account && demoCount >= 5) return; // max 5
    try {
      const next = !account.is_demo_account;
      await base44.entities.Account.update(account.id, { is_demo_account: next });
      setAccounts((accs) => accs.map((a) => (a.id === account.id ? { ...a, is_demo_account: next } : a)));
    } catch (e) {}
  };

  if (loading) return <div className="p-8 text-slate-400">Loading dashboard…</div>;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-slate-500">Know who to target. Know why now. Quantify the opportunity.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
        <StatCard label="Accounts Analysed" value={kpis.accounts} icon={Building2} accent="indigo" />
        <StatCard label="Tier 1 Prospects" value={kpis.tier1} icon={Target} accent="violet" />
        <StatCard label="Tier 2 Prospects" value={kpis.tier2} icon={Crosshair} accent="sky" />
        <StatCard label="Est. Pipeline" value={formatCurrency(kpis.pipeline)} icon={TrendingUp} accent="emerald" />
        <StatCard label="Avg Hybrid Fit" value={kpis.avgFit + "/100"} icon={Gauge} accent="emerald" />
        <StatCard label="Transform Opportunities" value={kpis.opps} icon={Radar} accent="amber" />
        <StatCard label="High-Urgency Accounts" value={kpis.urgent} icon={AlertTriangle} accent="rose" />
        <StatCard label="Recent Changes" value={signals.length} icon={Clock} accent="slate" />
      </div>

      <DemoAccountsSection accounts={accounts} onTogglePin={togglePin} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Recent Accounts</h3>
            <Link to="/accounts" className="text-xs text-indigo-600 hover:underline flex items-center gap-1">All accounts <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] text-slate-400 uppercase tracking-wide border-b border-slate-100">
                  <th className="px-5 py-2.5 font-medium">Company</th>
                  <th className="px-3 py-2.5 font-medium">Industry</th>
                  <th className="px-3 py-2.5 font-medium">Current ERP</th>
                  <th className="px-3 py-2.5 font-medium">Transform</th>
                  <th className="px-3 py-2.5 font-medium">Hybrid Fit</th>
                  <th className="px-3 py-2.5 font-medium">Savings</th>
                  <th className="px-3 py-2.5 font-medium">Priority</th>
                  <th className="px-3 py-2.5 font-medium">Last</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((a) => (
                  <tr key={a.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-5 py-2.5">
                      <Link to={`/accounts/${a.id}`} className="font-medium text-slate-900 hover:text-indigo-600">{a.company_name}</Link>
                    </td>
                    <td className="px-3 py-2.5 text-slate-500">{a.industry || "—"}</td>
                    <td className="px-3 py-2.5 text-slate-600">{a.current_erp || "—"}</td>
                    <td className="px-3 py-2.5 font-medium text-slate-700">{a.transformation_probability ?? "—"}</td>
                    <td className="px-3 py-2.5 font-medium text-slate-700">{a.hybrid_fit ?? "—"}</td>
                    <td className="px-3 py-2.5 text-slate-600">{formatCurrency(a.potential_saving)}</td>
                    <td className="px-3 py-2.5"><PriorityBadge value={a.priority} /></td>
                    <td className="px-3 py-2.5 text-slate-400 text-xs">{timeAgo(a.last_analysed)}</td>
                  </tr>
                ))}
                {recent.length === 0 && (
                  <tr><td colSpan={8} className="px-5 py-10 text-center text-slate-400">No accounts yet. <Link to="/analyse" className="text-indigo-600 hover:underline">Analyse your first account →</Link></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100"><h3 className="text-sm font-semibold text-slate-900">Recent Signals</h3></div>
          <div className="divide-y divide-slate-50">
            {signals.map((s) => (
              <div key={s.id} className="px-5 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-medium text-slate-800">{s.signal}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{s.company} · {formatDate(s.date)}</div>
                  </div>
                  <ConfidenceBadge value={s.confidence} />
                </div>
                {s.why_it_matters && <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{s.why_it_matters}</p>}
              </div>
            ))}
            {signals.length === 0 && <div className="px-5 py-8 text-center text-slate-400 text-sm">No signals yet.</div>}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 mt-5">
        <div className="px-5 py-4 border-b border-slate-100"><h3 className="text-sm font-semibold text-slate-900">Priority Opportunities</h3></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-5">
          {priority.map((a) => (
            <Link key={a.id} to={`/accounts/${a.id}`} className="border border-slate-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-sm transition-all">
              <div className="text-sm font-medium text-slate-900 truncate">{a.company_name}</div>
              <div className="text-xs text-slate-400 mt-0.5">{a.current_erp || "Unknown ERP"}</div>
              <div className="mt-3 flex items-end gap-4">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Transform</div>
                  <div className="text-lg font-semibold text-indigo-600">{a.transformation_probability ?? "—"}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Savings</div>
                  <div className="text-lg font-semibold text-emerald-600">{formatCurrency(a.potential_saving)}</div>
                </div>
              </div>
            </Link>
          ))}
          {priority.length === 0 && <div className="text-slate-400 text-sm col-span-5 text-center py-6">No opportunities yet.</div>}
        </div>
      </div>
    </div>
  );
}

function computeKpis(accounts) {
  const tier1 = accounts.filter((a) => (a.account_priority || "").toLowerCase() === "tier 1").length;
  const tier2 = accounts.filter((a) => (a.account_priority || "").toLowerCase() === "tier 2").length;
  const pipeline = accounts.reduce((s, a) => s + (a.estimated_traditional_cost_expected || 0), 0);
  const fitAcc = accounts.reduce((s, a) => s + (a.hybrid_fit || 0), 0);
  const opps = accounts.filter((a) => (a.transformation_probability || 0) >= 60).length;
  const urgent = accounts.filter((a) => (a.transformation_probability || 0) >= 70).length;
  return {
    accounts: accounts.length,
    tier1, tier2,
    pipeline,
    avgFit: accounts.length ? Math.round(fitAcc / accounts.length) : 0,
    opps, urgent,
  };
}