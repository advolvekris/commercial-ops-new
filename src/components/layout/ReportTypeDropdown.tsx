import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { ReportType } from "@/types";
import { REPORT_TYPE_LABELS } from "@/types";
import { useAppStore } from "@/store/app-store";

const OPTIONS: ReportType[] = ["completo", "parcial", "overview"];

export function ReportTypeDropdown() {
  const reportType = useAppStore((s) => s.reportType);
  const setReportType = useAppStore((s) => s.setReportType);
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

  return (
    <div className={`RT-wrap${open ? " open" : ""}`} id="rt-wrap" ref={wrapRef}>
      <button
        type="button"
        className="RT-sel"
        id="rt-sel"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        <span id="rt-label">{REPORT_TYPE_LABELS[reportType]}</span>
        <ChevronDown className="RT-chevron" size={16} strokeWidth={2.5} />
      </button>
      <div className="RT-dd" role="listbox" id="rt-dd">
        <div className="RT-dd-header">Selecione seu relatório</div>
        {OPTIONS.map((type) => (
          <div
            key={type}
            className={`RT-opt${reportType === type ? " active" : ""}`}
            role="option"
            data-rt={type}
            onClick={() => {
              setReportType(type);
              setOpen(false);
            }}
          >
            <span className="RT-dot" />
            {REPORT_TYPE_LABELS[type]}
          </div>
        ))}
      </div>
    </div>
  );
}
