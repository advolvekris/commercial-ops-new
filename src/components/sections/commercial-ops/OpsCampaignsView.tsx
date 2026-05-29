import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, MoreHorizontal, TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";
import { PROJECT_DATA } from "@/mocks/data";
import { getAllManagedProjects } from "@/mocks/handlers";
import type { ManagedProject } from "@/mocks/types";
import { matchesOpsFilters } from "@/lib/ops-aggregates";
import { useAppStore } from "@/store/app-store";
import { CampaignMetricsPanel } from "./CampaignMetricsPanel";

// Thresholds para classificar como "comprometido"
const PRE_CLICK_CTR_THRESHOLD = 4.0; // < 4% = pre-click comprometido
const INCREMENTAL_ROAS_THRESHOLD = 1.5; // < 1.5 = incremental comprometido
const POST_CLICK_WASTE_THRESHOLD = 35; // > 35% budget waste = pós-click comprometido

function parsePct(val: string): number {
  return Number.parseFloat(val.replace(",", ".").replace("%", "").trim()) || 0;
}

function parseRoas(val: string): number {
  return Number.parseFloat(val.replace(",", ".").replace("x", "").trim()) || 0;
}

export function OpsCampaignsView() {
  const opsFilters = useAppStore((s) => s.opsFilters);
  const setOpsSelectedProjectId = useAppStore((s) => s.setOpsSelectedProjectId);
  const setCommercialOpsView = useAppStore((s) => s.setCommercialOpsView);
  const [projects, setProjects] = useState<ManagedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    const list = await getAllManagedProjects();
    setProjects(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Apenas pa-ativo + filtros de BU/marca (status fixo — sem filtro de status aqui)
  const eligible = useMemo(
    () =>
      projects.filter(
        (p) =>
          p.status === "pa-ativo" &&
          matchesOpsFilters(p, { ...opsFilters, status: null }) &&
          p.reportIndex != null &&
          p.reportIndex >= 0,
      ),
    [projects, opsFilters],
  );

  // Computa alertas de saúde por projeto
  const healthMap = useMemo(() => {
    const map = new Map<
      string,
      { preClick: boolean; incremental: boolean; postClick: boolean }
    >();
    for (const p of eligible) {
      const m = PROJECT_DATA[p.reportIndex ?? -1];
      if (!m) continue;
      const ctr = parsePct(m.opCtr);
      const roas = parseRoas(m.opRoas);
      const waste = m.opDonutPct ?? 0;
      map.set(p.id, {
        preClick: ctr < PRE_CLICK_CTR_THRESHOLD,
        incremental: roas < INCREMENTAL_ROAS_THRESHOLD,
        postClick: waste > POST_CLICK_WASTE_THRESHOLD,
      });
    }
    return map;
  }, [eligible]);

  const alertCounts = useMemo(() => {
    let preClick = 0;
    let incremental = 0;
    let postClick = 0;
    for (const h of healthMap.values()) {
      if (h.preClick) preClick++;
      if (h.incremental) incremental++;
      if (h.postClick) postClick++;
    }
    return { preClick, incremental, postClick };
  }, [healthMap]);

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function openProjectDetail(id: string) {
    setOpsSelectedProjectId(id);
    setCommercialOpsView("projects");
  }

  if (loading) {
    return <div className="OPS-loading">Carregando campanhas…</div>;
  }

  if (eligible.length === 0) {
    return (
      <div className="OPS-view OPS-campaigns">
        <p className="OPS-empty">Nenhuma campanha ativa com métricas disponíveis para o filtro atual.</p>
      </div>
    );
  }

  const totalCompromised =
    alertCounts.preClick + alertCounts.incremental + alertCounts.postClick;

  return (
    <div className="OPS-view OPS-campaigns">
      {/* Painel de alertas gerais */}
      <div className="OPS-camp-alerts">
        <div className="OPS-camp-alert-card OPS-camp-alert-card--preclick">
          <div className="OPS-camp-alert-icon">
            <TrendingDown size={18} strokeWidth={2.5} />
          </div>
          <div className="OPS-camp-alert-body">
            <span className="OPS-camp-alert-num">{alertCounts.preClick}</span>
            <span className="OPS-camp-alert-lbl">
              {alertCounts.preClick === 1 ? "projeto" : "projetos"}
            </span>
            <span className="OPS-camp-alert-cat">Dados pré-click comprometidos</span>
            <span className="OPS-camp-alert-hint">CTR abaixo de {PRE_CLICK_CTR_THRESHOLD}%</span>
          </div>
        </div>

        <div className="OPS-camp-alert-card OPS-camp-alert-card--incremental">
          <div className="OPS-camp-alert-icon">
            <AlertTriangle size={18} strokeWidth={2.5} />
          </div>
          <div className="OPS-camp-alert-body">
            <span className="OPS-camp-alert-num">{alertCounts.incremental}</span>
            <span className="OPS-camp-alert-lbl">
              {alertCounts.incremental === 1 ? "projeto" : "projetos"}
            </span>
            <span className="OPS-camp-alert-cat">Dados incrementais comprometidos</span>
            <span className="OPS-camp-alert-hint">ROAS abaixo de {INCREMENTAL_ROAS_THRESHOLD}x</span>
          </div>
        </div>

        <div className="OPS-camp-alert-card OPS-camp-alert-card--postclick">
          <div className="OPS-camp-alert-icon">
            <TrendingUp size={18} strokeWidth={2.5} />
          </div>
          <div className="OPS-camp-alert-body">
            <span className="OPS-camp-alert-num">{alertCounts.postClick}</span>
            <span className="OPS-camp-alert-lbl">
              {alertCounts.postClick === 1 ? "projeto" : "projetos"}
            </span>
            <span className="OPS-camp-alert-cat">Dados pós-click comprometidos</span>
            <span className="OPS-camp-alert-hint">
              Budget waste acima de {POST_CLICK_WASTE_THRESHOLD}%
            </span>
          </div>
        </div>

        {totalCompromised === 0 && (
          <div className="OPS-camp-alert-card OPS-camp-alert-card--ok">
            <div className="OPS-camp-alert-icon">
              <TrendingUp size={18} strokeWidth={2.5} />
            </div>
            <div className="OPS-camp-alert-body">
              <span className="OPS-camp-alert-num">{eligible.length}</span>
              <span className="OPS-camp-alert-lbl">campanhas</span>
              <span className="OPS-camp-alert-cat">Todas saudáveis</span>
              <span className="OPS-camp-alert-hint">Sem alertas ativos</span>
            </div>
          </div>
        )}
      </div>

      {/* Listagem colapsável */}
      <div className="OPS-camp-list">
        {eligible.map((p) => {
          const idx = p.reportIndex ?? 0;
          const metrics = PROJECT_DATA[idx];
          if (!metrics) return null;

          const health = healthMap.get(p.id);
          const isExpanded = expanded.has(p.id);
          const hasAlert = health && (health.preClick || health.incremental || health.postClick);

          return (
            <div
              key={p.id}
              className={`OPS-camp-row${isExpanded ? " OPS-camp-row--expanded" : ""}${hasAlert ? " OPS-camp-row--alert" : ""}`}
            >
              {/* Cabeçalho colapsável */}
              <button
                type="button"
                className="OPS-camp-row-hdr"
                onClick={() => toggleExpand(p.id)}
              >
                <div className="OPS-camp-row-left">
                  <ChevronDown
                    size={14}
                    strokeWidth={2.5}
                    className={`OPS-camp-row-chevron${isExpanded ? " OPS-camp-row-chevron--open" : ""}`}
                  />
                  <div className="OPS-camp-row-info">
                    <span className="OPS-camp-row-name">{p.name}</span>
                    <span className="OPS-camp-row-meta">
                      {p.bu} · {p.brands.join(", ")} · {metrics.period}
                    </span>
                  </div>
                </div>

                <div className="OPS-camp-row-kpis">
                  <div className="OPS-camp-row-kpi">
                    <span
                      className={`OPS-camp-row-kpi-val${health?.incremental ? " OPS-camp-row-kpi-val--bad" : " OPS-camp-row-kpi-val--ok"}`}
                    >
                      {metrics.opRoas}x
                    </span>
                    <span className="OPS-camp-row-kpi-lbl">ROAS</span>
                  </div>
                  <div className="OPS-camp-row-kpi">
                    <span
                      className={`OPS-camp-row-kpi-val${health?.preClick ? " OPS-camp-row-kpi-val--bad" : " OPS-camp-row-kpi-val--ok"}`}
                    >
                      {metrics.opCtr}
                    </span>
                    <span className="OPS-camp-row-kpi-lbl">CTR</span>
                  </div>
                  <div className="OPS-camp-row-kpi">
                    <span className="OPS-camp-row-kpi-val">R$ {metrics.opGmv.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</span>
                    <span className="OPS-camp-row-kpi-lbl">GMV</span>
                  </div>
                  <div className="OPS-camp-row-kpi OPS-camp-row-kpi--invest">
                    <span className="OPS-camp-row-kpi-val">{metrics.opInvest}</span>
                    <span className="OPS-camp-row-kpi-lbl">Invest.</span>
                  </div>

                  {/* Alert badges */}
                  <div className="OPS-camp-row-badges">
                    {health?.preClick && (
                      <span className="OPS-camp-badge OPS-camp-badge--warn" title="Pré-click comprometido">
                        Pré-click
                      </span>
                    )}
                    {health?.incremental && (
                      <span className="OPS-camp-badge OPS-camp-badge--danger" title="ROAS abaixo da meta">
                        ROAS
                      </span>
                    )}
                    {health?.postClick && (
                      <span className="OPS-camp-badge OPS-camp-badge--warn" title="Budget waste alto">
                        Pós-click
                      </span>
                    )}
                  </div>

                  {/* Três pontos → briefing completo */}
                  <button
                    type="button"
                    className="OPS-camp-more"
                    title="Ver detalhes do briefing"
                    onClick={(e) => {
                      e.stopPropagation();
                      openProjectDetail(p.id);
                    }}
                  >
                    <MoreHorizontal size={16} strokeWidth={2} />
                  </button>
                </div>
              </button>

              {/* Painel expandido */}
              {isExpanded && (
                <div className="OPS-camp-row-detail">
                  <CampaignMetricsPanel metrics={metrics} variant="parcial" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
