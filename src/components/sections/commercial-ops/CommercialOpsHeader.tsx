import { useEffect, useMemo, useState } from "react";
import { getBuOptions, getResponsaveis } from "@/mocks/handlers";
import type { BuOption } from "@/mocks/types";
import { COMMERCIAL_OPS_VIEW_LABELS } from "@/types";
import type { ResponsavelUser } from "@/types";
import { useAppStore } from "@/store/app-store";
import { PIPELINE_STATUSES, getStatusLabel } from "@/lib/commercial-status";
import { OpsMultiSelect } from "./OpsMultiSelect";
import { CustomSelect } from "@/components/ui/CustomSelect";
export function CommercialOpsHeader() {
  const commercialOpsView = useAppStore((s) => s.commercialOpsView);
  const opsFilters = useAppStore((s) => s.opsFilters);
  const setOpsFilters = useAppStore((s) => s.setOpsFilters);
  const resetOpsFilters = useAppStore((s) => s.resetOpsFilters);
  const [responsaveis, setResponsaveis] = useState<ResponsavelUser[]>([]);
  const [allBuData, setAllBuData] = useState<BuOption[]>([]);

  useEffect(() => {
    void getResponsaveis().then(setResponsaveis);
    void getBuOptions().then(setAllBuData);
  }, []);

  const allBuOptions = useMemo(() => allBuData.map((o) => o.bu), [allBuData]);

  const allBrands = useMemo(() => {
    const set = new Set<string>();
    const activeBus = opsFilters.bu;
    for (const o of allBuData) {
      if (activeBus.length === 0 || activeBus.includes(o.bu)) {
        for (const b of o.brands) set.add(b);
      }
    }
    return [...set].sort();
  }, [opsFilters.bu, allBuData]);

  const isCampaigns = commercialOpsView === "campaigns";

  const hasActiveFilters =
    opsFilters.bu.length > 0 ||
    opsFilters.brands.length > 0 ||
    !!opsFilters.status ||
    !!opsFilters.responsavelId;

  const selectedResponsavel = opsFilters.responsavelId
    ? (responsaveis.find((r) => r.id === opsFilters.responsavelId) ?? null)
    : null;

  return (
    <header className="OPS-hdr">
      <div>
        <h1 className="OPS-hdr-title">{COMMERCIAL_OPS_VIEW_LABELS[commercialOpsView]}</h1>
        <p className="OPS-hdr-sub">
          {isCampaigns
            ? "Monitoramento de campanhas ativas em tempo real"
            : "Visão consolidada de todas as BUs e marcas"}
        </p>
      </div>

      <div className="OPS-hdr-right">
        <div className="OPS-filters">
          {/* BU — multi-select autocomplete */}
          <OpsMultiSelect
            options={allBuOptions}
            selected={opsFilters.bu}
            onChange={(vals) => setOpsFilters({ bu: vals, brands: [] })}
            placeholder="Todas as BUs"
          />

          {/* Marcas — multi-select autocomplete */}
          <OpsMultiSelect
            options={allBrands}
            selected={opsFilters.brands}
            onChange={(vals) => setOpsFilters({ brands: vals })}
            placeholder="Todas as marcas"
          />

          {/* Responsável — single select */}
          <CustomSelect
            value={opsFilters.responsavelId ?? ""}
            onChange={(v) => setOpsFilters({ responsavelId: v || null })}
            options={responsaveis.map((rv) => ({ value: rv.id, label: rv.name }))}
            placeholder="Todos os responsáveis"
            prefix={selectedResponsavel ? (
              <span className="OPS-select-rv-dot" style={{ background: selectedResponsavel.color }} title={selectedResponsavel.name} />
            ) : undefined}
          />

          {/* Status — apenas fora de Campanhas */}
          {!isCampaigns && (
            <CustomSelect
              value={opsFilters.status ?? ""}
              onChange={(v) => setOpsFilters({ status: v || null })}
              options={PIPELINE_STATUSES.map((s) => ({ value: s, label: getStatusLabel(s) }))}
              placeholder="Todos os status"
            />
          )}

          {hasActiveFilters && (
            <button
              type="button"
              className="OPS-btn OPS-btn-ghost OPS-btn-sm"
              onClick={resetOpsFilters}
            >
              Limpar filtros
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
