import { useEffect, useState, type ReactNode } from "react";
import { Menu } from "lucide-react";
import { AmbientOrbs } from "@/components/layout/AmbientOrbs";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useAppStore } from "@/store/app-store";
import { CommercialOpsHeader } from "./CommercialOpsHeader";
import { CommercialOpsSidebar } from "./CommercialOpsSidebar";
import { NewClientView } from "./NewClientView";
import { OpsCampaignsView } from "./OpsCampaignsView";
import { OpsOverviewView } from "./OpsOverviewView";
import { OpsProjectsView } from "./OpsProjectsView";
import { OpsRegistryView } from "./OpsRegistryView";

const MOBILE_BREAKPOINT = 768;

function OpsContent() {
  const commercialOpsView = useAppStore((s) => s.commercialOpsView);

  switch (commercialOpsView) {
    case "overview":
      return <OpsOverviewView />;
    case "projects":
      return <OpsProjectsView />;
    case "campaigns":
      return <OpsCampaignsView />;
    case "registry":
      return <OpsRegistryView />;
    case "new-client":
      return <NewClientView />;
    default:
      return null;
  }
}

export function CommercialOpsShell({ children }: { children?: ReactNode }) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < MOBILE_BREAKPOINT : false,
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const commercialOpsView = useAppStore((s) => s.commercialOpsView);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [commercialOpsView, isMobile]);

  return (
    <div className="R OPS-shell" id="commercial-ops-root">
      <AmbientOrbs />
      {!isMobile && <CommercialOpsSidebar />}
      {isMobile && (
        <>
          <button
            type="button"
            className="SH-menu-btn"
            aria-label="Abrir menu"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={18} strokeWidth={2} />
          </button>
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetContent>
              <CommercialOpsSidebar />
            </SheetContent>
          </Sheet>
        </>
      )}
      <main className="M OPS-main">
        <CommercialOpsHeader />
        <div className="OPS-content">{children ?? <OpsContent />}</div>
      </main>
    </div>
  );
}
