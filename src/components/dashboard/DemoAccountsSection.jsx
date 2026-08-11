import React from "react";
import { Link } from "react-router-dom";
import { Lock, Star, ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";
import { formatCurrency, timeAgo } from "@/lib/format";

export default function DemoAccountsSection({ accounts, onTogglePin }) {
  const demoAccounts = accounts.filter((a) => a.is_demo_account).slice(0, 5);

  if (demoAccounts.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 mt-5">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-semibold text-slate-900">Demo Accounts</h3>
          <span className="text-xs text-slate-400">{demoAccounts.length}/5 pinned</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] text-slate-400 uppercase tracking-wide border-b border-slate-100">
              <th className="px-5 py-2.5 font-medium">Company</th>
              <th className="px-3 py-2.5 font-medium">Current ERP</th>
              <th className="px-3 py-2.5 font-medium text-right">ERP Conf</th>
              <th className="px-3 py-2.5 font-medium text-right">Transform</th>
              <th className="px-3 py-2.5 font-medium text-right">Hybrid Fit</th>
              <th className="px-3 py-2.5 font-medium text-right">Future Fit</th>
              <th className="px-3 py-2.5 font-medium text-right">Complexity</th>
              <th className="px-3 py-2.5 font-medium text-right">Hiring</th>
              <th className="px-3 py-2.5 font-medium text-right">Ev Health</th>
              <th className="px-3 py-2.5 font-medium text-right">Commercial</th>
              <th className="px-3 py-2.5 font-medium">Quality</th>
              <th className="px-3 py-2.5 font-medium">Last</th>
              <th className="px-3 py-2.5 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {demoAccounts.map((a) => {
              const intel = a.intelligence || {};
              const erpConf = intel.erp_estate?.current_erp_product?.confidence;
              const hiring = intel.hiring_intelligence?.hiring_signal_score;
              const evHealth = intel.reconciliation?.evidence_health?.overall;
              const commercialConf = intel.commercial_model?.hybrid_scenarios?.[0]?.confidence;
              return (
                <tr key={a.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-5 py-2.5">
                    <Link to={`/accounts/${a.id}`} className="font-medium text-slate-900 hover:text-indigo-600 flex items-center gap-1.5">
                      {a.is_locked && <Lock className="w-3 h-3 text-slate-400" />}
                      {a.company_name}
                    </Link>
                  </td>
                  <td className="px-3 py-2.5 text-slate-600">{a.current_erp || "—"}</td>
                  <td className="px-3 py-2.5 text-right text-slate-600">{erpConf != null ? erpConf + "%" : "—"}</td>
                  <td className="px-3 py-2.5 text-right font-medium text-slate-700">{a.transformation_probability ?? "—"}</td>
                  <td className="px-3 py-2.5 text-right font-medium text-slate-700">{a.hybrid_fit ?? "—"}</td>
                  <td className="px-3 py-2.5 text-right font-medium text-slate-700">{a.future_enterprise_fit ?? "—"}</td>
                  <td className="px-3 py-2.5 text-right font-medium text-slate-700">{a.migration_complexity ?? "—"}</td>
                  <td className="px-3 py-2.5 text-right text-slate-600">{hiring ?? "—"}</td>
                  <td className="px-3 py-2.5 text-right text-slate-600">{evHealth != null ? evHealth + "/100" : "—"}</td>
                  <td className="px-3 py-2.5 text-right text-slate-600">{commercialConf || "—"}</td>
                  <td className="px-3 py-2.5"><QualityPill score={a.quality_score} status={a.quality_status} /></td>
                  <td className="px-3 py-2.5 text-slate-400 text-xs">{timeAgo(a.last_analysed)}</td>
                  <td className="px-3 py-2.5">
                    <button onClick={() => onTogglePin?.(a)} className="text-amber-500 hover:text-amber-600" title="Unpin demo account">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function QualityPill({ score, status }) {
  if (status === "PASS" || (score != null && score >= 75)) {
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"><ShieldCheck className="w-3 h-3" />{score ?? "—"} PASS</span>;
  }
  if (status === "FAIL" || (score != null && score < 50)) {
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200"><ShieldX className="w-3 h-3" />{score ?? "—"} FAIL</span>;
  }
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200"><ShieldAlert className="w-3 h-3" />{score ?? "—"} REVIEW</span>;
}