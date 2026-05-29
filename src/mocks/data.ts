import raw from "./data.json";
import type {
  AccountEntry,
  AudienceCard,
  Brand,
  BuOption,
  ContactPerson,
  CrossClientBrand,
  DashboardProject,
  Draft,
  FeeTier,
  HypothesisCard,
  ManagedProject,
  MockResponses,
  PnHypothesis,
  ProjectMetrics,
  ProviderAccountsMap,
  ResponsavelUser,
  WeeklyDataPoint,
} from "./types";

export const weeklyData = raw.weeklyData as WeeklyDataPoint[];
export const dashboardProjects = raw.dashboardProjects as DashboardProject[];
export const PROJECT_DATA = raw.PROJECT_DATA as ProjectMetrics[];
export const MOCK = raw.MOCK as MockResponses;
export const PROMPTS = raw.PROMPTS as Record<"aud" | "plan" | "hyp" | "ins", string>;
export const STATUS_LABELS = raw.STATUS_LABELS as Record<string, string>;
export const BU_OPTIONS = raw.BU_OPTIONS as BuOption[];
export const DRAFTS = raw.DRAFTS as unknown as Draft[];
export const BRANDS = raw.BRANDS as Brand[];
export const ACCOUNTS = raw.ACCOUNTS as AccountEntry[];
export const BU_BRANDS = raw.BU_BRANDS as Record<string, string[]>;
export const PROVIDER_ACCOUNTS = raw.PROVIDER_ACCOUNTS as unknown as ProviderAccountsMap;
export const PN_HYPS = raw.PN_HYPS as unknown as PnHypothesis[];
export const FEE_TIERS = raw.FEE_TIERS as FeeTier[];
export const AUD_DATA = raw.AUD_DATA as AudienceCard[];
export const HYP_CARDS = raw.HYP_CARDS as unknown as HypothesisCard[];
export const CROSS_CLIENT_BRANDS = raw.CROSS_CLIENT_BRANDS as CrossClientBrand[];
export const managedProjectsSeed = raw.managedProjects as ManagedProject[];
export const CONTACTS = raw.CONTACTS as ContactPerson[];
export const RESPONSAVEIS = (raw as unknown as { RESPONSAVEIS: ResponsavelUser[] }).RESPONSAVEIS as ResponsavelUser[];

export const INSIGHT_ICONS: Record<string, string> = {
  gr: "trending",
  pu: "target",
  am: "lightbulb",
  bl: "users",
};

export const CR_COLORS = [
  "linear-gradient(135deg,#ef444428,#ef444410)",
  "linear-gradient(135deg,#f9731628,#f9731610)",
  "linear-gradient(135deg,#3b82f628,#3b82f610)",
];

export const SCALE_TILE_COLORS = [
  "#ef444433",
  "#f9731633",
  "#8b5cf633",
  "#3b82f633",
  "#ec489933",
  "#a3e63533",
];
