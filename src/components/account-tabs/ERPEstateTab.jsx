import React from "react";
import SectionCard from "@/components/intelligence/SectionCard";
import { ConfidenceBadge } from "@/components/intelligence/Badges";
import { Info } from "lucide-react";

const ESTATE_FIELDS = [
  ["current_erp_vendor", "Current ERP Vendor"],
  ["current_erp_product", "Current ERP Product"],
  ["current_version", "Current Version"],
  ["erp_confidence_score", "ERP Confidence Score"],
  ["year_implemented", "Year Implemented"],
  ["last_major_upgrade", "Last Major Upgrade"],
  ["estimated_erp_age", "Estimated ERP Age"],
  ["deployment_type", "Deployment Type"],
  ["cloud_status", "Cloud / On-Prem / Hybrid"],
  ["estimated_users", "Estimated Users"],
  ["countries", "Countries"],
  ["legal_entities", "Legal Entities"],
  ["sites_warehouses", "Sites / Warehouses"],
  ["known_modules", "Known ERP Modules"],
  ["known_customisations", "Known Customisations"],
  ["known_integrations", "Known Integrations"],
  ["implementation_partner", "Implementation Partner"],
  ["support_partner", "Support Partner"],
  ["contract_renewal_signals", "Contract / Renewal Signals"],
];

export default function ERPEstateTab({ intel }) {
  const estate = intel.erp_estate || {};
  return (
    <div className="space-y-5">
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-4 h-4 text-sky-600 mt-0.5 shrink-0" />
        <p className="text-xs text-sky-700 leading-relaxed">
          Every field shows its <strong>value</strong>, <strong>confidence</strong>, <strong>evidence count</strong> and <strong>source status</strong>. Inferred information is never presented as confirmed fact. Statuses: CONFIRMED, HIGHLY LIKELY, INFERRED, UNKNOWN.
        </p>
      </div>
      <SectionCard title="ERP Estate" subtitle="Current ERP landscape with confidence and sourcing">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          {ESTATE_FIELDS.map(([key, label]) => (
            <EstateField key={key} label={label} field={estate[key]} />
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function EstateField({ label, field }) {
  const f = field || {};
  return (
    <div className="border-b border-slate-100 pb-3">
      <div className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</div>
      <div className="flex items-center justify-between mt-1.5 gap-2">
        <div className="text-sm font-medium text-slate-800">{f.value || <span className="text-slate-300">Unknown</span>}</div>
        <ConfidenceBadge value={f.confidence || f.source_status || "UNKNOWN"} />
      </div>
      <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
        <span>{(f.evidence_count || 0)} evidence {f.evidence_count === 1 ? "item" : "items"}</span>
        {f.source_status && <span>· {f.source_status}</span>}
      </div>
    </div>
  );
}