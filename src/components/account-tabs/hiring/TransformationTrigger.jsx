import React from "react";
import { Flame } from "lucide-react";

export default function TransformationTrigger({ hi }) {
  const t = hi.transformation_trigger;
  if (!t?.triggered) return null;
  return (
    <div className="bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-rose-100 flex items-center justify-center shrink-0">
        <Flame className="w-5 h-5 text-rose-600" />
      </div>
      <div>
        <div className="text-sm font-semibold text-rose-700">{t.label}</div>
        <p className="text-sm text-rose-600 mt-0.5">{t.summary}</p>
        {t.dominant_skills?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {t.dominant_skills.map((s) => (
              <span key={s} className="px-2 py-0.5 rounded text-[11px] bg-white text-rose-700 border border-rose-200">{s}</span>
            ))}
          </div>
        )}
        <p className="text-xs text-rose-500 mt-2 italic">{t.interpretation}</p>
      </div>
    </div>
  );
}