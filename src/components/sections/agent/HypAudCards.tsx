import { useCallback, useRef, useState, type ReactNode } from "react";
import { AUD_DATA, HYP_CARDS } from "@/mocks/data";
import type { ChatMessage, HypothesisCard, HypothesisPill } from "@/mocks/types";
import { AgentThinkingRow } from "./AgentThinkingRow";

export type AgentDisplayMessage = ChatMessage & {
  id: string;
  node?: ReactNode;
};

const TH_STEPS = [
  "Acessando base de 100MM de usuários iFood...",
  "Segmentando por comportamento de compra de bebidas...",
  "Calculando propensão de conversão por segmento...",
  "Estimando ROAS e confiança estatística...",
  "Gerando hipóteses ordenadas por potencial...",
];

const AUD_STEPS = [
  "Conectando à base de dados 1P iFood...",
  "Filtrando segmentos ativos do projeto...",
  "Calculando estimativas de tamanho e alcance...",
  "Cruzando com histórico de performance...",
  "Compilando perfis de audiência...",
];

function Pill({ pill }: { pill: HypothesisPill }) {
  return <span className={`HYP-pill${pill.c ? ` ${pill.c}` : ""}`}>{pill.t}</span>;
}

export function AudienceCards() {
  return (
    <div className="HYP-cards">
      {AUD_DATA.map((a, i) => (
        <div key={a.name} className="HYP-card" style={{ animationDelay: `${i * 0.12}s` }}>
          <div className="HYP-title">{a.name}</div>
          <div className="HYP-sec-lbl">Thesis</div>
          <div className="HYP-sec-txt">{a.thesis}</div>
          <div className="HYP-sec-lbl">Rationale</div>
          <div className="HYP-sec-txt">{a.rationale}</div>
          <div className="HYP-footer">
            <div className="HYP-meta-lbl">Estimativa de alcance</div>
            <div className="HYP-meta">
              <span className="HYP-pill">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ display: "inline", verticalAlign: "middle", marginRight: 3 }}
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                {a.estimativa}
              </span>
              <span className="HYP-pill gr">{a.potencial}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface HypCardsInteractiveProps {
  onDemandCompiled?: (count: number) => void;
}

export function HypothesisCardsInteractive({ onDemandCompiled }: HypCardsInteractiveProps) {
  const [votes, setVotes] = useState<Record<string, "like" | "dislike">>({});
  const [compiled, setCompiled] = useState(false);

  const accepted = Object.entries(votes)
    .filter(([, v]) => v === "like")
    .map(([id]) => {
      const idx = parseInt(id.split("-")[1] ?? "0", 10);
      return HYP_CARDS[idx];
    })
    .filter(Boolean) as HypothesisCard[];

  const handleVote = (cardId: string, vote: "like" | "dislike") => {
    setVotes((p) => {
      const next = { ...p, [cardId]: vote };
      if (vote === "dislike") delete next[cardId];
      return next;
    });
  };

  const handleCompile = () => {
    if (!accepted.length) return;
    setCompiled(true);
    onDemandCompiled?.(accepted.length);
  };

  if (compiled) {
    const now = new Date();
    const dateStr = now.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    return <DemandCard accepted={accepted} brand="Marca" dateStr={dateStr} onSend={() => {}} />;
  }

  return (
    <>
      <div className="HYP-cards">
        {HYP_CARDS.map((h, i) => {
          const id = `hyp-${i}`;
          const vote = votes[id];
          return (
            <div
              key={id}
              id={id}
              className={`HYP-card${h.sug ? " sug" : ""}${vote === "like" ? " card-voted-accept" : ""}${vote === "dislike" ? " card-voted-reject" : ""}`}
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              <div className="HYP-head">
                <div className="HYP-title">{h.title}</div>
                {h.sug && (
                  <div className="HYP-badge">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Sugerido
                  </div>
                )}
              </div>
              <div className="HYP-sec-lbl">Thesis</div>
              <div className="HYP-sec-txt">{h.thesis}</div>
              <div className="HYP-sec-lbl">Rationale</div>
              <div className="HYP-sec-txt">{h.rationale}</div>
              <div className="HYP-footer">
                <div>
                  <div className="HYP-meta-lbl">Métricas previstas</div>
                  <div className="HYP-meta">
                    {h.pills.map((p, pi) => (
                      <Pill key={pi} pill={p} />
                    ))}
                  </div>
                </div>
                <div className="HYP-actions">
                  <span className="HYP-actions-lbl">Adicionar ao briefing?</span>
                  <button
                    type="button"
                    className={`HYP-vbtn reject${vote === "dislike" ? " disliked" : ""}`}
                    onClick={() => handleVote(id, "dislike")}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                    Recusar
                  </button>
                  <button
                    type="button"
                    className={`HYP-vbtn accept${vote === "like" ? " liked" : ""}`}
                    onClick={() => handleVote(id, "like")}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Aceitar
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {accepted.length > 0 && (
        <button type="button" className="HYP-compile visible" onClick={handleCompile}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
            <path d="M14 2v4a2 2 0 0 0 2 2h4" />
            <path d="M10 9H8" />
            <path d="M16 13H8" />
            <path d="M16 17H8" />
          </svg>
          <span>
            Criar demanda com {accepted.length} hipótese{accepted.length > 1 ? "s" : ""} aceita
            {accepted.length > 1 ? "s" : ""}
          </span>
        </button>
      )}
    </>
  );
}

function DemandCard({
  accepted,
  brand,
  dateStr,
  onSend,
}: {
  accepted: HypothesisCard[];
  brand: string;
  dateStr: string;
  onSend: () => void;
}) {
  const [sent, setSent] = useState(false);

  const items = accepted.map((h, i) => {
    const roas = h.pills.find((p) => p.t.includes("ROAS"));
    const conf = h.pills.find((p) => p.t.includes("Confiança"));
    const canal = h.pills.find((p) => p.c === "pu");
    const size = h.pills.find((p) => p.t.includes("MM") || p.t.includes("k"));
    return (
      <div key={i} className="DEM-item">
        <div className="DEM-item-num">{i + 1}</div>
        <div className="DEM-item-body">
          <div className="DEM-item-title">{h.title}</div>
          <div className="DEM-item-pills">
            {roas && <Pill pill={roas} />}
            {conf && <Pill pill={conf} />}
            {size && <Pill pill={size} />}
            {canal && <Pill pill={canal} />}
          </div>
        </div>
      </div>
    );
  });

  return (
    <div className="DEM-card">
      <div className="DEM-header">
        <div>
          <div className="DEM-title">Demanda de Audiências — {brand}</div>
          <div className="DEM-meta">
            Gerado em {dateStr} · {accepted.length} hipótese{accepted.length > 1 ? "s" : ""} aceita
            {accepted.length > 1 ? "s" : ""}
          </div>
        </div>
        <div className="DEM-status">
          <span className="DEM-status-dot" />
          Aguardando revisão
        </div>
      </div>
      {items}
      <div className="DEM-actions">
        <button
          type="button"
          className="DEM-btn primary"
          disabled={sent}
          onClick={() => {
            setSent(true);
            onSend();
          }}
          style={
            sent
              ? {
                  background: "rgba(163,230,53,0.15)",
                  color: "var(--color-highlight)",
                  border: "1px solid rgba(163,230,53,0.3)",
                }
              : undefined
          }
        >
          {sent ? "✓ Audiências geradas" : "Gerar audiências"}
        </button>
        <button
          type="button"
          className="DEM-btn secondary"
          onClick={() => {
            const blob = new Blob([`Briefing Advolve — ${brand} — ${dateStr}`], {
              type: "application/pdf",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "briefing-advolve.pdf";
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
              URL.revokeObjectURL(url);
              document.body.removeChild(a);
            }, 200);
          }}
        >
          Exportar briefing
        </button>
      </div>
    </div>
  );
}

export function ThinkingMessage({
  title,
  steps,
  onLayoutChange,
}: {
  title: string;
  steps: string[];
  onLayoutChange?: () => void;
}) {
  return <AgentThinkingRow title={title} steps={steps} onLayoutChange={onLayoutChange} />;
}

interface UseHypAudFlowsOptions {
  busy: boolean;
  setBusy: (v: boolean) => void;
  appendMessage: (msg: AgentDisplayMessage) => void;
  removeThinking: () => void;
  setThinking: (node: ReactNode | null) => void;
  scrollChat: () => void;
  brand?: string;
}

export function useHypAudFlows({
  busy,
  setBusy,
  appendMessage,
  removeThinking,
  setThinking,
  scrollChat,
}: UseHypAudFlowsOptions) {
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const sendAud = useCallback(() => {
    if (busy) return;
    setBusy(true);
    const userText = "Consultar audiências do projeto.";
    appendMessage({ id: crypto.randomUUID(), role: "user", content: userText });
    scrollChat();

    setThinking(
      <ThinkingMessage
        title="Consultando audiências..."
        steps={AUD_STEPS}
        onLayoutChange={scrollChat}
      />,
    );
    scrollChat();

    AUD_STEPS.forEach((_, i) => {
      timersRef.current.push(setTimeout(() => scrollChat(), i * 900));
    });

    timersRef.current.push(
      setTimeout(() => {
        removeThinking();
        appendMessage({
          id: crypto.randomUUID(),
          role: "assistant",
          content: "[Audiências do projeto consultadas]",
          node: <AudienceCards />,
        });
        setBusy(false);
        scrollChat();
      }, 5200),
    );
  }, [busy, appendMessage, removeThinking, scrollChat, setBusy, setThinking]);

  const sendHyp = useCallback(() => {
    if (busy) return;
    setBusy(true);
    const userText = "Gere novas hipóteses de audiência com previsão de desempenho.";
    appendMessage({ id: crypto.randomUUID(), role: "user", content: userText });
    scrollChat();

    setThinking(
      <ThinkingMessage title="Pensando..." steps={TH_STEPS} onLayoutChange={scrollChat} />,
    );
    scrollChat();

    TH_STEPS.forEach((_, i) => {
      timersRef.current.push(setTimeout(() => scrollChat(), i * 900));
    });

    timersRef.current.push(
      setTimeout(() => {
        removeThinking();
        appendMessage({
          id: crypto.randomUUID(),
          role: "assistant",
          content: "[Hipóteses de audiência geradas]",
          node: <HypothesisCardsInteractive />,
        });
        setBusy(false);
        scrollChat();
      }, 5200),
    );
  }, [busy, appendMessage, removeThinking, scrollChat, setBusy, setThinking]);

  return { sendHyp, sendAud, clearTimers };
}

export { TH_STEPS, AUD_STEPS };
