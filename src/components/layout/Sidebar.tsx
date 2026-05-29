import { useMemo, type ReactNode } from "react";
import {
  Bot,
  CreditCard,
  LayoutGrid,
  Bell,
  Monitor,
  Pencil,
  LogOut,
} from "lucide-react";
import type { ViewId } from "@/types";
import { useAppStore } from "@/store/app-store";
import { UserAvatar } from "./UserAvatar";
import { managedProjectsSeed } from "@/mocks/data";
import { buildOpportunities } from "@/lib/opportunities";

const NAV_ITEMS: { view: ViewId; label: string; icon: ReactNode }[] = [
  { view: "dashboard", label: "Relatórios", icon: <LayoutGrid size={18} strokeWidth={2} /> },
  { view: "agent", label: "Project planner", icon: <Bot size={18} strokeWidth={2} /> },
  { view: "notifications", label: "Notificações", icon: <Bell size={18} strokeWidth={2} /> },
  { view: "brand", label: "Brand Guideline", icon: <Pencil size={18} strokeWidth={2} /> },
  { view: "history", label: "Gestão de projetos", icon: <Monitor size={18} strokeWidth={2} /> },
  { view: "accounts", label: "Contas de provedores", icon: <CreditCard size={18} strokeWidth={2} /> },
];

export function Sidebar() {
  const currentView = useAppStore((s) => s.currentView);
  const currentBu = useAppStore((s) => s.currentBu);
  const currentBrands = useAppStore((s) => s.currentBrands);
  const currentUser = useAppStore((s) => s.currentUser);
  const setCurrentView = useAppStore((s) => s.setCurrentView);
  const setGatePassed = useAppStore((s) => s.setGatePassed);
  const setAppDomain = useAppStore((s) => s.setAppDomain);

  const activeCampaign = useMemo(
    () => managedProjectsSeed.find((p) => p.bu === currentBu && p.status === "pa-ativo") ?? null,
    [currentBu],
  );

  const opportunityCount = useMemo(
    () => buildOpportunities(currentBu, currentBrands).length,
    [currentBu, currentBrands],
  );

  return (
    <aside className="S">
      <div className="SL">
        <img className="SL-logo" src="/advolve-logo.png" alt="advolve" />
        <p className="SL-pg">Playground v0</p>
      </div>

      <div className="SBU">
        <div className="SBU-active">
          <div className="SBU-active-inner">
            <div className="SBU-dot" />
            <div>
              <div className="SBU-active-name">{currentBu}</div>
              <button
                type="button"
                className="SBU-change-btn"
                id="btn-change-bu"
                onClick={() => setGatePassed(false)}
              >
                trocar cliente
              </button>
            </div>
          </div>
        </div>
      </div>

      <nav className="SN">
        <div className="SS">Principal</div>
        {NAV_ITEMS.slice(0, 3).map((item) => (
          <button
            key={item.view}
            type="button"
            className={`NI${currentView === item.view ? " on" : ""}`}
            data-view={item.view}
            onClick={() => setCurrentView(item.view)}
          >
            {item.icon}
            {item.label}
            {item.view === "notifications" && opportunityCount > 0 && (
              <span className="NBadge">{opportunityCount}</span>
            )}
          </button>
        ))}
        <div className="SS">Configurações</div>
        {NAV_ITEMS.slice(3).map((item) => (
          <button
            key={item.view}
            type="button"
            className={`NI${currentView === item.view ? " on" : ""}`}
            data-view={item.view}
            onClick={() => setCurrentView(item.view)}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="SF">
        <div className="SFC">
          <div className="TG">Campanha Ativa</div>
          {activeCampaign ? (
            <p>
              {activeCampaign.name}
              <br />
              <span style={{ color: "var(--color-text-muted)" }}>
                {activeCampaign.start} – {activeCampaign.end} · {activeCampaign.budget}
              </span>
            </p>
          ) : (
            <p style={{ color: "var(--color-text-muted)" }}>Nenhuma campanha ativa</p>
          )}
        </div>
        <button type="button" className="domain-btn SF-domain-btn" onClick={() => setAppDomain(null)}>
          trocar domínio
        </button>
        {currentUser && (
          <div className="S-user">
            <UserAvatar user={currentUser} size={24} />
            <div className="S-user-text">
              <span className="S-user-name">{currentUser.name}</span>
              <span className="S-user-role">{currentUser.role}</span>
            </div>
            <button
              type="button"
              className="S-user-exit"
              title="Sair"
              onClick={() => setAppDomain(null)}
            >
              <LogOut size={12} strokeWidth={2} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
