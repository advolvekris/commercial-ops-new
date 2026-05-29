import { useAppStore } from "@/store/app-store";
import type { PlannerMode } from "@/types";

const cards: {
  mode: Exclude<PlannerMode, "home" | "chat">;
  className: string;
  title: React.ReactElement;
  sub: string;
}[] = [
  {
    mode: "novo",
    className: "pp-novo",
    title: (
      <>
        Iniciar <em>novo projeto</em>
      </>
    ),
    sub: "Audiências, hipóteses e plano de mídia com agentes de IA",
  },
  {
    mode: "drafts",
    className: "pp-drafts",
    title: (
      <>
        Retomar <em>drafts</em>
      </>
    ),
    sub: "Continue projetos em andamento de finalização",
  },
];

export function PlannerHome() {
  const setPlannerMode = useAppStore((s) => s.setPlannerMode);

  return (
    <div id="pp-home" className="PP-home">
      <div className="PP-home-inner">
        <div className="PP-home-head">
          <div className="PP-home-eyebrow">Project planner</div>
          <h1 className="PP-home-title">
            O que você quer fazer <em>hoje?</em>
          </h1>
        </div>
        <div className="PP-home-cards">
          {cards.map((c, i) => (
            <div
              key={c.mode}
              className={`PP-hcard ${c.className}`}
              data-pphome={c.mode}
              style={{ animationDelay: `${i * 0.08}s` }}
              role="button"
              tabIndex={0}
              onClick={() => setPlannerMode(c.mode)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setPlannerMode(c.mode);
              }}
            >
              <div className="PP-hcard-visual" aria-hidden="true">
                {c.mode === "novo" ? (
                  <svg
                    className="PP-hcard-svg PP-hcard-svg-novo"
                    viewBox="0 0 48 48"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle className="PP-novo-ripple PP-novo-ripple-1" cx="24" cy="24" r="6" />
                    <circle className="PP-novo-ripple PP-novo-ripple-2" cx="24" cy="24" r="6" />
                    <circle className="PP-novo-ripple PP-novo-ripple-3" cx="24" cy="24" r="6" />
                    <g className="PP-novo-rays">
                      <line x1="24" y1="9" x2="24" y2="13" />
                      <line x1="24" y1="35" x2="24" y2="39" />
                      <line x1="9" y1="24" x2="13" y2="24" />
                      <line x1="35" y1="24" x2="39" y2="24" />
                      <line x1="13.4" y1="13.4" x2="16.2" y2="16.2" />
                      <line x1="31.8" y1="31.8" x2="34.6" y2="34.6" />
                      <line x1="13.4" y1="34.6" x2="16.2" y2="31.8" />
                      <line x1="31.8" y1="16.2" x2="34.6" y2="13.4" />
                    </g>
                    <circle className="PP-novo-core" cx="24" cy="24" r="4.5" />
                    <circle className="PP-novo-glint" cx="22.4" cy="22.4" r="1.2" />
                  </svg>
                ) : (
                  <svg
                    className="PP-hcard-svg PP-hcard-svg-drafts"
                    viewBox="0 0 48 48"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect className="PP-drafts-card PP-drafts-card-3" x="14" y="13" width="20" height="22" rx="3" />
                    <rect className="PP-drafts-card PP-drafts-card-2" x="14" y="13" width="20" height="22" rx="3" />
                    <rect className="PP-drafts-card PP-drafts-card-1" x="14" y="13" width="20" height="22" rx="3" />
                    <line className="PP-drafts-line PP-drafts-line-1" x1="18" y1="20" x2="29" y2="20" />
                    <line className="PP-drafts-line PP-drafts-line-2" x1="18" y1="24" x2="30" y2="24" />
                    <line className="PP-drafts-line PP-drafts-line-3" x1="18" y1="28" x2="26" y2="28" />
                    <path className="PP-drafts-cursor" d="M30 30 L30 36 L31.8 34.3 L33 36.8 L34 36.3 L32.7 33.8 L35 33.6 Z" />
                  </svg>
                )}
              </div>
              <div className="PP-hcard-body">
                <div className="PP-hcard-title">{c.title}</div>
                <div className="PP-hcard-sub">{c.sub}</div>
              </div>
              <svg
                className="PP-hcard-arrow"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
