import React from "react";
import SectionCard from "@/components/intelligence/SectionCard";
import TransformationTrigger from "@/components/account-tabs/hiring/TransformationTrigger";
import HiringSignalCard from "@/components/account-tabs/hiring/HiringSignalCard";
import ProgrammeStageInference from "@/components/account-tabs/hiring/ProgrammeStageInference";
import TechnologyEvidence from "@/components/account-tabs/hiring/TechnologyEvidence";
import ModuleIntelligence from "@/components/account-tabs/hiring/ModuleIntelligence";
import ConsultingDemand from "@/components/account-tabs/hiring/ConsultingDemand";
import TalentGap from "@/components/account-tabs/hiring/TalentGap";
import ResourcingCost from "@/components/account-tabs/hiring/ResourcingCost";
import DeliveryModel from "@/components/account-tabs/hiring/DeliveryModel";
import ConsultingEconomics from "@/components/account-tabs/hiring/ConsultingEconomics";
import EffortDisplacement from "@/components/account-tabs/hiring/EffortDisplacement";
import HistoricalTrend from "@/components/account-tabs/hiring/HistoricalTrend";
import VacancyTable from "@/components/account-tabs/hiring/VacancyTable";

export default function HiringIntelligenceTab({ account, intel }) {
  const hi = intel.hiring_intelligence;
  const vacancies = intel.job_vacancies || [];
  if (!hi) {
    return (
      <SectionCard title="ERP Hiring Intelligence">
        <p className="text-sm text-slate-400">No hiring intelligence available for this account.</p>
      </SectionCard>
    );
  }
  return (
    <div className="space-y-5">
      <TransformationTrigger hi={hi} />
      <HiringSignalCard hi={hi} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ProgrammeStageInference hi={hi} />
        <ConsultingDemand hi={hi} />
      </div>
      <TechnologyEvidence hi={hi} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ModuleIntelligence hi={hi} />
        <TalentGap hi={hi} />
      </div>
      <ResourcingCost hi={hi} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DeliveryModel hi={hi} />
        <HistoricalTrend hi={hi} />
      </div>
      <ConsultingEconomics hi={hi} />
      <EffortDisplacement hi={hi} />
      <VacancyTable vacancies={vacancies} />
    </div>
  );
}