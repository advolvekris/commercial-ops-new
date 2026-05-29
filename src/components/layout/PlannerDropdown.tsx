import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { PlannerMode } from "@/types";
import { useAppStore } from "@/store/app-store";

const MODES: Exclude<PlannerMode, "home" | "chat">[] = ["novo", "drafts"];

const MODE_LABELS: Record<Exclude<PlannerMode, "home" | "chat">, string> = {
  novo: "Novo projeto",
  drafts: "Drafts",
};

export function PlannerDropdown() {
  const plannerMode = useAppStore((s) => s.plannerMode);
  const setPlannerMode = useAppStore((s) => s.setPlannerMode);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const label =
    plannerMode === "home" || plannerMode === "chat"
      ? "Project planner"
      : MODE_LABELS[plannerMode as keyof typeof MODE_LABELS];

  return (
    <div className={`PP-wrap${open ? " open" : ""}`} id="pp-wrap" ref={wrapRef}>
      <button
        type="button"
        className="PP-sel"
        id="pp-sel"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        <span id="pp-label">{label}</span>
        <ChevronDown className="PP-chevron" size={16} strokeWidth={2.5} />
      </button>
      <div className="PP-dd" role="listbox" id="pp-dd">
        <div className="PP-dd-hdr">Selecionar modo</div>
        {MODES.map((mode) => (
          <div
            key={mode}
            className={`PP-opt${plannerMode === mode ? " active" : ""}`}
            role="option"
            data-pp={mode}
            onClick={() => {
              setPlannerMode(mode);
              setOpen(false);
            }}
          >
            <span className="PP-dot" />
            {MODE_LABELS[mode]}
          </div>
        ))}
      </div>
    </div>
  );
}
