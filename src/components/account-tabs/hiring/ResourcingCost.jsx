import React from "react";
import SectionCard from "@/components/intelligence/SectionCard";
import { formatCurrency } from "@/lib/format";
import { Info } from "lucide-react";

export default function ResourcingCost({ hi }) {
  const r = hi.resourcing || {};
  const fmt = (v) => (v != null ? formatCurrency(v) : "—");
  return (
    <SectionCard title="Resourcing Cost Model" subtitle="Estimated internal & external ERP resourcing requirements">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="text-[10px] font-semibold text-slate-400 uppercase mb-2">Advertised Compensation</div>
          <div className="space-y-1.5">
            {r.advertised?.length ? r.advertised.map((a, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-slate-700">{a.job_title}</span>
                <span className="font-medium text-slate-800">{a.advertised_compensation}</span>
              </div>
            )) : <span className="text-xs text-slate-400">No advertised compensation</span>}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-semibold text-slate-400 uppercase mb-2">Estimated FTE & Roles</div>
          <div className="text-sm text-slate-700">Estimated FTE: <strong>{r.estimated_fte}</strong></div>
          <div className="text-sm text-slate-700 mt-1">Contractor requirement: <strong>{r.contractor_requirement}</strong></div>
          <div className="text-sm text-slate-700 mt-1">Consulting requirement (gaps): <strong>{r.consulting_requirement}</strong></div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        <Cost label="Permanent Staff Cost (incl. on-costs)" range={r.permanent_staff_cost} fmt={fmt} />
        <Cost label="Estimated Contractor Spend" range={r.estimated_contractor_spend} fmt={fmt} />
        <Cost label="Estimated Consulting Spend" range={r.estimated_consulting_spend} fmt={fmt} />
        <Cost label="Estimated Total Resourcing" range={r.estimated_total_resourcing} fmt={fmt} highlight />
      </div>
      <div className="mt-3 flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
        <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
        <span>{r.note}</span>
      </div>
    </SectionCard>
  );
}

function Cost({ label, range, fmt, highlight }) {
  return (
    <div className={`rounded-lg border p-3 ${highlight ? "border-indigo-200 bg-indigo-50/40" : "border-slate-200 bg-slate-50"}`}>
      <div className="text-[10px] font-medium text-slate-400 uppercase">{label}</div>
      {range ? (
        <div className="mt-1">
          <div className={`text-base font-semibold ${highlight ? "text-indigo-700" : "text-slate-800"}`}>{fmt(range.expected)}</div>
          <div className="text-[11px] text-slate-400">{fmt(range.low)}–{fmt(range.high)}</div>
        </div>
      ) : <div className="text-base font-semibold text-slate-400 mt-1">—</div>}
    </div>
  );
}