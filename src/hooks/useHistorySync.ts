import { useEffect, useRef } from "react";
import { useAppStore } from "@/store/app-store";
import type { NavSnapshot } from "@/store/app-store";

function buildSnapshot(s: ReturnType<typeof useAppStore.getState>): NavSnapshot {
  return {
    currentUserId: s.currentUser?.id ?? null,
    appDomain: s.appDomain,
    gatePassed: s.gatePassed,
    currentView: s.currentView,
    reportType: s.reportType,
    commercialOpsView: s.commercialOpsView,
    brandSubView: s.brandSubView,
    selectedBrandId: s.selectedBrandId,
    historyTab: s.historyTab,
    accountsSubView: s.accountsSubView,
    plannerMode: s.plannerMode,
    selectedDraftId: s.selectedDraftId,
    opsSelectedProjectId: s.opsSelectedProjectId,
  };
}

function snapshotsEqual(a: NavSnapshot, b: NavSnapshot): boolean {
  return (Object.keys(a) as (keyof NavSnapshot)[]).every((k) => a[k] === b[k]);
}

export function useHistorySync() {
  const restoreNavSnapshot = useAppStore((s) => s.restoreNavSnapshot);
  const isRestoringRef = useRef(false);
  const prevRef = useRef<NavSnapshot | null>(null);

  // Subscribe directly to the Zustand store — no re-render dependency
  useEffect(() => {
    const initial = buildSnapshot(useAppStore.getState());
    history.replaceState(initial, "");
    prevRef.current = initial;

    const unsub = useAppStore.subscribe((state) => {
      if (isRestoringRef.current) return;
      const snap = buildSnapshot(state);
      if (prevRef.current && !snapshotsEqual(snap, prevRef.current)) {
        history.pushState(snap, "");
        prevRef.current = snap;
      }
    });

    return unsub;
  }, []);

  // Listen for browser back/forward
  useEffect(() => {
    const onPopstate = (e: PopStateEvent) => {
      const snap = e.state as NavSnapshot | null;
      if (!snap) return;
      isRestoringRef.current = true;
      restoreNavSnapshot(snap);
      prevRef.current = snap;
      isRestoringRef.current = false;
    };
    window.addEventListener("popstate", onPopstate);
    return () => window.removeEventListener("popstate", onPopstate);
  }, [restoreNavSnapshot]);
}
