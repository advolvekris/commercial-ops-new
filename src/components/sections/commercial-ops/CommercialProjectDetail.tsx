import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, CheckCircle, FileText } from "lucide-react";
import { CustomSelect } from "@/components/ui/CustomSelect";
import {
  getAllowedTransitions,
  getStatusLabel,
  requiresConfirmation,
} from "@/lib/commercial-status";
import {
  getBrands,
  getContacts,
  getResponsaveis,
  assignResponsavel,
  updateProject,
  updateProjectProviders,
  updateProjectStatus,
} from "@/mocks/handlers";
import type { Brand, ContactPerson, ManagedProject, ProviderAccountRef } from "@/mocks/types";
import type { CommercialProjectStatus, ResponsavelUser } from "@/types";
import { StatusChangeDialog } from "./StatusChangeDialog";
import { UserChip } from "@/components/layout/UserAvatar";
import { KPI_OPTS } from "@/lib/constants";

const PLAT_NAMES: Record<string, string> = {
  meta: "Meta Ads",
  google: "Google Ads",
  tiktok: "TikTok Ads",
};

const PLAT_MOCK_ACCOUNTS: Record<string, { value: string; label: string }[]> = {
  meta: [
    { value: "meta-br-feed::meta-001", label: "Meta BR — Feed & Stories · meta-001" },
    { value: "meta-br-retarg::meta-002", label: "Meta BR — Retargeting · meta-002" },
  ],
  google: [
    { value: "google-br-search::google-001", label: "Google BR — Search & Performance · google-001" },
    { value: "google-br-display::google-002", label: "Google BR — Display & Discovery · google-002" },
  ],
  tiktok: [
    { value: "tiktok-br-awareness::tiktok-001", label: "TikTok BR — Awareness · tiktok-001" },
    { value: "tiktok-br-perf::tiktok-002", label: "TikTok BR — Performance · tiktok-002" },
  ],
};

interface CommercialProjectDetailProps {
  project: ManagedProject;
  onBack: () => void;
  onUpdated: (project: ManagedProject) => void;
}

export function CommercialProjectDetail({
  project,
  onBack,
  onUpdated,
}: CommercialProjectDetailProps) {
  const [pendingStatus, setPendingStatus] = useState<CommercialProjectStatus | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedTs, setSavedTs] = useState<number | null>(null);
  const [contact, setContact] = useState<ContactPerson | null>(null);
  const [responsaveis, setResponsaveis] = useState<ResponsavelUser[]>([]);
  const [currentResponsavelId, setCurrentResponsavelId] = useState<string | null>(
    project.responsavelId ?? null,
  );
  const [brandGuidelines, setBrandGuidelines] = useState<Brand[]>([]);
  const [contas, setContas] = useState<ProviderAccountRef[]>(project.contas ?? []);
  const [provSelections, setProvSelections] = useState<Record<string, string>>({ meta: "", google: "", tiktok: "" });

  // Editable fields
  const [budget, setBudget] = useState(project.budget ?? "");
  const [fee, setFee] = useState(project.fee ?? "");
  const [objetivo, setObjetivo] = useState(project.objetivo ?? "");
  const [kpi, setKpi] = useState(project.kpi ?? "");
  const [kpiTarget, setKpiTarget] = useState(project.kpiTarget ?? "");
  const [periodo, setPeriodo] = useState(project.periodo ?? "");
  const [produtos, setProdutos] = useState(project.produtos ?? "");
  const [briefing, setBriefing] = useState(project.briefing ?? project.desc ?? "");
  const [observacoes, setObservacoes] = useState(project.observacoes ?? "");

  // Lock rules — mirror playground domain
  const isFinancialLocked = !["pa-draft", "pa-desconto"].includes(project.status);
  const isActive = project.status === "pa-ativo";
  const isTerminal = project.status === "pa-finalizado" || project.status === "pa-cancelado";
  const isCampaignLocked = isActive || isTerminal;

  const kpiOptions = objetivo ? (KPI_OPTS[objetivo] ?? []) : [];

  useEffect(() => {
    if (!project.contactId) {
      setContact(null);
    } else {
      let cancelled = false;
      void getContacts().then((list) => {
        if (cancelled) return;
        setContact(list.find((c) => c.id === project.contactId) ?? null);
      });
      return () => { cancelled = true; };
    }
  }, [project.contactId]);

  useEffect(() => {
    void getResponsaveis().then(setResponsaveis);
  }, []);

  useEffect(() => {
    void getBrands().then((all) => {
      setBrandGuidelines(all.filter((b) => project.brands.includes(b.name)));
    });
  }, [project.brands]);

  async function handleAssignResponsavel(rvId: string) {
    setCurrentResponsavelId(rvId || null);
    if (rvId) await assignResponsavel(project.id, rvId);
  }

  function handleAssociateProvider(plat: string) {
    const val = provSelections[plat];
    if (!val) return;
    const [name, id] = val.split("::");
    const next = [...contas.filter((c) => c.plat !== plat), { plat, name, id }];
    setContas(next);
    setProvSelections((prev) => ({ ...prev, [plat]: "" }));
    void updateProjectProviders(project.id, next);
  }

  const selectedRv = responsaveis.find((r) => r.id === currentResponsavelId) ?? null;
  const allowed = getAllowedTransitions(project.status);

  const applyStatus = useCallback(
    async (next: CommercialProjectStatus) => {
      setSaving(true);
      const updated = await updateProjectStatus(project.id, next);
      setSaving(false);
      setDialogOpen(false);
      setPendingStatus(null);
      if (updated) onUpdated(updated);
    },
    [project.id, onUpdated],
  );

  function requestStatus(next: CommercialProjectStatus) {
    if (requiresConfirmation(next)) {
      setPendingStatus(next);
      setDialogOpen(true);
      return;
    }
    void applyStatus(next);
  }

  const canRequestDiscount =
    project.status === "pa-draft" && allowed.includes("pa-desconto");

  async function handleSave() {
    setSaving(true);
    await updateProject(project.id, {
      budget,
      fee,
      objetivo,
      kpi,
      kpiTarget,
      periodo,
      produtos,
      briefing,
      observacoes,
    });
    setSaving(false);
    setSavedTs(Date.now());
  }

  return (
    <div className="OPS-view OPS-detail">
      <button type="button" className="OPS-detail-back OPS-link-btn" onClick={onBack}>
        <ArrowLeft size={14} />
        Voltar à lista
      </button>

      {/* ── Header ── */}
      <header className="OPS-detail-hdr">
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 className="OPS-detail-title">{project.name}</h2>
          <div className="OPS-detail-hdr-meta">
            <span className={`PA-badge ${project.status}`}>{project.statusLabel}</span>
            {project.brands.map((b) => (
              <span key={b} className="OPS-detail-brand-pill">{b}</span>
            ))}
            <span className="OPS-detail-meta-text">{project.bu} · {project.start} – {project.end}</span>
          </div>
        </div>
      </header>

      {/* ── Status stepper ── */}
      <section className="OPS-status-stepper">
        <div className="OPS-section-title">Status do projeto</div>
        {project.status !== "pa-finalizado" && project.status !== "pa-cancelado" && (
          <p className="OPS-detail-status-meta">
            Apenas o Commercial Ops pode alterar o status comercial. Cancelamentos pedem confirmação.
          </p>
        )}
        <div className="OPS-status-actions">
          {allowed.map((next) => (
            <button
              key={next}
              type="button"
              className={`OPS-status-btn${next === "pa-cancelado" ? " danger" : ""}`}
              disabled={saving}
              onClick={() => requestStatus(next)}
            >
              {next === "pa-cancelado" ? "Cancelar projeto" : `→ ${getStatusLabel(next)}`}
            </button>
          ))}
          {canRequestDiscount && (
            <button
              type="button"
              className="OPS-status-btn"
              disabled={saving}
              onClick={() => requestStatus("pa-desconto")}
            >
              Solicitar aprovação de desconto (fee)
            </button>
          )}
          {allowed.length === 0 && !canRequestDiscount && (
            project.status === "pa-finalizado" ? (
              <div className="OPS-status-done">
                <CheckCircle size={13} strokeWidth={2} />
                Projeto concluído — relatórios disponíveis para envio ao cliente.
              </div>
            ) : (
              <span className="OPS-muted">
                {project.status === "pa-cancelado"
                  ? "Projeto cancelado. Nenhuma ação disponível."
                  : "Nenhuma transição disponível para este status."}
              </span>
            )
          )}
        </div>
      </section>

      {/* ── Two-column body ── */}
      <div className="OPS-det-body">

        {/* ── LEFT: Briefing + Hipóteses + Perf ── */}
        <div className="OPS-det-main">
          {/* Briefing */}
          <div className="OPS-det-sec">
            <div className="OPS-section-title">
              Briefing
              {isCampaignLocked && <span className="OPS-detail-lock-badge">bloqueado após ativo</span>}
            </div>
            {isCampaignLocked ? (
              <p className="OPS-detail-desc">{briefing}</p>
            ) : (
              <textarea
                className="OPS-edit-textarea"
                value={briefing}
                rows={5}
                onChange={(e) => setBriefing(e.target.value)}
                placeholder="Descreva o briefing do projeto…"
              />
            )}
          </div>

          {/* Hipóteses */}
          {project.hypotheses.length > 0 && (
            <div className="OPS-det-sec">
              <div className="OPS-section-title">
                Hipóteses de audiência
                <span className="OPS-kanban-count" style={{ marginLeft: "auto" }}>{project.hypotheses.length}</span>
              </div>
              <div className="OPS-det-hyp-list">
                {project.hypotheses.map((h, i) => (
                  <div key={`${h.title}-${i}`} className="OPS-det-hyp-card">
                    <div className="OPS-det-hyp-title">{h.title}</div>
                    <div className="OPS-det-hyp-pills">
                      {h.pills.map((p) => (
                        <span key={p.t} className={`HYP-pill${p.c ? ` ${p.c}` : ""}`}>{p.t}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Performance */}
          {project.perf && (
            <div className="OPS-det-sec">
              <div className="OPS-section-title" style={{ marginBottom: 10 }}>Performance da campanha</div>
              <div className="OPS-perf-card">
                <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginBottom: 10 }}>
                  {project.perf.metrics.map((m) => (
                    <div key={m.lbl}>
                      <div style={{ fontSize: 10, color: "var(--color-text-muted)", textTransform: "uppercase" }}>{m.lbl}</div>
                      <strong style={{ fontSize: 18 }}>{m.val}</strong>
                      <div style={{ fontSize: 10, color: "var(--color-text-muted)" }}>{m.meta}</div>
                    </div>
                  ))}
                </div>
                <div dangerouslySetInnerHTML={{ __html: project.perf.txt }} />
              </div>
            </div>
          )}

          {/* Reports */}
          {project.status === "pa-finalizado" && (
            <div className="OPS-det-sec">
              <div className="OPS-section-title">Relatórios prontos para envio</div>
              <div className="OPS-reports-list">
                {(["Relatório final", "Relatório de atribuição (7d)", "Relatório de atribuição (14d)"] as const).map((label) => (
                  <div key={label} className="OPS-report-item">
                    <FileText size={13} strokeWidth={2} className="OPS-report-icon" />
                    <span className="OPS-report-label">{label}</span>
                    <span className="OPS-report-badge">Pronto para envio</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Meta + Config + Financeiro + Equipe + Obs ── */}
        <div className="OPS-det-side">

          {/* Objetivo e meta */}
          <div className="OPS-det-sec">
            <div className="OPS-section-title">
              Objetivo e meta
              {isCampaignLocked && <span className="OPS-detail-lock-badge">bloqueado após ativo</span>}
            </div>
            {isCampaignLocked ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                {objetivo && <span className="HYP-pill pu">{objetivo}</span>}
                {kpi && <><span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>→</span><span className="HYP-pill">{kpi}</span></>}
                {kpiTarget && <><span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>→</span><span className="HYP-pill gr">{kpiTarget}</span></>}
              </div>
            ) : (
              <div className="OPS-edit-stack">
                <div className="OPS-edit-field">
                  <label className="OPS-edit-lbl">Objetivo</label>
                  <CustomSelect
                    value={objetivo}
                    onChange={(v) => { setObjetivo(v); setKpi(""); }}
                    options={Object.keys(KPI_OPTS).map((o) => ({ value: o, label: o }))}
                    placeholder="Selecionar objetivo…"
                    size="sm"
                  />
                </div>
                {kpiOptions.length > 0 && (
                  <div className="OPS-edit-field">
                    <label className="OPS-edit-lbl">KPI</label>
                    <CustomSelect
                      value={kpi}
                      onChange={setKpi}
                      options={kpiOptions.map((k) => ({ value: k, label: k }))}
                      placeholder="Selecionar KPI…"
                      size="sm"
                    />
                  </div>
                )}
                <div className="OPS-edit-field">
                  <label className="OPS-edit-lbl">Meta do projeto</label>
                  <input className="OPS-edit-input" value={kpiTarget} onChange={(e) => setKpiTarget(e.target.value)} placeholder="ex.: 4,5x ou R$ 15,00" />
                </div>
              </div>
            )}
          </div>

          {/* Configuração da campanha */}
          <div className="OPS-det-sec">
            <div className="OPS-section-title">
              Configuração da campanha
              {isCampaignLocked && <span className="OPS-detail-lock-badge">bloqueado após ativo</span>}
            </div>
            {isCampaignLocked ? (
              <div className="OPS-edit-stack">
                {periodo && <dl className="OPS-detail-row"><dt>Período</dt><dd>{periodo}</dd></dl>}
                {produtos && <dl className="OPS-detail-row"><dt>Produtos</dt><dd>{produtos}</dd></dl>}
                {project.eans && <dl className="OPS-detail-row"><dt>EANs</dt><dd style={{ fontFamily: "monospace", fontSize: 11 }}>{project.eans}</dd></dl>}
                {project.midia && (
                  <dl className="OPS-detail-row">
                    <dt>Mídia</dt>
                    <dd>{project.midia.canais.join(", ")}{project.midia.geo ? ` · ${project.midia.geo}` : ""}</dd>
                  </dl>
                )}
              </div>
            ) : (
              <div className="OPS-edit-stack">
                <div className="OPS-edit-field">
                  <label className="OPS-edit-lbl">Período</label>
                  <input className="OPS-edit-input" value={periodo} onChange={(e) => setPeriodo(e.target.value)} placeholder="ex.: 30 dias" />
                </div>
                <div className="OPS-edit-field">
                  <label className="OPS-edit-lbl">Produtos</label>
                  <input className="OPS-edit-input" value={produtos} onChange={(e) => setProdutos(e.target.value)} placeholder="Lista de produtos" />
                </div>
                {project.midia && (
                  <dl className="OPS-detail-row">
                    <dt>Mídia</dt>
                    <dd>{project.midia.canais.join(", ")}{project.midia.geo ? ` · ${project.midia.geo}` : ""}</dd>
                  </dl>
                )}
              </div>
            )}
          </div>

          {/* Composição financeira */}
          <div className="OPS-det-sec">
            <div className="OPS-section-title">
              Composição financeira
              {isFinancialLocked && <span className="OPS-detail-lock-badge">bloqueado a partir do contrato</span>}
            </div>
            {isFinancialLocked ? (
              <div className="OPS-edit-stack">
                <dl className="OPS-detail-row"><dt>Budget</dt><dd>{budget}</dd></dl>
                <dl className="OPS-detail-row"><dt>Fee Advolve</dt><dd>{fee}</dd></dl>
                {project.taxas && <dl className="OPS-detail-row"><dt>Taxas</dt><dd>{project.taxas}</dd></dl>}
                {project.midia_valor && <dl className="OPS-detail-row"><dt>Investimento mídia</dt><dd>{project.midia_valor}</dd></dl>}
              </div>
            ) : (
              <div className="OPS-edit-stack">
                <div className="OPS-edit-field">
                  <label className="OPS-edit-lbl">Budget total</label>
                  <input className="OPS-edit-input" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="ex.: R$ 150.000,00" />
                </div>
                <div className="OPS-edit-field">
                  <label className="OPS-edit-lbl">Fee Advolve</label>
                  <input className="OPS-edit-input" value={fee} onChange={(e) => setFee(e.target.value)} placeholder="ex.: R$ 18.000,00" />
                </div>
                {project.taxas && <dl className="OPS-detail-row"><dt>Taxas</dt><dd>{project.taxas}</dd></dl>}
                {project.midia_valor && <dl className="OPS-detail-row"><dt>Inv. mídia</dt><dd>{project.midia_valor}</dd></dl>}
              </div>
            )}
          </div>

          {/* Responsável + Contato */}
          <div className="OPS-det-sec">
            <div className="OPS-section-title">Equipe</div>
            <div className="OPS-edit-stack">
              <div>
                <div className="OPS-edit-lbl" style={{ marginBottom: 6 }}>Responsável Advolve</div>
                {selectedRv && <div style={{ marginBottom: 8 }}><UserChip user={selectedRv} /></div>}
                <CustomSelect
                  value={currentResponsavelId ?? ""}
                  onChange={(v) => void handleAssignResponsavel(v)}
                  options={responsaveis.map((rv) => ({ value: rv.id, label: `${rv.name} · ${rv.role}` }))}
                  placeholder="Atribuir responsável…"
                  size="sm"
                />
              </div>
              {contact && (
                <div>
                  <div className="OPS-edit-lbl" style={{ marginBottom: 6 }}>Contato comercial</div>
                  <dl className="OPS-detail-row"><dt>Nome</dt><dd>{contact.name}</dd></dl>
                  {contact.email && <dl className="OPS-detail-row"><dt>E-mail</dt><dd>{contact.email}</dd></dl>}
                  {contact.phone && <dl className="OPS-detail-row"><dt>Telefone</dt><dd>{contact.phone}</dd></dl>}
                </div>
              )}
            </div>
          </div>

          {/* Observações */}
          <div className="OPS-det-sec">
            <div className="OPS-section-title">Observações</div>
            <textarea
              className="OPS-edit-textarea"
              value={observacoes}
              rows={3}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Observações internas, notas de reunião, pontos de atenção…"
            />
          </div>
        </div>
      </div>

      {/* ── Brand Guidelines ── */}
      {brandGuidelines.length > 0 && (
        <div className="OPS-det-full">
          <div className="OPS-section-title">Brand guidelines</div>
          <div className="PD-bg-list">
            {brandGuidelines.map((bg) => (
              <div key={bg.id} className="PD-bg-card">
                <div className="PD-bg-card-hd">
                  <div className="PD-bg-av" style={{ background: bg.color, boxShadow: `0 0 10px ${bg.color}55` }}>{bg.initials}</div>
                  <div>
                    <div className="PD-bg-name">{bg.name}</div>
                    <div className="PD-bg-cat">{bg.cat}</div>
                  </div>
                  {bg.inferred
                    ? <span className="PD-bg-badge ok">Diretrizes completas</span>
                    : <span className="PD-bg-badge pending">Pendente</span>}
                </div>
                {bg.inferred && bg.palette.length > 0 && (
                  <div className="PD-bg-palette">
                    {bg.palette.map((c) => (
                      <div key={c} className="PD-bg-swatch" style={{ background: c, border: c === "#FFFFFF" ? "1px solid rgba(255,255,255,0.15)" : undefined }} title={c} />
                    ))}
                  </div>
                )}
                {bg.inferred && bg.fonts.length > 0 && <div className="PD-bg-fonts">{bg.fonts.join(" · ")}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Contas de provedor ── */}
      <div className="OPS-det-full">
        <div className="OPS-section-title">Contas de provedor</div>
        <div className="PA-prov-grid">
          {(["meta", "google", "tiktok"] as const).map((plat) => {
            const linked = contas.find((c) => c.plat === plat);
            return (
              <div key={plat} className={`PA-prov-card${linked ? " linked" : ""}`}>
                <div className={`PA-prov-logo ${plat}`} />
                <div className="PA-prov-body">
                  <div className="PA-prov-plat">{PLAT_NAMES[plat]}</div>
                  {linked ? (
                    <>
                      <div className="PA-prov-linked-name">{linked.name}</div>
                      <div className="PA-prov-linked-id">{linked.id}</div>
                    </>
                  ) : (
                    <div className="PA-prov-sel-wrap">
                      <CustomSelect
                        value={provSelections[plat] ?? ""}
                        onChange={(v) => setProvSelections((prev) => ({ ...prev, [plat]: v }))}
                        options={PLAT_MOCK_ACCOUNTS[plat]}
                        placeholder="Selecionar conta…"
                        size="sm"
                      />
                      <button
                        type="button"
                        className="PA-acc-btn"
                        onClick={() => handleAssociateProvider(plat)}
                      >
                        Associar
                      </button>
                    </div>
                  )}
                </div>
                {linked && (
                  <span className="PA-prov-ok">
                    {isActive ? "✓ Ativo" : "✓ Definido"}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Referências de KV ── */}
      {project.kvs && project.kvs.length > 0 && (
        <div className="OPS-det-full">
          <div className="OPS-section-title">Referências de KV</div>
          <div className="PA-kv-list">
            {project.kvs.map((kv, i) => (
              <div key={`${kv.name}-${i}`} className="PA-kv-item">
                <div className="PA-kv-ico">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                  </svg>
                </div>
                <div className="PA-kv-info">
                  <div className="PA-kv-name">{kv.name}</div>
                  <div className="PA-kv-date">{kv.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Save bar ── */}
      <div className="OPS-detail-save-bar">
        <div className="OPS-detail-save-status">
          {savedTs && (
            <span className="OPS-detail-save-ok">
              <CheckCircle size={12} strokeWidth={2.5} />
              Salvo
            </span>
          )}
        </div>
        <button
          type="button"
          className="OPS-btn OPS-btn-primary"
          disabled={saving}
          onClick={() => void handleSave()}
        >
          {saving ? "Salvando…" : "Salvar alterações"}
        </button>
      </div>

      <StatusChangeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        projectName={project.name}
        nextStatus={pendingStatus}
        loading={saving}
        onConfirm={() => pendingStatus && void applyStatus(pendingStatus)}
      />
    </div>
  );
}
