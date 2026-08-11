import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Globe, MapPin, Users, Building, Loader2, Star, GitBranch, Lock, Unlock, RefreshCw, Sparkles } from "lucide-react";
import { TierBadge, PriorityBadge } from "@/components/intelligence/Badges";
import { formatDate, formatCurrency, formatNumber } from "@/lib/format";
import OverviewTab from "@/components/account-tabs/OverviewTab";
import ERPEstateTab from "@/components/account-tabs/ERPEstateTab";
import ERPIntelligenceTab from "@/components/account-tabs/ERPIntelligenceTab";
import SignalsTab from "@/components/account-tabs/SignalsTab";
import ComplexityTab from "@/components/account-tabs/ComplexityTab";
import CommercialTab from "@/components/account-tabs/CommercialTab";
import BuyingCommitteeTab from "@/components/account-tabs/BuyingCommitteeTab";
import MeddpiccTab from "@/components/account-tabs/MeddpiccTab";
import OutreachTab from "@/components/account-tabs/OutreachTab";
import EvidenceTab from "@/components/account-tabs/EvidenceTab";
import DebugTab from "@/components/account-tabs/DebugTab";
import HiringIntelligenceTab from "@/components/account-tabs/HiringIntelligenceTab";
import DemoSummaryTab from "@/components/account-tabs/DemoSummaryTab";
import QualityTab from "@/components/account-tabs/QualityTab";

const TABS = ["Demo", "Overview", "Quality", "ERP Estate", "ERP Intelligence", "Transformation Signals", "Migration Complexity", "Commercial Model", "Buying Committee", "MEDDPICC", "Outreach", "Evidence", "Hiring Intelligence", "Debug"];

export default function AccountDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [tab, setTab] = useState("Demo");
  const [loading, setLoading] = useState(true);
  const [savingFlag, setSavingFlag] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [snapshotInfo, setSnapshotInfo] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const a = await base44.entities.Account.get(id);
        setAccount(a);
      } catch (e) {
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="p-8 text-slate-400 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading account…</div>;
  if (!account) return <div className="p-8"><p className="text-slate-500">Account not found.</p><Link to="/accounts" className="text-indigo-600 hover:underline">← Back to accounts</Link></div>;

  const intel = account.intelligence || {};
  const co = intel.company_overview || {};
  const updateAccount = (patch) => setAccount((a) => ({ ...a, ...patch }));

  const toggleSave = async () => {
    setSavingFlag(true);
    const next = !account.saved;
    try {
      await base44.entities.Account.update(account.id, { saved: next });
      updateAccount({ saved: next });
    } catch (e) {}
    setSavingFlag(false);
  };

  const addToPipeline = async () => {
    try {
      const existing = await base44.entities.Pipeline.filter({ account_id: account.id });
      if (existing.length === 0) {
        await base44.entities.Pipeline.create({
          account_id: account.id, company: account.company_name, industry: account.industry,
          current_erp: account.current_erp, stage: "Research",
          potential_value: account.estimated_traditional_cost_expected,
          traditional_value: account.estimated_traditional_cost_expected,
          hybrid_value: account.estimated_traditional_cost_expected ? account.estimated_traditional_cost_expected * 0.5 : undefined,
          client_saving: account.potential_saving,
          transformation_probability: account.transformation_probability,
          hybrid_fit: account.hybrid_fit,
          next_action: "Initial outreach to economic buyer",
          next_action_date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
        });
      }
      navigate("/pipeline");
    } catch (e) {}
  };

  const toggleDemoPin = async () => {
    try {
      const next = !account.is_demo_account;
      await base44.entities.Account.update(account.id, { is_demo_account: next });
      updateAccount({ is_demo_account: next });
    } catch (e) {}
  };

  const toggleLock = async () => {
    try {
      const next = !account.is_locked;
      const patch = { is_locked: next };
      if (next) {
        // Lock: record current snapshot version
        const versions = await base44.entities.AnalysisVersion.filter({ account_id: account.id }, "-version", 1);
        if (versions[0]) patch.locked_snapshot_id = versions[0].id;
      }
      await base44.entities.Account.update(account.id, patch);
      updateAccount(patch);
    } catch (e) {}
  };

  const handleRefresh = async () => {
    // Refresh creates a new analysis version instead of overwriting a locked one
    setRefreshing(true);
    try {
      const res = await base44.functions.invoke("startAnalysis", {
        company_name: account.company_name, website: account.website, country: account.country,
        industry: account.industry, known_erp: account.known_erp, research_mode: "LIVE",
      });
      const data = res.data || {};
      let intelligence = data.intelligence;
      if (data.async && !intelligence) {
        // Poll for completion
        intelligence = await new Promise((resolve, reject) => {
          const poll = setInterval(async () => {
            try {
              const jobs = await base44.entities.AnalysisJob.filter({ analysis_id: data.analysis_id });
              const job = jobs[0];
              if (!job) return;
              if (job.status === "complete") { clearInterval(poll); resolve(job.intelligence || {}); }
              else if (job.status === "failed") { clearInterval(poll); reject(new Error(job.error || "Refresh failed")); }
            } catch (e) {}
          }, 3000);
          setTimeout(() => { clearInterval(poll); reject(new Error("Refresh timed out")); }, 180000);
        });
      }
      // Persist new intelligence (creates new version via reconcileEvidence)
      const intelForAccount = { ...intelligence };
      delete intelForAccount.reconciliation;
      await base44.entities.Account.update(account.id, {
        intelligence: intelForAccount, last_analysed: new Date().toISOString(),
        transformation_probability: intelligence.scores?.transformation_probability?.value,
        hybrid_fit: intelligence.scores?.hybrid_fit?.value,
        future_enterprise_fit: intelligence.scores?.future_enterprise_fit?.value,
        migration_complexity: intelligence.scores?.migration_complexity?.value,
        current_erp: intelligence.erp_estate?.current_erp_product?.value || account.current_erp,
        target_erp: intelligence.target_erp?.next_erp || intelligence.target_erp?.product,
      });
      try {
        await base44.functions.invoke("reconcileEvidence", {
          account_id: account.id, company_name: account.company_name,
          intelligence, analysis_id: data.analysis_id, trigger_reason: "refresh_analysis",
        });
        await base44.functions.invoke("validateAnalysisQuality", { account_id: account.id, intelligence });
      } catch (e) {}
      window.location.reload();
    } catch (e) {
      setSnapshotInfo({ fallback: true, snapshot_date: account.last_analysed });
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 pt-6 pb-5">
        <button onClick={() => navigate(-1)} className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 mb-4">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-semibold text-xl shrink-0 overflow-hidden">
              {co.logo_url ? <img src={co.logo_url} alt="" className="w-full h-full object-contain" /> : account.company_name?.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">{account.company_name}</h1>
                <TierBadge value={account.account_priority} />
                <PriorityBadge value={account.priority} />
                {account.source_provider === "mock" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-violet-100 text-violet-700 border border-violet-200">MOCK ANALYSIS</span>
                )}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-slate-500">
                {co.website && <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" />{co.website}</span>}
                {co.industry && <span>{co.industry}</span>}
                {(co.headquarters || account.country) && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{co.headquarters || account.country}</span>}
                {(co.employees || account.employees) && <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{formatNumber(co.employees || account.employees)} emp</span>}
                {co.ownership && <span className="flex items-center gap-1.5"><Building className="w-3.5 h-3.5" />{co.ownership}</span>}
                {co.revenue && <span>{formatCurrency(co.revenue)} revenue</span>}
                <span className="text-slate-400">Analysed {formatDate(account.last_analysed)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={toggleDemoPin} className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${account.is_demo_account ? "bg-amber-50 border-amber-300 text-amber-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
              <Sparkles className={`w-4 h-4 ${account.is_demo_account ? "text-amber-500" : ""}`} /> {account.is_demo_account ? "Demo Account" : "Pin as Demo"}
            </button>
            <button onClick={toggleLock} className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${account.is_locked ? "bg-slate-800 border-slate-800 text-white" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
              {account.is_locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />} {account.is_locked ? "Locked" : "Lock"}
            </button>
            <button onClick={handleRefresh} disabled={refreshing} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50">
              {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Refresh
            </button>
            <button onClick={toggleSave} disabled={savingFlag} className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${account.saved ? "bg-amber-50 border-amber-200 text-amber-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
              <Star className={`w-4 h-4 ${account.saved ? "fill-amber-400 text-amber-500" : ""}`} /> {account.saved ? "Saved" : "Save"}
            </button>
            <button onClick={addToPipeline} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700">
              <GitBranch className="w-4 h-4" /> Add to Pipeline
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 px-8">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${tab === t ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="p-8 bg-slate-50 min-h-[60vh]">
        {tab === "Demo" && <DemoSummaryTab account={account} intel={intel} onNavigateTab={setTab} onToggleLock={toggleLock} onRefresh={handleRefresh} refreshing={refreshing} snapshotInfo={snapshotInfo} />}
        {tab === "Overview" && <OverviewTab account={account} intel={intel} onNavigateTab={setTab} />}
        {tab === "Quality" && <QualityTab account={account} />}
        {tab === "ERP Estate" && <ERPEstateTab intel={intel} />}
        {tab === "ERP Intelligence" && <ERPIntelligenceTab account={account} intel={intel} />}
        {tab === "Transformation Signals" && <SignalsTab intel={intel} accountId={account.id} />}
        {tab === "Migration Complexity" && <ComplexityTab intel={intel} />}
        {tab === "Commercial Model" && <CommercialTab intel={intel} />}
        {tab === "Buying Committee" && <BuyingCommitteeTab intel={intel} />}
        {tab === "MEDDPICC" && <MeddpiccTab account={account} onUpdate={updateAccount} />}
        {tab === "Outreach" && <OutreachTab account={account} intel={intel} />}
        {tab === "Evidence" && <EvidenceTab account={account} intel={intel} />}
        {tab === "Hiring Intelligence" && <HiringIntelligenceTab account={account} intel={intel} />}
        {tab === "Debug" && <DebugTab account={account} />}
      </div>
    </div>
  );
}