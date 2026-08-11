import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { PriorityBadge, ConfidenceBadge } from "@/components/intelligence/Badges";
import { formatCurrency, timeAgo } from "@/lib/format";
import { Input } from "@/components/ui/input";

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const a = await base44.entities.Account.list("-last_analysed", 200);
        setAccounts(a);
      } catch (e) {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = accounts.filter((a) =>
    !q || a.company_name?.toLowerCase().includes(q.toLowerCase()) || a.industry?.toLowerCase().includes(q.toLowerCase()) || a.current_erp?.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Accounts</h1>
          <p className="text-sm text-slate-500">All analysed accounts in your intelligence library.</p>
        </div>
        <Link to="/analyse" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">
          <Plus className="w-4 h-4" /> Analyse New
        </Link>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search company, industry, ERP…" className="pl-9" />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] text-slate-400 uppercase tracking-wide border-b border-slate-100">
              <th className="px-5 py-3 font-medium">Company</th>
              <th className="px-3 py-3 font-medium">Industry</th>
              <th className="px-3 py-3 font-medium">Current ERP</th>
              <th className="px-3 py-3 font-medium">Transform</th>
              <th className="px-3 py-3 font-medium">Hybrid Fit</th>
              <th className="px-3 py-3 font-medium">Complexity</th>
              <th className="px-3 py-3 font-medium">Savings</th>
              <th className="px-3 py-3 font-medium">Priority</th>
              <th className="px-3 py-3 font-medium">Last</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="px-5 py-3"><Link to={`/accounts/${a.id}`} className="font-medium text-slate-900 hover:text-indigo-600">{a.company_name}</Link></td>
                <td className="px-3 py-3 text-slate-500">{a.industry || "—"}</td>
                <td className="px-3 py-3 text-slate-600">{a.current_erp || "—"}</td>
                <td className="px-3 py-3 font-semibold text-slate-800">{a.transformation_probability ?? "—"}</td>
                <td className="px-3 py-3 font-medium text-slate-700">{a.hybrid_fit ?? "—"}</td>
                <td className="px-3 py-3 font-medium text-slate-700">{a.migration_complexity ?? "—"}</td>
                <td className="px-3 py-3 text-slate-600">{formatCurrency(a.potential_saving)}</td>
                <td className="px-3 py-3"><PriorityBadge value={a.priority} /></td>
                <td className="px-3 py-3 text-slate-400 text-xs">{timeAgo(a.last_analysed)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="px-5 py-12 text-center text-slate-400">{loading ? "Loading…" : "No accounts found."}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}