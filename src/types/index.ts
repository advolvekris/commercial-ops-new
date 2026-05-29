export type ViewId =
  | "dashboard"
  | "agent"
  | "notifications"
  | "brand"
  | "history"
  | "accounts";

export type ReportType = "completo" | "parcial" | "overview";

export type PlannerMode = "home" | "novo" | "drafts" | "chat";

export type DashboardProjectStatus = "ativo" | "pausado" | "finalizado";

export type BrandSubView = "catalog" | "detail" | "new";

export type HistoryTab = "lista" | "andamento" | "kv";

export type AccountsSubView = "main" | "add";

export type AppDomain = "playground" | "commercial_ops";

export type CommercialOpsViewId = "overview" | "projects" | "campaigns" | "registry" | "new-client";

export type CommercialProjectStatus =
  | "pa-draft"
  | "pa-desconto"
  | "pa-ativo"
  | "pa-contrato"
  | "pa-faturado"
  | "pa-setup"
  | "pa-cancelado"
  | "pa-finalizado";

export interface OpsFilters {
  bu: string[];
  brands: string[];
  status: string | null;
  responsavelId: string | null;
}

export interface ResponsavelUser {
  id: string;
  name: string;
  email: string;
  role: string;
  initials: string;
  color: string;
}

export const COMMERCIAL_OPS_VIEW_LABELS: Record<CommercialOpsViewId, string> = {
  overview: "Painel geral",
  projects: "Projetos",
  campaigns: "Campanhas ativas",
  registry: "Clientes",
  "new-client": "Novo cliente",
};

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  completo: "Relatório Completo",
  parcial: "Relatório Parcial",
  overview: "Visão Geral",
};

export const PLANNER_MODE_LABELS: Record<Exclude<PlannerMode, "home" | "chat">, string> = {
  novo: "Novo projeto",
  drafts: "Drafts",
};

export const HISTORY_TAB_LABELS: Record<HistoryTab, string> = {
  lista: "Todos os projetos",
  andamento: "Projetos em andamento",
  kv: "Referências KV",
};
