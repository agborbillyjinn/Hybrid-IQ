import React from "react";
import SectionCard from "@/components/intelligence/SectionCard";
import { ERP_SYSTEMS } from "@/lib/erpData";
import { ShieldCheck, Database, Bot, AlertCircle } from "lucide-react";

const WEIGHTS = [
  ["ERP Age", "15%"], ["Legacy ERP Evidence", "15%"], ["ERP Recruitment", "15%"],
  ["Finance Transformation Signals", "10%"], ["M&A", "10%"], ["Executive Change", "10%"],
  ["International Expansion", "5%"], ["Cloud Strategy", "5%"], ["Business Growth", "5%"],
  ["Support / Maintenance Complexity", "5%"], ["Other Strategic Triggers", "5%"],
];

export default function Settings() {
  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-sm text-slate-500">Configuration of the HybridIQ intelligence engine.</p>
      </div>

      <SectionCard title="ERP Systems Supported" subtitle="The engine analyses across all of these — not just Business Central">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {ERP_SYSTEMS.map((e) => (
            <div key={e} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 text-sm text-slate-700">
              <Database className="w-3.5 h-3.5 text-slate-400" />{e}
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="mt-5">
        <SectionCard title="Transformation Probability Weighting Model">
          <div className="space-y-2">
            {WEIGHTS.map(([label, w]) => (
              <div key={label} className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-sm text-slate-700">{label}</span>
                <span className="text-sm font-medium text-slate-900">{w}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="mt-5">
        <SectionCard title="AI Reduction Model" subtitle="Hybrid publicly references reductions of up to 70%">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Scenario name="Conservative" pct="~30%" />
            <Scenario name="Expected" pct="~50%" />
            <Scenario name="Maximum" pct="up to 70%" highlight />
          </div>
          <p className="text-xs text-slate-500 mt-4 leading-relaxed">
            Reduction is adjusted per account based on how much implementation work appears AI-compressible. Never presented as a guaranteed figure.
          </p>
        </SectionCard>
      </div>

      <div className="mt-5 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div className="text-xs text-amber-700 leading-relaxed">
            <strong>Safety & Accuracy.</strong> HybridIQ distinguishes FACT, INFERENCE, ESTIMATE and HYPOTHESIS. Every ERP conclusion carries confidence, evidence and a last-checked date. Insufficient evidence returns UNKNOWN. Commercial calculations state: "Illustrative pre-discovery estimate. Requires validation."
          </div>
        </div>
      </div>
    </div>
  );
}

function Scenario({ name, pct, highlight }) {
  return (
    <div className={`rounded-lg p-4 text-center ${highlight ? "bg-emerald-50 border border-emerald-200" : "bg-slate-50 border border-slate-100"}`}>
      <Bot className={`w-5 h-5 mx-auto mb-2 ${highlight ? "text-emerald-600" : "text-slate-400"}`} />
      <div className="text-sm font-medium text-slate-700">{name}</div>
      <div className={`text-lg font-semibold mt-1 ${highlight ? "text-emerald-700" : "text-slate-800"}`}>{pct}</div>
    </div>
  );
}