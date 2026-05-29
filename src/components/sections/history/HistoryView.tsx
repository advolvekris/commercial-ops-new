import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { getManagedProjects, updateProjectKvs } from "@/mocks/handlers";
import type { KvRef, ManagedProject } from "@/mocks/types";
import { ProjectDetailView } from "./ProjectDetailView";
import { HISTORY_TAB_LABELS, type HistoryTab } from "@/types";
import { useAppStore } from "@/store/app-store";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { parseMoneyBR, formatMoneyBR } from "@/lib/ops-aggregates";

type StatusFilter =
  | "todos"
  | "pa-ativo"
  | "pa-desconto"
  | "pa-contrato"
  | "pa-faturado"
  | "pa-setup"
  | "pa-draft"
  | "pa-cancelado"
  | "pa-finalizado";

type AndamentoFilter = Exclude<StatusFilter, "pa-draft" | "pa-finalizado" | "pa-cancelado">;

const ALL_STATUS_OPTIONS: { id: StatusFilter; label: string }[] = [
  { id: "todos", label: "Todos os status" },
  { id: "pa-ativo", label: "Ativo" },
  { id: "pa-desconto", label: "Aguardando aprovação de desconto" },
  { id: "pa-setup", label: "Pronto para setup" },
  { id: "pa-faturado", label: "Faturado" },
  { id: "pa-contrato", label: "Contrato assinado" },
  { id: "pa-draft", label: "Em draft" },
  { id: "pa-cancelado", label: "Cancelado" },
  { id: "pa-finalizado", label: "Finalizado" },
];

const ANDAMENTO_STATUS_OPTIONS: { id: AndamentoFilter; label: string }[] = [
  { id: "todos", label: "Todos os status" },
  { id: "pa-ativo", label: "Ativo" },
  { id: "pa-desconto", label: "Aguardando aprovação de desconto" },
  { id: "pa-setup", label: "Pronto para setup" },
  { id: "pa-faturado", label: "Faturado" },
  { id: "pa-contrato", label: "Contrato assinado" },
];

const ANDAMENTO_STATUSES: ReadonlyArray<ManagedProject["status"]> = [
  "pa-ativo",
  "pa-desconto",
  "pa-contrato",
  "pa-faturado",
  "pa-setup",
];

const ANDAMENTO_KPI_STATUSES: { id: ManagedProject["status"]; label: string; cls: string }[] = [
  { id: "pa-ativo", label: "Ativo", cls: "hi" },
  { id: "pa-desconto", label: "Aguard. desconto", cls: "am" },
  { id: "pa-setup", label: "Pronto para setup", cls: "pu" },
  { id: "pa-faturado", label: "Faturado", cls: "am" },
  { id: "pa-contrato", label: "Contrato assinado", cls: "bl" },
];

const TABS: HistoryTab[] = ["lista", "andamento", "kv"];

function shortPeriod(start: string, end: string) {
  if (!start && !end) return "—";
  return `${start ?? ""} – ${end ?? ""}`;
}

function matchesBrands(project: ManagedProject, brandFilters: string[]) {
  if (brandFilters.length === 0) return true;
  return brandFilters.some((b) => project.brands?.includes(b));
}

function brandFilterLabel(selected: string[]) {
  if (selected.length === 0) return "Todas as marcas";
  if (selected.length === 1) return selected[0];
  return `${selected.length} marcas`;
}

function mockThumbSvg(index: number) {
  const colors = [
    ["#5b21b6", "#a78bfa"],
    ["#1e3a5f", "#93c5fd"],
    ["#064e3b", "#6ee7b7"],
    ["#78350f", "#fcd34d"],
  ];
  const [c0, c1] = colors[index % colors.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72"><defs><linearGradient id="gi${index}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c0}"/><stop offset="1" stop-color="${c1}"/></linearGradient></defs><rect width="72" height="72" fill="url(#gi${index})"/><circle cx="36" cy="30" r="9" fill="rgba(255,255,255,0.12)"/><rect x="18" y="47" width="36" height="4" rx="2" fill="rgba(255,255,255,0.1)"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const KV_IMG_EXTS = ["png", "jpg", "jpeg", "svg", "webp", "gif"];

function extOf(name: string) {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

function todayBR() {
  return new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function BkvCard({ project }: { project: ManagedProject }) {
  const [items, setItems] = useState<KvRef[]>(project.kvs ?? []);
  const inputRef = useRef<HTMLInputElement>(null);

  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    files.forEach((f) => {
      const ext = extOf(f.name);
      if (KV_IMG_EXTS.includes(ext)) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const src = String(ev.target?.result ?? "");
          setItems((prev) => {
            const next = [...prev, { name: f.name, date: todayBR(), ext, src }];
            void updateProjectKvs(project.id, next);
            return next;
          });
        };
        reader.readAsDataURL(f);
      } else {
        setItems((prev) => {
          const next = [...prev, { name: f.name, date: todayBR(), ext, src: null }];
          void updateProjectKvs(project.id, next);
          return next;
        });
      }
    });
    e.target.value = "";
  };

  const removeItem = (i: number) => {
    setItems((prev) => {
      const next = prev.filter((_, j) => j !== i);
      void updateProjectKvs(project.id, next);
      return next;
    });
  };

  const openPicker = () => inputRef.current?.click();

  let seedIndex = 0;

  return (
    <div className="BKV-card" data-bkv-id={project.id}>
      <div className="BKV-card-hdr">
        <div>
          <div className="BKV-card-name">{project.name}</div>
          {project.brands.length > 0 && (
            <div
              style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 6 }}
            >
              {project.brands.map((b) => (
                <span
                  key={b}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    fontSize: 10,
                    fontWeight: 600,
                    fontFamily: "var(--font-body)",
                    padding: "3px 9px",
                    borderRadius: 100,
                    background: "rgba(139,92,246,0.1)",
                    border: "1px solid rgba(139,92,246,0.25)",
                    color: "var(--color-accent-light)",
                  }}
                >
                  {b}
                </span>
              ))}
            </div>
          )}
        </div>
        <span className={`PA-badge ${project.status}`} style={{ flexShrink: 0 }}>
          <span className="PA-badge-dot" />
          {project.statusLabel}
        </span>
      </div>
      <div className="BKV-thumbs">
        {items.map((kv, i) => {
          const ext = (kv.ext ?? extOf(kv.name)).toLowerCase();
          const isImg = KV_IMG_EXTS.includes(ext);
          if (kv.src) {
            return (
              <div key={`${kv.name}-${i}`} className="BKV-thumb">
                <img src={kv.src} alt={kv.name} />
                <button
                  type="button"
                  className="BKV-thumb-x"
                  aria-label={`Remover ${kv.name}`}
                  onClick={() => removeItem(i)}
                >
                  ×
                </button>
              </div>
            );
          }
          if (!isImg && ext) {
            return (
              <div key={`${kv.name}-${i}`} className="BKV-thumb-pdf">
                <div className="BKV-thumb-pdf-ext">{ext.toUpperCase()}</div>
                <div className="BKV-thumb-pdf-name">{kv.name}</div>
                <button
                  type="button"
                  className="BKV-thumb-pdf-x"
                  aria-label={`Remover ${kv.name}`}
                  onClick={() => removeItem(i)}
                >
                  ×
                </button>
              </div>
            );
          }
          return (
            <div key={`${kv.name}-${i}`} className="BKV-thumb">
              <img src={mockThumbSvg(seedIndex++)} alt={kv.name} />
              <button
                type="button"
                className="BKV-thumb-x"
                aria-label={`Remover ${kv.name}`}
                onClick={() => removeItem(i)}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
      <input
        ref={inputRef}
        type="file"
        hidden
        multiple
        accept=".png,.jpg,.jpeg,.svg,.webp,.gif,.pdf"
        onChange={onPick}
      />
      <div
        className="BKV-add-zone"
        role="button"
        tabIndex={0}
        onClick={openPicker}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openPicker();
          }
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Adicionar referência de KV
      </div>
    </div>
  );
}

function BrandMultiSelect({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (brands: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const toggle = (brand: string) => {
    onChange(selected.includes(brand) ? selected.filter((b) => b !== brand) : [...selected, brand]);
  };

  return (
    <div ref={wrapRef} className="HIST-ms-wrap">
      <button
        type="button"
        className={`HIST-ms-trigger${open ? " open" : ""}${selected.length > 0 ? " has-val" : ""}`}
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="HIST-ms-trigger-txt">{brandFilterLabel(selected)}</span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="HIST-ms-panel">
          <div className="HIST-ms-panel-hdr">
            <span>Marcas</span>
            {selected.length > 0 && (
              <button type="button" className="HIST-ms-clear" onClick={() => onChange([])}>
                Limpar
              </button>
            )}
          </div>
          <div className="HIST-ms-list">
            {options.length === 0 ? (
              <div className="HIST-ms-empty">Nenhuma marca disponível</div>
            ) : (
              options.map((brand) => {
                const checked = selected.includes(brand);
                return (
                  <label key={brand} className={`HIST-ms-opt${checked ? " on" : ""}`}>
                    <input type="checkbox" checked={checked} onChange={() => toggle(brand)} />
                    <span className="HIST-ms-opt-txt">{brand}</span>
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <CustomSelect
      value={value}
      onChange={onChange}
      options={options}
    />
  );
}

export function HistoryView() {
  const historyTab = useAppStore((s) => s.historyTab);
  const setHistoryTab = useAppStore((s) => s.setHistoryTab);
  const selectedManagedProjectId = useAppStore((s) => s.selectedManagedProjectId);
  const setSelectedManagedProjectId = useAppStore((s) => s.setSelectedManagedProjectId);

  const [allStatusFilter, setAllStatusFilter] = useState<StatusFilter>("todos");
  const [allBrandFilter, setAllBrandFilter] = useState<string[]>([]);
  const [paStatusFilter, setPaStatusFilter] = useState<AndamentoFilter>("todos");
  const [paBrandFilter, setPaBrandFilter] = useState<string[]>([]);
  const [projects, setProjects] = useState<ManagedProject[]>([]);

  const loadProjects = useCallback(async () => {
    // TODO: Replace with real API call
    const data = await getManagedProjects();
    setProjects(data);
  }, []);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  const brandOptions = useMemo(() => {
    const names = new Set<string>();
    for (const p of projects) {
      for (const b of p.brands ?? []) names.add(b);
    }
    return [...names].sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [projects]);

  const totals = useMemo(() => {
    const totalBudget = projects.reduce((sum, p) => sum + (p.budgetNum ?? parseMoneyBR(p.budget)), 0);
    const totalMidia = projects.reduce((sum, p) => sum + parseMoneyBR(p.midia_valor), 0);
    const ativas = projects.filter((p) => p.status === "pa-ativo").length;
    const finalizadas = projects.filter((p) => p.status === "pa-finalizado").length;
    return { totalBudget, totalMidia, ativas, finalizadas };
  }, [projects]);

  const andamentoProjects = useMemo(
    () => projects.filter((p) => ANDAMENTO_STATUSES.includes(p.status as ManagedProject["status"])),
    [projects],
  );

  const andamentoCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const { id } of ANDAMENTO_KPI_STATUSES) counts[id] = 0;
    for (const p of andamentoProjects) {
      if (counts[p.status] !== undefined) counts[p.status] += 1;
    }
    return counts;
  }, [andamentoProjects]);

  const filteredAll = useMemo(() => {
    return projects.filter((p) => {
      if (allStatusFilter !== "todos" && p.status !== allStatusFilter) return false;
      if (!matchesBrands(p, allBrandFilter)) return false;
      return true;
    });
  }, [projects, allStatusFilter, allBrandFilter]);

  const filteredAndamento = useMemo(() => {
    return andamentoProjects.filter((p) => {
      if (paStatusFilter !== "todos" && p.status !== paStatusFilter) return false;
      if (!matchesBrands(p, paBrandFilter)) return false;
      return true;
    });
  }, [andamentoProjects, paStatusFilter, paBrandFilter]);

  const openProject = (projectId: string) => {
    setSelectedManagedProjectId(projectId);
  };

  const renderFilterBar = (
    statusValue: string,
    onStatusChange: (value: string) => void,
    statusOptions: { id: string; label: string }[],
    brandValue: string[],
    onBrandChange: (brands: string[]) => void,
    count: number,
  ) => (
    <div className="HIST-filterbar">
      <FilterSelect
        label="Filtrar por status"
        value={statusValue}
        onChange={onStatusChange}
        options={statusOptions.map((o) => ({ value: o.id, label: o.label }))}
      />
      <BrandMultiSelect
        label="Filtrar por marca"
        options={brandOptions}
        selected={brandValue}
        onChange={onBrandChange}
      />
      <span className="HIST-filterbar-count">
        {count} projeto{count !== 1 ? "s" : ""}
      </span>
    </div>
  );

  const renderProjectsTable = (rows: ManagedProject[]) => (
    <div className="HIST-section-tbl-wrap">
    <table className="camp-tbl cols-5 clickable">
      <thead>
        <tr>
          <th>Projeto</th>
          <th>Marcas</th>
          <th>Período</th>
          <th>Budget</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={5} style={{ textAlign: "center", color: "var(--color-text-muted)", fontStyle: "italic", padding: "24px 12px" }}>
              Nenhum projeto encontrado com os filtros aplicados
            </td>
          </tr>
        ) : (
          rows.map((p) => (
            <tr
              key={p.id}
              role="button"
              tabIndex={0}
              onClick={() => openProject(p.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openProject(p.id);
                }
              }}
            >
              <td>{p.name}</td>
              <td>
                {p.brands?.length ? (
                  <div className="HIST-brand-tags">
                    {p.brands.map((b) => (
                      <span key={b} className="HIST-brand-tag">
                        {b}
                      </span>
                    ))}
                  </div>
                ) : (
                  "—"
                )}
              </td>
              <td>{shortPeriod(p.start, p.end)}</td>
              <td>{p.budget}</td>
              <td>
                <span className={`PA-badge ${p.status}`}>
                  <span className="PA-badge-dot" />
                  {p.statusLabel}
                </span>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
    </div>
  );

  if (selectedManagedProjectId) {
    return (
      <ProjectDetailView
        projectId={selectedManagedProjectId}
        onBack={() => setSelectedManagedProjectId(null)}
      />
    );
  }

  return (
    <>
      <div style={{ marginBottom: 28 }}>
        <h2 className="SH2">Gestão de projetos</h2>
        <p className="SP">Acompanhe projetos em andamento, histórico de campanhas e referências de KV.</p>
      </div>

      <div className="HIST-tab-row">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`HIST-tab${historyTab === tab ? " active" : ""}`}
            onClick={() => setHistoryTab(tab)}
          >
            {HISTORY_TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {historyTab === "lista" && (
        <div id="hist-tab-lista">
          <div className="HIST-kpi-row">
            <div className="HIST-kpi">
              <div className="HIST-kpi-val">{formatMoneyBR(totals.totalBudget)}</div>
              <div className="HIST-kpi-lbl">Budget total investido</div>
            </div>
            <div className="HIST-kpi-div" />
            <div className="HIST-kpi">
              <div className="HIST-kpi-val">{formatMoneyBR(totals.totalMidia)}</div>
              <div className="HIST-kpi-lbl">Valor total de mídia</div>
            </div>
            <div className="HIST-kpi-div" />
            <div className="HIST-kpi">
              <div className="HIST-kpi-val hi">{totals.ativas}</div>
              <div className="HIST-kpi-lbl">Projetos ativos</div>
            </div>
            <div className="HIST-kpi-div" />
            <div className="HIST-kpi">
              <div className="HIST-kpi-val pu">{totals.finalizadas}</div>
              <div className="HIST-kpi-lbl">Projetos finalizados</div>
            </div>
          </div>

          <div className="HIST-section">
            {renderFilterBar(
              allStatusFilter,
              (v) => setAllStatusFilter(v as StatusFilter),
              ALL_STATUS_OPTIONS,
              allBrandFilter,
              setAllBrandFilter,
              filteredAll.length,
            )}
            {renderProjectsTable(filteredAll)}
          </div>
        </div>
      )}

      {historyTab === "andamento" && (
        <div id="hist-tab-andamento">
          <div className="HIST-kpi-row">
            {ANDAMENTO_KPI_STATUSES.map((item, idx) => (
              <div key={item.id} style={{ display: "contents" }}>
                {idx > 0 && <div className="HIST-kpi-div" />}
                <div className="HIST-kpi">
                  <div className={`HIST-kpi-val ${item.cls}`}>{andamentoCounts[item.id] ?? 0}</div>
                  <div className="HIST-kpi-lbl">{item.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="HIST-section">
            {renderFilterBar(
              paStatusFilter,
              (v) => setPaStatusFilter(v as AndamentoFilter),
              ANDAMENTO_STATUS_OPTIONS,
              paBrandFilter,
              setPaBrandFilter,
              filteredAndamento.length,
            )}
            {renderProjectsTable(filteredAndamento)}
          </div>
        </div>
      )}

      {historyTab === "kv" && (
        <div id="hist-tab-kv">
          <div className="HIST-kv-section">
            <div className="BND-section">
              <div className="BND-section-hdr">
                <div className="BND-section-ico pu">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
                <div className="BND-section-hdr-text">
                  <h3>Referências de KV por projeto</h3>
                  <p>Imagens e materiais de key visual vinculados a cada projeto — marcas trabalhadas por campanha</p>
                </div>
              </div>
              <div className="BKV-grid">
                {projects.map((p) => (
                  <BkvCard key={p.id} project={p} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
