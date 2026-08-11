import React from "react";
import { AlertTriangle } from "lucide-react";
import ComplexityInputs from "./commercial/ComplexityInputs";
import TraditionalEstimate from "./commercial/TraditionalEstimate";
import HybridScenarios from "./commercial/HybridScenarios";
import Explanation from "./commercial/Explanation";
import CostOfDelay from "./commercial/CostOfDelay";
import CommercialExplainability from "./commercial/CommercialExplainability";
import ConsultantDayModel from "./commercial/ConsultantDayModel";
import CommercialSensitivity from "./commercial/CommercialSensitivity";

export default function CommercialTab({ intel }) {
  const cm = intel.commercial_model || {};
  return (
    <div className="space-y-5">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-700 leading-relaxed">
          <strong>Illustrative pre-discovery estimate — validation required.</strong> These are planning estimates from Hybrid Solutions AI, not customer quotations. Hybrid references potential reductions of <em>up to 70%</em> — never a guaranteed figure.
        </p>
      </div>
      <ComplexityInputs inputs={cm.complexity_inputs} migration={cm.migration_assessment} />
      <TraditionalEstimate traditional={cm.traditional} compressibility={cm.ai_compressibility} />
      <HybridScenarios scenarios={cm.hybrid_scenarios} />
      <Explanation explanation={cm.explanation} />
      <CostOfDelay cod={cm.cost_of_delay} />
      <CommercialExplainability intel={intel} />
      <ConsultantDayModel intel={intel} />
      <CommercialSensitivity intel={intel} />
    </div>
  );
}