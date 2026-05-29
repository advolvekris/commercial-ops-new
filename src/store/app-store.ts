import { create } from "zustand";
import type {
  AccountsSubView,
  AppDomain,
  BrandSubView,
  CommercialOpsViewId,
  HistoryTab,
  OpsFilters,
  PlannerMode,
  ReportType,
  ResponsavelUser,
  ViewId,
} from "@/types";
import { RESPONSAVEIS } from "@/mocks/data";

export type PlannerPreload = {
  brands: string[];
  budget: string;
  produtos: string;
  contextMsg: string;
};

export type NavSnapshot = {
  currentUserId: string | null;
  appDomain: AppDomain | null;
  gatePassed: boolean;
  currentView: ViewId;
  reportType: ReportType;
  commercialOpsView: CommercialOpsViewId;
  brandSubView: BrandSubView;
  selectedBrandId: string | null;
  historyTab: HistoryTab;
  accountsSubView: AccountsSubView;
  plannerMode: PlannerMode;
  selectedDraftId: string | null;
  opsSelectedProjectId: string | null;
};

interface AppState {
  appDomain: AppDomain | null;
  currentUser: ResponsavelUser | null;
  gatePassed: boolean;
  currentBu: string;
  currentBrands: string[];
  currentView: ViewId;
  reportType: ReportType;
  projectIndex: number;
  plannerMode: PlannerMode;
  brandSubView: BrandSubView;
  selectedBrandId: string | null;
  historyTab: HistoryTab;
  accountsSubView: AccountsSubView;
  selectedManagedProjectId: string | null;
  selectedDraftId: string | null;
  extendProjectId: string | null;
  dateStart: string;
  dateEnd: string;
  commercialOpsView: CommercialOpsViewId;
  opsSelectedProjectId: string | null;
  opsFilters: OpsFilters;
  plannerPreload: PlannerPreload | null;
  setAppDomain: (domain: AppDomain | null) => void;
  setCurrentUser: (user: ResponsavelUser | null) => void;
  setGatePassed: (v: boolean) => void;
  setCurrentBu: (bu: string, brands: string[]) => void;
  setCurrentView: (view: ViewId) => void;
  setReportType: (type: ReportType) => void;
  setProjectIndex: (idx: number) => void;
  setPlannerMode: (mode: PlannerMode) => void;
  setBrandSubView: (view: BrandSubView, brandId?: string | null) => void;
  setHistoryTab: (tab: HistoryTab) => void;
  setAccountsSubView: (view: AccountsSubView) => void;
  setSelectedManagedProjectId: (id: string | null) => void;
  setSelectedDraftId: (id: string | null) => void;
  setExtendProjectId: (id: string | null) => void;
  setDateRange: (start: string, end: string) => void;
  setCommercialOpsView: (view: CommercialOpsViewId) => void;
  setOpsSelectedProjectId: (id: string | null) => void;
  setOpsFilters: (patch: Partial<OpsFilters>) => void;
  resetOpsFilters: () => void;
  setPlannerPreload: (preload: PlannerPreload | null) => void;
  openPlannerWithPreload: (preload: PlannerPreload) => void;
  openProjectInCommercialOps: (projectId: string) => void;
  restoreNavSnapshot: (snap: NavSnapshot) => void;
}

const defaultOpsFilters: OpsFilters = {
  bu: [],
  brands: [],
  status: null,
  responsavelId: null,
};

export const useAppStore = create<AppState>((set) => ({
  appDomain: null,
  currentUser: null,
  gatePassed: false,
  currentBu: "iFood Bebidas",
  currentBrands: ["Coca-Cola", "Ambev — Skol", "Heineken", "Red Bull", "Smirnoff Ice"],
  currentView: "dashboard",
  reportType: "overview",
  projectIndex: 0,
  plannerMode: "home",
  brandSubView: "catalog",
  selectedBrandId: null,
  historyTab: "andamento",
  accountsSubView: "main",
  selectedManagedProjectId: null,
  selectedDraftId: null,
  extendProjectId: null,
  dateStart: "2026-04-01",
  dateEnd: "2026-04-29",
  commercialOpsView: "overview",
  opsSelectedProjectId: null,
  opsFilters: { ...defaultOpsFilters },
  plannerPreload: null,
  setAppDomain: (appDomain) =>
    set({
      appDomain,
      ...(appDomain === null
        ? {
            gatePassed: false,
            opsSelectedProjectId: null,
            commercialOpsView: "overview" as CommercialOpsViewId,
          }
        : {}),
    }),
  setCurrentUser: (currentUser) => set({ currentUser }),
  setGatePassed: (gatePassed) => set({ gatePassed }),
  setCurrentBu: (currentBu, currentBrands) => set({ currentBu, currentBrands }),
  setCurrentView: (currentView) =>
    set((state) => ({
      currentView,
      ...(currentView === "agent" && !state.extendProjectId
        ? { plannerMode: "home" as PlannerMode, selectedDraftId: null }
        : {}),
      ...(currentView !== "agent" ? { extendProjectId: null } : {}),
      ...(currentView === "brand" ? { brandSubView: "catalog" as BrandSubView, selectedBrandId: null } : {}),
      ...(currentView === "accounts" ? { accountsSubView: "main" as AccountsSubView } : {}),
      ...(currentView === "history"
        ? { historyTab: "andamento" as HistoryTab, selectedManagedProjectId: null }
        : { selectedManagedProjectId: null }),
    })),
  setReportType: (reportType) => set({ reportType }),
  setProjectIndex: (projectIndex) => set({ projectIndex }),
  setPlannerMode: (plannerMode) => set({ plannerMode }),
  setBrandSubView: (brandSubView, selectedBrandId = null) =>
    set({ brandSubView, selectedBrandId }),
  setHistoryTab: (historyTab) => set({ historyTab, selectedManagedProjectId: null }),
  setAccountsSubView: (accountsSubView) => set({ accountsSubView }),
  setSelectedManagedProjectId: (selectedManagedProjectId) => set({ selectedManagedProjectId }),
  setSelectedDraftId: (selectedDraftId) => set({ selectedDraftId }),
  setExtendProjectId: (extendProjectId) => set({ extendProjectId }),
  setDateRange: (dateStart, dateEnd) => set({ dateStart, dateEnd }),
  setCommercialOpsView: (commercialOpsView) =>
    set({ commercialOpsView, opsSelectedProjectId: null }),
  setOpsSelectedProjectId: (opsSelectedProjectId) => set({ opsSelectedProjectId }),
  setOpsFilters: (patch) =>
    set((state) => ({ opsFilters: { ...state.opsFilters, ...patch } })),
  resetOpsFilters: () => set({ opsFilters: { ...defaultOpsFilters } }),
  setPlannerPreload: (plannerPreload) => set({ plannerPreload }),
  openPlannerWithPreload: (plannerPreload) =>
    set({
      plannerPreload,
      currentView: "agent",
      plannerMode: "novo",
      selectedDraftId: null,
      extendProjectId: null,
    }),
  openProjectInCommercialOps: (projectId) =>
    set({
      appDomain: "commercial_ops",
      commercialOpsView: "projects",
      opsSelectedProjectId: projectId,
    }),
  restoreNavSnapshot: (snap) =>
    set({
      currentUser: snap.currentUserId
        ? (RESPONSAVEIS.find((r) => r.id === snap.currentUserId) ?? null)
        : null,
      appDomain: snap.appDomain,
      gatePassed: snap.gatePassed,
      currentView: snap.currentView,
      reportType: snap.reportType,
      commercialOpsView: snap.commercialOpsView,
      brandSubView: snap.brandSubView,
      selectedBrandId: snap.selectedBrandId,
      historyTab: snap.historyTab,
      accountsSubView: snap.accountsSubView,
      plannerMode: snap.plannerMode,
      selectedDraftId: snap.selectedDraftId,
      opsSelectedProjectId: snap.opsSelectedProjectId,
    }),
}));
