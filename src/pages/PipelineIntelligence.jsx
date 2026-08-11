import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/lib/format";

const STAGES = ["Research", "Target", "Contacted", "Discovery", "Qualified", "Technical Validation", "Commercial", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];

export default function PipelineIntelligence() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const p = await base44.entities.Pipeline.list("-created_date", 200);
        setItems(p);
      } catch (e) {} finally { setLoading(false); }
    })();
  }, []);

  const moveStage = async (id, stage) => {
    try {
      await base44.entities.Pipeline.update(id, { stage });
      setItems((items) => items.map((i) => i.id === id ? { ...i, stage } : i));
    } catch (e) {}
  };

  const grouped = STAGES.map((stage) => ({ stage, items: items.filter((i) => i.stage === stage) }));
  const totals = computeTotals(items);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Pipeline Intelligence</h1>
          <p className="text-sm text-slate-500">Track accounts through the ERP transformation sales motion.</p>
        </div>
        <Link to="/prospects" className="text-sm text-indigo-600 hover:underline">Find prospects →</Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KPI label="Pipeline Value" value={formatCurrency(totals.value)} />
        <KPI label="Potential Client Saving" value={formatCurrency(totals.saving)} />
        <KPI label="Active Deals" value={items.filter((i) => !["Closed Won", "Closed Lost"].includes(i.stage)).length} />
        <KPI label="Closed Won" value={items.filter((i) => i.stage === "Closed Won").length} />
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {grouped.map((col) => (
            <div key={col.stage} className="w-72 shrink-0">
              <div className="flex items-center justify-between px-3 py-2 mb-2">
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">{col.stage}</span>
                <span className="text-xs text-slate-400">{col.items.length}</span>
              </div>
              <div className="space-y-2">
                {col.items.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg border border-slate-200 p-3 hover:shadow-sm transition-shadow">
                    <Link to={`/accounts/${item.account_id}`} className="text-sm font-medium text-slate-900 hover:text-indigo-600 block truncate">{item.company}</Link>
                    <div className="text-xs text-slate-400 mt-0.5">{item.current_erp || "—"} · {item.industry || "—"}</div>
                    <div className="mt-2 grid grid-cols-2 gap-1 text-[11px]">
                      <Stat label="Value" value={formatCurrency(item.potential_value)} />
                      <Stat label="Saving" value={formatCurrency(item.client_saving)} />
                      <Stat label="Transform" value={item.transformation_probability ?? "—"} />
                      <Stat label="MEDDPICC" value={(item.meddpicc_completeness ?? 0) + "%"} />
                    </div>
                    {item.next_action && (
                      <div className="mt-2 pt-2 border-t border-slate-100">
                        <div className="text-[10px] text-slate-400 uppercase">Next: {item.next_action_date ? formatDate(item.next_action_date) : ""}</div>
                        <div className="text-xs text-slate-600 truncate">{item.next_action}</div>
                      </div>
                    )}
                    <div className="mt-2">
                      <Select value={item.stage} onValueChange={(v) => moveStage(item.id, v)}>
                        <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>{STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
                {col.items.length === 0 && <div className="text-center text-xs text-slate-300 py-8 border-2 border-dashed border-slate-100 rounded-lg">Empty</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
      {loading && items.length === 0 && <p className="text-slate-400 text-sm">Loading pipeline…</p>}
    </div>
  );
}

function KPI({ label, value }) {
  return <div className="bg-white rounded-xl border border-slate-200 p-4"><div className="text-xs text-slate-400 uppercase">{label}</div><div className="text-xl font-semibold text-slate-900 mt-1">{value}</div></div>;
}
function Stat({ label, value }) {
  return <div><span className="text-slate-400">{label}: </span><span className="font-medium text-slate-700">{value}</span></div>;
}
function computeTotals(items) {
  return {
    value: items.reduce((s, i) => s + (i.potential_value || 0), 0),
    saving: items.reduce((s, i) => s + (i.client_saving || 0), 0),
  };
}