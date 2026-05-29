import { useCallback, useState } from "react";
import type { ChatMessage } from "@/mocks/types";
import { MOCK } from "@/mocks/data";
import { sendChat as mockSendChat } from "@/mocks/handlers";

function pickMockKey(text: string): keyof typeof MOCK {
  const t = text.toLowerCase();
  if (/audi[eê]nc|segment/.test(t)) return "aud";
  if (/plano|m[ií]dia|budget|or[cç]amento/.test(t)) return "plan";
  if (/hip[oó]tes|novas audi/.test(t)) return "hyp";
  if (/insight|analise|an[aá]lise|dados/.test(t)) return "ins";
  return "default";
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;
      const userMsg: ChatMessage = { role: "user", content: trimmed };
      const thread = [...messages, userMsg];
      setMessages(thread);
      setLoading(true);

      const key = pickMockKey(trimmed);
      try {
        if (process.env.NEXT_PUBLIC_USE_REAL_CHAT === "true") {
          const r = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: thread }),
          });
          const d = (await r.json()) as { text?: string; error?: string };
          if (r.ok && d.text?.trim()) {
            setMessages((p) => [...p, { role: "assistant", content: d.text! }]);
          } else {
            const err = d.error ?? "HTTP erro";
            setMessages((p) => [
              ...p,
              { role: "assistant", content: `${MOCK[key]}\n\n---\n*${err}*` },
            ]);
          }
        } else {
          // TODO: Replace with real API call
          const res = await mockSendChat(thread);
          setMessages((p) => [
            ...p,
            { role: "assistant", content: res.text ?? res.error ?? MOCK.default },
          ]);
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Falha de rede";
        setMessages((p) => [
          ...p,
          { role: "assistant", content: `${MOCK[key]}\n\n---\n*${msg}*` },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, messages],
  );

  const clear = useCallback(() => setMessages([]), []);

  return { messages, loading, send, clear, setMessages };
}
