import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useChat } from "@/hooks/useChat";
import { useScrollToEnd } from "@/hooks/useScrollToEnd";
import { renderMarkdown } from "@/lib/markdown";
import { PROMPTS } from "@/mocks/data";
import { useAppStore } from "@/store/app-store";
import {
  useHypAudFlows,
  type AgentDisplayMessage,
} from "./HypAudCards";

const quickActions = [
  {
    key: "aud" as const,
    label: "Consultar audiências",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    key: "plan" as const,
    label: "Criar plano de mídia",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
        <path d="M22 12A10 10 0 0 0 12 2v10z" />
      </svg>
    ),
  },
  {
    key: "hyp" as const,
    label: "Gerar novas audiências",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
  },
  {
    key: "ins" as const,
    label: "Insights da campanha",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
        <path d="M9 18h6" />
        <path d="M10 22h4" />
      </svg>
    ),
  },
];

function AgentLabel({ role }: { role: "user" | "assistant" }) {
  if (role === "user") {
    return (
      <>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="m9 9 5 12 1.8-5.2L21 14Z" />
          <path d="M7.2 2.2 8 5.1" />
          <path d="M5.1 8 2 8.9" />
          <path d="M14 3.1 12 5.5" />
          <path d="M3.9 14 5.5 12" />
        </svg>{" "}
        Você
      </>
    );
  }
  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      </svg>{" "}
      Agente Advolve
    </>
  );
}

export function AgentView() {
  const reportType = useAppStore((s) => s.reportType);
  const showAgentBtns = reportType === "completo";

  const { messages: chatMessages, loading, send, clear } = useChat();
  const [extraMessages, setExtraMessages] = useState<AgentDisplayMessage[]>([]);
  const [flowBusy, setFlowBusy] = useState(false);
  const [thinking, setThinking] = useState<ReactNode | null>(null);
  const [input, setInput] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const busy = loading || flowBusy;

  const scrollChat = useCallback(() => {
    const container = scrollRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, []);

  useScrollToEnd({
    containerRef: scrollRef,
    endRef: chatEndRef,
    deps: [chatMessages, extraMessages, loading, thinking],
  });

  const appendMessage = useCallback((msg: AgentDisplayMessage) => {
    setExtraMessages((p) => [...p, msg]);
  }, []);

  const removeThinking = useCallback(() => setThinking(null), []);

  const { sendHyp, sendAud, clearTimers } = useHypAudFlows({
    busy,
    setBusy: setFlowBusy,
    appendMessage,
    removeThinking,
    setThinking,
    scrollChat,
  });

  useEffect(() => () => clearTimers(), [clearTimers]);

  const handleClear = () => {
    clear();
    chatWithIds.current = [];
    setExtraMessages([]);
    setThinking(null);
    clearTimers();
    setFlowBusy(false);
  };

  const handleSend = (text: string) => {
    void send(text);
  };

  const chatWithIds = useRef<AgentDisplayMessage[]>([]);
  if (chatWithIds.current.length !== chatMessages.length) {
    chatWithIds.current = chatMessages.map((m, i) => ({
      ...m,
      id: chatWithIds.current[i]?.id ?? crypto.randomUUID(),
    }));
  }
  const allMessages: AgentDisplayMessage[] = [...chatWithIds.current, ...extraMessages];

  const hasMessages = allMessages.length > 0 || thinking;

  return (
    <div id="pp-chat" style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <div className="AA">
        {showAgentBtns && (
          <>
            <button type="button" className="AB" id="agent-btn-hyp" onClick={sendHyp} disabled={busy}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" />
              </svg>
              Criar novas hipóteses de audiência
            </button>
            <button type="button" className="AB" id="agent-btn-aud" onClick={sendAud} disabled={busy}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Consultar audiências do projeto
            </button>
          </>
        )}

        {quickActions.map((q) => (
          <button
            key={q.key}
            type="button"
            className="AB"
            onClick={() => handleSend(PROMPTS[q.key])}
            disabled={busy}
          >
            {q.icon} {q.label}
          </button>
        ))}

        {hasMessages && (
          <button
            type="button"
            className="AB"
            id="btn-clear"
            style={{ marginLeft: "auto", color: "var(--color-text-muted)" }}
            onClick={handleClear}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M8 16H3v5" />
            </svg>
            Limpar
          </button>
        )}
      </div>

      <div className="AC" id="chat-scroll" ref={scrollRef}>
        <div id="chat-messages">
          {allMessages.length === 0 && !loading && !thinking && (
            <div className="AE">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
              </svg>
              <h3>Agente de Mídia Advolve</h3>
              <p>
                Consulte audiências, crie planos de mídia ou gere hipóteses com previsão de
                desempenho.
              </p>
            </div>
          )}

          {allMessages.map((m) => {
            const isWide = m.role === "assistant" && !!m.node;
            return (
              <div
                key={m.id}
                className={`msg ${m.role === "user" ? "u" : "a"}${isWide ? " wide" : ""}`}
              >
                <div className="ml">
                  <AgentLabel role={m.role} />
                </div>
                <div className="mb">
                  <div className="mc">
                    {m.node ??
                      (m.role === "assistant" ? renderMarkdown(m.content) : <p>{m.content}</p>)}
                  </div>
                </div>
              </div>
            );
          })}

          {thinking}

          {loading && (
            <div className="msg a" id="chat-loading">
              <div className="ml">
                <AgentLabel role="assistant" />
              </div>
              <div className="mb">
                <div className="ti">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          )}
        </div>
        <div id="chat-end" ref={chatEndRef} />
      </div>

      <div className="AIB">
        <div className="AIW">
          <input
            id="chat-input"
            type="text"
            placeholder="Descreva o briefing, objetivo ou peça hipóteses de audiência..."
            autoComplete="off"
            value={input}
            disabled={busy}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSend(input);
                setInput("");
              }
            }}
          />
          <button
            type="button"
            className="SB"
            id="chat-send"
            aria-label="Enviar"
            disabled={!input.trim() || busy}
            onClick={() => {
              handleSend(input);
              setInput("");
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m22 2-7 20-4-9-9-4Z" />
              <path d="M22 2 11 13" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
