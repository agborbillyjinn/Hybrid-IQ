import React from "react";
import { scoreBand, fitBand } from "@/lib/erpData";

export default function ScoreGauge({ label, value, type = "score", subtitle }) {
  const v = Math.round(Number(value) || 0);
  const band = type === "fit" ? fitBand(v) : scoreBand(v);
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (v / 100) * circumference;
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="7" className="text-slate-100" />
          <circle
            cx="50" cy="50" r="42" fill="none" strokeWidth="7" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={band.bar.replace("bg-", "stroke-") + " transition-all duration-700"}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-semibold ${band.color}`}>{v}</span>
          <span className="text-[10px] text-slate-400 -mt-1">/ 100</span>
        </div>
      </div>
      <div className="mt-2 text-center">
        <div className="text-sm font-medium text-slate-700">{label}</div>
        <div className={`text-xs ${band.color}`}>{band.label}</div>
        {subtitle && <div className="text-[11px] text-slate-400 mt-0.5">{subtitle}</div>}
      </div>
    </div>
  );
}