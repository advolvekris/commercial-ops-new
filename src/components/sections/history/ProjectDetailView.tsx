import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ReactElement,
} from "react";
import { CustomSelect } from "@/components/ui/CustomSelect";
import {
  getBrands,
  getManagedProject,
  updateProject,
  updateProjectKvs,
  updateProjectProviders,
} from "@/mocks/handlers";
import type {
  Brand,
  KvRef,
  ManagedHypothesis,
  ManagedProject,
  ProviderAccountRef,
} from "@/mocks/types";
import { useAppStore } from "@/store/app-store";
import { KPI_OPTS, VERTICALS } from "@/lib/constants";
import { parseMoneyBR, formatMoneyBRFull as fmtBRL } from "@/lib/ops-aggregates";

const IMG_EXTS = ["png", "jpg", "jpeg", "svg", "webp", "gif"];

function todayBR() {
  return new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function extOf(name: string) {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

const trashSvg: ReactElement = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

function VerticalMultiSelect({
  selected,
  onChange,
  disabled,
}: {
  selected: string[];
  onChange: (v: string[]) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const toggle = (v: string) => {
    onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);
  };

  return (
    <div ref={wrapRef} className="PNF-vert-wrap">
      <div
        className={`PNF-vert-trigger${open ? " open" : ""}${selected.length ? " has-value" : ""}`}
        role="button"
        tabIndex={0}
        onClick={() => !disabled && setOpen((o) => !o)}
      >
        <span>
          {selected.length === 0
            ? "Selecionar verticais…"
            : selected.length === 1
              ? selected[0]
              : `${selected.length} verticais selecionadas`}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
      {open && !disabled && (
        <div className="PNF-vert-dropdown open">
          {VERTICALS.map((v) => (
            <div
              key={v}
              className={`PNF-vert-item${selected.includes(v) ? " on" : ""}`}
              onClick={() => toggle(v)}
            >
              <div className="PNF-vert-chk">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span className="PNF-vert-item-name">{v}</span>
            </div>
          ))}
        </div>
      )}
      <div className="PNF-vert-tags">
        {selected.map((v) => (
          <span key={v} className="PNF-brand-tag">
            {v}
            {!disabled && (
              <button
                type="button"
                className="PNF-brand-tag-x"
                aria-label={`Remover ${v}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggle(v);
                }}
              >
                ×
              </button>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

function BrandMultiSelect({
  selected,
  available,
  onChange,
  disabled,
}: {
  selected: string[];
  available: string[];
  onChange: (v: string[]) => void;
  disabled?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [showDd, setShowDd] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(
    () => available.filter((b) => !selected.includes(b) && (!query || b.toLowerCase().includes(query.toLowerCase()))),
    [available, selected, query],
  );

  useEffect(() => {
    if (!showDd) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setShowDd(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showDd]);

  const add = (v: string) => {
    if (!v || selected.includes(v)) return;
    onChange([...selected, v]);
    setQuery("");
    setShowDd(false);
  };

  return (
    <div className="PNF-brand-wrap">
      <div className="PNF-brand-sel-row" ref={wrapRef}>
        <div className="PNF-brand-ac">
          <input
            className="PNF-brand-ac-input"
            type="text"
            placeholder="Buscar marca…"
            value={query}
            disabled={disabled}
            onChange={(e) => { setQuery(e.target.value); setShowDd(true); }}
            onFocus={() => setShowDd(true)}
          />
          {showDd && (filtered.length > 0 || query) && (
            <div className="PNF-brand-dd">
              {filtered.length > 0 ? (
                filtered.map((b) => (
                  <div key={b} className="PNF-brand-dd-item" onMouseDown={() => add(b)}>{b}</div>
                ))
              ) : (
                <div className="PNF-brand-dd-empty">Nenhuma marca encontrada</div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="PNF-brand-tags">
        {selected.length === 0 ? (
          <span className="PNF-brand-empty">Nenhuma marca adicionada ainda</span>
        ) : (
          selected.map((b) => (
            <span key={b} className="PNF-brand-tag">
              {b}
              {!disabled && (
                <button
                  type="button"
                  className="PNF-brand-tag-x"
                  aria-label={`Remover ${b}`}
                  onClick={() => onChange(selected.filter((x) => x !== b))}
                >
                  ×
                </button>
              )}
            </span>
          ))
        )}
      </div>
    </div>
  );
}

function ProjectDetail({
  project,
  onBack,
  onSaved,
}: {
  project: ManagedProject;
  onBack: () => void;
  onSaved: () => void;
}) {
  const setExtendProjectId = useAppStore((s) => s.setExtendProjectId);
  const setCurrentView = useAppStore((s) => s.setCurrentView);
  const setPlannerMode = useAppStore((s) => s.setPlannerMode);
  const currentBrands = useAppStore((s) => s.currentBrands);
  const openProjectInCommercialOps = useAppStore((s) => s.openProjectInCommercialOps);

  const isAtivo = project.status === "pa-ativo";
  const isFinancialLocked = !["pa-draft", "pa-desconto"].includes(project.status);

  const [briefing, setBriefing] = useState(project.briefing ?? "");
  const [brands, setBrands] = useState<string[]>(project.brands ?? []);
  const [verticais, setVerticais] = useState<string[]>(project.verticais ?? []);
  const [objetivo, setObjetivo] = useState(project.objetivo ?? "");
  const [kpi, setKpi] = useState(project.kpi ?? "");
  const [kpiTarget, setKpiTarget] = useState(project.kpiTarget ?? "");
  const [periodo, setPeriodo] = useState(project.periodo ?? "");
  const [produtos, setProdutos] = useState(project.produtos ?? "");
  const [eans, setEans] = useState(project.eans ?? "");
  const [budget, setBudget] = useState(project.budget ?? "");
  const [fee, setFee] = useState(project.fee ?? "");
  const [hypotheses, setHypotheses] = useState<ManagedHypothesis[]>(project.hypotheses ?? []);
  const [contas, setContas] = useState<ProviderAccountRef[]>(project.contas ?? []);
  const [provSelections, setProvSelections] = useState<Record<string, string>>({ meta: "", google: "", tiktok: "" });
  const [kvs, setKvs] = useState<KvRef[]>(project.kvs ?? []);
  const [eansErr, setEansErr] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedTs, setSavedTs] = useState<number | null>(null);
  const [brandGuidelines, setBrandGuidelines] = useState<Brand[]>([]);

  const kvInputRef = useRef<HTMLInputElement>(null);

  const kpiOptions = objetivo ? KPI_OPTS[objetivo] ?? [] : [];

  const liveBudget = parseMoneyBR(budget);
  const liveFee = parseMoneyBR(fee);
  const liveTax = liveBudget > 0 ? Math.round(liveBudget * 0.1215 * 100) / 100 : 0;
  const liveInvest =
    liveBudget > 0 ? Math.max(0, Math.round((liveBudget - liveTax - liveFee) * 100) / 100) : 0;

  const midiaVal = project.midia
    ? project.midia.canais.join(", ") +
      (project.midia.geo ? ` · ${project.midia.geo}` : "")
    : null;

  const perfLabels: Record<string, string> = {
    above: "Resultados acima do esperado",
    within: "Resultados dentro do esperado",
    below: "Resultados abaixo do esperado",
  };

  const removeHypothesis = (i: number) => {
    setHypotheses((p) => p.filter((_, j) => j !== i));
  };

  const onAddHypotheses = () => {
    setExtendProjectId(project.id);
    setPlannerMode("novo");
    setCurrentView("agent");
  };

  useEffect(() => {
    void getBrands().then((all) => {
      setBrandGuidelines(all.filter((b) => brands.includes(b.name)));
    });
  }, [brands]);

  const handleKvPick = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    files.forEach((f) => {
      const ext = extOf(f.name);
      if (IMG_EXTS.includes(ext)) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const src = String(ev.target?.result ?? "");
          setKvs((prev) => {
            const next = [...prev, { name: f.name, date: todayBR(), ext, src }];
            void updateProjectKvs(project.id, next);
            return next;
          });
        };
        reader.readAsDataURL(f);
      } else {
        setKvs((prev) => {
          const next = [...prev, { name: f.name, date: todayBR(), ext, src: null }];
          void updateProjectKvs(project.id, next);
          return next;
        });
      }
    });
    e.target.value = "";
  };

  const handleKvRemove = (i: number) => {
    setKvs((prev) => {
      const next = prev.filter((_, j) => j !== i);
      void updateProjectKvs(project.id, next);
      return next;
    });
  };

  const handleAssociateProvider = (plat: string) => {
    const val = provSelections[plat];
    if (!val) return;
    const [name, id] = val.split("::");
    const next = [...contas.filter((c) => c.plat !== plat), { plat, name, id }];
    setContas(next);
    setProvSelections((prev) => ({ ...prev, [plat]: "" }));
    void updateProjectProviders(project.id, next);
  };

  const handleSave = async () => {
    if (!eans.trim()) {
      setEansErr(true);
      return;
    }
    setSaving(true);
    const budgetStr = liveBudget > 0 ? fmtBRL(liveBudget) : budget;
    const feeStr = liveFee > 0 ? fmtBRL(liveFee) : fee;
    const taxStr = liveTax > 0 ? fmtBRL(liveTax) : project.taxas;
    const investStr = liveInvest > 0 ? fmtBRL(liveInvest) : project.midia_valor;
    await updateProject(project.id, {
      briefing,
      brands,
      verticais,
      objetivo,
      kpi,
      kpiTarget,
      periodo,
      produtos,
      eans,
      budget: budgetStr,
      budgetNum: liveBudget || project.budgetNum,
      fee: feeStr,
      taxas: taxStr,
      midia_valor: investStr,
      hypotheses,
    });
    setSaving(false);
    setSavedTs(Date.now());
    onSaved();
  };

  const brandOptions = useMemo(() => {
    const set = new Set<string>([...currentBrands, ...brands]);
    return Array.from(set);
  }, [currentBrands, brands]);

  return (
    <>
      <button type="button" className="PD-back" id="pa-back" onClick={onBack}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        Voltar para projetos
      </button>

      <div className="PD-dv-hero">
        <div className="PD-dv-name">{project.name}</div>
        <div className="PD-dv-meta">
          <span className={`PA-badge ${project.status}`}>
            <span className="PA-badge-dot" />
            {project.statusLabel}
          </span>
          <button
            type="button"
            className="OPS-link-btn"
            onClick={() => openProjectInCommercialOps(project.id)}
          >
            Alterar status no Commercial Ops
          </button>
          {brands.map((b) => (
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
          <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
            {project.start} – {project.end}
          </span>
        </div>
      </div>

      <div className="PA-det-body">
        <div className="PA-det-main">
          <div className="PD-dv-sec">
            <div className="PD-dv-sec-title">Briefing</div>
            {isAtivo ? (
              <div className="PD-dv-briefing">{briefing}</div>
            ) : (
              <textarea
                className="PD-edit-textarea"
                value={briefing}
                rows={5}
                onChange={(e) => setBriefing(e.target.value)}
                placeholder="Descreva o briefing do projeto…"
              />
            )}
          </div>

          {!isAtivo && (
            <div className="PD-dv-sec">
              <div className="PD-dv-sec-title">Marcas</div>
              <BrandMultiSelect
                selected={brands}
                available={brandOptions}
                onChange={setBrands}
              />
            </div>
          )}

          <div className="PD-dv-sec">
            <div className="PD-dv-sec-title">
              Hipóteses
              {!isAtivo && (
                <button
                  type="button"
                  className="PD-add-hyp-btn"
                  onClick={onAddHypotheses}
                >
                  + Adicionar hipóteses
                </button>
              )}
            </div>
            {hypotheses.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {hypotheses.map((h, i) => (
                  <div key={`${h.title}-${i}`} className="PD-hyp-card accepted">
                    <div className="PD-hyp-card-head">
                      <span className="PD-hyp-card-title">{h.title}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span className="PD-hyp-card-badge accepted">Aceita</span>
                        {!isAtivo && (
                          <button
                            type="button"
                            className="PD-hyp-rm"
                            aria-label={`Remover ${h.title}`}
                            onClick={() => removeHypothesis(i)}
                          >
                            ×
                          </button>
                        )}
                      </span>
                    </div>
                    {h.pills?.length ? (
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {h.pills.map((p, pi) => (
                          <span key={pi} className={`HYP-pill${p.c ? ` ${p.c}` : ""}`}>
                            {p.t}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  fontSize: 13,
                  color: "var(--color-text-muted)",
                  fontStyle: "italic",
                  padding: "8px 0",
                }}
              >
                Nenhuma hipótese adicionada ainda. Clique em + Adicionar hipóteses para consultar a base.
              </div>
            )}
          </div>

          {isAtivo && project.perf && (
            <div className="PD-dv-sec">
              <div className="PD-dv-sec-title">Análise de performance</div>
              <div className={`PA-perf ${project.perf.status}`}>
                <div className="PA-perf-head">
                  <span className={`PA-perf-badge ${project.perf.status}`}>
                    <span className="PA-perf-badge-dot" />
                    {perfLabels[project.perf.status]}
                  </span>
                </div>
                {project.perf.metrics?.length ? (
                  <div className="PA-perf-metrics">
                    {project.perf.metrics.map((m, i) => (
                      <div key={i} className="PA-perf-metric">
                        <div className="PA-perf-metric-lbl">{m.lbl}</div>
                        <div className="PA-perf-metric-val">{m.val}</div>
                        <div className="PA-perf-metric-meta">{m.meta}</div>
                      </div>
                    ))}
                  </div>
                ) : null}
                <div
                  className="PA-perf-txt"
                  dangerouslySetInnerHTML={{ __html: project.perf.txt }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="PA-det-side">
          <div className="PD-dv-sec">
            <div className="PD-dv-sec-title">Objetivo e meta</div>
            {isAtivo ? (
              <div
                style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}
              >
                <span className="HYP-pill pu">{objetivo}</span>
                {kpi && (
                  <>
                    <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>→</span>
                    <span className="HYP-pill">{kpi}</span>
                  </>
                )}
                {kpiTarget && (
                  <>
                    <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>→</span>
                    <span className="HYP-pill gr">{kpiTarget}</span>
                  </>
                )}
              </div>
            ) : (
              <div className="PD-edit-stack">
                <CustomSelect
                  value={objetivo}
                  onChange={(v) => { setObjetivo(v); setKpi(""); }}
                  options={Object.keys(KPI_OPTS).map((o) => ({ value: o, label: o }))}
                  placeholder="Selecionar objetivo…"
                />
                {kpiOptions.length > 0 && (
                  <CustomSelect
                    value={kpi}
                    onChange={setKpi}
                    options={kpiOptions.map((k) => ({ value: k, label: k }))}
                    placeholder="Selecionar KPI…"
                  />
                )}
                <input
                  className="PNF-in"
                  type="text"
                  placeholder="Meta (ex.: 4,5x ou R$ 15,00)"
                  value={kpiTarget}
                  onChange={(e) => setKpiTarget(e.target.value)}
                />
              </div>
            )}
          </div>

          {brandGuidelines.length > 0 && (
            <div className="PD-dv-sec">
              <div className="PD-dv-sec-title">Brand guidelines</div>
              <div className="PD-bg-list">
                {brandGuidelines.map((bg) => (
                  <div key={bg.id} className="PD-bg-card">
                    <div className="PD-bg-card-hd">
                      <div
                        className="PD-bg-av"
                        style={{ background: bg.color, boxShadow: `0 0 10px ${bg.color}55` }}
                      >
                        {bg.initials}
                      </div>
                      <div>
                        <div className="PD-bg-name">{bg.name}</div>
                        <div className="PD-bg-cat">{bg.cat}</div>
                      </div>
                      {bg.inferred ? (
                        <span className="PD-bg-badge ok">Diretrizes completas</span>
                      ) : (
                        <span className="PD-bg-badge pending">Pendente</span>
                      )}
                    </div>
                    {bg.inferred && (
                      <>
                        {bg.palette.length > 0 && (
                          <div className="PD-bg-palette">
                            {bg.palette.map((c) => (
                              <div
                                key={c}
                                className="PD-bg-swatch"
                                style={{
                                  background: c,
                                  border: c === "#FFFFFF" || c === "#FFF" ? "1px solid rgba(255,255,255,0.15)" : undefined,
                                }}
                                title={c}
                              />
                            ))}
                          </div>
                        )}
                        {bg.fonts.length > 0 && (
                          <div className="PD-bg-fonts">{bg.fonts.join(" · ")}</div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="PD-dv-sec">
            <div className="PD-dv-sec-title">Configuração do projeto</div>
            <div className="PD-edit-stack">
              <div className="PD-edit-field">
                <label className="PD-edit-lbl">Verticais</label>
                {isAtivo ? (
                  <div className="PD-cfg-val">{verticais.join(", ") || "Não informado"}</div>
                ) : (
                  <VerticalMultiSelect selected={verticais} onChange={setVerticais} />
                )}
              </div>
              <div className="PD-edit-field">
                <label className="PD-edit-lbl">Período</label>
                {isAtivo ? (
                  <div className="PD-cfg-val">{periodo || "Não informado"}</div>
                ) : (
                  <input
                    className="PNF-in"
                    type="text"
                    placeholder="Ex.: 30 dias"
                    value={periodo}
                    onChange={(e) => setPeriodo(e.target.value)}
                  />
                )}
              </div>
              <div className="PD-edit-field">
                <label className="PD-edit-lbl">Produtos</label>
                {isAtivo ? (
                  <div className="PD-cfg-val">{produtos || "Não informado"}</div>
                ) : (
                  <input
                    className="PNF-in"
                    type="text"
                    placeholder="Lista de produtos"
                    value={produtos}
                    onChange={(e) => setProdutos(e.target.value)}
                  />
                )}
              </div>
              <div className="PD-edit-field">
                <label className="PD-edit-lbl">
                  EANs dos produtos {!isAtivo && <span className="PD-edit-req">obrigatório</span>}
                </label>
                {isAtivo ? (
                  <div className="PD-cfg-val">{eans || "Não informado"}</div>
                ) : (
                  <>
                    <input
                      className={`PNF-in${eansErr ? " pnf-err" : ""}`}
                      type="text"
                      placeholder="Digite os EANs separados por vírgula"
                      value={eans}
                      onChange={(e) => {
                        setEans(e.target.value);
                        if (e.target.value.trim()) setEansErr(false);
                      }}
                      style={eansErr ? { borderColor: "rgba(248,113,113,0.55)" } : undefined}
                    />
                    <div className="PD-edit-help">
                      Necessário para colocar o projeto em &quot;Pronto para setup&quot; ou
                      &quot;Ativo&quot;.
                    </div>
                  </>
                )}
              </div>
              <div className="PD-edit-field">
                <label className="PD-edit-lbl">Plano de mídia</label>
                <div className="PD-cfg-val">{midiaVal || "Não informado"}</div>
              </div>
            </div>
          </div>

          <div className="PD-dv-sec">
            <div className="PD-dv-sec-title">Composição financeira</div>
            <div className="PD-comp">
              <div className="PD-comp-row">
                <span className="lbl">Budget total</span>
                {isFinancialLocked ? (
                  <span className="val">{budget}</span>
                ) : (
                  <input
                    className="PN-budget-inp"
                    type="text"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                  />
                )}
              </div>
              <div className="PD-comp-row locked">
                <span className="lbl">
                  Impostos{" "}
                  <span style={{ fontSize: 10, opacity: 0.55 }}>(12,15% — fixo)</span>
                </span>
                <span className="val">−{fmtBRL(liveTax)}</span>
              </div>
              <div className="PD-comp-row locked">
                <span className="lbl">Fee Advolve</span>
                {isFinancialLocked ? (
                  <span className="val">−{fee}</span>
                ) : (
                  <input
                    className="PN-fee-inp"
                    type="text"
                    value={fee}
                    onChange={(e) => setFee(e.target.value)}
                  />
                )}
              </div>
              <div className="PD-comp-row total">
                <span className="lbl">Valor de mídia</span>
                <span className="val">{fmtBRL(liveInvest)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="PA-det-foot">
        <div>
          <div className="PD-dv-sec">
            <div className="PD-dv-sec-title">Contas de provedor</div>
            <div className="PA-prov-grid" id="pa-prov-grid">
              {(["meta", "google", "tiktok"] as const).map((plat) => {
                const linked = contas.find((c) => c.plat === plat);
                const platNames = {
                  meta: "Meta Ads",
                  google: "Google Ads",
                  tiktok: "TikTok Ads",
                };
                return (
                  <div
                    key={plat}
                    className={`PA-prov-card${linked ? " linked" : ""}`}
                    id={`pa-prov-card-${plat}`}
                  >
                    <div className={`PA-prov-logo ${plat}`} />
                    <div className="PA-prov-body">
                      <div className="PA-prov-plat">{platNames[plat]}</div>
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
                            options={[
                              { value: `Conta ${platNames[plat]} 1::${plat}-001`, label: `Conta ${platNames[plat]} 1 · ${plat}-001` },
                              { value: `Conta ${platNames[plat]} 2::${plat}-002`, label: `Conta ${platNames[plat]} 2 · ${plat}-002` },
                            ]}
                            placeholder="Selecionar conta…"
                            size="sm"
                          />
                          <button
                            type="button"
                            className="PA-acc-btn"
                            data-prov-plat={plat}
                            onClick={() => handleAssociateProvider(plat)}
                          >
                            Associar
                          </button>
                        </div>
                      )}
                    </div>
                    {linked && (
                      <span className="PA-prov-ok">
                        {isAtivo ? "✓ Ativo" : "✓ Definido"}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div>
          <div className="PD-dv-sec">
            <div className="PD-dv-sec-title">Referências de KV</div>
            <div className="PA-kv-list" id="pa-kv-list">
              {kvs.length ? (
                kvs.map((kv, i) => (
                  <div key={`${kv.name}-${i}`} className="PA-kv-item">
                    {kv.src ? (
                      <div className="PA-kv-thumb">
                        <img src={kv.src} alt={kv.name} />
                      </div>
                    ) : (
                      <div className="PA-kv-ico">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <path d="M9 9h6M9 13h4" />
                        </svg>
                      </div>
                    )}
                    <div className="PA-kv-info">
                      <div className="PA-kv-name">{kv.name}</div>
                      <div className="PA-kv-date">Enviado em {kv.date}</div>
                    </div>
                    <button
                      type="button"
                      className="PA-kv-rm"
                      aria-label={`Remover ${kv.name}`}
                      onClick={() => handleKvRemove(i)}
                    >
                      {trashSvg}
                    </button>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--color-text-muted)",
                    fontStyle: "italic",
                    padding: "8px 0",
                  }}
                >
                  Nenhum KV enviado
                </div>
              )}
            </div>
            <input
              ref={kvInputRef}
              type="file"
              style={{ display: "none" }}
              accept="image/*,.pdf,.zip"
              multiple
              onChange={handleKvPick}
            />
            <button
              type="button"
              className="PA-kv-add"
              onClick={() => kvInputRef.current?.click()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span className="PA-kv-add-txt">Arraste ou</span>
              <span className="PA-kv-add-lbl">Selecionar arquivo</span>
            </button>
          </div>
        </div>
      </div>

      {!isAtivo && (
        <div className="PD-dv-actions">
          <div className="PD-dv-actions-status">
            {eansErr && (
              <span className="PD-dv-actions-err">
                Preencha os EANs antes de salvar.
              </span>
            )}
            {!eansErr && savedTs && (
              <span className="PD-dv-actions-ok">Alterações salvas.</span>
            )}
          </div>
          <button type="button" className="PD-btn" onClick={onBack}>
            Voltar
          </button>
          <button
            type="button"
            className="PD-btn-primary"
            disabled={saving}
            onClick={() => void handleSave()}
          >
            {saving ? "Salvando…" : "Salvar alterações"}
          </button>
        </div>
      )}
    </>
  );
}

export function ProjectDetailView({
  projectId,
  onBack,
}: {
  projectId: string;
  onBack: () => void;
}) {
  const [project, setProject] = useState<ManagedProject | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    void getManagedProject(projectId).then((p) => setProject(p ?? null));
  }, [projectId, refreshTick]);

  if (!project) {
    return (
      <div
        className="PD-dv"
        style={{ padding: "32px 0", color: "var(--color-text-muted)", fontSize: 13 }}
      >
        Carregando projeto…
      </div>
    );
  }

  return (
    <div className="PD-dv" id="pa-detail" style={{ display: "block" }}>
      <ProjectDetail
        key={project.id}
        project={project}
        onBack={onBack}
        onSaved={() => setRefreshTick((t) => t + 1)}
      />
    </div>
  );
}
