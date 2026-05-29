import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { BU_OPTIONS } from "@/mocks/data";
import { assetPath } from "@/lib/base-path";
import { useAppStore } from "@/store/app-store";
import { AmbientOrbs } from "./AmbientOrbs";
import { NewClientModal } from "./NewClientModal";

export function ProjectScreen() {
  const setGatePassed = useAppStore((s) => s.setGatePassed);
  const setCurrentBu = useAppStore((s) => s.setCurrentBu);
  const setAppDomain = useAppStore((s) => s.setAppDomain);
  const currentUser = useAppStore((s) => s.currentUser);
  const [search, setSearch] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [options, setOptions] = useState(BU_OPTIONS);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.bu.toLowerCase().includes(q));
  }, [search, options]);

  const enterApp = useCallback(
    (bu: string, brands: string[]) => {
      setCurrentBu(bu, brands);
      setGatePassed(true);
    },
    [setCurrentBu, setGatePassed],
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
      if (item) enterApp(item.bu, item.brands);
    }
  }

  function handleCreated(bu: string, brands: string[]) {
    setOptions((prev) => {
      if (prev.some((o) => o.bu === bu)) return prev;
      return [
        ...prev,
        {
          bu,
          brands,
          count: `${brands.length} marca${brands.length !== 1 ? "s" : ""}`,
        },
      ];
    });
    setSearch("");
    setActiveIdx(0);
  }

  return (
    <div className="PS" id="project-screen">
      <AmbientOrbs />

      <div className="PS-panel">
        <div className="PS-logo">
          <img className="PS-logo-img" src={assetPath("/advolve-logo.png")} alt="advolve" />
          <p className="PS-logo-pg">Playground v0</p>
        </div>
        <h2 className="PS-heading">
          Olá, {currentUser?.name.split(" ")[0] ?? "visitante"}.
          <br />
          Selecione um <em>projeto</em>.
        </h2>
        <p className="PS-sub">Digite para buscar o cliente.</p>
        <div className="PS-divider" />

        <div className="PS-field">
          <div className="PS-iw">
            <Search size={16} strokeWidth={2} />
            <input
              id="ps-search"
              type="text"
              placeholder="Buscar cliente — ex: iFood, Pepsico, Publicis…"
              autoComplete="off"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className="PS-dd" id="ps-dropdown">
            {filtered.length === 0 ? (
              <div className="PS-no-result">Nenhum cliente encontrado</div>
            ) : (
              filtered.map((item, idx) => (
                <div
                  key={item.bu}
                  className={`PS-item${idx === activeIdx ? " ps-active" : ""}`}
                  data-bu={item.bu}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    enterApp(item.bu, item.brands);
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
        <button type="button" className="PS-back-domain" onClick={() => setAppDomain(null)}>
          ← Voltar ao seletor de domínio
        </button>
        <button type="button" className="PS-add-btn" id="btn-new-client" onClick={() => setModalOpen(true)}>
          <Plus size={14} strokeWidth={2.5} />
          Novo cliente
        </button>
      </div>

      <NewClientModal open={modalOpen} onOpenChange={setModalOpen} onCreated={handleCreated} />
    </div>
  );
}
