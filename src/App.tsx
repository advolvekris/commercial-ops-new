import { AppShell } from "@/components/layout/AppShell";
import { LoginScreen } from "@/components/layout/LoginScreen";
import { MainHeader } from "@/components/layout/MainHeader";
import { UnifiedEntryScreen } from "@/components/layout/UnifiedEntryScreen";
import { CommercialOpsShell } from "@/components/sections/commercial-ops/CommercialOpsShell";
import { AccountsView } from "@/components/sections/accounts/AccountsView";
import { BrandView } from "@/components/sections/brand/BrandView";
import { HistoryView } from "@/components/sections/history/HistoryView";
import { NotificationsView } from "@/components/sections/notifications/NotificationsView";
import { PlannerView } from "@/components/sections/planner/PlannerView";
import { DashboardReport } from "@/components/sections/reports/DashboardReport";
import { OverviewReport } from "@/components/sections/reports/OverviewReport";
import { PartialReport } from "@/components/sections/reports/PartialReport";
import { useAppStore } from "@/store/app-store";
import { useHistorySync } from "@/hooks/useHistorySync";

function ReportContent() {
  const reportType = useAppStore((s) => s.reportType);

  if (reportType === "completo") {
    return (
      <div className="ST" id="view-dashboard">
        <DashboardReport />
      </div>
    );
  }
  if (reportType === "parcial") {
    return (
      <div className="OP" id="view-partial">
        <PartialReport />
      </div>
    );
  }
  return (
    <div className="OVV" id="view-overview">
      <OverviewReport />
    </div>
  );
}

function MainContent() {
  const currentView = useAppStore((s) => s.currentView);

  switch (currentView) {
    case "dashboard":
      return <ReportContent />;
    case "agent":
      return (
        <div className="AV" id="view-agent">
          <PlannerView />
        </div>
      );
    case "notifications":
      return (
        <div id="view-notifications">
          <NotificationsView />
        </div>
      );
    case "brand":
      return (
        <div id="view-brand">
          <BrandView />
        </div>
      );
    case "history":
      return (
        <div className="HISTV" id="view-history">
          <HistoryView />
        </div>
      );
    case "accounts":
      return (
        <div className="ACCV" id="view-accounts">
          <AccountsView />
        </div>
      );
    default:
      return null;
  }
}

export default function App() {
  useHistorySync();
  const appDomain = useAppStore((s) => s.appDomain);
  const currentUser = useAppStore((s) => s.currentUser);
  const gatePassed = useAppStore((s) => s.gatePassed);

  // Etapa 1: identificação do responsável comercial
  if (currentUser === null) {
    return <LoginScreen />;
  }

  // Etapa 2: seleção de domínio e cliente (tela unificada)
  if (appDomain !== "commercial_ops" && !gatePassed) {
    return <UnifiedEntryScreen />;
  }

  if (appDomain === "commercial_ops") {
    return <CommercialOpsShell />;
  }

  return (
    <AppShell>
      <MainHeader />
      <MainContent />
    </AppShell>
  );
}
