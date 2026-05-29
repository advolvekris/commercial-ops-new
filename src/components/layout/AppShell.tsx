import { useEffect, useState, type ReactNode } from "react";
import { Menu } from "lucide-react";
import { AmbientOrbs } from "./AmbientOrbs";
import { Sidebar } from "./Sidebar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useAppStore } from "@/store/app-store";

interface AppShellProps {
  children: ReactNode;
}

const MOBILE_BREAKPOINT = 768;

export function AppShell({ children }: AppShellProps) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < MOBILE_BREAKPOINT : false,
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const currentView = useAppStore((s) => s.currentView);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [currentView, isMobile]);

  return (
    <div className="R" id="app-root">
      <AmbientOrbs />
      {!isMobile && <Sidebar />}
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
              <Sidebar />
            </SheetContent>
          </Sheet>
        </>
      )}
      <main className="M" id="main-scroll">
        {children}
      </main>
    </div>
  );
}
