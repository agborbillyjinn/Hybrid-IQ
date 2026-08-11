import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Lock, Unlock, RefreshCw, FileText, Loader2, Star, AlertCircle, Eye } from "lucide-react";
import { formatCurrency, formatDate, timeAgo } from "@/lib/format";
import { QualityPill } from "@/components/dashboard/DemoAccountsSection";
import { Button } from "@/components/ui/button";

export default function DemoSummaryTab({ account, intel, onNavigateTab, onToggleLock, onRefresh, refreshing, snapshotInfo }) {
  const [narrative, setNarrative] = useState(account.demo_narrative || "");
  const [generating, setGenerating] = useState(false);
  const [versions, setVersions] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const v = await base44.entities.AnalysisVersion.filter({ account_id: account.id }, "-version", 5);
        setVersions(v);
      } catch (e) {}
    })();
  }, [account.id]);

  const generateNarrative = async () => {
    setGenerating(true);
    try {
      const res = await base44.functions.invoke("generateDemoNarrative", {
        intelligence: intel, account_name: account.company_name, account_id: account.id,
      });
      setNarrative(res.data?.narrative || res.narrative);
    } catch (e) {} finally {
      setGenerating(false);
    }
  };

  const co = intel.company_overview || {};
  const scores = intel.scores || {};
  const cm = intel.commercial_model || {};
  const hiring = intel.hiring_intelligence || {};
  const attack = intel.attack_plan || {};
  const signals = (intel.signals || []).slice(0, 3);
  const tradCost = cm.traditional?.cost?.expected;
  const expectedScenario = (cm.hybrid_scenarios || []).find((s) => s.name?.toLowerCase().includes("expected")) || (cm.hybrid_scenarios || [])[0] || {};
  const erpEstate = intel.erp_estate || {};
  const evHealth = intel.reconciliation?.evidence_health?.overall;

  return (
    <div className="space-y-4">
      {/* Demo Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          onClick={onToggleLock}
          variant={account.is_locked ? "default" : "outline"}
          size="sm"
        >
          {account.is_locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          {account.is_locked ? "Locked" : "Lock Snapshot"}
        </Button>
        <Button onClick={onRefresh} disabled={refreshing} variant="outline" size="sm">
          {refreshing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          Refresh Analysis
        </Button>
        <Button onClick={generateNarrative} disabled={generating} variant="outline" size="sm">
          {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
          Generate Demo Narrative
        </Button>
        <Button onClick={() => onNavigateTab("Quality")} variant="outline" size="sm">
          <Eye className="w-3.5 h-3.5" /> Quality Check
        </Button>
        <div className="ml-auto flex items-center gap-2">
          <QualityPill score={account.quality_score} status={account.quality_status} />
          {account.is_locked && (
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Snapshot locked {snapshotInfo?.locked_at ? formatDate(snapshotInfo.locked_at) : ""}
            </span>
          )}
        </div>
      </div>

      {/* Snapshot Safety Notice */}
      {snapshotInfo?.fallback && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-700">
            Live research was unavailable — showing the latest successful analysis snapshot from {formatDate(snapshotInfo.snapshot_date)}. This account can be demonstrated without a live research call.
          </p>
        </div>
      )}

      {/* Executive Demo View — one screen */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">{account.company_name}</h2>
              <p className="text-xs text-slate-300 mt-0.5">{co.industry || ""} · {co.headquarters || account.country || ""} · {co.employees ? co.employees.toLocaleString() + " employees" : ""}</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-300">Last analysed</div>
              <div className="text-sm font-medium">{formatDate(account.last_analysed)}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-4 p-6">
          {/* WHAT THEY RUN */}
          <DemoBlock label="What They Run">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900">{erpEstate.current_erp_product?.value || account.current_erp || "Unknown"}</span>
              <span className="text-xs text-slate-500">{erpEstate.current_erp_product?.confidence ? erpEstate.current_erp_product.confidence + "% conf" : ""}</span>
            </div>
            {erpEstate.previous_erp_product?.value && (
              <div className="text-xs text-slate-400 mt-1">Previous: {erpEstate.previous_erp_product.value}</div>
            )}
          </DemoBlock>

          {/* WHAT MAY HAPPEN NEXT */}
          <DemoBlock label="What May Happen Next">
            <div className="text-sm font-semibold text-slate-900">{intel.target_erp?.next_erp || intel.target_erp?.product || erpEstate.target_erp_product?.value || "—"}</div>
            <div className="text-xs text-slate-400 mt-1">{hiring.likely_programme_stage || "Stage unknown"}</div>
          </DemoBlock>

          {/* WHY NOW */}
          <DemoBlock label="Why Now — Top Signals">
            {signals.length > 0 ? (
              <ul className="space-y-1">
                {signals.map((s, i) => (
                  <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                    {s.signal || s}
                  </li>
                ))}
              </ul>
            ) : <span className="text-xs text-slate-400">No signals detected</span>}
          </DemoBlock>

          {/* ERP HIRING */}
          <DemoBlock label="ERP Hiring">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold text-slate-900">{hiring.active_vacancies ?? "—"}</span>
              <span className="text-xs text-slate-400">active jobs</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">{hiring.likely_programme_stage || "—"}</div>
          </DemoBlock>

          {/* COMPLEXITY */}
          <DemoBlock label="Complexity">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{scores.migration_complexity?.value ?? "—"}</span>
              <span className="text-xs text-slate-400">/100</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">{scores.migration_complexity?.level || ""}</div>
          </DemoBlock>

          {/* POTENTIAL ECONOMICS */}
          <DemoBlock label="Potential Economics">
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
              <EconRow label="Traditional" value={formatCurrency(tradCost)} />
              <EconRow label="AI-enabled" value={formatCurrency(expectedScenario.cost?.expected)} />
              <EconRow label="Saving" value={formatCurrency(expectedScenario.saving)} accent="text-emerald-600" />
              <EconRow label="Months saved" value={expectedScenario.months_saved != null ? expectedScenario.months_saved + " mo" : "—"} accent="text-indigo-600" />
            </div>
            <div className="text-[10px] text-slate-400 mt-1.5">Illustrative estimates — up to {expectedScenario.reduction_pct || 70}% reduction, not guaranteed</div>
          </DemoBlock>

          {/* WHY HYBRID */}
          <DemoBlock label="Why Hybrid">
            <div className="grid grid-cols-2 gap-x-3 text-xs">
              <EconRow label="Current fit" value={scores.hybrid_fit?.value != null ? scores.hybrid_fit.value + "/100" : "—"} />
              <EconRow label="Future fit" value={scores.future_enterprise_fit?.value != null ? scores.future_enterprise_fit.value + "/100" : "—"} />
            </div>
          </DemoBlock>

          {/* WHO TO APPROACH */}
          <DemoBlock label="Who To Approach">
            <div className="text-sm font-medium text-slate-900">{attack.economic_buyer || "—"}</div>
            <div className="text-xs text-slate-500 mt-0.5">Champion: {attack.champion || "—"}</div>
          </DemoBlock>

          {/* NEXT ACTION */}
          <DemoBlock label="Next Action" full>
            <div className="text-sm text-slate-700">{attack.next_action || "—"}</div>
          </DemoBlock>

          {/* EVIDENCE HEALTH */}
          <DemoBlock label="Evidence Health" full>
            <div className="flex items-center gap-3">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-900">{evHealth ?? "—"}</span>
                <span className="text-xs text-slate-400">/100</span>
              </div>
              <span className="text-xs text-slate-500">{intel.reconciliation?.accuracy_principle || ""}</span>
            </div>
          </DemoBlock>
        </div>

        <div className="px-6 pb-5">
          <Button onClick={() => onNavigateTab("Overview")} variant="default" size="sm">
            <Eye className="w-3.5 h-3.5" /> View Full Analysis
          </Button>
        </div>
      </div>

      {/* Demo Narrative */}
      {narrative && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-slate-400" /> Demo Narrative
            <span className="text-[10px] text-slate-400 font-normal ml-1">Internal — not customer-facing</span>
          </h3>
          <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{narrative}</div>
        </div>
      )}

      {/* Snapshot versions */}
      {versions.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">Analysis Snapshots</h3>
          <div className="flex flex-wrap gap-2">
            {versions.map((v) => (
              <div key={v.id} className={`px-3 py-2 rounded-lg border text-xs ${v.id === account.locked_snapshot_id ? "border-indigo-300 bg-indigo-50" : "border-slate-200 bg-slate-50"}`}>
                <div className="font-medium text-slate-700">v{v.version} {v.id === account.locked_snapshot_id && "🔒"}</div>
                <div className="text-slate-400">{formatDate(v.created_at)} · Health {v.evidence_health ?? "—"}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DemoBlock({ label, children, full }) {
  return (
    <div className={full ? "lg:col-span-2" : ""}>
      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">{label}</div>
      <div>{children}</div>
    </div>
  );
}
function EconRow({ label, value, accent }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{label}</span>
      <span className={`font-medium ${accent || "text-slate-800"}`}>{value || "—"}</span>
    </div>
  );
}