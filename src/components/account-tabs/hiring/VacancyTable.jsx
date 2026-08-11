import React, { useState } from "react";
import SectionCard from "@/components/intelligence/SectionCard";
import { formatDate } from "@/lib/format";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function VacancyTable({ vacancies }) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? vacancies : (vacancies || []).slice(0, 5);
  return (
    <SectionCard title="Vacancy Evidence" subtitle={`${vacancies?.length || 0} vacancies — historical records retained even after a job closes`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] text-slate-400 uppercase border-b border-slate-100">
              <th className="text-left font-medium py-2">Job Title</th>
              <th className="text-left font-medium py-2">ERP Product</th>
              <th className="text-left font-medium py-2">Type</th>
              <th className="text-left font-medium py-2">Status</th>
              <th className="text-left font-medium py-2">Posted</th>
              <th className="text-left font-medium py-2">Compensation</th>
              <th className="text-left font-medium py-2">Confidence</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((v, i) => (
              <tr key={i} className="border-b border-slate-50">
                <td className="py-2 text-slate-700 font-medium">{v.job_title}</td>
                <td className="py-2 text-slate-600">{v.erp_product || "—"}</td>
                <td className="py-2 text-slate-600">{v.employment_type || "—"}</td>
                <td className="py-2">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${v.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{v.status}</span>
                </td>
                <td className="py-2 text-slate-500">{v.date_posted ? formatDate(v.date_posted) : "—"}</td>
                <td className="py-2 text-slate-600">{v.advertised_compensation || "—"}</td>
                <td className="py-2 text-slate-500">{v.evidence_confidence != null ? v.evidence_confidence + "%" : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {(vacancies?.length || 0) > 5 && (
        <button onClick={() => setExpanded(!expanded)} className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700">
          {expanded ? <><ChevronUp className="w-3.5 h-3.5" />Show fewer</> : <><ChevronDown className="w-3.5 h-3.5" />Show all {vacancies.length}</>}
        </button>
      )}
    </SectionCard>
  );
}