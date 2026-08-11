import React, { useState } from "react";
import SectionCard from "@/components/intelligence/SectionCard";
import { base44 } from "@/api/base44Client";
import { ConfidenceBadge } from "@/components/intelligence/Badges";
import { Textarea } from "@/components/ui/textarea";
import { Check, Save } from "lucide-react";

const FIELDS = [
  ["metrics", "Metrics"],
  ["economic_buyer", "Economic Buyer"],
  ["decision_criteria", "Decision Criteria"],
  ["decision_process", "Decision Process"],
  ["paper_process", "Paper Process"],
  ["pain", "Pain"],
  ["champion", "Champion"],
  ["competition", "Competition"],
];

export default function MeddpiccTab({ account, onUpdate }) {
  const med = (account.intelligence?.meddpicc) || {};
  const [draft, setDraft] = useState(med);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = (field, key, value) => {
    setDraft((d) => ({ ...d, [field]: { ...(d[field] || {}), [key]: value } }));
    setDirty(true);
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      const newIntel = { ...account.intelligence, meddpicc: draft };
      await base44.entities.Account.update(account.id, { intelligence: newIntel });
      onUpdate({ intelligence: newIntel });
      setDirty(false);
      setSaved(true);
    } catch (e) {}
    setSaving(false);
  };

  const completeness = computeCompleteness(draft);

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">MEDDPICC Workspace</h3>
          <p className="text-xs text-slate-400 mt-0.5">Update every field manually — completeness updates live.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-slate-400">Completeness</div>
            <div className="text-2xl font-semibold text-indigo-600">{completeness}%</div>
          </div>
          <div className="w-28 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all" style={{ width: `${completeness}%` }} />
          </div>
          <button onClick={save} disabled={!dirty || saving} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50">
            {saving ? "Saving…" : saved ? <><Check className="w-4 h-4" /> Saved</> : <><Save className="w-4 h-4" /> Save</>}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {FIELDS.map(([key, label]) => (
          <MedCard key={key} field={draft[key] || {}} label={label} onChange={(k, v) => set(key, k, v)} />
        ))}
      </div>
    </div>
  );
}

function MedCard({ field, label, onChange }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-slate-900">{label}</h4>
        <ConfidenceBadge value={field.confidence} />
      </div>
      <div className="space-y-2.5">
        <Input label="Known" value={field.known} onChange={(v) => onChange("known", v)} />
        <Input label="Hypothesised" value={field.hypothesised} onChange={(v) => onChange("hypothesised", v)} />
        <Input label="Unknown" value={field.unknown} onChange={(v) => onChange("unknown", v)} />
        <Input label="Evidence" value={field.evidence} onChange={(v) => onChange("evidence", v)} />
        <div>
          <div className="text-[11px] text-slate-400 uppercase mb-1">Recommended Discovery Question</div>
          <Textarea value={field.discovery_question || ""} onChange={(e) => onChange("discovery_question", e.target.value)} rows={2} className="text-sm" />
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange }) {
  return (
    <div>
      <div className="text-[11px] text-slate-400 uppercase mb-1">{label}</div>
      <Textarea value={value || ""} onChange={(e) => onChange(e.target.value)} rows={1} className="text-sm resize-none" />
    </div>
  );
}

function computeCompleteness(med) {
  const keys = Object.keys(med);
  if (!keys.length) return 0;
  let filled = 0;
  let total = 0;
  for (const k of keys) {
    const f = med[k] || {};
    for (const field of ["known", "hypothesised", "evidence", "discovery_question"]) {
      total++;
      if (f[field] && String(f[field]).trim()) filled++;
    }
  }
  return total ? Math.round((filled / total) * 100) : 0;
}