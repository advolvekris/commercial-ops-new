import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, X } from "lucide-react";
import { getAllManagedProjects, getResponsaveis } from "@/mocks/handlers";
import type { ManagedProject } from "@/mocks/types";
import type { CommercialProjectStatus, ResponsavelUser } from "@/types";
import { matchesOpsFilters } from "@/lib/ops-aggregates";
import {
  COMMERCIAL_STATUS_LABELS,
  PIPELINE_STATUSES,
  isCommercialStatus,
} from "@/lib/commercial-status";
import { useAppStore } from "@/store/app-store";
import { CommercialProjectDetail } from "./CommercialProjectDetail";
import { UserAvatar } from "@/components/layout/UserAvatar";

type ProjectsViewMode = "list" | "kanban";

const KANBAN_COLUMNS = PIPELINE_STATUSES.map((s) => ({
  status: s,
  label: COMMERCIAL_STATUS_LABELS[s],
}));

function shortPeriod(start: string, end: string) {
  if (!start && !end) return "—";
  return `${start ?? ""} – ${end ?? ""}`;
}

/* Parse dd/mm/yyyy → timestamp; returns null if invalid */
function parseBR(s: string): number | null {
  if (!s) return null;
  const [dd, mm, yyyy] = s.split("/");
  if (!dd || !mm || !yyyy) return null;
  const t = new Date(Number(yyyy), Number(mm) - 1, Number(dd)).getTime();
  return isNaN(t) ? null : t;
}

/* Parse yyyy-mm-dd (from <input type="date">) → timestamp; returns null if empty */
function parseISO(s: string): number | null {
  if (!s) return null;
  const t = new Date(s + "T00:00:00").getTime();
  return isNaN(t) ? null : t;
}

function matchesPeriod(p: ManagedProject, start: string, end: string): boolean {
  if (!start && !end) return true;
  const pStart = parseBR(p.start);
  const pEnd = parseBR(p.end);
  const fStart = parseISO(start);
  const fEnd = parseISO(end);
  // project overlaps filter range: project.start ≤ filter.end AND project.end ≥ filter.start
  if (fEnd !== null && pStart !== null && pStart > fEnd) return false;
  if (fStart !== null && pEnd !== null && pEnd < fStart) return false;
  return true;
}

export function OpsProjectsView() {
  const opsFilters = useAppStore((s) => s.opsFilters);
  const opsSelectedProjectId = useAppStore((s) => s.opsSelectedProjectId);
  const setOpsSelectedProjectId = useAppStore((s) => s.setOpsSelectedProjectId);
  const [projects, setProjects] = useState<ManagedProject[]>([]);
  const [responsaveis, setResponsaveis] = useState<ResponsavelUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ProjectsViewMode>("list");

  /* Date range filter — local state */
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");

  /* DnD state */
  const draggingIdRef = useRef<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [list, rvs] = await Promise.all([getAllManagedProjects(), getResponsaveis()]);
    setProjects(list);
    setResponsaveis(rvs);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const responsaveisMap = useMemo(() => {
    const map = new Map<string, ResponsavelUser>();
    for (const rv of responsaveis) map.set(rv.id, rv);
    return map;
  }, [responsaveis]);

  const filtered = useMemo(
    () =>
      projects
        .filter((p) => matchesOpsFilters(p, opsFilters))
        .filter((p) => matchesPeriod(p, periodStart, periodEnd)),
    [projects, opsFilters, periodStart, periodEnd],
  );

  const selected = useMemo(
    () => projects.find((p) => p.id === opsSelectedProjectId) ?? null,
    [projects, opsSelectedProjectId],
  );

  function handleDragStart(e: React.DragEvent, projectId: string) {
    draggingIdRef.current = projectId;
    setDraggingId(projectId);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragEnd() {
    draggingIdRef.current = null;
    setDraggingId(null);
    setDragOverCol(null);
  }

  function handleDragOver(e: React.DragEvent, colStatus: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverCol(colStatus);
  }

  function handleDrop(e: React.DragEvent, colStatus: string) {
    e.preventDefault();
    const id = draggingIdRef.current;
    if (!id) return;
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const newStatus = isCommercialStatus(colStatus) ? colStatus : p.status;
        return {
          ...p,
          status: newStatus,
          statusLabel: isCommercialStatus(newStatus)
            ? COMMERCIAL_STATUS_LABELS[newStatus as CommercialProjectStatus]
            : p.statusLabel,
        };
      }),
    );
    setDraggingId(null);
    setDragOverCol(null);
    draggingIdRef.current = null;
  }

  if (selected) {
    return (
      <CommercialProjectDetail
        project={selected}
        onBack={() => setOpsSelectedProjectId(null)}
        onUpdated={(updated) => {
          setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        }}
      />
    );
  }

  if (loading) {
    return <div className="OPS-loading">Carregando projetos…</div>;
  }

  const hasPeriodFilter = periodStart || periodEnd;

  return (
    <div className="OPS-view OPS-projects">
      {/* Date range filter */}
      <div className="OPS-date-filter">
        <span className="OPS-date-label">
          <CalendarDays size={13} strokeWidth={2} />
          Período
        </span>
        <input
          type="date"
          className="OPS-date-input"
          value={periodStart}
          onChange={(e) => setPeriodStart(e.target.value)}
          title="Início do período"
        />
        <span className="OPS-date-sep">→</span>
        <input
          type="date"
          className="OPS-date-input"
          value={periodEnd}
          onChange={(e) => setPeriodEnd(e.target.value)}
          title="Fim do período"
        />
        {hasPeriodFilter && (
          <button
            type="button"
            className="OPS-btn OPS-btn-ghost OPS-btn-sm OPS-date-clear"
            onClick={() => { setPeriodStart(""); setPeriodEnd(""); }}
          >
            <X size={11} strokeWidth={2.5} />
            Limpar
          </button>
        )}
      </div>

      {/* View mode toggle */}
      <div className="OPS-view-toolbar">
        <button
          type="button"
          className={`OPS-view-toggle${viewMode === "list" ? " on" : ""}`}
          onClick={() => setViewMode("list")}
          title="Visão em lista"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
          Lista
        </button>
        <button
          type="button"
          className={`OPS-view-toggle${viewMode === "kanban" ? " on" : ""}`}
          onClick={() => setViewMode("kanban")}
          title="Visão Kanban"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="5" height="18" rx="1" />
            <rect x="10" y="3" width="5" height="12" rx="1" />
            <rect x="17" y="3" width="5" height="15" rx="1" />
          </svg>
          Kanban
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="OPS-empty">Nenhum projeto encontrado com os filtros atuais.</p>
      ) : viewMode === "list" ? (
        <div className="OPS-table">
          <div className="OPS-table-hdr">
            <span className="OPS-table-col-bu">BU</span>
            <span>Projeto</span>
            <span>Status</span>
            <span className="OPS-table-col-num">Budget</span>
            <span className="OPS-table-col-period">Período</span>
            <span className="OPS-table-col-num OPS-table-col-midia">Mídia</span>
            <span className="OPS-table-col-resp">Responsável</span>
          </div>
          {filtered.map((p) => {
            const rv = p.responsavelId ? responsaveisMap.get(p.responsavelId) : undefined;
            return (
              <button
                key={p.id}
                type="button"
                className="OPS-table-row"
                onClick={() => setOpsSelectedProjectId(p.id)}
              >
                <span className="OPS-table-col-bu">{p.bu}</span>
                <span className="OPS-table-col-name">
                  <strong>{p.name}</strong>
                  <span>{p.brands.join(" · ")}</span>
                </span>
                <span className="OPS-table-col-status">
                  <span className={`PA-badge ${p.status}`} title={p.statusLabel}>
                    {p.statusLabel}
                  </span>
                </span>
                <span className="OPS-table-col-num">{p.budget}</span>
                <span className="OPS-table-col-period">{shortPeriod(p.start, p.end)}</span>
                <span className="OPS-table-col-num OPS-table-col-midia">{p.midia_valor}</span>
                <span className="OPS-table-col-resp">
                  {rv ? (
                    <span className="OPS-resp-cell">
                      <UserAvatar user={rv} size={22} showTooltip />
                      <span className="OPS-resp-name">{rv.name.split(" ")[0]}</span>
                    </span>
                  ) : (
                    <span className="OPS-resp-none">—</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        /* Kanban com drag-and-drop */
        <div className="OPS-kanban-wrap">
          <div className="OPS-kanban">
            {KANBAN_COLUMNS.map(({ status, label }) => {
              const colProjects = filtered.filter((p) => p.status === status);
              const isOver = dragOverCol === status;
              return (
                <div
                  key={status}
                  className={`OPS-kanban-col${isOver ? " dnd-over" : ""}`}
                  onDragOver={(e) => handleDragOver(e, status)}
                  onDragLeave={() => setDragOverCol(null)}
                  onDrop={(e) => handleDrop(e, status)}
                >
                  <div className="OPS-kanban-col-hd">
                    <span className={`PA-badge ${status}`}>{label}</span>
                    <span className="OPS-kanban-count">{colProjects.length}</span>
                  </div>
                  <div className="OPS-kanban-cards">
                    {colProjects.length === 0 ? (
                      <div className={`OPS-kanban-empty${isOver ? " dnd-over-empty" : ""}`}>
                        {isOver ? "Soltar aqui" : "Nenhum projeto"}
                      </div>
                    ) : (
                      colProjects.map((p) => {
                        const rv = p.responsavelId
                          ? responsaveisMap.get(p.responsavelId)
                          : undefined;
                        const isDragging = draggingId === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            draggable
                            className={`OPS-kanban-card${isDragging ? " dnd-dragging" : ""}`}
                            onClick={() => !draggingId && setOpsSelectedProjectId(p.id)}
                            onDragStart={(e) => handleDragStart(e, p.id)}
                            onDragEnd={handleDragEnd}
                          >
                            <div className="OPS-kanban-card-name">{p.name}</div>
                            <div className="OPS-kanban-card-brands">
                              {p.brands.map((b) => (
                                <span key={b} className="OPS-kanban-brand-tag">{b}</span>
                              ))}
                            </div>
                            <div className="OPS-kanban-card-foot">
                              <span className="OPS-kanban-card-budget">{p.budget}</span>
                              {rv && <UserAvatar user={rv} size={20} showTooltip />}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
