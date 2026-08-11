import React from "react";
import { erpConfidenceStyle } from "@/lib/erpData";

export default function ConfidenceBar({ score, label }) {
  const v = Math.max(0, Math.min(100, Number(score) || 0));
  const lbl = label || (v >= 70 ? "HIGH" : v >= 40 ? "MEDIUM" : "LOW");
  const s = erpConfidenceStyle(lbl);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full ${s.bar} rounded-full transition-all`} style={{ width: `${v}%` }} />
      </div>
      <span className={`text-[11px] font-semibold ${s.color} whitespace-nowrap`}>{lbl} · {v}%</span>
    </div>
  );
}