import type { ReactNode } from "react";
import { BarChart3, Briefcase, LayoutGrid, LogOut, UserPlus, Users } from "lucide-react";
import type { CommercialOpsViewId } from "@/types";
import { assetPath } from "@/lib/base-path";
import { useAppStore } from "@/store/app-store";
import { UserAvatar } from "@/components/layout/UserAvatar";

const MAIN_NAV: { view: CommercialOpsViewId; label: string; icon: ReactNode }[] = [
  { view: "overview", label: "Painel geral", icon: <LayoutGrid size={18} strokeWidth={2} /> },
  { view: "projects", label: "Projetos", icon: <Briefcase size={18} strokeWidth={2} /> },
  { view: "campaigns", label: "Campanhas ativas", icon: <BarChart3 size={18} strokeWidth={2} /> },
];

const REGISTRY_NAV: { view: CommercialOpsViewId; label: string; icon: ReactNode }[] = [
  { view: "registry", label: "Clientes", icon: <Users size={18} strokeWidth={2} /> },
  { view: "new-client", label: "Novo cliente", icon: <UserPlus size={18} strokeWidth={2} /> },
];

export function CommercialOpsSidebar() {
  const commercialOpsView = useAppStore((s) => s.commercialOpsView);
  const currentUser = useAppStore((s) => s.currentUser);
  const setCommercialOpsView = useAppStore((s) => s.setCommercialOpsView);
  const setAppDomain = useAppStore((s) => s.setAppDomain);

  return (
    <aside className="S OPS-sidebar">
      <div className="SL">
        <img className="SL-logo" src={assetPath("/advolve-logo.png")} alt="advolve" />
        <p className="SL-pg OPS-brand">Commercial Ops</p>
      </div>

      <div className="SBU OPS-sbu-hint">
        <div className="OPS-sbu-label">Portfolio · todas as BUs</div>
      </div>

      <nav className="SN">
        <div className="SS">Principal</div>
        {MAIN_NAV.map((item) => (
          <button
            key={item.view}
            type="button"
            className={`NI${commercialOpsView === item.view ? " on" : ""}`}
            onClick={() => setCommercialOpsView(item.view)}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
        <div className="SS">Cadastros</div>
        {REGISTRY_NAV.map((item) => (
          <button
            key={item.view}
            type="button"
            className={`NI${commercialOpsView === item.view ? " on" : ""}`}
            onClick={() => setCommercialOpsView(item.view)}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="SF OPS-sf">
        <button type="button" className="OPS-domain-btn" onClick={() => setAppDomain(null)}>
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
