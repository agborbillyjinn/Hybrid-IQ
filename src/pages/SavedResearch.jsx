import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { PriorityBadge } from "@/components/intelligence/Badges";
import { formatCurrency, timeAgo } from "@/lib/format";

export default function SavedResearch() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const a = await base44.entities.Account.list("-last_analysed", 300);
        setAccounts(a.filter((x) => x.saved));
      } catch (e) {} finally { setLoading(false); }
    })();
  }, []);

  const unsave = async (id) => {
    try {
      await base44.entities.Account.update(id, { saved: false });
      setAccounts((accs) => accs.filter((a) => a.id !== id));
    } catch (e) {}
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Saved Research</h1>
        <p className="text-sm text-slate-500">Accounts you've bookmarked for follow-up.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((a) => (
          <div key={a.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between">
              <Link to={`/accounts/${a.id}`} className="text-base font-semibold text-slate-900 hover:text-indigo-600">{a.company_name}</Link>
              <button onClick={() => unsave(a.id)} title="Remove"><Star className="w-4 h-4 fill-amber-400 text-amber-500" /></button>
            </div>
            <div className="text-xs text-slate-400 mt-1">{a.industry || "—"} · {a.current_erp || "Unknown ERP"}</div>
            <div className="mt-4 flex items-end justify-between">
              <div className="flex gap-4">
                <div><div className="text-[10px] text-slate-400 uppercase">Transform</div><div className="text-lg font-semibold text-indigo-600">{a.transformation_probability ?? "—"}</div></div>
                <div><div className="text-[10px] text-slate-400 uppercase">Savings</div><div className="text-lg font-semibold text-emerald-600">{formatCurrency(a.potential_saving)}</div></div>
              </div>
              <PriorityBadge value={a.priority} />
            </div>
            <div className="text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-100">Analysed {timeAgo(a.last_analysed)}</div>
          </div>
        ))}
        {accounts.length === 0 && !loading && (
          <div className="col-span-full text-center py-16 text-slate-400">
            <Star className="w-8 h-8 mx-auto mb-3 text-slate-300" />
            <p>No saved research yet. Bookmark accounts from the accounts list.</p>
            <Link to="/accounts" className="text-indigo-600 hover:underline text-sm">Browse accounts →</Link>
          </div>
        )}
      </div>
    </div>
  );
}