import { randomLatency } from "@/lib/utils";
import {
  ACCOUNTS as accountsSeed,
  BRANDS as brandsSeed,
  BU_BRANDS as buBrandsSeed,
  BU_OPTIONS,
  CONTACTS as contactsSeed,
  DRAFTS as draftsSeed,
  MOCK,
  RESPONSAVEIS as responsaveisSeed,
  managedProjectsSeed,
} from "./data";
import type { BuOption } from "./types";
import type {
  AccountEntry,
  AuthUser,
  Brand,
  BuRecord,
  ChatMessage,
  ChatResponse,
  ContactPerson,
  Draft,
  ExportFormat,
  KvRef,
  ManagedHypothesis,
  ManagedProject,
  ProviderAccountRef,
  ResponsavelUser,
} from "./types";
import { COMMERCIAL_STATUS_LABELS } from "@/lib/commercial-status";
import { aggregateFinancials, matchesOpsFilters } from "@/lib/ops-aggregates";
import type { CommercialProjectStatus, OpsFilters } from "@/types";

const AUTH_USER: AuthUser = {
  email: "demo@advolve.com",
  name: "Demo User",
};

let responsaveis = structuredClone(responsaveisSeed);
let brands = structuredClone(brandsSeed);
let drafts = structuredClone(draftsSeed);
let accounts = structuredClone(accountsSeed);
let buBrands = structuredClone(buBrandsSeed);
let managedProjects = structuredClone(managedProjectsSeed);
let contacts = structuredClone(contactsSeed);
let buOptions: BuOption[] = structuredClone(BU_OPTIONS as BuOption[]);
let buRecords: BuRecord[] = BU_OPTIONS.map((o) => ({
  bu: o.bu,
  brands: [...o.brands],
  contactIds: contacts.filter((c) => c.bu === o.bu).map((c) => c.id),
}));

const providerOverrides = new Map<string, ProviderAccountRef[]>();
const kvOverrides = new Map<string, KvRef[]>();

function pickMockKey(text: string): keyof typeof MOCK {
  const t = text.toLowerCase();
  if (/audi[eê]nc|segment/.test(t)) return "aud";
  if (/plano|m[ií]dia|budget|or[cç]amento/.test(t)) return "plan";
  if (/hip[oó]tes|novas audi/.test(t)) return "hyp";
  if (/insight|analise|an[aá]lise|dados/.test(t)) return "ins";
  return "default";
}

export async function getAuthUser(): Promise<AuthUser> {
  await randomLatency();
  return AUTH_USER;
}

export async function getResponsaveis(): Promise<ResponsavelUser[]> {
  await randomLatency();
  return structuredClone(responsaveis);
}

export async function saveResponsavel(
  rv: Omit<ResponsavelUser, "id"> & { id?: string },
): Promise<ResponsavelUser> {
  await randomLatency(200, 400);
  const existing = responsaveis.find((r) => r.id === rv.id);
  if (existing) {
    Object.assign(existing, rv);
    return structuredClone(existing);
  }
  const created: ResponsavelUser = {
    ...rv,
    id: rv.id ?? `rv${Date.now()}`,
  };
  responsaveis.push(created);
  return structuredClone(created);
}

export async function assignResponsavel(projectId: string, responsavelId: string): Promise<void> {
  await randomLatency(200, 400);
  const idx = managedProjects.findIndex((p) => p.id === projectId);
  if (idx >= 0) managedProjects[idx].responsavelId = responsavelId;
}

export async function sendChat(messages: ChatMessage[]): Promise<ChatResponse> {
  await randomLatency();
  const last = messages.filter((m) => m.role === "user").pop();
  const key = pickMockKey(last?.content ?? "");
  if (typeof window !== "undefined" && new URLSearchParams(window.location.search).has("simulateError")) {
    return { error: "Erro simulado para testes." };
  }
  return { text: MOCK[key] };
}

export async function getBrands(): Promise<Brand[]> {
  await randomLatency();
  return structuredClone(brands);
}

export async function getBrand(id: string): Promise<Brand | undefined> {
  await randomLatency();
  return structuredClone(brands.find((b) => b.id === id));
}

export async function saveBrand(brand: Brand): Promise<Brand> {
  await randomLatency(400, 900);
  const idx = brands.findIndex((b) => b.id === brand.id);
  if (idx >= 0) brands[idx] = brand;
  else brands.push(brand);
  return structuredClone(brand);
}

export async function inferBrand(_brandId: string): Promise<{ success: boolean }> {
  await randomLatency(1800, 2200);
  return { success: true };
}

export async function getDrafts(): Promise<Draft[]> {
  await randomLatency();
  return structuredClone(drafts);
}

export async function getDraft(id: string): Promise<Draft | undefined> {
  await randomLatency();
  return structuredClone(drafts.find((d) => d.id === id));
}

export async function deleteDraft(id: string): Promise<void> {
  await randomLatency(200, 500);
  drafts = drafts.filter((d) => d.id !== id);
}

export async function getManagedProjects(): Promise<ManagedProject[]> {
  await randomLatency();
  return structuredClone(managedProjects);
}

export async function getAllManagedProjects(): Promise<ManagedProject[]> {
  await randomLatency();
  return structuredClone(managedProjects);
}

export async function getContacts(): Promise<ContactPerson[]> {
  await randomLatency();
  return structuredClone(contacts);
}

export async function getBuRecords(): Promise<BuRecord[]> {
  await randomLatency();
  return structuredClone(buRecords);
}

export async function getBuOptions(): Promise<BuOption[]> {
  await randomLatency();
  return structuredClone(buOptions);
}

export async function getCommercialAggregates(filters: OpsFilters) {
  await randomLatency();
  const filtered = managedProjects.filter((p) => matchesOpsFilters(p, filters));
  const statusCounts: Record<string, number> = {};
  for (const p of filtered) {
    statusCounts[p.status] = (statusCounts[p.status] ?? 0) + 1;
  }
  return {
    projects: structuredClone(filtered),
    statusCounts,
    financials: aggregateFinancials(filtered),
  };
}

export async function updateProjectStatus(
  projectId: string,
  nextStatus: CommercialProjectStatus,
  _opts?: { reason?: string },
): Promise<ManagedProject | undefined> {
  await randomLatency(300, 600);
  const idx = managedProjects.findIndex((p) => p.id === projectId);
  if (idx < 0) return undefined;
  managedProjects[idx] = {
    ...managedProjects[idx],
    status: nextStatus,
    statusLabel: COMMERCIAL_STATUS_LABELS[nextStatus],
  };
  return structuredClone(managedProjects[idx]);
}

export async function getManagedProject(id: string): Promise<ManagedProject | undefined> {
  await randomLatency();
  const p = managedProjects.find((x) => x.id === id);
  if (!p) return undefined;
  const copy = structuredClone(p);
  if (providerOverrides.has(id)) copy.contas = providerOverrides.get(id)!;
  if (kvOverrides.has(id)) copy.kvs = kvOverrides.get(id)!;
  return copy;
}

export async function updateProjectProviders(id: string, contas: ProviderAccountRef[]): Promise<void> {
  await randomLatency();
  providerOverrides.set(id, contas);
  const idx = managedProjects.findIndex((p) => p.id === id);
  if (idx >= 0) managedProjects[idx].contas = contas;
}

export async function updateProjectKvs(id: string, kvs: KvRef[]): Promise<void> {
  await randomLatency();
  kvOverrides.set(id, kvs);
  const idx = managedProjects.findIndex((p) => p.id === id);
  if (idx >= 0) managedProjects[idx].kvs = kvs;
}

export async function updateProject(id: string, patch: Partial<ManagedProject>): Promise<void> {
  await randomLatency(300, 600);
  const idx = managedProjects.findIndex((p) => p.id === id);
  if (idx >= 0) managedProjects[idx] = { ...managedProjects[idx], ...patch };
}

export async function addProjectHypotheses(id: string, hyps: ManagedHypothesis[]): Promise<void> {
  await randomLatency(300, 600);
  const idx = managedProjects.findIndex((p) => p.id === id);
  if (idx >= 0) {
    managedProjects[idx].hypotheses = [...managedProjects[idx].hypotheses, ...hyps];
  }
}

export async function getAccounts(): Promise<AccountEntry[]> {
  await randomLatency();
  return structuredClone(accounts);
}

export async function addAccount(entry: AccountEntry): Promise<AccountEntry> {
  await randomLatency();
  accounts.push(entry);
  return structuredClone(entry);
}

export async function verifyAccount(_plat: string, _id: string): Promise<{ ok: boolean; checks: string[] }> {
  await randomLatency(1500, 1800);
  return {
    ok: true,
    checks: [
      "Leitura de campanhas",
      "Edição de orçamento",
      "Criação de audiências",
      "Acesso a relatórios",
    ],
  };
}

export async function createBuBrand(
  buName: string,
  brandNames: string[],
  opts?: { cnpj?: string; tipo?: string; contact?: { name: string; email?: string; phone?: string } },
): Promise<void> {
  await randomLatency();
  buBrands[buName] = brandNames;
  buOptions.push({ bu: buName, brands: brandNames, count: `${brandNames.length} marcas` });
  const contactIds: string[] = [];
  if (opts?.contact?.name) {
    const id = `ct${Date.now()}`;
    const person: ContactPerson = {
      id,
      name: opts.contact.name,
      email: opts.contact.email ?? "",
      phone: opts.contact.phone,
      bu: buName,
      brands: brandNames,
      projectIds: [],
    };
    contacts.push(person);
    contactIds.push(id);
  }
  buRecords.push({ bu: buName, cnpj: opts?.cnpj, tipo: opts?.tipo, brands: brandNames, contactIds });
}

export async function addBrandToBu(buName: string, brandName: string): Promise<void> {
  await randomLatency();
  const brands = buBrands[buName] ?? [];
  if (!brands.includes(brandName)) brands.push(brandName);
  buBrands[buName] = brands;
  const opt = buOptions.find((o) => o.bu === buName);
  if (opt) {
    opt.brands = brands;
    opt.count = `${brands.length} marca${brands.length !== 1 ? "s" : ""}`;
  }
  const rec = buRecords.find((r) => r.bu === buName);
  if (rec && !rec.brands.includes(brandName)) rec.brands.push(brandName);
}

export async function createContact(
  contact: Omit<ContactPerson, "id"> & { id?: string },
): Promise<ContactPerson> {
  await randomLatency();
  const person: ContactPerson = {
    ...contact,
    id: contact.id ?? `ct${Date.now()}`,
    projectIds: contact.projectIds ?? [],
  };
  contacts.push(person);
  const rec = buRecords.find((r) => r.bu === person.bu);
  if (rec && !rec.contactIds.includes(person.id)) rec.contactIds.push(person.id);
  return structuredClone(person);
}

export async function linkContactToProject(contactId: string, projectId: string): Promise<void> {
  await randomLatency();
  const contact = contacts.find((c) => c.id === contactId);
  const project = managedProjects.find((p) => p.id === projectId);
  if (contact && !contact.projectIds?.includes(projectId)) {
    contact.projectIds = [...(contact.projectIds ?? []), projectId];
  }
  if (project) project.contactId = contactId;
}

export async function exportReport(format: ExportFormat, label: string): Promise<Blob> {
  await randomLatency(800, 1200);
  const mime = format === "pdf" ? "application/pdf" : "application/vnd.ms-powerpoint";
  return new Blob([`Relatório Advolve — ${label} (mock)`], { type: mime });
}

export function resetMockState() {
  brands = structuredClone(brandsSeed);
  drafts = structuredClone(draftsSeed);
  accounts = structuredClone(accountsSeed);
  buBrands = structuredClone(buBrandsSeed);
  managedProjects = structuredClone(managedProjectsSeed);
  contacts = structuredClone(contactsSeed);
  buOptions = structuredClone(BU_OPTIONS as BuOption[]);
  buRecords = BU_OPTIONS.map((o) => ({
    bu: o.bu,
    brands: [...o.brands],
    contactIds: contacts.filter((c) => c.bu === o.bu).map((c) => c.id),
  }));
  providerOverrides.clear();
  kvOverrides.clear();
}
