import React from "react";
import SectionCard from "@/components/intelligence/SectionCard";
import { HelpCircle, Search } from "lucide-react";

export default function Unknowns({ unansweredQuestions, recommendedResearch }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <SectionCard title="Unanswered Questions" subtitle="Open questions the evidence could not resolve">
        {unansweredQuestions?.length ? (
          <ul className="space-y-2">
            {unansweredQuestions.map((q, i) => (
              <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />{q}
              </li>
            ))}
          </ul>
        ) : <p className="text-sm text-slate-400">No open questions.</p>}
      </SectionCard>
      <SectionCard title="Recommended Research" subtitle="Specific missing evidence to collect next">
        {recommendedResearch?.length ? (
          <ul className="space-y-2">
            {recommendedResearch.map((r, i) => (
              <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                <Search className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />{r}
              </li>
            ))}
          </ul>
        ) : <p className="text-sm text-slate-400">No research gaps identified.</p>}
      </SectionCard>
    </div>
  );
}