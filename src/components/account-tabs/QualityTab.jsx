import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import SectionCard from "@/components/intelligence/SectionCard";
import { QualityPill } from "@/components/dashboard/DemoAccountsSection";
import { formatCurrency, formatDate } from "@/lib/format";
import { ShieldCheck, ShieldAlert, ShieldX, AlertTriangle, Lightbulb, TrendingUp, Users, Clock, Target, Zap } from "lucide-react";

export default function QualityTab({ account }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    // Use persisted quality data from the account if available
    if (account.quality_score != null && account.quality_breakdown) {
      setReport(buildReportFromAccount(account));
      setLoading(false);
    } else {
      runValidation(false);
    }
  }, [account.id]);

  const runValidation = async (force) => {
    setLoading(true);
    setValidating(true);
    try {
      const res = await base44.functions.invoke("validateAnalysisQuality", { account_id: account.id });
      setReport(res.data?.report || res.report);
      if (force && res.data?.report) {
        // Refresh account in parent
        window.location.reload();
      }
    } catch (e) {
      // Fallback to persisted
      if (account.quality_score != null) setReport(buildReportFromAccount(account));
    } finally {
      setLoading(false);
      setValidating(false);
    }
  };

  if (loading) return <div className="p-4 text-slate-400 flex items-center gap-2"><ShieldAlert className="w-4 h-4 animate-pulse" /> Validating analysis quality…</div>;
  if (!report) return <div className="p-4 text-slate-400">No quality report available.</div>;

  const cats = report.categories || {};
  const redFlags = report.red_flags || [];

  return (
    <div className="space-y-5">
      {/* Overall Score */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Analysis Quality Score</h3>
            <p className="text-xs text-slate-400 mt-0.5">Automated validation after analysis — {report.generated_at ? formatDate(report.generated_at) : ""}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className={`text-3xl font-bold ${scoreColor(report.score)}`}>{report.score}<span className="text-base text-slate-400">/100</span></div>
            </div>
            <QualityPill score={report.score} status={report.status} />
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => runValidation(true)} disabled={validating} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50">
            {validating ? "Re-validating…" : "Re-run validation"}
          </button>
        </div>
      </div>

      {/* Red Flags */}
      {redFlags.length > 0 && (
        <SectionCard title="Red Flags" subtitle={`${redFlags.length} issue(s) requiring attention before demo`}>
          <div className="space-y-2">
            {redFlags.map((f, i) => (
              <div key={i} className={`flex items-start gap-2.5 p-3 rounded-lg border ${flagBg(f.severity)}`}>
                <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${flagIcon(f.severity)}`} />
                <div>
                  <div className="text-sm font-medium text-slate-900">{f.flag}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{f.detail}</div>
                  <div className="text-[10px] text-slate-400 uppercase mt-1">{f.category.replace(/_/g, " ")} · {f.severity}</div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(cats).map(([key, cat]) => (
          <CategoryCard key={key} name={categoryName(key)} cat={cat} />
        ))}
      </div>
    </div>
  );
}

function CategoryCard({ name, cat }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-slate-900">{name}</h4>
        <span className={`text-lg font-bold ${scoreColor(cat.score)}`}>{cat.score}</span>
      </div>
      {cat.problems?.length > 0 && (
        <div className="mb-2">
          <div className="text-[10px] text-rose-500 uppercase font-medium mb-1">Problems</div>
          <ul className="space-y-1">
            {cat.problems.map((p, i) => <li key={i} className="text-xs text-rose-600 flex items-start gap-1.5"><span className="w-1 h-1 rounded-full bg-rose-400 mt-1.5 shrink-0" />{p}</li>)}
          </ul>
        </div>
      )}
      {cat.warnings?.length > 0 && (
        <div className="mb-2">
          <div className="text-[10px] text-amber-500 uppercase font-medium mb-1">Warnings</div>
          <ul className="space-y-1">
            {cat.warnings.map((w, i) => <li key={i} className="text-xs text-amber-600 flex items-start gap-1.5"><span className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 shrink-0" />{w}</li>)}
          </ul>
        </div>
      )}
      {cat.problems?.length === 0 && cat.warnings?.length === 0 && (
        <div className="text-xs text-emerald-600 flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> All checks passed</div>
      )}
      {cat.recommended_fix && (
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-start gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-indigo-500 mt-0.5 shrink-0" />
          <p className="text-xs text-slate-600">{cat.recommended_fix}</p>
        </div>
      )}
    </div>
  );
}

function buildReportFromAccount(account) {
  return {
    score: account.quality_score,
    status: account.quality_status,
    categories: account.quality_breakdown || {},
    red_flags: account.red_flags || [],
    generated_at: account.last_analysed,
  };
}

function categoryName(key) {
  const map = {
    erp_intelligence: "ERP Intelligence Quality",
    evidence: "Evidence Quality",
    hiring_intelligence: "Hiring Intelligence Quality",
    transformation_intelligence: "Transformation Intelligence Quality",
    commercial_model: "Commercial Model Quality",
    gtm_output: "GTM Output Quality",
  };
  return map[key] || key;
}

function scoreColor(s) {
  if (s >= 75) return "text-emerald-600";
  if (s >= 50) return "text-amber-600";
  return "text-rose-600";
}

function flagBg(sev) {
  if (sev === "high") return "bg-rose-50 border-rose-200";
  if (sev === "medium") return "bg-amber-50 border-amber-200";
  return "bg-slate-50 border-slate-200";
}
function flagIcon(sev) {
  if (sev === "high") return "text-rose-500";
  if (sev === "medium") return "text-amber-500";
  return "text-slate-400";
}