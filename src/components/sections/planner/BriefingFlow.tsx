import { forwardRef, useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { AgentThinkingRow } from "@/components/sections/agent/AgentThinkingRow";
import { useScrollToEnd } from "@/hooks/useScrollToEnd";
import { FEE_TIERS, PN_HYPS } from "@/mocks/data";
import { KPI_OPTS, VERTICALS } from "@/lib/constants";
import { parseMoneyBR as parseBudgetFn, formatMoneyBRFull } from "@/lib/ops-aggregates";
import {
  addProjectHypotheses,
  getDraft,
  getManagedProject,
} from "@/mocks/handlers";
import type {
  Draft,
  DraftHypothesis,
  ManagedHypothesis,
  ManagedProject,
  PnHypothesis,
} from "@/mocks/types";
import { useAppStore } from "@/store/app-store";

type AgentKey = "prediction" | "trends" | "prices";

type PnMessage = {
  id: string;
  role: "user" | "assistant";
  content?: string;
  node?: ReactNode;
};

const STAGE_COLORS: Record<string, string> = {
  "s-done": "var(--color-highlight)",
  "s-gen": "var(--color-accent-light)",
  "s-wait": "#fbbf24",
  "s-inc": "#f87171",
  "s-brief": "#94a3b8",
};

function parseBudget(str: string) {
  return parseBudgetFn(str);
}

function fmtBRL(n: number) {
  return formatMoneyBRFull(n);
}

function getFeeTier(n: number) {
  for (const t of FEE_TIERS) {
    if (n <= t.max) return t;
  }
  return FEE_TIERS[FEE_TIERS.length - 1];
}

function AgentLabel({ role }: { role: "user" | "assistant" }) {
  if (role === "user") {
    return (
      <>
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m9 9 5 12 1.8-5.2L21 14Z" />
          <path d="M7.2 2.2 8 5.1" />
          <path d="M5.1 8 2 8.9" />
          <path d="M14 3.1 12 5.5" />
          <path d="M3.9 14 5.5 12" />
        </svg>{" "}
        Você
      </>
    );
  }
  return (
    <>
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      </svg>{" "}
      Agente Advolve
    </>
  );
}

const PnMsg = forwardRef<HTMLDivElement, { msg: PnMessage }>(function PnMsg({ msg }, ref) {
  const isWide = msg.role === "assistant" && !!msg.node;
  return (
    <div
      ref={ref}
      className={`msg ${msg.role === "user" ? "u" : "a"}${isWide ? " wide" : ""}`}
    >
      <div className="ml">
        <AgentLabel role={msg.role} />
      </div>
      <div className="mb">
        <div className="mc">
          {msg.node ?? (msg.role === "user" ? <p>{msg.content}</p> : msg.content ? <p dangerouslySetInnerHTML={{ __html: msg.content }} /> : null)}
        </div>
      </div>
    </div>
  );
});

interface DataFormProps {
  brands: string[];
  onSubmit: (data: {
    objetivo: string;
    kpis: { kpi: string; target: string }[];
    verticais: string[];
    periodo: string;
    periodoUnit: string;
    budget: string;
    produtos: string;
    eans: string;
    temMidia: boolean;
    canais: string[];
    geo: string;
    brands: string[];
  }) => void;
}

function DataForm({ brands: brandOptions, onSubmit }: DataFormProps) {
  const [objetivo, setObjetivo] = useState("");
  const [objErr, setObjErr] = useState(false);
  const [kpis, setKpis] = useState<{ kpi: string; target: string }[]>([]);
  const [kpisErr, setKpisErr] = useState(false);
  const [kpiTargetsErr, setKpiTargetsErr] = useState(false);
  const [verticais, setVerticais] = useState<string[]>([]);
  const [vertOpen, setVertOpen] = useState(false);
  const [vertErr, setVertErr] = useState(false);
  const [periodo, setPeriodo] = useState("");
  const [periodoErr, setPeriodoErr] = useState(false);
  const [periodoUnit, setPeriodoUnit] = useState("dias");
  const [periodoUnitOpen, setPeriodoUnitOpen] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [brandErr, setBrandErr] = useState(false);
  const [brandQuery, setBrandQuery] = useState("");
  const [showBrandDd, setShowBrandDd] = useState(false);
  const [budget, setBudget] = useState("");
  const [budgetErr, setBudgetErr] = useState(false);
  const [produtos, setProdutos] = useState("");
  const [prodErr, setProdErr] = useState(false);
  const [eans, setEans] = useState("");
  const [temMidia, setTemMidia] = useState<boolean | null>(null);
  const [channels, setChannels] = useState<Record<string, { on: boolean; pct: string }>>({
    google: { on: false, pct: "" },
    meta: { on: false, pct: "" },
    tiktok: { on: false, pct: "" },
  });
  const [geo, setGeo] = useState("");
  const [locked, setLocked] = useState(false);
  const vertWrapRef = useRef<HTMLDivElement>(null);
  const brandInputRef = useRef<HTMLDivElement>(null);
  const periodoUnitRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!vertOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (vertWrapRef.current && !vertWrapRef.current.contains(e.target as Node)) {
        setVertOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [vertOpen]);

  useEffect(() => {
    if (!showBrandDd) return;
    const onPointerDown = (e: MouseEvent) => {
      if (brandInputRef.current && !brandInputRef.current.contains(e.target as Node)) {
        setShowBrandDd(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [showBrandDd]);

  useEffect(() => {
    if (!periodoUnitOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (periodoUnitRef.current && !periodoUnitRef.current.contains(e.target as Node)) {
        setPeriodoUnitOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [periodoUnitOpen]);

  const kpiOptions = objetivo ? KPI_OPTS[objetivo] ?? [] : [];
  const filteredBrands = brandOptions.filter(
    (b) => !selectedBrands.includes(b) && (!brandQuery || b.toLowerCase().includes(brandQuery.toLowerCase())),
  );

  const toggleVert = (v: string) => {
    setVerticais((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]));
    setVertErr(false);
  };

  const addBrand = (v: string) => {
    if (!v || selectedBrands.includes(v)) return;
    setSelectedBrands((p) => [...p, v]);
    setBrandErr(false);
    setBrandQuery("");
    setShowBrandDd(false);
  };

  const toggleKpi = (kpiName: string) => {
    setKpis((prev) =>
      prev.some((k) => k.kpi === kpiName)
        ? prev.filter((k) => k.kpi !== kpiName)
        : [...prev, { kpi: kpiName, target: "" }],
    );
    setKpisErr(false);
  };

  const updateKpiTarget = (index: number, value: string) => {
    setKpis((prev) => prev.map((k, i) => (i === index ? { ...k, target: value } : k)));
    setKpiTargetsErr(false);
  };

  const removeKpi = (kpiName: string) => {
    setKpis((prev) => prev.filter((k) => k.kpi !== kpiName));
  };

  const handleSubmit = () => {
    let valid = true;
    if (!objetivo) {
      setObjErr(true);
      valid = false;
    }
    if (objetivo && !kpis.length) {
      setKpisErr(true);
      valid = false;
    }
    if (objetivo && kpis.some((k) => !k.target.trim())) {
      setKpiTargetsErr(true);
      valid = false;
    }
    if (!verticais.length) {
      setVertErr(true);
      valid = false;
    }
    if (!periodo.trim()) {
      setPeriodoErr(true);
      valid = false;
    }
    if (!budget.trim()) {
      setBudgetErr(true);
      valid = false;
    }
    if (!produtos.trim()) {
      setProdErr(true);
      valid = false;
    }
    if (!selectedBrands.length) {
      setBrandErr(true);
      valid = false;
    }
    if (!valid) return;

    setVertOpen(false);
    setLocked(true);
    const canais: string[] = [];
    (["google", "meta", "tiktok"] as const).forEach((ch) => {
      if (channels[ch].on) {
        canais.push(
          ch.charAt(0).toUpperCase() +
            ch.slice(1) +
            (channels[ch].pct ? ` ${channels[ch].pct}%` : ""),
        );
      }
    });

    onSubmit({
      objetivo,
      kpis,
      verticais,
      periodo: periodo.trim(),
      periodoUnit,
      budget: budget.trim(),
      produtos: produtos.trim(),
      eans: eans.trim(),
      temMidia: temMidia === true,
      canais,
      geo: geo.trim(),
      brands: selectedBrands,
    });
  };

  return (
    <div className="PNF">
      <div className="PNF-hd">Vamos completar o briefing</div>
      <div className="PNF-sub">
        Preciso de mais alguns dados para gerar hipóteses precisas. Preencha os campos abaixo:
      </div>
      <div className="PNF-fields">
        <div>
          <div className="PNF-lbl">
            Objetivo da campanha <span className="PNF-tag req">Obrigatório</span>
          </div>
          <div className={`PNF-obj-grid${objErr ? " pnf-err" : ""}`} id="pnf-obj-grid">
            {(["Aumentar vendas", "Novos compradores"] as const).map((obj) => (
              <button
                key={obj}
                type="button"
                className={`PNF-obj-opt PNF-obj-card${objetivo === obj ? " on" : ""}`}
                disabled={locked}
                onClick={() => {
                  setObjetivo(obj);
                  setObjErr(false);
                  setKpis([]);
                }}
              >
                <span className="PNF-obj-card-lbl">{obj}</span>
              </button>
            ))}
          </div>
          {objetivo && (
            <div className="PNF-kpi-wrap show" id="pnf-kpi-wrap">
              <div className="PNF-lbl" style={{ marginTop: 4 }}>
                Meta do projeto <span className="PNF-tag req">Obrigatório</span>
              </div>
              <div className={`PNF-kpi-opts${kpisErr ? " pnf-err" : ""}`}>
                {kpiOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className={`PNF-kpi-opt${kpis.some((k) => k.kpi === opt) ? " on" : ""}`}
                    disabled={locked}
                    onClick={() => toggleKpi(opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {kpis.length > 0 && (
                <div className="PNF-kpi-items">
                  {kpis.map((k, i) => (
                    <div key={k.kpi} className="PNF-kpi-item">
                      <span className="PNF-kpi-item-lbl">{k.kpi}</span>
                      <input
                        className="PNF-in"
                        type="text"
                        placeholder="Valor da meta"
                        value={k.target}
                        disabled={locked}
                        style={kpiTargetsErr && !k.target.trim() ? { borderColor: "rgba(248,113,113,0.55)" } : undefined}
                        onChange={(e) => updateKpiTarget(i, e.target.value)}
                      />
                      {!locked && (
                        <button type="button" className="PNF-kpi-item-rm" onClick={() => removeKpi(k.kpi)}>×</button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <div className="PNF-lbl">
            Verticais do projeto <span className="PNF-tag req">Obrigatório</span>
          </div>
          <div className="PNF-vert-wrap" id="pnf-vert-wrap" ref={vertWrapRef}>
            <div
              className={`PNF-vert-trigger${vertOpen ? " open" : ""}${verticais.length ? " has-value" : ""}${vertErr ? " pnf-err" : ""}`}
              role="button"
              tabIndex={0}
              onClick={() => !locked && setVertOpen((o) => !o)}
            >
              <span>
                {verticais.length === 0
                  ? "Selecionar verticais…"
                  : verticais.length === 1
                    ? verticais[0]
                    : `${verticais.length} verticais selecionadas`}
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
            {vertOpen && (
              <div className="PNF-vert-dropdown open">
                {VERTICALS.map((v) => (
                  <div
                    key={v}
                    className={`PNF-vert-item${verticais.includes(v) ? " on" : ""}`}
                    onClick={() => !locked && toggleVert(v)}
                  >
                    <div className="PNF-vert-chk">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span className="PNF-vert-item-name">{v}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="PNF-vert-tags">
              {verticais.map((v) => (
                <span key={v} className="PNF-brand-tag">
                  {v}
                  {!locked && (
                    <button
                      type="button"
                      className="PNF-brand-tag-x"
                      aria-label={`Remover ${v}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleVert(v);
                      }}
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="PNF-lbl">
            Período do projeto <span className="PNF-tag req">Obrigatório</span>
          </div>
          <div className="PNF-periodo-row">
            <input
              className="PNF-in"
              id="pnf-periodo"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Ex: 30"
              value={periodo}
              disabled={locked}
              style={periodoErr ? { borderColor: "rgba(248,113,113,0.55)" } : undefined}
              onChange={(e) => {
                setPeriodo(e.target.value);
                setPeriodoErr(false);
              }}
            />
            <div className="PNF-unit-wrap" ref={periodoUnitRef}>
              <div
                className={`PNF-vert-trigger has-value${periodoUnitOpen ? " open" : ""}`}
                role="button"
                tabIndex={0}
                onClick={() => !locked && setPeriodoUnitOpen((o) => !o)}
              >
                <span style={{ textTransform: "capitalize" }}>{periodoUnit}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
              {periodoUnitOpen && (
                <div className="PNF-vert-dropdown open">
                  {(["dias", "meses", "ano"] as const).map((unit) => (
                    <div
                      key={unit}
                      className={`PNF-vert-item${periodoUnit === unit ? " on" : ""}`}
                      onClick={() => { if (!locked) { setPeriodoUnit(unit); setPeriodoUnitOpen(false); } }}
                    >
                      <div className="PNF-vert-chk">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <span className="PNF-vert-item-name" style={{ textTransform: "capitalize" }}>{unit}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="PNF-lbl">
            Marcas do projeto <span className="PNF-tag req">Obrigatório</span>
          </div>
          <div className={`PNF-brand-wrap${brandErr ? " pnf-err" : ""}`}>
            <div className="PNF-brand-sel-row" ref={brandInputRef}>
              <div className="PNF-brand-ac">
                <input
                  className="PNF-brand-ac-input"
                  type="text"
                  placeholder="Buscar marca…"
                  value={brandQuery}
                  disabled={locked}
                  onChange={(e) => { setBrandQuery(e.target.value); setShowBrandDd(true); }}
                  onFocus={() => setShowBrandDd(true)}
                />
                {showBrandDd && (filteredBrands.length > 0 || brandQuery) && (
                  <div className="PNF-brand-dd">
                    {filteredBrands.length > 0 ? (
                      filteredBrands.map((b) => (
                        <div key={b} className="PNF-brand-dd-item" onMouseDown={() => addBrand(b)}>
                          {b}
                        </div>
                      ))
                    ) : (
                      <div className="PNF-brand-dd-empty">Nenhuma marca encontrada</div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="PNF-brand-tags">
              {selectedBrands.length === 0 ? (
                <span className="PNF-brand-empty">Nenhuma marca adicionada ainda</span>
              ) : (
                selectedBrands.map((b, i) => (
                  <span key={b} className="PNF-brand-tag">
                    {b}{" "}
                    {!locked && (
                      <button
                        type="button"
                        className="PNF-brand-tag-x"
                        aria-label="Remover"
                        onClick={() => setSelectedBrands((p) => p.filter((_, j) => j !== i))}
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="PNF-lbl">
            Budget total do projeto <span className="PNF-tag req">Obrigatório</span>
          </div>
          <input
            className="PNF-in"
            id="pnf-budget"
            type="text"
            placeholder="Ex: R$ 250.000"
            value={budget}
            disabled={locked}
            style={budgetErr ? { borderColor: "rgba(248,113,113,0.55)" } : undefined}
            onChange={(e) => {
              setBudget(e.target.value);
              setBudgetErr(false);
            }}
          />
        </div>

        <div>
          <div className="PNF-lbl">
            Produtos trabalhados <span className="PNF-tag req">Obrigatório</span>
          </div>
          <input
            className="PNF-in"
            id="pnf-produtos"
            type="text"
            placeholder="Ex: Coca-Cola Zero, Heineken 350ml, Red Bull"
            value={produtos}
            disabled={locked}
            style={prodErr ? { borderColor: "rgba(248,113,113,0.55)" } : undefined}
            onChange={(e) => {
              setProdutos(e.target.value);
              setProdErr(false);
            }}
          />
        </div>

        <div>
          <div className="PNF-lbl">
            EANs dos produtos <span className="PNF-tag opt">Opcional</span>
          </div>
          <input
            className="PNF-in"
            id="pnf-eans"
            type="text"
            placeholder="Ex: 7894900010015, 7896045112236"
            value={eans}
            disabled={locked}
            onChange={(e) => setEans(e.target.value)}
          />
        </div>

        <div>
          <div className="PNF-lbl">
            Existe plano de mídia? <span className="PNF-tag req">Obrigatório</span>
          </div>
          <div className="PNF-radio">
            <button
              type="button"
              className={`PNF-rb${temMidia === false ? " on" : ""}`}
              disabled={locked}
              onClick={() => setTemMidia(false)}
            >
              Não
            </button>
            <button
              type="button"
              className={`PNF-rb${temMidia === true ? " on" : ""}`}
              disabled={locked}
              onClick={() => setTemMidia(true)}
            >
              Sim
            </button>
          </div>
          {temMidia && (
            <div className="PNF-media show">
              <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Canais e distribuição de budget
              </div>
              {(["google", "meta", "tiktok"] as const).map((ch) => (
                <div key={ch} className="PNF-ch">
                  <div
                    className={`PNF-chk${channels[ch].on ? " on" : ""}`}
                    onClick={() =>
                      !locked &&
                      setChannels((p) => ({
                        ...p,
                        [ch]: { ...p[ch], on: !p[ch].on },
                      }))
                    }
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span className="PNF-chnm">{ch.charAt(0).toUpperCase() + ch.slice(1)}</span>
                  <input
                    className="PNF-pct"
                    type="text"
                    placeholder="%"
                    disabled={!channels[ch].on || locked}
                    value={channels[ch].pct}
                    onChange={(e) =>
                      setChannels((p) => ({ ...p, [ch]: { ...p[ch], pct: e.target.value } }))
                    }
                  />
                </div>
              ))}
              <div style={{ marginTop: 8 }}>
                <div className="PNF-lbl">
                  Geolocalização <span className="PNF-tag opt">Opcional</span>
                </div>
                <input
                  className="PNF-in"
                  type="text"
                  placeholder="Ex: São Paulo, Rio de Janeiro, Sul do Brasil"
                  value={geo}
                  disabled={locked}
                  onChange={(e) => setGeo(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <button type="button" className="PNF-cta" id="pnf-submit" disabled={locked} onClick={handleSubmit}>
        Gerar hipóteses de audiência →
      </button>
    </div>
  );
}

function MediaPlanForm({
  onSubmit,
}: {
  onSubmit: (canais: string[], geo: string) => void;
}) {
  const [channels, setChannels] = useState<Record<string, { on: boolean; pct: string }>>({
    google: { on: false, pct: "" },
    meta: { on: false, pct: "" },
    tiktok: { on: false, pct: "" },
  });
  const [geo, setGeo] = useState("");
  const [err, setErr] = useState(false);
  const [locked, setLocked] = useState(false);

  const handleSubmit = () => {
    const canais: string[] = [];
    (["google", "meta", "tiktok"] as const).forEach((ch) => {
      if (channels[ch].on) {
        canais.push(
          ch.charAt(0).toUpperCase() +
            ch.slice(1) +
            (channels[ch].pct ? ` ${channels[ch].pct}%` : ""),
        );
      }
    });
    if (!canais.length) {
      setErr(true);
      return;
    }
    setLocked(true);
    onSubmit(canais, geo.trim());
  };

  return (
    <div className="PNF">
      <div className="PNF-hd">Plano de mídia</div>
      <div className="PNF-sub">Selecione os canais e distribuição de budget.</div>
      <div className="PNF-fields">
        <div>
          <div className="PNF-lbl">
            Canais <span className="PNF-tag req">Obrigatório</span>
          </div>
          <div className="PNF-media show" style={{ marginTop: 0, background: "none", border: "none", padding: 0 }}>
            {(["google", "meta", "tiktok"] as const).map((ch) => (
              <div key={ch} className="PNF-ch">
                <div
                  className={`PNF-chk${channels[ch].on ? " on" : ""}`}
                  onClick={() =>
                    !locked &&
                    setChannels((p) => ({ ...p, [ch]: { ...p[ch], on: !p[ch].on } }))
                  }
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="PNF-chnm">{ch.charAt(0).toUpperCase() + ch.slice(1)}</span>
                <input
                  className="PNF-pct"
                  type="text"
                  placeholder="%"
                  disabled={!channels[ch].on || locked}
                  value={channels[ch].pct}
                  onChange={(e) =>
                    setChannels((p) => ({ ...p, [ch]: { ...p[ch], pct: e.target.value } }))
                  }
                />
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="PNF-lbl">
            Geolocalização <span className="PNF-tag opt">Opcional</span>
          </div>
          <input
            className="PNF-in"
            type="text"
            placeholder="Ex: São Paulo, Rio de Janeiro"
            value={geo}
            disabled={locked}
            onChange={(e) => setGeo(e.target.value)}
          />
        </div>
      </div>
      <button
        type="button"
        className="PNF-cta"
        style={err ? { outline: "2px solid rgba(248,113,113,0.5)" } : undefined}
        disabled={locked}
        onClick={handleSubmit}
      >
        Finalizar e criar projeto →
      </button>
    </div>
  );
}

export type ConfirmPricing = {
  budget: number;
  fee: number;
  feeDefault: number;
  discountRequested: boolean;
};

function HypothesisResults({
  agents,
  budget,
  briefingText,
  selectedBrands,
  onConfirm,
}: {
  agents: Set<AgentKey>;
  budget: string;
  briefingText: string;
  selectedBrands: string[];
  onConfirm: (accepted: PnHypothesis[], pricing: ConfirmPricing) => void;
}) {
  const [accepted, setAccepted] = useState<Record<string, PnHypothesis>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [editedBudget, setEditedBudget] = useState("");
  const [editedFee, setEditedFee] = useState("");
  const [feeDefaultSnapshot, setFeeDefaultSnapshot] = useState(0);
  const acceptedList = Object.values(accepted);

  const handleCompile = () => {
    if (!acceptedList.length) return;
    const bNum = parseBudget(budget);
    const tier = bNum > 0 ? getFeeTier(bNum) : null;
    const fee = tier ? Math.round(bNum * tier.feePct * 100) / 100 : 0;
    setEditedBudget(bNum > 0 ? fmtBRL(bNum) : "");
    setEditedFee(fee > 0 ? fmtBRL(fee) : "");
    setFeeDefaultSnapshot(fee);
    setShowConfirm(true);
  };

  if (showConfirm && acceptedList.length) {
    const liveBudget = parseBudget(editedBudget);
    const liveFee = parseBudget(editedFee);
    const tier = liveBudget > 0 ? getFeeTier(liveBudget) : null;
    const liveTax = liveBudget > 0 ? Math.round(liveBudget * 0.1215 * 100) / 100 : 0;
    const liveInvest =
      liveBudget > 0 ? Math.max(0, Math.round((liveBudget - liveTax - liveFee) * 100) / 100) : 0;
    const excerpt =
      briefingText.length > 230 ? `${briefingText.substring(0, 230)}…` : briefingText;

    const handleConfirm = () => {
      const discountRequested = liveFee < feeDefaultSnapshot - 0.5;
      onConfirm(acceptedList, {
        budget: liveBudget,
        fee: liveFee,
        feeDefault: feeDefaultSnapshot,
        discountRequested,
      });
    };

    return (
      <div className="PN-confirm" id="pn-confirm-block">
        <div className="PN-confirm-hd">Revisão do projeto</div>
        <div className="PN-confirm-sub">Confirme os dados abaixo antes de finalizar.</div>
        {selectedBrands.length > 0 && (
          <div className="PN-confirm-section">
            <div className="PN-confirm-section-lbl">Projeto</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 9 }}>
              {selectedBrands.map((b) => (
                <span
                  key={b}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    background: "rgba(139,92,246,0.1)",
                    border: "1px solid rgba(139,92,246,0.24)",
                    borderRadius: 100,
                    padding: "3px 10px",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--color-accent-light)",
                  }}
                >
                  {b}
                </span>
              ))}
            </div>
          </div>
        )}
        {excerpt && (
          <div className="PN-confirm-section">
            <div className="PN-confirm-section-lbl">Resumo do briefing</div>
            <div className="PN-confirm-briefing-text">{excerpt}</div>
          </div>
        )}
        {liveBudget > 0 && (
          <div className="PN-confirm-section">
            <div className="PN-confirm-section-lbl">Composição</div>
            <div className="PN-confirm-calc">
              <div className="PN-confirm-calc-row cfee">
                <span className="clbl" style={{ paddingTop: 3 }}>Budget total</span>
                <div className="PN-fee-cell">
                  <input
                    type="text"
                    className="PN-budget-inp"
                    value={editedBudget}
                    onChange={(e) => setEditedBudget(e.target.value)}
                  />
                </div>
              </div>
              <div className="PN-confirm-calc-row clocked">
                <span className="clbl">
                  Impostos <span style={{ fontSize: 10, opacity: 0.6 }}>(12,15% — fixo)</span>
                </span>
                <span className="cval">−{fmtBRL(liveTax)}</span>
              </div>
              <div className="PN-confirm-calc-row cfee">
                <div className="clbl" style={{ paddingTop: 3 }}>
                  Fee Advolve
                  {tier && (
                    <>
                      <br />
                      <span style={{ fontSize: 10, color: "var(--color-text-muted)" }}>{tier.label}</span>
                    </>
                  )}
                </div>
                <div className="PN-fee-cell">
                  <input
                    type="text"
                    className="PN-fee-inp"
                    value={editedFee}
                    onChange={(e) => setEditedFee(e.target.value)}
                  />
                  <span className="PN-fee-hint">editável</span>
                </div>
              </div>
              <hr className="PN-confirm-calc-divider" />
              <div className="PN-confirm-calc-row ctotal">
                <span className="clbl">Valor de mídia</span>
                <span className="cval">{fmtBRL(liveInvest)}</span>
              </div>
            </div>
          </div>
        )}
        <div className="PN-confirm-section">
          <div className="PN-confirm-section-lbl">
            {acceptedList.length} hipótese{acceptedList.length > 1 ? "s" : ""} selecionada
            {acceptedList.length > 1 ? "s" : ""}
          </div>
          <div className="PN-confirm-hyps">
            {acceptedList.map((h) => (
              <div key={h.title} className="PN-confirm-hyp">
                <div className="PN-confirm-hyp-dot" />
                <div className="PN-confirm-hyp-txt">{h.title}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="PN-confirm-actions">
          <button type="button" className="PN-btn PN-btn-review" onClick={() => setShowConfirm(false)}>
            Revisar briefing e hipóteses
          </button>
          <button type="button" className="PN-btn PN-btn-confirm" onClick={handleConfirm}>
            Confirmar projeto
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="HYP-cards">
        {PN_HYPS.map((h, i) => {
          const id = `pn-hyp-${i}`;
          const isAccepted = !!accepted[id];
          return (
            <div
              key={id}
              id={id}
              className={`HYP-card${h.sug ? " sug" : ""}${isAccepted ? " card-voted-accept" : ""}`}
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              <div className="HYP-head">
                <div className="HYP-title">{h.title}</div>
                {h.sug && (
                  <div className="HYP-badge">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                    </svg>
                    IA Recomenda
                  </div>
                )}
              </div>
              <div className="HYP-sec-lbl">Tese</div>
              <div className="HYP-sec-txt">{h.thesis}</div>
              <div className="HYP-sec-lbl">Racional</div>
              <div className="HYP-sec-txt">{h.rationale}</div>
              {agents.has("prediction") && (
                <div className="HYP-addon">
                  <div className="HYP-addon-lbl pd">Predição de Performance</div>
                  <div className="PRED-grid">
                    {Object.entries(h.pred).map(([k, v]) => (
                      <div key={k} className="PRED-cell">
                        <div className="PRED-lbl">{k}</div>
                        <div className="PRED-val">{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {agents.has("trends") && (
                <div className="HYP-addon">
                  <div className="HYP-addon-lbl tr">Análise de Trends</div>
                  <div className="HYP-addon-txt">{h.trend}</div>
                </div>
              )}
              {agents.has("prices") && (
                <div className="HYP-addon">
                  <div className="HYP-addon-lbl pr">Análise de Preços</div>
                  <div className="HYP-addon-txt">{h.price}</div>
                </div>
              )}
              <div className="HYP-footer">
                <div>
                  <div className="HYP-meta-lbl">Métricas previstas</div>
                  <div className="HYP-meta">
                    {h.pills.map((p, pi) => (
                      <span key={pi} className={`HYP-pill${p.c ? ` ${p.c}` : ""}`}>
                        {p.t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="HYP-actions">
                  <span className="HYP-actions-lbl">Incluir neste projeto?</span>
                  <button
                    type="button"
                    className="HYP-vbtn reject"
                    onClick={() =>
                      setAccepted((p) => {
                        const n = { ...p };
                        delete n[id];
                        return n;
                      })
                    }
                  >
                    Descartar
                  </button>
                  <button
                    type="button"
                    className="HYP-vbtn accept"
                    onClick={() => setAccepted((p) => ({ ...p, [id]: h }))}
                  >
                    Aceitar
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {acceptedList.length > 0 && (
        <button type="button" className="HYP-compile visible" onClick={handleCompile}>
          Criar projeto com {acceptedList.length} hipótese{acceptedList.length > 1 ? "s" : ""} aceita
          {acceptedList.length > 1 ? "s" : ""}
        </button>
      )}
    </>
  );
}

function DraftHypReview({
  hyps,
  onAcceptedChange,
}: {
  hyps: DraftHypothesis[];
  onAcceptedChange: (count: number) => void;
}) {
  const [accepted, setAccepted] = useState<Record<number, boolean>>({});

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {hyps.map((h, i) => (
          <div
            key={i}
            className="HYP-card"
            style={
              accepted[i]
                ? { borderColor: "rgba(163,230,53,0.45)", background: "rgba(163,230,53,0.04)" }
                : undefined
            }
          >
            <div className="HYP-title">{h.title}</div>
            {h.pills?.length ? (
              <div className="HYP-pills">
                {h.pills.map((p, pi) => (
                  <span key={pi} className={`HYP-pill${p.c ? ` ${p.c}` : ""}`}>
                    {p.t}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="HYP-actions">
              <span className="HYP-actions-lbl">Adicionar ao projeto?</span>
              <button
                type="button"
                className="HYP-vbtn reject"
                onClick={() => {
                  setAccepted((p) => {
                    const n = { ...p };
                    delete n[i];
                    onAcceptedChange(Object.keys(n).length);
                    return n;
                  });
                }}
              >
                Descartar
              </button>
              <button
                type="button"
                className="HYP-vbtn accept"
                onClick={() => {
                  setAccepted((p) => {
                    const n = { ...p, [i]: true };
                    onAcceptedChange(Object.keys(n).length);
                    return n;
                  });
                }}
              >
                Aceitar
              </button>
            </div>
          </div>
        ))}
      </div>
      {Object.keys(accepted).length > 0 && (
        <button type="button" className="HYP-compile visible">
          Criar projeto
        </button>
      )}
    </>
  );
}

interface BriefingFlowProps {
  draftId?: string | null;
  extendProjectId?: string | null;
}

export function BriefingFlow({ draftId, extendProjectId }: BriefingFlowProps) {
  const currentBrands = useAppStore((s) => s.currentBrands);
  const setSelectedDraftId = useAppStore((s) => s.setSelectedDraftId);
  const setExtendProjectId = useAppStore((s) => s.setExtendProjectId);
  const setSelectedManagedProjectId = useAppStore((s) => s.setSelectedManagedProjectId);
  const setHistoryTab = useAppStore((s) => s.setHistoryTab);
  const setCurrentView = useAppStore((s) => s.setCurrentView);
  const plannerPreload = useAppStore((s) => s.plannerPreload);
  const setPlannerPreload = useAppStore((s) => s.setPlannerPreload);

  const [messages, setMessages] = useState<PnMessage[]>([]);
  const [showEmpty, setShowEmpty] = useState(true);
  const [thinking, setThinking] = useState<{ title: string; steps: string[] } | null>(null);
  const [busy, setBusy] = useState(false);
  const [agents, setAgents] = useState<Set<AgentKey>>(new Set());
  const [briefingText, setBriefingText] = useState("");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [inputLocked, setInputLocked] = useState(false);
  const [textarea, setTextarea] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const draftLoadedRef = useRef(false);
  const extendProjectRef = useRef<ManagedProject | null>(null);
  const preloadConsumedRef = useRef(false);

  useScrollToEnd({
    containerRef: scrollRef,
    endRef,
    deps: [messages, thinking, busy],
  });

  const scrollToEnd = useCallback(() => {
    const container = scrollRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, []);

  const appendMsg = useCallback((msg: Omit<PnMessage, "id">) => {
    setShowEmpty(false);
    setMessages((p) => [...p, { ...msg, id: crypto.randomUUID() }]);
  }, []);

  const runThinking = useCallback(
    (title: string, steps: string[], cb: () => void, delay = 3200) => {
      setThinking({ title, steps });
      const t = setTimeout(() => {
        setThinking(null);
        cb();
      }, delay);
      return () => clearTimeout(t);
    },
    [],
  );

  const showSuccess = useCallback(
    (title: string, sub: string, discountMsg?: string) => {
      appendMsg({
        role: "assistant",
        node: (
          <div className="PN-success">
            <div className="PN-success-ico">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="PN-success-title">{title}</div>
            <div className="PN-success-sub" dangerouslySetInnerHTML={{ __html: sub }} />
            {discountMsg && (
              <div
                className="PN-discount-msg"
                dangerouslySetInnerHTML={{ __html: discountMsg }}
              />
            )}
          </div>
        ),
      });
      setInputLocked(true);
      setBusy(true);
    },
    [appendMsg],
  );

  const showResults = useCallback(
    (budgetVal: string, _produtos: string) => {
      appendMsg({
        role: "assistant",
        content:
          "Com base no briefing e nos dados fornecidos, elaborei o <strong>contexto estratégico do projeto</strong> e identifiquei <strong>4 hipóteses de audiência</strong> ordenadas por potencial incremental.",
      });
      setTimeout(() => {
        appendMsg({
          role: "assistant",
          node: (
            <div className="PNC">
              <div className="PNC-sec">
                <div className="PNC-lbl ctx">Contexto e cenário</div>
                <div className="PNC-body">
                  O foco em crescimento de vendas aponta para <strong>intensificação de demanda em categoria com alta intenção de compra</strong>.
                </div>
              </div>
            </div>
          ),
        });
        setTimeout(() => {
          appendMsg({
            role: "assistant",
            node: (
              <HypothesisResults
                agents={agents}
                budget={budgetVal}
                briefingText={briefingText}
                selectedBrands={selectedBrands}
                onConfirm={(accepted, pricing) => {
                  const n = accepted.length;
                  if (extendProjectId && extendProjectRef.current) {
                    const managedHyps: ManagedHypothesis[] = accepted.map((h) => ({
                      title: h.title,
                      pills: h.pills,
                    }));
                    const projectName = extendProjectRef.current.name;
                    void addProjectHypotheses(extendProjectId, managedHyps);
                    showSuccess(
                      "Hipóteses adicionadas!",
                      `<strong>${n} hipótese${n > 1 ? "s" : ""}</strong> incluída${n > 1 ? "s" : ""} em <strong>${projectName}</strong>.<br/>Voltando para o detalhe do projeto…`,
                    );
                    const projectIdToReturn = extendProjectId;
                    setTimeout(() => {
                      setExtendProjectId(null);
                      setCurrentView("history");
                      setHistoryTab("andamento");
                      setSelectedManagedProjectId(projectIdToReturn);
                    }, 1800);
                    return;
                  }
                  const dateStr = new Date().toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  });
                  const investStr = pricing.budget > 0 ? ` · ${fmtBRL(pricing.budget)} de investimento` : "";
                  const sub = `<strong>${selectedBrands.join(", ") || "Marca"}</strong> · ${n} hipótese${n > 1 ? "s" : ""} de audiência incluída${n > 1 ? "s" : ""}${investStr}<br/>Criado em ${dateStr}. Acompanhe em <strong>Gestão de projetos</strong>.`;
                  const discountMsg = pricing.discountRequested
                    ? `Desconto no fee solicitado para <strong>${fmtBRL(pricing.fee)}</strong> (valor padrão: ${fmtBRL(pricing.feeDefault)}). Já solicitamos a aprovação — aguarde algumas horas para a confirmação do desconto na confirmação do projeto.`
                    : undefined;
                  showSuccess("Projeto confirmado!", sub, discountMsg);
                  setSelectedDraftId(null);
                }}
              />
            ),
          });
          setBusy(false);
        }, 400);
      }, 300);
    },
    [
      agents,
      appendMsg,
      briefingText,
      selectedBrands,
      showSuccess,
      setSelectedDraftId,
      extendProjectId,
      setExtendProjectId,
      setCurrentView,
      setHistoryTab,
      setSelectedManagedProjectId,
    ],
  );

  const showDataForm = useCallback(() => {
    appendMsg({
      role: "assistant",
      node: (
        <DataForm
          brands={currentBrands}
          onSubmit={(data) => {
            setSelectedBrands(data.brands);
            const metaStr = data.kpis.map((k) => k.kpi + (k.target ? ` → ${k.target}` : "")).join(", ");
            const parts = [
              `Marcas: ${data.brands.join(", ")}`,
              `Objetivo: ${data.objetivo}`,
              `Meta: ${metaStr}`,
              `Vertical: ${data.verticais.join(", ")}`,
              `Período: ${data.periodo} ${data.periodoUnit}`,
              `Budget: ${data.budget}`,
              `Produtos: ${data.produtos}`,
            ];
            if (data.eans) parts.push(`EANs: ${data.eans}`);
            if (data.temMidia && data.canais.length) parts.push(`Mídia: ${data.canais.join(", ")}`);
            else if (!data.temMidia) parts.push("Sem plano de mídia definido");
            if (data.geo) parts.push(`Geo: ${data.geo}`);
            appendMsg({ role: "user", content: parts.join(" · ") });

            const steps = [
              "Acessando base de 100MM usuários iFood...",
              `Segmentando por comportamento de compra de ${data.produtos.split(",")[0]?.trim()}...`,
              "Calculando propensão de conversão por segmento...",
              "Estimando ROAS e confiança estatística...",
            ];
            if (agents.has("prediction")) steps.push("Rodando modelo preditivo de performance...");
            if (agents.has("trends")) steps.push("Consultando trends das redes sociais...");
            if (agents.has("prices")) steps.push("Analisando ticket médio e elasticidade de preço...");
            steps.push("Gerando hipóteses ordenadas por potencial...");

            runThinking("Planejando o projeto...", steps, () => showResults(data.budget, data.produtos), steps.length * 900 + 500);
          }}
        />
      ),
    });
    setBusy(false);
  }, [agents, appendMsg, currentBrands, runThinking, showResults]);

  const loadDraft = useCallback(
    (draft: Draft) => {
      setShowEmpty(false);
      setInputLocked(true);
      setBusy(true);
      setSelectedBrands(draft.brands ?? []);
      setBriefingText(draft.briefing ?? "");

      const sc = STAGE_COLORS[draft.stage] ?? "var(--color-text-secondary)";
      const excerpt =
        draft.briefing && draft.briefing.length > 160
          ? `${draft.briefing.substring(0, 160)}…`
          : draft.briefing ?? "";

      appendMsg({
        role: "assistant",
        node: (
          <div className="PN-confirm" style={{ animation: "fu .3s ease-out" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)" }}>{draft.name}</div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  padding: "3px 8px",
                  borderRadius: 100,
                  border: `1px solid ${sc}44`,
                  color: sc,
                  background: `${sc}11`,
                }}
              >
                {draft.stageLabel}
              </span>
            </div>
            {draft.brands?.length ? (
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
                {draft.brands.map((b) => (
                  <span
                    key={b}
                    style={{
                      background: "rgba(139,92,246,0.1)",
                      border: "1px solid rgba(139,92,246,0.22)",
                      borderRadius: 100,
                      padding: "2px 8px",
                      fontSize: 11,
                      fontWeight: 600,
                      color: "var(--color-accent-light)",
                    }}
                  >
                    {b}
                  </span>
                ))}
              </div>
            ) : null}
            <div
              style={{
                fontSize: 12,
                color: "var(--color-text-secondary)",
                lineHeight: 1.55,
                borderLeft: "2px solid rgba(139,92,246,0.3)",
                paddingLeft: 10,
                fontStyle: "italic",
              }}
            >
              {excerpt}
            </div>
          </div>
        ),
      });

      if (draft.progress >= 80) {
        setTimeout(() => {
          appendMsg({
            role: "assistant",
            content:
              "Seu projeto está quase pronto! As hipóteses de audiência já foram aprovadas. Só precisamos definir o <strong>plano de mídia</strong> para finalizar.",
          });
          setTimeout(() => {
            appendMsg({
              role: "assistant",
              node: (
                <MediaPlanForm
                  onSubmit={(canais, geo) => {
                    appendMsg({
                      role: "user",
                      content: `Mídia: ${canais.join(", ")}${geo ? ` · Geo: ${geo}` : ""}`,
                    });
                    runThinking(
                      "Criando projeto...",
                      [
                        "Consolidando briefing e hipóteses aceitas...",
                        "Configurando plano de mídia...",
                        "Registrando projeto na plataforma...",
                      ],
                      () => {
                        const dateStr = new Date().toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        });
                        showSuccess(
                          "Projeto criado!",
                          `<strong>${draft.name}</strong> foi finalizado com sucesso.<br/>Criado em ${dateStr}. Acompanhe em <strong>Gestão de projetos</strong>.`,
                        );
                        setSelectedDraftId(null);
                      },
                      3500,
                    );
                  }}
                />
              ),
            });
          }, 400);
        }, 300);
      } else if (draft.progress >= 60) {
        runThinking(
          "Retomando projeto...",
          [
            "Carregando configurações do projeto...",
            "Recuperando hipóteses geradas...",
            "Preparando para revisão...",
          ],
          () => {
            appendMsg({
              role: "assistant",
              content: `Retomei o projeto <strong>${draft.name}</strong>. Abaixo estão as <strong>${draft.hyps.length} hipóteses</strong> geradas. Revise e aceite as que fazem sentido para avançar.`,
            });
            appendMsg({
              role: "assistant",
              node: <DraftHypReview hyps={draft.hyps} onAcceptedChange={() => {}} />,
            });
            setBusy(false);
          },
          3500,
        );
      } else if (draft.progress >= 40) {
        const prod = draft.produtos?.split(",")[0]?.trim() ?? "produto";
        runThinking(
          "Retomando projeto...",
          [
            "Carregando dados do projeto...",
            "Acessando base de 100MM usuários iFood...",
            `Segmentando por ${prod}...`,
            "Calculando propensão de conversão...",
            "Gerando hipóteses de audiência...",
          ],
          () => {
            appendMsg({
              role: "assistant",
              content: `Retomei o projeto <strong>${draft.name}</strong> e gerei as hipóteses com base nos dados fornecidos.`,
            });
            showResults(draft.budget ?? "", draft.produtos ?? "");
          },
          5000,
        );
      } else {
        runThinking(
          "Analisando briefing...",
          [
            "Lendo o briefing...",
            "Verificando dados já preenchidos...",
            "Identificando o que falta completar...",
          ],
          () => {
            appendMsg({
              role: "assistant",
              content:
                "Retomei o projeto. Para gerar as hipóteses de audiência, preciso que você complete os dados abaixo.",
            });
            showDataForm();
          },
          3000,
        );
      }
    },
    [appendMsg, runThinking, showDataForm, showResults, showSuccess, setSelectedDraftId],
  );

  const loadExtendProject = useCallback(
    (project: ManagedProject) => {
      extendProjectRef.current = project;
      setShowEmpty(false);
      setInputLocked(false);
      setBusy(false);
      setSelectedBrands(project.brands ?? []);
      setBriefingText(project.briefing ?? "");
      appendMsg({
        role: "assistant",
        content: `Projeto <strong>${project.name}</strong> carregado. Atualmente possui <strong>${project.hypotheses.length} hipótese${project.hypotheses.length === 1 ? "" : "s"}</strong>. Descreva o que você procura nas novas hipóteses — pode ser uma nova audiência, um comportamento de compra, ou uma janela sazonal.`,
      });
    },
    [appendMsg],
  );

  useEffect(() => {
    if (draftLoadedRef.current) return;
    if (extendProjectId) {
      draftLoadedRef.current = true;
      void getManagedProject(extendProjectId).then((p) => {
        if (p) loadExtendProject(p);
      });
      return;
    }
    if (!draftId) return;
    draftLoadedRef.current = true;
    // TODO: Replace with real API call
    void getDraft(draftId).then((d) => {
      if (d) loadDraft(d);
    });
  }, [draftId, extendProjectId, loadDraft, loadExtendProject]);

  useEffect(() => {
    if (preloadConsumedRef.current || !plannerPreload) return;
    preloadConsumedRef.current = true;
    const preload = plannerPreload;
    setPlannerPreload(null);
    setShowEmpty(false);
    setInputLocked(true);
    setBusy(true);
    setSelectedBrands(preload.brands);
    setBriefingText(preload.contextMsg);
    appendMsg({ role: "user", content: preload.contextMsg });
    const steps = [
      "Acessando base de 100MM usuários iFood...",
      `Segmentando por comportamento de compra de ${preload.produtos.split(",")[0]?.trim() ?? preload.produtos}...`,
      "Calculando propensão de conversão por segmento...",
      "Estimando ROAS e confiança estatística...",
      "Gerando hipóteses ordenadas por potencial...",
    ];
    runThinking(
      "Planejando o projeto...",
      steps,
      () => showResults(preload.budget, preload.produtos),
      steps.length * 900 + 500,
    );
  }, [plannerPreload, setPlannerPreload, appendMsg, runThinking, showResults]);

  const sendBriefing = () => {
    const text = textarea.trim();
    if (!text || busy) return;
    setBriefingText(text);
    setBusy(true);
    setTextarea("");
    appendMsg({ role: "user", content: text });

    if (extendProjectId && extendProjectRef.current) {
      const project = extendProjectRef.current;
      const prod = project.produtos?.split(",")[0]?.trim() ?? "produto";
      const steps = [
        "Acessando base de 100MM usuários iFood...",
        `Segmentando por comportamento de compra de ${prod}...`,
        "Cruzando com hipóteses já existentes no projeto...",
        "Calculando propensão de conversão por segmento...",
      ];
      if (agents.has("prediction")) steps.push("Rodando modelo preditivo de performance...");
      if (agents.has("trends")) steps.push("Consultando trends das redes sociais...");
      if (agents.has("prices")) steps.push("Analisando ticket médio e elasticidade de preço...");
      steps.push("Gerando hipóteses ordenadas por potencial...");
      runThinking(
        "Consultando base e gerando novas hipóteses...",
        steps,
        () => showResults(project.budget ?? "", project.produtos ?? ""),
        steps.length * 850 + 400,
      );
      return;
    }

    runThinking(
      "Analisando briefing...",
      [
        "Lendo o briefing...",
        "Verificando dados obrigatórios...",
        "Identificando informações faltantes...",
      ],
      showDataForm,
      3200,
    );
  };

  const toggleAgent = (ag: AgentKey) => {
    setAgents((p) => {
      const n = new Set(p);
      if (n.has(ag)) n.delete(ag);
      else n.add(ag);
      return n;
    });
  };

  const hasConversation = !showEmpty || messages.length > 0 || !!thinking;

  const agentOptions = [
    { key: "prediction" as const, label: "Predição de resultados" },
    { key: "trends" as const, label: "Trends" },
    { key: "prices" as const, label: "Análise de preços" },
  ] as const;

  const composer = (
    <div className="NP-compose">
      <div className="NP-tw" id="pn-tw">
        <textarea
          className="NP-ta"
          id="pn-ta"
          rows={hasConversation ? 3 : 4}
          placeholder={
            hasConversation
              ? "Continuar conversa…"
              : "Descreva o projeto, objetivos, marcas e budget…"
          }
          value={textarea}
          disabled={inputLocked || busy}
          onChange={(e) => setTextarea(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendBriefing();
            }
          }}
        />
        <div className="NP-tw-row">
          <button
            type="button"
            className="SB"
            id="pn-send"
            aria-label="Enviar briefing"
            disabled={inputLocked || busy || !textarea.trim()}
            onClick={sendBriefing}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m22 2-7 20-4-9-9-4Z" />
              <path d="M22 2 11 13" />
            </svg>
          </button>
        </div>
      </div>
      {!hasConversation && (
        <div className="NP-quick">
          {agentOptions.map((a) => (
            <button
              key={a.key}
              type="button"
              className={`NP-atog${agents.has(a.key) ? " on" : ""}`}
              data-agent={a.key}
              disabled={inputLocked}
              onClick={() => toggleAgent(a.key)}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className={`NP-body${hasConversation ? " has-msgs" : " is-landing"}`}>
      {hasConversation ? (
        <div className="NP-col">
          <div className="NP-msgs" id="pn-msgs" ref={scrollRef}>
            <div id="pn-msg-list">
              {messages.map((m) => (
                <PnMsg key={m.id} msg={m} />
              ))}
              {thinking && (
                <AgentThinkingRow
                  title={thinking.title}
                  steps={thinking.steps}
                  onLayoutChange={scrollToEnd}
                />
              )}
            </div>
            <div id="pn-msg-end" ref={endRef} />
          </div>
          {composer}
        </div>
      ) : (
        <div className="NP-col is-centered">
          <div className="NP-hero" id="pn-empty">
            <span className="NPE-badge">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
              </svg>
              Agente Advolve
            </span>
            <h3 className="NPE-title">
              Descreva o projeto,
              <br />
              <em>o agente faz o resto.</em>
            </h3>
            <p className="NPE-sub">
              Cole seu briefing e selecione os agentes — hipóteses de audiência com impacto estimado em instantes.
            </p>
          </div>
          {composer}
        </div>
      )}
    </div>
  );
}
