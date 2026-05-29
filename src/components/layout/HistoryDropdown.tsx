import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { HISTORY_TAB_LABELS, type HistoryTab } from "@/types";
import { useAppStore } from "@/store/app-store";

const TABS: HistoryTab[] = ["lista", "andamento", "kv"];

export function HistoryDropdown() {
  const historyTab = useAppStore((s) => s.historyTab);
  const setHistoryTab = useAppStore((s) => s.setHistoryTab);
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

  const current = TABS.find((t) => t === historyTab) ?? TABS[0];
  const currentLabel = HISTORY_TAB_LABELS[current];

  return (
    <div className={`PP-wrap${open ? " open" : ""}`} id="hist-mh-wrap" ref={wrapRef}>
      <button
        type="button"
        className="PP-sel"
        id="hist-mh-sel"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        <span id="hist-mh-label">{currentLabel}</span>
        <ChevronDown className="PP-chevron" size={16} strokeWidth={2.5} />
      </button>
      <div className="PP-dd" role="listbox" id="hist-mh-dd">
        <div className="PP-dd-hdr">Visualização</div>
        {TABS.map((tab) => (
          <div
            key={tab}
            className={`PP-opt${historyTab === tab ? " active" : ""}`}
            role="option"
            data-hist={tab}
            onClick={() => {
              setHistoryTab(tab);
              setOpen(false);
            }}
          >
            <span className="PP-dot" />
            {HISTORY_TAB_LABELS[tab]}
          </div>
        ))}
      </div>
    </div>
  );
}
