export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  max_tokens?: number;
  model?: string;
}

export interface ChatResponse {
  text?: string;
  error?: string;
}

export interface AuthUser {
  email: string;
  name: string;
}

export interface DashboardProject {
  label: string;
  status: "ativo" | "pausado" | "finalizado";
}

export interface PlatformSplit {
  n: string;
  p: number;
  c: string;
  t: string;
}

export interface CreativeMetric {
  n: string;
  t: string;
  ctr: string;
  roas: string;
  conv: string;
}

export interface InsightItem {
  c: "gr" | "pu" | "am" | "bl";
  t: string;
  d: string;
}

export interface PartialAudience {
  n: string;
  gmv: string;
  tm: string;
  h: number;
}

export interface ProjectMetrics {
  period: string;
  opPeriod: string;
  heroOrders: string;
  hfIncrVal: string;
  hfRoasVal: string;
  hfRoasDelta: string;
  hfCacVal: string;
  hfCacDelta: string;
  bnImpVal: string;
  bnImpDelta: string;
  bnOrdVal: string;
  bnOrdDelta: string;
  bnRoasVal: string;
  bnRoasSub: string;
  bnRoasDelta: string;
  cacPct: string;
  cacBefore: string;
  cacAfter: string;
  cacBarPct: number;
  cacSavings: string;
  budgetWaste: string;
  budgetDonutPct: number;
  budgetBefore: string;
  budgetAmount: string;
  platforms: PlatformSplit[];
  creatives: CreativeMetric[];
  insights: InsightItem[];
  scaleMult: string;
  scaleTotal: string;
  scaleBase: string;
  opRoas: string;
  opGmv: string;
  opPedidos: string;
  opTicket: string;
  opImp: string;
  opCtr: string;
  opCpc: string;
  opInvest: string;
  opDonutPct: number;
  opAuds: PartialAudience[];
  opAudNote: string;
}

export interface HypothesisPill {
  t: string;
  c?: string;
}

export interface ManagedHypothesis {
  title: string;
  pills: HypothesisPill[];
}

export interface ProviderAccountRef {
  plat: string;
  name: string;
  id: string;
}

export interface KvRef {
  name: string;
  date: string;
  src?: string | null;
  ext?: string;
}

export interface ProjectPerformance {
  status: string;
  metrics: { lbl: string; val: string; meta: string }[];
  txt: string;
}

export interface ContactPerson {
  id: string;
  name: string;
  email: string;
  phone?: string;
  bu: string;
  brands: string[];
  projectIds?: string[];
}

export interface BuRecord {
  bu: string;
  cnpj?: string;
  tipo?: string;
  brands: string[];
  contactIds: string[];
}

export type { ResponsavelUser } from "@/types";

export interface ManagedProject {
  id: string;
  bu: string;
  name: string;
  responsavelId?: string | null;
  brands: string[];
  reportIndex?: number | null;
  contactId?: string | null;
  desc: string;
  start: string;
  end: string;
  budget: string;
  budgetNum: number;
  fee: string;
  taxas: string;
  midia_valor: string;
  status: string;
  statusLabel: string;
  objetivo: string;
  kpi: string;
  kpiTarget: string;
  verticais: string[];
  periodo: string;
  produtos: string;
  eans: string | null;
  midia: { canais: string[]; geo: string };
  briefing: string;
  hypotheses: ManagedHypothesis[];
  contas: ProviderAccountRef[];
  kvs: KvRef[];
  perf: ProjectPerformance | null;
  observacoes?: string;
}

export interface DraftHypothesis {
  title: string;
  status?: string;
  pills: HypothesisPill[];
}

export interface Draft {
  id: string;
  name: string;
  desc: string;
  date: string;
  stage: string;
  stageLabel: string;
  progress: number;
  missing: string[];
  brands: string[];
  objetivo: string;
  kpi: string;
  kpiTarget: string;
  verticais: string[];
  periodo: string;
  briefing: string;
  budget: string;
  budgetNum: number;
  fee: string;
  taxas: string;
  midia_valor: string;
  produtos: string;
  eans: string | null;
  midia: { canais: string[]; geo: string };
  hyps: DraftHypothesis[];
  agentCtx?: boolean;
  agentTrend?: boolean;
  agentPrice?: boolean;
}

export interface Brand {
  id: string;
  name: string;
  initials: string;
  color: string;
  cat: string;
  verticals: string[];
  hasLogo: boolean;
  hasBrandbook: boolean;
  hasFonts: boolean;
  inferred: boolean;
  inferDate?: string;
  fonts: string[];
  palette: string[];
}

export interface AccountEntry {
  plat: string;
  type: string;
  id: string;
  brands: string[];
  projects: string[];
  status: string;
}

export interface AudienceCard {
  name: string;
  thesis: string;
  rationale: string;
  estimativa: string;
  potencial: string;
}

export interface HypothesisCard {
  sug: string;
  title: string;
  thesis: string;
  rationale: string;
  pills: HypothesisPill[];
}

export interface PnHypothesis {
  sug: string;
  title: string;
  thesis: string;
  rationale: string;
  pills: HypothesisPill[];
  pred: {
    imp: string;
    reach: string;
    clicks: string;
    ctr: string;
    cpm: string;
    cpc: string;
    roas: string;
  };
  trend: string;
  price: string;
}

export interface FeeTier {
  max: number;
  feePct: number;
  label: string;
}

export interface CrossClientBrand {
  name: string;
  initials: string;
  color: string;
  clients: string[];
}

export interface BuOption {
  bu: string;
  brands: string[];
  count: string;
}

export type ExportFormat = "pdf" | "pptx";

export interface WeeklyDataPoint {
  name: string;
  pedidos: number;
}

export interface MockResponses {
  aud: string;
  plan: string;
  hyp: string;
  ins: string;
  default: string;
}

export interface ProviderAccountsMap {
  [brand: string]: {
    meta: ProviderAccountRef[];
    google: ProviderAccountRef[];
    tiktok: ProviderAccountRef[];
  };
}
