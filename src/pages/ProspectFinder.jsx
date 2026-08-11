import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PriorityBadge } from "@/components/intelligence/Badges";
import { formatCurrency } from "@/lib/format";
import { ERP_SYSTEMS, INDUSTRIES } from "@/lib/erpData";
import { Crosshair, Star, Mail, GitBranch, Search, SlidersHorizontal } from "lucide-react";

export default function ProspectFinder() {
  const [accounts, setAccounts] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const a = await base44.entities.Account.list("-transformation_probability", 300);
        setAccounts(a);
      } catch (e) {} finally { setLoading(false); }
    })();
  }, []);

  const set = (k, v) => setFilters((f) => ({ ...f, [k]: v }));

  const filtered = accounts.filter((a) => {
    if (filters.country && a.country !== filters.country) return false;
    if (filters.industry && a.industry !== filters.industry) return false;
    if (filters.current_erp && a.current_erp !== filters.current_erp) return false;
    if (filters.priority && a.priority !== filters.priority) return false;
    if (filters.min_prob && (a.transformation_probability || 0) < Number(filters.min_prob)) return false;
    if (filters.min_fit && (a.hybrid_fit || 0) < Number(filters.min_fit)) return false;
    return true;
  });

  const action = async (accountId, type) => {
    setUpdating(accountId + type);
    try {
      if (type === "save") {
        await base44.entities.Account.update(accountId, { saved: true });
        setAccounts((accs) => accs.map((a) => a.id === accountId ? { ...a, saved: true } : a));
      } else if (type === "pipeline") {
        const acc = accounts.find((a) => a.id === accountId);
        const existing = await base44.entities.Pipeline.filter({ account_id: accountId });
        if (existing.length === 0) {
          await base44.entities.Pipeline.create({
            account_id: accountId, company: acc.company_name, industry: acc.industry, current_erp: acc.current_erp,
            stage: "Research", potential_value: acc.estimated_traditional_cost_expected,
            traditional_value: acc.estimated_traditional_cost_expected,
            hybrid_value: acc.estimated_traditional_cost_expected ? acc.estimated_traditional_cost_expected * 0.5 : undefined,
            client_saving: acc.potential_saving, transformation_probability: acc.transformation_probability,
            hybrid_fit: acc.hybrid_fit, next_action: "Initial outreach", next_action_date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
          });
        }
      }
    } catch (e) {} finally { setUpdating(null); }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Prospect Finder</h1>
        <p className="text-sm text-slate-500">Filter your territory to surface the highest-priority targets.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-5">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-3"><SlidersHorizontal className="w-3.5 h-3.5" /> Filters</div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <Filter label="Country"><Input value={filters.country || ""} onChange={(e) => set("country", e.target.value)} placeholder="Any" /></Filter>
          <Filter label="Industry">
            <Select value={filters.industry || ""} onValueChange={(v) => set("industry", v)}><SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger><SelectContent>{INDUSTRIES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent></Select>
          </Filter>
          <Filter label="Current ERP">
            <Select value={filters.current_erp || ""} onValueChange={(v) => set("current_erp", v)}><SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger><SelectContent>{ERP_SYSTEMS.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent></Select>
          </Filter>
          <Filter label="Priority">
            <Select value={filters.priority || ""} onValueChange={(v) => set("priority", v)}><SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger><SelectContent>{["High", "Medium", "Low"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select>
          </Filter>
          <Filter label="Min Transform"><Input type="number" value={filters.min_prob || ""} onChange={(e) => set("min_prob", e.target.value)} placeholder="0" /></Filter>
          <Filter label="Min Hybrid Fit"><Input type="number" value={filters.min_fit || ""} onChange={(e) => set("min_fit", e.target.value)} placeholder="0" /></Filter>
          <div className="flex items-end"><Button variant="outline" onClick={() => setFilters({})} className="w-full"><Search className="w-3.5 h-3.5 mr-1" /> Reset</Button></div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] text-slate-400 uppercase border-b border-slate-100">
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="px-3 py-3 font-medium">Industry</th>
              <th className="px-3 py-3 font-medium">ERP</th>
              <th className="px-3 py-3 font-medium">Trigger</th>
              <th className="px-3 py-3 font-medium">Transform</th>
              <th className="px-3 py-3 font-medium">Hybrid Fit</th>
              <th className="px-3 py-3 font-medium">Fut. Fit</th>
              <th className="px-3 py-3 font-medium">Trad. Cost</th>
              <th className="px-3 py-3 font-medium">Saving</th>
              <th className="px-3 py-3 font-medium">Priority</th>
              <th className="px-3 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="px-4 py-3"><Link to={`/accounts/${a.id}`} className="font-medium text-slate-900 hover:text-indigo-600">{a.company_name}</Link></td>
                <td className="px-3 py-3 text-slate-500">{a.industry || "—"}</td>
                <td className="px-3 py-3 text-slate-600">{a.current_erp || "—"}</td>
                <td className="px-3 py-3 text-slate-500 text-xs max-w-[140px] truncate">{a.primary_trigger || "—"}</td>
                <td className="px-3 py-3 font-semibold text-slate-800">{a.transformation_probability ?? "—"}</td>
                <td className="px-3 py-3 font-medium text-slate-700">{a.hybrid_fit ?? "—"}</td>
                <td className="px-3 py-3 font-medium text-slate-700">{a.future_enterprise_fit ?? "—"}</td>
                <td className="px-3 py-3 text-slate-600">{formatCurrency(a.estimated_traditional_cost_expected)}</td>
                <td className="px-3 py-3 text-emerald-600 font-medium">{formatCurrency(a.potential_saving)}</td>
                <td className="px-3 py-3"><PriorityBadge value={a.priority} /></td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1">
                    <IconBtn title="Analyse" to={`/accounts/${a.id}`}><Crosshair className="w-3.5 h-3.5" /></IconBtn>
                    <IconBtn title="Save" onClick={() => action(a.id, "save")} disabled={updating === a.id + "save"} active={a.saved}><Star className={`w-3.5 h-3.5 ${a.saved ? "fill-amber-400 text-amber-500" : ""}`} /></IconBtn>
                    <IconBtn title="Outreach" to={`/accounts/${a.id}`}><Mail className="w-3.5 h-3.5" /></IconBtn>
                    <IconBtn title="Add to Pipeline" onClick={() => action(a.id, "pipeline")} disabled={updating === a.id + "pipeline"}><GitBranch className="w-3.5 h-3.5" /></IconBtn>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={11} className="px-4 py-12 text-center text-slate-400">{loading ? "Loading…" : "No prospects match these filters."}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Filter({ label, children }) {
  return <div><div className="text-[11px] text-slate-400 uppercase mb-1">{label}</div>{children}</div>;
}
function IconBtn({ children, title, to, onClick, disabled, active }) {
  const cls = `w-7 h-7 rounded-md flex items-center justify-center transition-colors ${active ? "text-amber-500" : "text-slate-400 hover:text-indigo-600 hover:bg-slate-100"} disabled:opacity-40`;
  if (to) return <Link to={to} title={title} className={cls}>{children}</Link>;
  return <button title={title} onClick={onClick} disabled={disabled} className={cls}>{children}</button>;
}