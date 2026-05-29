import { useCallback, useEffect, useState, type ReactElement } from "react";
import { deleteDraft, getDraft, getDrafts } from "@/mocks/handlers";
import type { Draft, DraftHypothesis } from "@/mocks/types";
import { useAppStore } from "@/store/app-store";

const PD_ICONS: Record<string, ReactElement> = {
  "s-done": (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  "s-gen": (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  ),
  "s-wait": (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  "s-inc": (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  "s-brief": (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
};

const trashSvg = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const sLabels: Record<string, string> = {
  accepted: "Aceita",
  rejected: "Recusada",
  pending: "Aguardando revisão",
};

type DraftWithAgents = Draft & {
  agentCtx?: string | null;
  agentTrend?: string | null;
  agentPrice?: string | null;
};

function CfgItem({ lbl, val }: { lbl: string; val: string | null | undefined }) {
  return (
    <div className="PD-cfg-item">
      <div className="PD-cfg-lbl">{lbl}</div>
      <div className={`PD-cfg-val${val ? "" : " miss"}`}>{val || "Não informado"}</div>
    </div>
  );
}

function CompRow({ lbl, val, cls }: { lbl: string; val: string; cls?: string }) {
  return (
    <div className={`PD-comp-row${cls ? ` ${cls}` : ""}`}>
      <span className="lbl" dangerouslySetInnerHTML={{ __html: lbl }} />
      <span className="val">{val}</span>
    </div>
  );
}

function HypCard({ h }: { h: DraftHypothesis }) {
  return (
    <div className={`PD-hyp-card ${h.status ?? "pending"}`}>
      <div className="PD-hyp-card-head">
        <span className="PD-hyp-card-title">{h.title}</span>
        {h.status && (
          <span className={`PD-hyp-card-badge ${h.status}`}>{sLabels[h.status]}</span>
        )}
      </div>
      {h.pills?.length ? (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {h.pills.map((p, i) => (
            <span key={i} className={`HYP-pill${p.c ? ` ${p.c}` : ""}`}>
              {p.t}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function DraftDetail({
  draft,
  onBack,
  onDelete,
}: {
  draft: DraftWithAgents;
  onBack: () => void;
  onDelete: (id: string) => void;
}) {
  const setPlannerMode = useAppStore((s) => s.setPlannerMode);
  const setSelectedDraftId = useAppStore((s) => s.setSelectedDraftId);

  const midiaVal = draft.midia
    ? draft.midia.canais.join(", ") + (draft.midia.geo ? ` · ${draft.midia.geo}` : "")
    : null;
  const fillColor =
    draft.progress >= 70
      ? "var(--color-highlight)"
      : draft.progress >= 50
        ? "var(--color-accent-light)"
        : draft.progress >= 30
          ? "#fbbf24"
          : "#f87171";

  const agIco = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );

  const handleContinue = () => {
    setSelectedDraftId(draft.id);
    setPlannerMode("novo");
  };

  return (
    <>
      <button type="button" className="PD-back" onClick={onBack}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m15 18-6-6 6-6" />
        </svg>
        Voltar para drafts
      </button>

      <div className="PD-dv-hero">
        <div className="PD-dv-name">{draft.name}</div>
        <div className="PD-dv-meta">
          <span className={`PD-stage ${draft.stage}`}>{draft.stageLabel}</span>
          {draft.brands?.map((b) => (
            <span
              key={b}
              style={{
                fontSize: 11,
                background: "rgba(139,92,246,0.1)",
                border: "1px solid rgba(139,92,246,0.22)",
                borderRadius: 100,
                padding: "2px 9px",
                color: "var(--color-accent-light)",
                fontWeight: 600,
              }}
            >
              {b}
            </span>
          ))}
          <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Criado em {draft.date}</span>
        </div>
        <div className="PD-dv-prog-row">
          <div className="PD-dv-prog-bar">
            <div
              className="PD-dv-prog-fill"
              style={{ width: `${draft.progress}%`, background: fillColor }}
            />
          </div>
          <div className="PD-dv-prog-pct">{draft.progress}%</div>
        </div>
      </div>

      <div className="PD-dv-sec">
        <div className="PD-dv-sec-title">Briefing</div>
        <div className="PD-dv-briefing">{draft.briefing}</div>
      </div>

      {draft.objetivo && (
        <div className="PD-dv-sec">
          <div className="PD-dv-sec-title">Objetivo e meta</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            <span className="HYP-pill pu">{draft.objetivo}</span>
            {draft.kpi && (
              <>
                <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>→</span>
                <span className="HYP-pill">{draft.kpi}</span>
              </>
            )}
            {draft.kpiTarget && (
              <>
                <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>→</span>
                <span className="HYP-pill gr">{draft.kpiTarget}</span>
              </>
            )}
          </div>
        </div>
      )}

      <div className="PD-dv-sec">
        <div className="PD-dv-sec-title">Configuração do projeto</div>
        <div className="PD-cfg-grid">
          <CfgItem lbl="Verticais" val={draft.verticais?.join(", ")} />
          <CfgItem lbl="Período" val={draft.periodo} />
          <CfgItem lbl="Produtos" val={draft.produtos} />
          <CfgItem lbl="EANs dos produtos" val={draft.eans} />
          <CfgItem lbl="Plano de mídia" val={midiaVal} />
        </div>
      </div>

      {draft.budgetNum > 0 && (
        <div className="PD-dv-sec">
          <div className="PD-dv-sec-title">Composição financeira</div>
          <div className="PD-comp">
            <CompRow lbl="Budget total" val={draft.budget} />
            <CompRow
              lbl='Impostos <span style="font-size:10px;opacity:.55;">(12,15% — fixo)</span>'
              val={`−${draft.taxas}`}
              cls="locked"
            />
            <CompRow lbl="Fee Advolve" val={`−${draft.fee}`} cls="locked" />
            <CompRow lbl="Valor de mídia" val={draft.midia_valor} cls="total" />
          </div>
        </div>
      )}

      {draft.hyps.length > 0 && (
        <div className="PD-dv-sec">
          <div className="PD-dv-sec-title">Hipóteses de audiência</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {draft.hyps.map((h, i) => (
              <HypCard key={i} h={h} />
            ))}
          </div>
        </div>
      )}

      {(draft.agentCtx || draft.agentTrend || draft.agentPrice) && (
        <div className="PD-dv-sec">
          <div className="PD-dv-sec-title">Outputs dos agentes</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {draft.agentCtx && (
              <div className="PD-agent">
                <div className="PD-agent-head">
                  <div className="PD-agent-ico">{agIco}</div>
                  <span className="PD-agent-name">Contexto estratégico</span>
                </div>
                <div className="PD-agent-body" dangerouslySetInnerHTML={{ __html: draft.agentCtx }} />
              </div>
            )}
            {draft.agentTrend && (
              <div className="PD-agent">
                <div className="PD-agent-head">
                  <div className="PD-agent-ico">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                      <polyline points="17 6 23 6 23 12" />
                    </svg>
                  </div>
                  <span className="PD-agent-name">Trends & criativos</span>
                </div>
                <div className="PD-agent-body" dangerouslySetInnerHTML={{ __html: draft.agentTrend }} />
              </div>
            )}
            {draft.agentPrice && (
              <div className="PD-agent">
                <div className="PD-agent-head">
                  <div className="PD-agent-ico">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="1" x2="12" y2="23" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                  <span className="PD-agent-name">Análise de preço e ticket</span>
                </div>
                <div className="PD-agent-body" dangerouslySetInnerHTML={{ __html: draft.agentPrice }} />
              </div>
            )}
          </div>
        </div>
      )}

      {draft.missing.length > 0 && (
        <div className="PD-dv-sec">
          <div className="PD-dv-sec-title">Próximos passos</div>
          <div className="PD-next">
            {draft.missing.map((m, i) => (
              <div key={i} className="PD-next-item">
                <div className="PD-next-num">{i + 1}</div>
                <div className="PD-next-text">{m}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="PD-dv-actions">
        <button type="button" className="PD-btn primary" onClick={handleContinue}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
          </svg>
          Continuar planejamento
        </button>
        <button type="button" className="PD-btn danger" onClick={() => onDelete(draft.id)}>
          {trashSvg}
          Excluir draft
        </button>
      </div>
    </>
  );
}

export function DraftsPanel() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<DraftWithAgents | null>(null);

  const loadDrafts = useCallback(async () => {
    // TODO: Replace with real API call
    const data = await getDrafts();
    setDrafts(data);
  }, []);

  useEffect(() => {
    void loadDrafts();
  }, [loadDrafts]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    // TODO: Replace with real API call
    void getDraft(selectedId).then((d) => setDetail((d as DraftWithAgents) ?? null));
  }, [selectedId]);

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    // TODO: Replace with real API call
    await deleteDraft(id);
    if (selectedId === id) setSelectedId(null);
    await loadDrafts();
  };

  if (selectedId && detail) {
    return (
      <div className="PD-dv" id="pd-detail" style={{ display: "block" }}>
        <DraftDetail
          draft={detail}
          onBack={() => setSelectedId(null)}
          onDelete={(id) => void handleDelete(id)}
        />
      </div>
    );
  }

  return (
    <div className="PD-lv" id="pd-list">
      <div className="PD-hdr">
        <div className="PD-hdr-title">Drafts</div>
        <p className="PD-hdr-sub">Projetos iniciados aguardando finalização</p>
      </div>
      <div className="PL-col-hdr pd-hdr">
        <div />
        <div className="PL-col-hdr-cell">Projeto</div>
        <div className="PL-col-hdr-cell">Marcas</div>
        <div className="PL-col-hdr-cell">Criado em</div>
        <div className="PL-col-hdr-cell">Etapa</div>
        <div />
      </div>
      <div className="PD-list" id="pd-list-items">
        {drafts.map((d) => (
          <div
            key={d.id}
            className={`PD-item ${d.stage}`}
            data-draft-id={d.id}
            role="button"
            tabIndex={0}
            onClick={() => setSelectedId(d.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setSelectedId(d.id);
            }}
          >
            <div className="PD-item-icon">{PD_ICONS[d.stage]}</div>
            <div className="PD-item-body">
              <div className="PD-item-name">{d.name}</div>
            </div>
            <div className="PD-col-brands">
              {d.brands?.length ? (
                d.brands.map((b) => (
                  <span key={b} className="PD-brand-tag">
                    {b}
                  </span>
                ))
              ) : (
                <span className="PD-brand-empty">—</span>
              )}
            </div>
            <span className="PD-col-date">{d.date}</span>
            <div className="PD-col-stage">
              <span className={`PD-stage ${d.stage}`}>{d.stageLabel}</span>
            </div>
            <button
              type="button"
              className="PD-del-btn"
              aria-label={`Excluir draft ${d.name}`}
              onClick={(e) => void handleDelete(d.id, e)}
            >
              {trashSvg}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
