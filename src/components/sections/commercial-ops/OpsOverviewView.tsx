import { useCallback, useEffect, useMemo, useState } from "react";
import { Clock, Send } from "lucide-react";
import { getCommercialAggregates } from "@/mocks/handlers";
import type { ManagedProject } from "@/mocks/types";
import { PIPELINE_STATUSES, getStatusLabel } from "@/lib/commercial-status";
import { formatMoneyBR } from "@/lib/ops-aggregates";
import { useAppStore } from "@/store/app-store";
import { BuBreakdownTable } from "./BuBreakdownTable";

function daysSince(dateStr: string): number {
  const parts = dateStr.split("/");
  if (parts.length !== 3) return 0;
  const d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
  const now = new Date();
  return Math.max(0, Math.floor((now.getTime() - d.getTime()) / 86_400_000));
}

interface OpsAlert {
  type: "sla-setup" | "relatorio-semanal" | "relatorio-final" | "atribuicao-7d" | "atribuicao-14d";
  severity: "critical" | "warning" | "info";
  projectId: string;
  projectName: string;
  bu: string;
}

const ALERT_META: Record<OpsAlert["type"], { label: string; badgeLabel: string }> = {
  "sla-setup":          { label: "SLA de setup em atraso", badgeLabel: "SLA" },
  "relatorio-semanal":  { label: "Relatório semanal pronto — enviar para cliente", badgeLabel: "Relatório" },
  "relatorio-final":    { label: "Relatório final pronto — enviar para cliente", badgeLabel: "Relatório" },
  "atribuicao-7d":      { label: "Relatório de atribuição pronto (7d) — enviar para cliente", badgeLabel: "Atribuição" },
  "atribuicao-14d":     { label: "Relatório de atribuição pronto (14d) — enviar para cliente", badgeLabel: "Atribuição" },
};

export function OpsOverviewView() {
  const opsFilters = useAppStore((s) => s.opsFilters);
  const setOpsFilters = useAppStore((s) => s.setOpsFilters);
  const setOpsSelectedProjectId = useAppStore((s) => s.setOpsSelectedProjectId);
  const setCommercialOpsView = useAppStore((s) => s.setCommercialOpsView);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<ManagedProject[]>([]);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [financials, setFinancials] = useState<{
    totals: { budget: number; fee: number; midia: number; projectCount: number };
    byBu: { bu: string; projectCount: number; budget: number; fee: number; midia: number }[];
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getCommercialAggregates(opsFilters);
    setProjects(data.projects);
    setStatusCounts(data.statusCounts);
    setFinancials(data.financials);
    setLoading(false);
  }, [opsFilters]);

  useEffect(() => {
    void load();
  }, [load]);

  const alerts = useMemo<OpsAlert[]>(() => {
    const result: OpsAlert[] = [];

    for (const p of projects) {
      // SLA: setup em atraso (> 4 dias em pa-setup)
      if (p.status === "pa-setup") {
        const days = daysSince(p.start);
        if (days >= 4) {
          result.push({
            type: "sla-setup",
            severity: days >= 8 ? "critical" : "warning",
            projectId: p.id,
            projectName: p.name,
            bu: p.bu,
          });
        }
      }

      // Relatório semanal: projetos ativos com relatório disponível
      if (p.status === "pa-ativo" && p.reportIndex != null) {
        result.push({
          type: "relatorio-semanal",
          severity: "info",
          projectId: p.id,
          projectName: p.name,
          bu: p.bu,
        });
      }

      // Relatórios de encerramento: projetos finalizados
      if (p.status === "pa-finalizado") {
        result.push({
          type: "relatorio-final",
          severity: "info",
          projectId: p.id,
          projectName: p.name,
          bu: p.bu,
        });
        const daysEnded = daysSince(p.end);
        if (daysEnded >= 14) {
          result.push({
            type: "atribuicao-14d",
            severity: "info",
            projectId: p.id,
            projectName: p.name,
            bu: p.bu,
          });
        } else if (daysEnded >= 7) {
          result.push({
            type: "atribuicao-7d",
            severity: "info",
            projectId: p.id,
            projectName: p.name,
            bu: p.bu,
          });
        }
      }
    }

    const SEVERITY_ORDER = { critical: 0, warning: 1, info: 2 };
    return result.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
  }, [projects]);

  function openProject(id: string) {
    setCommercialOpsView("projects");
    setOpsSelectedProjectId(id);
  }

  function openByStatus(status: string, count: number) {
    if (count === 0) return;
    setOpsFilters({ status });
    setCommercialOpsView("projects");
  }

  if (loading || !financials) {
    return <div className="OPS-loading">Carregando painel…</div>;
  }

  const recent = projects
    .filter((p) => !["pa-finalizado", "pa-cancelado"].includes(p.status))
    .slice(0, 5);

  return (
    <div className="OPS-view OPS-overview">
      {/* Pipeline comercial enriquecido — inclui totais financeiros e navegação por status */}
      <div className="OPS-pipeline OPS-pipeline-rich">
        <div className="OPS-pipeline-head">
          <div className="OPS-section-title">Pipeline comercial</div>
          <div className="OPS-pipeline-summary">
            <span className="OPS-pipeline-summary-item">
              <span className="OPS-pipeline-summary-lbl">Projetos</span>
              <span className="OPS-pipeline-summary-val">{financials.totals.projectCount}</span>
            </span>
            <span className="OPS-pipeline-summary-divider" />
            <span className="OPS-pipeline-summary-item">
              <span className="OPS-pipeline-summary-lbl">Budget</span>
              <span className="OPS-pipeline-summary-val">
                {formatMoneyBR(financials.totals.budget)}
              </span>
            </span>
            <span className="OPS-pipeline-summary-divider" />
            <span className="OPS-pipeline-summary-item">
              <span className="OPS-pipeline-summary-lbl">Fee</span>
              <span className="OPS-pipeline-summary-val">
                {formatMoneyBR(financials.totals.fee)}
              </span>
            </span>
            <span className="OPS-pipeline-summary-divider" />
            <span className="OPS-pipeline-summary-item">
              <span className="OPS-pipeline-summary-lbl">Mídia</span>
              <span className="OPS-pipeline-summary-val">
                {formatMoneyBR(financials.totals.midia)}
              </span>
            </span>
          </div>
        </div>
        <div className="OPS-pipeline-track">
          {PIPELINE_STATUSES.map((status) => {
            const count = statusCounts[status] ?? 0;
            return (
              <button
                key={status}
                type="button"
                className={`OPS-pipeline-stage ${status}${count > 0 ? " OPS-pipeline-stage--active" : ""}`}
                onClick={() => openByStatus(status, count)}
                title={
                  count > 0
                    ? `Ver ${count} projeto${count !== 1 ? "s" : ""} em ${getStatusLabel(status)}`
                    : undefined
                }
              >
                <span className="OPS-pipeline-count">{count}</span>
                <span className="OPS-pipeline-lbl">{getStatusLabel(status)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Financeiro por BU */}
      <div className="OPS-finance-card">
        <div className="OPS-section-title">Breakdown por BU</div>
        <BuBreakdownTable rows={financials.byBu} />
      </div>

      {/* Alertas: SLA + relatórios */}
      <div className="OPS-attention">
        <div className="OPS-section-title">Alertas</div>
        {alerts.length === 0 ? (
          <p className="OPS-muted" style={{ padding: 0 }}>
            Nenhum alerta no momento.
          </p>
        ) : (
          <div className="OPS-alerts-list">
            {alerts.map((alert) => (
              <button
                key={`${alert.projectId}-${alert.type}`}
                type="button"
                className={`OPS-alert-item OPS-alert-${alert.severity}`}
                onClick={() => openProject(alert.projectId)}
              >
                <div className="OPS-alert-icon">
                  {alert.type === "sla-setup" ? (
                    <Clock size={14} strokeWidth={2.5} />
                  ) : (
                    <Send size={14} strokeWidth={2.5} />
                  )}
                </div>
                <div className="OPS-alert-body">
                  <div className="OPS-alert-project-name">{alert.projectName}</div>
                  <div className="OPS-alert-title">{ALERT_META[alert.type].label}</div>
                  <div className="OPS-alert-project">{alert.bu}</div>
                </div>
                <span className={`OPS-alert-badge OPS-alert-badge--${alert.severity}`}>
                  {ALERT_META[alert.type].badgeLabel}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Últimos movimentos (projetos ativos) */}
      {recent.length > 0 && (
        <div className="OPS-attention">
          <div className="OPS-section-title">Últimos movimentos</div>
          <div className="OPS-attention-list">
            {recent.map((p) => (
              <button
                key={p.id}
                type="button"
                className="OPS-attention-item"
                onClick={() => openProject(p.id)}
              >
                <span className={`PA-badge ${p.status}`}>{p.statusLabel}</span>
                <span className="OPS-attention-name">{p.name}</span>
                <span className="OPS-attention-bu">
                  {p.bu} · {p.budget}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
