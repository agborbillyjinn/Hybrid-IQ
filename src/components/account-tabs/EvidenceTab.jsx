import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { base44 } from "@/api/base44Client";
import SectionCard from "@/components/intelligence/SectionCard";
import EvidenceSummaryPanel from "@/components/account-tabs/evidence/EvidenceSummaryPanel";
import ErpEstatePanel from "@/components/account-tabs/evidence/ErpEstatePanel";
import ConflictsPanel from "@/components/account-tabs/evidence/ConflictsPanel";
import ResearchGapsPanel from "@/components/account-tabs/evidence/ResearchGapsPanel";
import AnalysisHistoryPanel from "@/components/account-tabs/evidence/AnalysisHistoryPanel";
import EvidenceTablePanel from "@/components/account-tabs/evidence/EvidenceTablePanel";

const HIRING_TAGS = ["programme_stage", "consulting_demand"];
const TRANSFORMATION_TAGS = ["transformation_probability", "transformation_urgency", "target_erp"];

export default function EvidenceTab({ account, intel }) {
  const [evidence, setEvidence] = useState(intel.evidence || []);
  const [clusters, setClusters] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const [e, c] = await Promise.all([
          base44.entities.Evidence.filter({ account_id: account.id }),
          base44.entities.EvidenceCluster.filter({ account_id: account.id }),
        ]);
        if (e.length) setEvidence(e);
        if (c.length) setClusters(c);
      } catch (err) {}
    })();
  }, [account.id, refreshKey]);

  // Prefer persisted clusters (re-run versions), fall back to in-memory reconciliation
  const reconciliation = clusters.length
    ? buildReconciliationFromClusters(clusters, intel.reconciliation)
    : intel.reconciliation;

  const onResolved = () => {
    setRefreshKey((k) => k + 1);
    // Also reload the page-level account intelligence so scores update
    if (typeof window !== "undefined") window.location.reload();
  };

  return (
    <Tabs defaultValue="summary" className="w-full">
      <TabsList className="mb-4 flex flex-wrap h-auto">
        <TabsTrigger value="summary">Evidence Summary</TabsTrigger>
        <TabsTrigger value="erp">ERP Evidence</TabsTrigger>
        <TabsTrigger value="hiring">Hiring Evidence</TabsTrigger>
        <TabsTrigger value="transformation">Transformation</TabsTrigger>
        <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
        <TabsTrigger value="gaps">Research Gaps</TabsTrigger>
        <TabsTrigger value="history">Analysis History</TabsTrigger>
        <TabsTrigger value="raw">Raw Evidence</TabsTrigger>
      </TabsList>

      <TabsContent value="summary"><EvidenceSummaryPanel reconciliation={reconciliation} clusters={reconciliation?.clusters || []} /></TabsContent>
      <TabsContent value="erp"><ErpEstatePanel reconciliation={reconciliation} /></TabsContent>
      <TabsContent value="hiring"><ClusterGroupPanel reconciliation={reconciliation} tags={HIRING_TAGS} title="Hiring Evidence" subtitle="Programme stage and consulting demand conclusions from vacancy evidence" /></TabsContent>
      <TabsContent value="transformation"><ClusterGroupPanel reconciliation={reconciliation} tags={TRANSFORMATION_TAGS} title="Transformation Evidence" subtitle="Transformation probability, urgency and target ERP conclusions" /></TabsContent>
      <TabsContent value="conflicts"><ConflictsPanel reconciliation={reconciliation} /></TabsContent>
      <TabsContent value="gaps"><ResearchGapsPanel reconciliation={reconciliation} account={account} onResolved={onResolved} /></TabsContent>
      <TabsContent value="history"><AnalysisHistoryPanel account={account} /></TabsContent>
      <TabsContent value="raw"><EvidenceTablePanel evidence={evidence} /></TabsContent>
    </Tabs>
  );
}

function ClusterGroupPanel({ reconciliation, tags, title, subtitle }) {
  const filtered = (reconciliation?.clusters || []).filter((c) => tags.includes(c.tag));
  if (filtered.length === 0) return <SectionCard title={title} subtitle={subtitle}><p className="text-sm text-slate-400">No evidence for these conclusions yet.</p></SectionCard>;
  return (
    <SectionCard title={title} subtitle={subtitle}>
      <div className="space-y-3">
        {filtered.map((c, i) => (
          <div key={i} className="border border-slate-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-slate-500 uppercase">{c.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700">{c.confidence}%</span>
                <span className="text-[10px] px-2 py-0.5 rounded border bg-slate-50 text-slate-600">{c.status}</span>
              </div>
            </div>
            <div className="text-sm font-semibold text-slate-900 mb-1">{c.value || "—"}</div>
            <p className="text-xs text-slate-500">{c.explanation}</p>
            {c.interpretation && <p className="text-xs text-amber-700 mt-1 italic">{c.interpretation}</p>}
            {c.supporting?.length > 0 && (
              <div className="mt-2 pt-2 border-t border-slate-100">
                <div className="text-[10px] text-slate-400 uppercase mb-1">Supporting Evidence ({c.independent_sources} independent)</div>
                <div className="flex flex-wrap gap-1.5">
                  {c.supporting.slice(0, 5).map((s, j) => (
                    <span key={j} className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">{s.source_category}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function buildReconciliationFromClusters(clusters, fallback) {
  if (!fallback) return { clusters, erp_estate: null, evidence_health: null, research_gaps: [], source_stats: {}, accuracy_principle: null };
  return { ...fallback, clusters };
}