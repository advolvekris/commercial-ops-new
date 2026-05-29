import type { CommercialProjectStatus } from "@/types";

export const COMMERCIAL_STATUS_LABELS: Record<CommercialProjectStatus, string> = {
  "pa-draft": "Draft",
  "pa-desconto": "Aguardando aprovação",
  "pa-ativo": "Ativo",
  "pa-contrato": "Contrato assinado",
  "pa-faturado": "Faturado",
  "pa-setup": "Pronto para setup",
  "pa-cancelado": "Cancelado",
  "pa-finalizado": "Finalizado",
};

const FORWARD: Partial<Record<CommercialProjectStatus, CommercialProjectStatus[]>> = {
  "pa-draft": ["pa-desconto"],
  "pa-desconto": ["pa-contrato", "pa-draft"],
  "pa-contrato": ["pa-faturado"],
  "pa-faturado": ["pa-setup"],
  "pa-setup": ["pa-ativo"],
  "pa-ativo": ["pa-finalizado"],
};

const CANCELLABLE: CommercialProjectStatus[] = [
  "pa-ativo",
  "pa-contrato",
  "pa-faturado",
  "pa-setup",
];

export function isCommercialStatus(value: string): value is CommercialProjectStatus {
  return value in COMMERCIAL_STATUS_LABELS;
}

export function getStatusLabel(status: string): string {
  if (isCommercialStatus(status)) return COMMERCIAL_STATUS_LABELS[status];
  return status;
}

export function getAllowedTransitions(status: string): CommercialProjectStatus[] {
  const normalized = isCommercialStatus(status) ? status : "pa-draft";
  const forward = FORWARD[normalized] ?? [];
  const cancel = CANCELLABLE.includes(normalized) ? (["pa-cancelado"] as CommercialProjectStatus[]) : [];
  return [...forward, ...cancel];
}

export function isCancellable(status: string): boolean {
  return isCommercialStatus(status) && CANCELLABLE.includes(status);
}

export function requiresConfirmation(nextStatus: CommercialProjectStatus): boolean {
  return nextStatus === "pa-cancelado";
}

export const PIPELINE_STATUSES: CommercialProjectStatus[] = [
  "pa-draft",
  "pa-desconto",
  "pa-contrato",
  "pa-faturado",
  "pa-setup",
  "pa-ativo",
  "pa-finalizado",
  "pa-cancelado",
];
