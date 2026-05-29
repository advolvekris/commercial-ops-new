import { useCallback, useEffect, useState } from "react";
import { getBrands } from "@/mocks/handlers";
import type { Brand } from "@/mocks/types";
import { useAppStore } from "@/store/app-store";

const CHECK_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ICONS = {
  logo: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  book: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  font: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="4 7 4 4 20 4 20 7" />
      <line x1="9" x2="15" y1="20" y2="20" />
      <line x1="12" x2="12" y1="4" y2="20" />
    </svg>
  ),
  edit: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
};

function assetMissing(brand: Brand) {
  const missing: string[] = [];
  if (!brand.hasLogo) missing.push("Logo");
  if (!brand.hasBrandbook) missing.push("Brandbook");
  if (!brand.hasFonts) missing.push("Fonte");
  return missing;
}

export function BrandCatalog() {
  const setBrandSubView = useAppStore((s) => s.setBrandSubView);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBrands = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getBrands();
      setBrands(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBrands();
  }, [loadBrands]);

  const complete = brands.filter((b) => b.inferred).length;
  const pending = brands.length - complete;

  return (
    <div className="BNDV">
      <div className="BGC-header">
        <div>
          <h2 className="SH2">Brand Guideline</h2>
          <p className="SP">
            Gerencie identidade visual, tipografia e diretrizes criativas para cada marca da conta.
          </p>
        </div>
        <button type="button" className="BGC-new-btn" onClick={() => setBrandSubView("new", null)}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Cadastrar marca
        </button>
      </div>

      <div className="HIST-kpi-row">
        <div className="HIST-kpi">
          <div className="HIST-kpi-val pu">{loading ? "—" : brands.length}</div>
          <div className="HIST-kpi-lbl">Marcas cadastradas</div>
        </div>
        <div className="HIST-kpi-div" />
        <div className="HIST-kpi">
          <div className="HIST-kpi-val hi">{loading ? "—" : complete}</div>
          <div className="HIST-kpi-lbl">Diretrizes completas</div>
        </div>
        <div className="HIST-kpi-div" />
        <div className="HIST-kpi">
          <div className="HIST-kpi-val am">{loading ? "—" : pending}</div>
          <div className="HIST-kpi-lbl">Com pendências</div>
        </div>
      </div>

      <div className="HIST-section">
        <div className="HIST-filterbar">
          <span className="HIST-filterbar-count">
            {loading ? "—" : `${brands.length} marca${brands.length === 1 ? "" : "s"}`}
          </span>
        </div>
        <table className="camp-tbl cols-5 clickable BGC-tbl">
          <thead>
            <tr>
              <th>Marca</th>
              <th>Categoria</th>
              <th>Verticais</th>
              <th>Diretrizes</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", color: "var(--color-text-muted)", padding: "32px 0" }}>
                  Carregando marcas…
                </td>
              </tr>
            ) : brands.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", color: "var(--color-text-muted)", padding: "32px 0" }}>
                  Nenhuma marca cadastrada ainda.
                </td>
              </tr>
            ) : (
              brands.map((brand) => {
                const missing = assetMissing(brand);
                const statusItems = [
                  { lbl: "Logo", ok: brand.hasLogo, ico: ICONS.logo },
                  { lbl: "Brandbook", ok: brand.hasBrandbook, ico: ICONS.book },
                  { lbl: "Fonte", ok: brand.hasFonts, ico: ICONS.font },
                ];
                return (
                  <tr
                    key={brand.id}
                    onClick={() => setBrandSubView("detail", brand.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setBrandSubView("detail", brand.id);
                      }
                    }}
                    tabIndex={0}
                  >
                    <td>
                      <div className="BGC-tbl-brand">
                        <div className="BGC-av sm" style={{ background: brand.color }}>
                          {brand.initials}
                        </div>
                        <span className="BGC-tbl-name">{brand.name}</span>
                      </div>
                    </td>
                    <td>{brand.cat}</td>
                    <td>
                      <div className="HIST-brand-tags">
                        {brand.verticals.length > 0 ? (
                          brand.verticals.map((v) => (
                            <span key={v} className="HIST-brand-tag">
                              {v}
                            </span>
                          ))
                        ) : (
                          <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>—</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="BGC-tbl-assets">
                        {statusItems.map((s) => (
                          <span
                            key={s.lbl}
                            className={`BGC-tbl-asset ${s.ok ? "ok" : "miss"}`}
                            title={`${s.lbl}: ${s.ok ? "ok" : "pendente"}`}
                          >
                            {s.ok ? CHECK_ICON : s.ico}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="BGC-tbl-status">
                        {brand.inferred ? (
                          <span className="BGC-badge complete">Completo</span>
                        ) : (
                          <span className="BGC-badge pending">
                            {missing.length} pendência{missing.length !== 1 ? "s" : ""}
                          </span>
                        )}
                        {brand.inferred && (
                          <button
                            type="button"
                            className="BGC-edit-btn"
                            title="Editar diretrizes"
                            onClick={(e) => {
                              e.stopPropagation();
                              setBrandSubView("new", brand.id);
                            }}
                          >
                            {ICONS.edit}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
