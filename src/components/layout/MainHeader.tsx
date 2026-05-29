import { useState } from "react";
import { Download } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { ReportTypeDropdown } from "./ReportTypeDropdown";
import { ProjectFilterDropdown } from "./ProjectFilterDropdown";
import { DateRangePicker } from "./DateRangePicker";
import { ExportDialog } from "./ExportDialog";
import { PlannerDropdown } from "./PlannerDropdown";
import { BrandDropdown } from "./BrandDropdown";
import { HistoryDropdown } from "./HistoryDropdown";

const STATIC_TITLES: Partial<Record<string, string>> = {
  notifications: "Notificações",
  accounts: "Contas Google e Meta",
};

export function MainHeader() {
  const currentView = useAppStore((s) => s.currentView);
  const reportType = useAppStore((s) => s.reportType);
  const [exportOpen, setExportOpen] = useState(false);

  const isDashboard = currentView === "dashboard";
  const isAgent = currentView === "agent";
  const isBrand = currentView === "brand";
  const isHistory = currentView === "history";
  const isOverview = isDashboard && reportType === "overview";

  const showReportType = isDashboard;
  const showProjectFilter = isDashboard && !isOverview;
  const showPlanner = isAgent;
  const showHistory = isHistory;
  const showExtras = !isAgent && !isOverview;
  const staticTitle = STATIC_TITLES[currentView];
  const showStaticTitle =
    staticTitle != null && !isDashboard && !isAgent && !isBrand && !isHistory;

  return (
    <>
      <div className="MH">
        {showPlanner && <PlannerDropdown />}
        {isBrand && <BrandDropdown />}
        {showHistory && <HistoryDropdown />}
        {showStaticTitle && (
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            {staticTitle}
          </h2>
        )}
        {showReportType && <ReportTypeDropdown />}
        {showExtras && (
          <div className="MM">
            {showProjectFilter && <ProjectFilterDropdown />}
            <DateRangePicker />
            <button type="button" className="btn-export" id="btn-export" onClick={() => setExportOpen(true)}>
              <Download size={14} strokeWidth={2} />
              Exportar
            </button>
          </div>
        )}
      </div>
      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} />
    </>
  );
}
