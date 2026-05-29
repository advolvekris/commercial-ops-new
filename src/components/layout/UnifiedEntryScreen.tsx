import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, BarChart3, LogOut, Search } from "lucide-react";
import { BU_OPTIONS, managedProjectsSeed } from "@/mocks/data";
import { assetPath } from "@/lib/base-path";
import { useAppStore } from "@/store/app-store";
import { AmbientOrbs } from "./AmbientOrbs";
import { UserAvatar } from "./UserAvatar";

const TOTAL_BUS = BU_OPTIONS.length;
const ACTIVE_PROJECTS = managedProjectsSeed.filter((p) => p.status === "pa-ativo").length;
const SETUP_PROJECTS = managedProjectsSeed.filter((p) => p.status === "pa-setup").length;
const DONE_PROJECTS = managedProjectsSeed.filter((p) => p.status === "pa-finalizado").length;

export function UnifiedEntryScreen() {
  const setGatePassed = useAppStore((s) => s.setGatePassed);
  const setCurrentBu = useAppStore((s) => s.setCurrentBu);
  const setAppDomain = useAppStore((s) => s.setAppDomain);
  const currentUser = useAppStore((s) => s.currentUser);
  const setCurrentUser = useAppStore((s) => s.setCurrentUser);

  const [search, setSearch] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const [options] = useState(BU_OPTIONS);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.bu.toLowerCase().includes(q));
  }, [search, options]);

  const enterPlayground = useCallback(
    (bu: string, brands: string[]) => {
      setCurrentBu(bu, brands);
      setAppDomain("playground");
      setGatePassed(true);
    },
    [setCurrentBu, setAppDomain, setGatePassed],
  );

  useEffect(() => {
    setActiveIdx(0);
  }, [search]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (filtered.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => (i + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => (i - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = filtered[activeIdx];
      if (item) enterPlayground(item.bu, item.brands);
    }
  }

  const firstName = currentUser?.name.split(" ")[0] ?? "visitante";

  return (
    <div className="UE-screen" id="unified-entry">
      <AmbientOrbs />

      {currentUser && (
        <div className="DS-user-badge">
          <UserAvatar user={currentUser} size={30} showTooltip={false} />
          <div className="DS-user-info">
            <span className="DS-user-name">{currentUser.name}</span>
            <span className="DS-user-role">{currentUser.role}</span>
          </div>
          <button
            type="button"
            className="DS-logout-btn"
            title="Trocar usuário"
            onClick={() => setCurrentUser(null)}
          >
            <LogOut size={14} strokeWidth={2} />
          </button>
        </div>
      )}

      <div className="UE-wrap">
        {/* Painel esquerdo — Playground */}
        <div className="UE-left">
          <div className="PS-logo">
            <img className="PS-logo-img" src={assetPath("/advolve-logo.png")} alt="advolve" />
            <p className="PS-logo-pg">Playground v0</p>
          </div>
          <h2 className="PS-heading">
            Olá, {firstName}.<br />
            Selecione um <em>projeto</em>.
          </h2>
          <p className="PS-sub" style={{ marginBottom: 0 }}>
            Digite para buscar o cliente.
          </p>
          <div className="PS-divider" style={{ marginTop: "20px", marginBottom: "16px" }} />

          <div className="PS-field">
            <div className="PS-iw">
              <Search size={16} strokeWidth={2} />
              <input
                type="text"
                placeholder="Buscar cliente — ex: iFood, Pepsico…"
                autoComplete="off"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <div className="PS-dd" id="ue-ps-dropdown">
              {filtered.length === 0 ? (
                <div className="PS-no-result">Nenhum cliente encontrado</div>
              ) : (
                filtered.map((item, idx) => (
                  <div
                    key={item.bu}
                    className={`PS-item${idx === activeIdx ? " ps-active" : ""}`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      enterPlayground(item.bu, item.brands);
                    }}
                    onMouseEnter={() => setActiveIdx(idx)}
                  >
                    <div className="PS-item-name">{item.bu}</div>
                    <div className="PS-item-count">{item.count}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <p className="PS-hint">↑↓ para navegar · Enter para selecionar</p>
        </div>

        {/* Painel direito — Commercial Ops */}
        <div className="UE-right">
          <div className="PS-logo">
            <img className="PS-logo-img" src={assetPath("/advolve-logo.png")} alt="advolve" />
            <p className="PS-logo-pg UE-ops-pg">Commercial Ops</p>
          </div>
          <h2 className="PS-heading">
            Gestão comercial <em>centralizada</em>.
          </h2>
          <p className="PS-sub" style={{ marginBottom: 0 }}>
            Portfólio consolidado de BUs, projetos e campanhas.
          </p>
          <div className="PS-divider" style={{ marginTop: "20px", marginBottom: "24px" }} />

          <div className="UE-stats">
            <div className="UE-stat">
              <span className="UE-stat-val">{TOTAL_BUS}</span>
              <span className="UE-stat-lbl">BUs ativas</span>
            </div>
            <div className="UE-stat">
              <span className="UE-stat-val ue-gr">{ACTIVE_PROJECTS}</span>
              <span className="UE-stat-lbl">Projetos ativos</span>
            </div>
            <div className="UE-stat">
              <span className="UE-stat-val ue-pu">{SETUP_PROJECTS}</span>
              <span className="UE-stat-lbl">Em setup</span>
            </div>
            <div className="UE-stat">
              <span className="UE-stat-val">{DONE_PROJECTS}</span>
              <span className="UE-stat-lbl">Finalizados</span>
            </div>
          </div>

          <button
            type="button"
            className="UE-ops-cta"
            onClick={() => setAppDomain("commercial_ops")}
          >
            <BarChart3 size={14} strokeWidth={2} />
            Acessar Commercial Ops
            <ArrowRight size={12} strokeWidth={2} style={{ marginLeft: "auto", opacity: 0.7 }} />
          </button>
        </div>
      </div>
    </div>
  );
}
