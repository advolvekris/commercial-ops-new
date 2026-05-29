import { forwardRef } from "react";
import { ThinkingBlock } from "./ThinkingBlock";

interface AgentThinkingRowProps {
  title: string;
  steps: string[];
  onLayoutChange?: () => void;
}

export const AgentThinkingRow = forwardRef<HTMLDivElement, AgentThinkingRowProps>(
  function AgentThinkingRow({ title, steps, onLayoutChange }, ref) {
    return (
      <div ref={ref} className="msg a wide">
        <div className="ml">
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
        </div>
        <div className="mb">
          <div className="mc">
            <ThinkingBlock title={title} steps={steps} onLayoutChange={onLayoutChange} />
          </div>
        </div>
      </div>
    );
  },
);
