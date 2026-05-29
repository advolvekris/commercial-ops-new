import { useMemo } from "react";
import { useAppStore } from "@/store/app-store";
import { buildOpportunities } from "@/lib/opportunities";

export function NotificationsView() {
  const openPlannerWithPreload = useAppStore((s) => s.openPlannerWithPreload);
  const currentBu = useAppStore((s) => s.currentBu);
  const currentBrands = useAppStore((s) => s.currentBrands);

  const opportunities = useMemo(
    () => buildOpportunities(currentBu, currentBrands),
    [currentBu, currentBrands],
  );

  const actionCount = opportunities.length;
  const scaleCount = opportunities.filter((o) => o.type === "scale").length;
  const seasonalCount = opportunities.filter((o) => o.type === "seasonal").length;

  return (
    <div className="NOTV">
      <div style={{ marginBottom: 36 }}>
        <div className="SH">
          <span />
          Inteligência
        </div>
        <h2 className="SH2">
          Central de inteligência
          <br />
          <span style={{ color: "var(--color-accent-light)" }}>de campanha.</span>
        </h2>
        <p className="SP">
          {actionCount > 0
            ? `O agente monitorou os sinais ativos e identificou ${actionCount} oportunidade${actionCount !== 1 ? "s" : ""} que requer${actionCount !== 1 ? "em" : ""} atenção.`
            : "Nenhuma oportunidade ativa no momento para este cliente."}
        </p>
      </div>

      {actionCount > 0 && (
        <div className="NOT-stats">
          <div className="NOT-stat">
            <span className="NOT-stat-num">{actionCount}</span>
            <span className="NOT-stat-lbl">oportunidades ativas</span>
          </div>
          <div className="NOT-stat-div" />
          <div className="NOT-stat">
            <span className="NOT-stat-num am">{actionCount}</span>
            <span className="NOT-stat-lbl">requerem ação</span>
          </div>
          {scaleCount > 0 && (
            <>
              <div className="NOT-stat-div" />
              <div className="NOT-stat">
                <span className="NOT-stat-num gr">{scaleCount}</span>
                <span className="NOT-stat-lbl">escala identificada</span>
              </div>
            </>
          )}
          {seasonalCount > 0 && (
            <>
              <div className="NOT-stat-div" />
              <div className="NOT-stat">
                <span className="NOT-stat-num cy">{seasonalCount}</span>
                <span className="NOT-stat-lbl">oportunidade sazonal</span>
              </div>
            </>
          )}
        </div>
      )}

      {opportunities.map((opp) => (
        <div key={opp.id} className={`NOT-card nt-${opp.type === "scale" ? "opp" : "sazon"}`}>
          <div className="NOT-icon">
            {opp.type === "scale" ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2a10 10 0 1 0 10 10" />
                <path d="M12 6v6l4 2" />
                <path d="M17 3l5 0 0 5" />
                <path d="M22 3l-5 5" />
              </svg>
            )}
          </div>
          <div className="NOT-body">
            <h4>{opp.title}</h4>
            <p>{opp.description}</p>
            <div className="NOT-meta">{opp.meta}</div>
            <span className={`NOT-pill ${opp.pillColor}`}>{opp.pill}</span>
            <div className="NOT-actions">
              <button
                type="button"
                className="NOT-cta pri"
                style={
                  opp.type === "seasonal"
                    ? { background: "rgba(34,211,238,0.12)", borderColor: "rgba(34,211,238,0.28)", color: "#22d3ee" }
                    : undefined
                }
                onClick={() => openPlannerWithPreload(opp.preload)}
              >
                {opp.ctaLabel}
              </button>
              <button type="button" className="NOT-cta">
                Ver análise
              </button>
            </div>
          </div>
        </div>
      ))}

      {actionCount === 0 && (
        <div className="NOT-empty">
          <p>Nenhuma oportunidade identificada para <strong>{currentBu}</strong> no momento.</p>
        </div>
      )}
    </div>
  );
}
