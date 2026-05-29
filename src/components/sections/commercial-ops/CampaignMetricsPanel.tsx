import type { ProjectMetrics } from "@/mocks/types";

interface CampaignMetricsPanelProps {
  metrics: ProjectMetrics;
  variant: "parcial" | "completo";
}

export function CampaignMetricsPanel({ metrics, variant }: CampaignMetricsPanelProps) {
  if (variant === "parcial") {
    return (
      <div className="OPS-campaign-metrics">
        <div className="OPS-campaign-hero">
          <div className="OPS-campaign-kpi">
            <span className="OPS-campaign-kpi-lbl">ROAS</span>
            <span className="OPS-campaign-kpi-val gr">{metrics.opRoas}</span>
          </div>
          <div className="OPS-campaign-kpi">
            <span className="OPS-campaign-kpi-lbl">GMV</span>
            <span className="OPS-campaign-kpi-val">R$ {metrics.opGmv}</span>
          </div>
          <div className="OPS-campaign-kpi">
            <span className="OPS-campaign-kpi-lbl">Pedidos</span>
            <span className="OPS-campaign-kpi-val">{metrics.opPedidos}</span>
          </div>
          <div className="OPS-campaign-kpi">
            <span className="OPS-campaign-kpi-lbl">Investimento</span>
            <span className="OPS-campaign-kpi-val">{metrics.opInvest}</span>
          </div>
        </div>
        <div className="OPS-campaign-row">
          <span>
            <strong>CTR</strong> {metrics.opCtr}
          </span>
          <span>
            <strong>CPC</strong> {metrics.opCpc}
          </span>
          <span>
            <strong>Impressões</strong> {metrics.opImp}
          </span>
          <span>
            <strong>Ticket médio</strong> R$ {metrics.opTicket}
          </span>
        </div>
      </div>
    );
  }

  const topPlatforms = metrics.platforms?.slice(0, 3) ?? [];
  const topCreatives = metrics.creatives?.slice(0, 3) ?? [];

  return (
    <div className="OPS-campaign-metrics">
      <div className="OPS-campaign-hero">
        <div className="OPS-campaign-kpi">
          <span className="OPS-campaign-kpi-lbl">Pedidos hero</span>
          <span className="OPS-campaign-kpi-val gr">{metrics.heroOrders}</span>
        </div>
        <div className="OPS-campaign-kpi">
          <span className="OPS-campaign-kpi-lbl">ROAS</span>
          <span className="OPS-campaign-kpi-val">{metrics.hfRoasVal}</span>
        </div>
        <div className="OPS-campaign-kpi">
          <span className="OPS-campaign-kpi-lbl">CAC</span>
          <span className="OPS-campaign-kpi-val">{metrics.hfCacVal}</span>
        </div>
        <div className="OPS-campaign-kpi">
          <span className="OPS-campaign-kpi-lbl">Budget</span>
          <span className="OPS-campaign-kpi-val">{metrics.budgetAmount}</span>
        </div>
      </div>
      <div className="OPS-campaign-row">
        <span>
          <strong>Impressões</strong> {metrics.bnImpVal}
        </span>
        <span>
          <strong>Pedidos banner</strong> {metrics.bnOrdVal}
        </span>
        <span>
          <strong>ROAS banner</strong> {metrics.bnRoasVal}
        </span>
      </div>

      {topPlatforms.length > 0 && (
        <div className="OPS-campaign-sub-section">
          <div className="OPS-campaign-sub-title">Plataformas principais</div>
          <div className="OPS-platform-list">
            {topPlatforms.map((p) => (
              <div key={p.n} className="OPS-platform-row">
                <span className="OPS-platform-name">{p.n}</span>
                <span className="OPS-platform-bar">
                  <span style={{ width: `${p.p}%` }} />
                </span>
                <span className="OPS-platform-pct">{p.p}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {topCreatives.length > 0 && (
        <div className="OPS-campaign-sub-section">
          <div className="OPS-campaign-sub-title">Criativos de destaque</div>
          <div className="OPS-creatives-list">
            {topCreatives.map((c) => (
              <div key={c.n} className="OPS-creative-row">
                <div>
                  <strong>{c.n}</strong>
                  <span> · {c.t}</span>
                </div>
                <div className="OPS-creative-metrics">
                  <span>CTR {c.ctr}</span>
                  <span>ROAS {c.roas}</span>
                  <span>Conv {c.conv}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
