import { AgentView } from "@/components/sections/agent/AgentView";
import { useAppStore } from "@/store/app-store";
import { BriefingFlow } from "./BriefingFlow";
import { DraftsPanel } from "./DraftsPanel";
import { PlannerHome } from "./PlannerHome";

export function PlannerView() {
  const plannerMode = useAppStore((s) => s.plannerMode);
  const selectedDraftId = useAppStore((s) => s.selectedDraftId);
  const extendProjectId = useAppStore((s) => s.extendProjectId);

  return (
    <>
      {plannerMode === "home" && <PlannerHome />}

      {plannerMode === "chat" && <AgentView />}

      {plannerMode === "novo" && (
        <div id="pp-novo" className="NP-panel" style={{ display: "flex" }}>
          <BriefingFlow
            key={extendProjectId ?? selectedDraftId ?? "new"}
            draftId={selectedDraftId}
            extendProjectId={extendProjectId}
          />
        </div>
      )}

      {plannerMode === "drafts" && (
        <div id="pp-drafts" className="PD-panel" style={{ display: "flex" }}>
          <DraftsPanel />
        </div>
      )}
    </>
  );
}
