import { useMemo } from "react";
import { PROJECT_DATA, STATUS_LABELS, dashboardProjects } from "@/mocks/data";
import { useAppStore } from "@/store/app-store";

function StatusBadge({ projectIndex }: { projectIndex: number }) {
  const project = dashboardProjects[projectIndex];
  if (!project) return null;
  return (
    <div className={`PS-badge ${project.status}`} id="ps-badge-partial">
      <span className="PS-dot" />
      <span className="PS-lbl">{STATUS_LABELS[project.status]}</span>
    </div>
  );
}

export function PartialReport() {
  const projectIndex = useAppStore((s) => s.projectIndex);
  const d = PROJECT_DATA[projectIndex] ?? PROJECT_DATA[0];

  const donutOffset = useMemo(() => {
    const OC = 301.6;
    return (OC * (1 - d.opDonutPct / 100)).toFixed(0);
  }, [d.opDonutPct]);

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="OP-period" id="op-period-label">
            <span />
            {d.opPeriod}
          </div>
          <StatusBadge projectIndex={projectIndex} />
        </div>

        <div className="OP-banner">
          <div className="OP-banner-label">
            <h3>
              Resultados
              <br />
              Pós Clique
            </h3>
          </div>
          <div className="OP-kpi">
            <div className="OP-kpi-label">ROAS Atribuído</div>
            <div className="OP-kpi-val gr" id="op-roas">
              {d.opRoas}
            </div>
          </div>
          <div className="OP-kpi">
            <div className="OP-kpi-label">GMV</div>
            <div className="OP-kpi-val" id="op-gmv-wrap">
              <span className="OP-pre">R$</span>
              <span id="op-gmv">{d.opGmv}</span>
            </div>
          </div>
          <div className="OP-kpi">
            <div className="OP-kpi-label">Pedidos</div>
            <div className="OP-kpi-val" id="op-pedidos">
              {d.opPedidos}
            </div>
          </div>
          <div className="OP-kpi">
            <div className="OP-kpi-label">Ticket Médio</div>
            <div className="OP-kpi-val" id="op-ticket-wrap">
              <span className="OP-pre">R$</span>
              <span id="op-ticket">{d.opTicket}</span>
            </div>
          </div>
        </div>

        <div className="OP-row">
          <div className="OP-card">
            <div className="OP-card-title">Pré Clique</div>
            <div className="OP-row-item">
              <span className="OP-row-key">Impressões</span>
              <span className="OP-row-val" id="op-imp">
                {d.opImp}
              </span>
            </div>
            <div className="OP-row-item">
              <span className="OP-row-key">CTR</span>
              <span className="OP-row-val" id="op-ctr">
                {d.opCtr}
              </span>
            </div>
            <div className="OP-row-item">
              <span className="OP-row-key">CPC</span>
              <span className="OP-row-val" id="op-cpc">
                {d.opCpc}
              </span>
            </div>
            <div className="OP-row-item">
              <span className="OP-row-key">Investimento</span>
              <span className="OP-row-val" id="op-invest">
                {d.opInvest}
              </span>
            </div>
          </div>

          <div
            className="OP-card"
            style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
          >
            <div className="OP-card-title" style={{ alignSelf: "flex-start" }}>
              Share Recompra
            </div>
            <div className="OP-donut-wrap">
              <svg className="OP-donut-svg" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="48" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="14" />
                <circle
                  cx="60"
                  cy="60"
                  r="48"
                  fill="none"
                  stroke="var(--color-highlight)"
                  strokeWidth="14"
                  id="op-donut-circle"
                  strokeDasharray="301.6"
                  strokeDashoffset={donutOffset}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div className="OP-donut-val" id="op-donut-val" style={{ marginTop: -16 }}>
                {d.opDonutPct}%
              </div>
              <div className="OP-donut-sub">
                % de clientes únicos que realizaram
                <br />
                mais de uma compra no período.
              </div>
            </div>
          </div>

          <div className="OP-card">
            <div className="OP-card-title">Resultado por Audiência</div>
            <div className="OP-aud">
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div className="OP-aud-legend">
                  <span>
                    <i className="pu" />
                    GMV
                  </span>
                  <span>
                    <i className="wh" />
                    Ticket Médio
                  </span>
                </div>
              </div>
              <div className="OP-aud-bars" id="op-aud-bars">
                {d.opAuds.map((a) => {
                  const lines = a.n.split("\n");
                  return (
                    <div className="OP-aud-bar-wrap" key={a.n}>
                      <div className="OP-aud-bar-gmv">{a.gmv}</div>
                      <div className="OP-aud-bar" style={{ height: a.h }} />
                      <div className="OP-aud-bar-tm">{a.tm}</div>
                      <div className="OP-aud-bar-lbl">
                        {lines[0]}
                        <br />
                        {lines[1]}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="OP-aud-note" id="op-aud-note">
                {d.opAudNote}
              </div>
            </div>
          </div>
        </div>
    </>
  );
}
