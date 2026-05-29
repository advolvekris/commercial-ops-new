import { Calendar } from "lucide-react";
import { useAppStore } from "@/store/app-store";

function fmtDate(val: string): string | null {
  if (!val) return null;
  const p = val.split("-");
  return `${p[2]}/${p[1]}`;
}

export function DateRangePicker() {
  const dateStart = useAppStore((s) => s.dateStart);
  const dateEnd = useAppStore((s) => s.dateEnd);
  const setDateRange = useAppStore((s) => s.setDateRange);

  const startLabel = fmtDate(dateStart);
  const endLabel = fmtDate(dateEnd);
  const hasVal = !!startLabel || !!endLabel;
  const showEnd = !!startLabel;

  return (
    <div className={`DR${hasVal ? " has-val" : ""}`} id="dr-wrap">
      <Calendar
        size={13}
        strokeWidth={2}
        style={{ width: 13, height: 13, flexShrink: 0, color: "var(--color-text-muted)" }}
      />
      <span className="DR-slot" id="dr-slot-start">
        <span id="dr-lbl-start">{startLabel ?? "Período"}</span>
        <input
          type="date"
          id="dr-start"
          value={dateStart}
          onChange={(e) => {
            const v = e.target.value;
            setDateRange(v, dateEnd);
          }}
        />
      </span>
      <span className="DR-arrow" id="dr-arrow" style={{ display: showEnd ? undefined : "none" }}>
        →
      </span>
      <span className="DR-slot" id="dr-slot-end" style={{ display: showEnd ? undefined : "none" }}>
        <span id="dr-lbl-end">{endLabel ?? "Fim"}</span>
        <input
          type="date"
          id="dr-end"
          value={dateEnd}
          onChange={(e) => {
            setDateRange(dateStart, e.target.value);
          }}
        />
      </span>
    </div>
  );
}
