import React from "react";
import SectionCard from "@/components/intelligence/SectionCard";
import { ArrowRight } from "lucide-react";

const FIELDS = [
  "revenue", "employees", "erp_users", "countries", "legal_entities", "locations",
  "warehouses", "erp_modules", "integrations", "customisations", "erp_age",
  "training_population", "current_erp", "target_erp", "migration_type",
  "data_volume", "historical_data_requirement", "regulatory_requirements",
  "process_complexity", "ma_complexity", "data_quality", "expected_custom_development",
];

const LABELS = {
  revenue: "Revenue (£)", employees: "Employees", erp_users: "ERP Users", countries: "Countries",
  legal_entities: "Legal Entities", locations: "Locations", warehouses: "Warehouses",
  erp_modules: "ERP Modules", integrations: "Integrations", customisations: "Customisations",
  erp_age: "ERP Age (yrs)", current_erp: "Current ERP", target_erp: "Target ERP",
  migration_type: "Migration Type", data_volume: "Data Volume",
  historical_data_requirement: "Historical Data", regulatory_requirements: "Regulatory",
  training_population: "Training Population", process_complexity: "Process Complexity",
  ma_complexity: "M&A Complexity", data_quality: "Data Quality",
  expected_custom_development: "Expected Custom Dev",
};

export default function ComplexityInputs({ inputs, migration }) {
  const data = inputs || {};
  return (
    <SectionCard title="Account Complexity Inputs" subtitle="The 21 inputs driving the commercial model">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {FIELDS.map((k) => (
          <div key={k} className="rounded-lg bg-slate-50 border border-slate-100 p-2.5">
            <div className="text-[10px] text-slate-400 uppercase tracking-wide">{LABELS[k] || k}</div>
            <div className="text-sm font-medium text-slate-800 mt-0.5 truncate">{data[k] != null && data[k] !== "" ? data[k] : "—"}</div>
          </div>
        ))}
      </div>
      {migration && (migration.from || migration.to) && (
        <div className="mt-4 p-4 rounded-lg border border-indigo-100 bg-indigo-50/50">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 uppercase mb-1.5">
            <ArrowRight className="w-3.5 h-3.5" /> Migration Assessment
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-700 flex-wrap">
            <span className="font-medium">{migration.from || "?"}</span>
            <ArrowRight className="w-4 h-4 text-indigo-500" />
            <span className="font-medium">{migration.to || "?"}</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-500">{migration.migration_type || "—"}</span>
            {migration.complexity_multiplier != null && (
              <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 font-medium">×{migration.complexity_multiplier} complexity</span>
            )}
          </div>
          {migration.rationale && <p className="text-sm text-slate-600 mt-1.5">{migration.rationale}</p>}
        </div>
      )}
    </SectionCard>
  );
}