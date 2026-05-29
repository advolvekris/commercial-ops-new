import type { ManagedProject } from "@/mocks/types";
import type { OpsFilters } from "@/types";

export function parseMoneyBR(value: string | undefined | null): number {
  if (!value) return 0;
  const digits = value.replace(/[^0-9,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const num = Number.parseFloat(digits);
  return Number.isFinite(num) ? num : 0;
}

export function formatMoneyBRFull(value: number): string {
  return `R$ ${Number(value).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatMoneyBR(value: number): string {
  if (value >= 1_000_000) {
    return `R$ ${(value / 1_000_000).toFixed(2).replace(".", ",")}MM`;
  }
  if (value >= 1_000) {
    return `R$ ${(value / 1_000).toFixed(0)}K`;
  }
  return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function matchesOpsFilters(project: ManagedProject, filters: OpsFilters): boolean {
  if (filters.bu.length > 0 && !filters.bu.includes(project.bu)) return false;
  if (filters.brands.length > 0 && !filters.brands.some((b) => project.brands?.includes(b))) {
    return false;
  }
  if (filters.status && project.status !== filters.status) return false;
  if (filters.responsavelId && project.responsavelId !== filters.responsavelId) return false;
  return true;
}

export interface BuFinancialRow {
  bu: string;
  projectCount: number;
  budget: number;
  fee: number;
  midia: number;
}

export interface OpsFinancialTotals {
  budget: number;
  fee: number;
  midia: number;
  projectCount: number;
}

export function aggregateFinancials(projects: ManagedProject[]): {
  totals: OpsFinancialTotals;
  byBu: BuFinancialRow[];
} {
  const buMap = new Map<string, BuFinancialRow>();

  let budget = 0;
  let fee = 0;
  let midia = 0;

  for (const p of projects) {
    const b = p.budgetNum ?? 0;
    const f = parseMoneyBR(p.fee);
    const m = parseMoneyBR(p.midia_valor);
    budget += b;
    fee += f;
    midia += m;

    const row = buMap.get(p.bu) ?? {
      bu: p.bu,
      projectCount: 0,
      budget: 0,
      fee: 0,
      midia: 0,
    };
    row.projectCount += 1;
    row.budget += b;
    row.fee += f;
    row.midia += m;
    buMap.set(p.bu, row);
  }

  return {
    totals: { budget, fee, midia, projectCount: projects.length },
    byBu: [...buMap.values()].sort((a, b) => b.budget - a.budget),
  };
}

export function countByStatus(projects: ManagedProject[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const p of projects) {
    counts[p.status] = (counts[p.status] ?? 0) + 1;
  }
  return counts;
}
