import { BarChart3, Bot, LogOut } from "lucide-react";
import { assetPath } from "@/lib/base-path";
import { useAppStore } from "@/store/app-store";
import { AmbientOrbs } from "./AmbientOrbs";
import { UserAvatar } from "./UserAvatar";

export function DomainSelectorScreen() {
  const setAppDomain = useAppStore((s) => s.setAppDomain);
  const currentUser = useAppStore((s) => s.currentUser);
  const setCurrentUser = useAppStore((s) => s.setCurrentUser);

  const firstName = currentUser?.name.split(" ")[0] ?? "visitante";

  return (
    <div className="DS-screen" id="domain-selector">
      <AmbientOrbs />

      {/* Usuário logado — canto superior direito */}
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

      <div className="DS-panel">
        <div className="PS-logo">
          <img className="PS-logo-img" src={assetPath("/advolve-logo.png")} alt="advolve" />
        </div>
        <h2 className="PS-heading">
          Olá, {firstName}.
          <br />
          Onde você quer <em>trabalhar</em>?
        </h2>
        <p className="PS-sub">Escolha o ambiente para esta sessão.</p>
        <div className="PS-divider" />

        <div className="DS-cards">
          <button
            type="button"
            className="DS-card"
            onClick={() => setAppDomain("playground")}
          >
            <div className="DS-card-icon DS-card-icon-pg">
              <Bot size={28} strokeWidth={1.75} />
            </div>
            <div className="DS-card-body">
              <div className="DS-card-title">Playground</div>
              <div className="DS-card-desc">
                Planejamento, agente e relatórios por cliente
              </div>
            </div>
          </button>

          <button
            type="button"
            className="DS-card"
            onClick={() => setAppDomain("commercial_ops")}
          >
            <div className="DS-card-icon DS-card-icon-ops">
              <BarChart3 size={28} strokeWidth={1.75} />
            </div>
            <div className="DS-card-body">
              <div className="DS-card-title">Commercial Ops</div>
              <div className="DS-card-desc">
                Status, campanhas e cadastros de todas as BUs
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
