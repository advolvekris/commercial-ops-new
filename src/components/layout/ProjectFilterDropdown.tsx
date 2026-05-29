import { useEffect, useRef, useState } from "react";
import { ChevronDown, Folder } from "lucide-react";
import { dashboardProjects } from "@/mocks/data";
import { useAppStore } from "@/store/app-store";

export function ProjectFilterDropdown() {
  const projectIndex = useAppStore((s) => s.projectIndex);
  const setProjectIndex = useAppStore((s) => s.setProjectIndex);
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

  const project = dashboardProjects[projectIndex];

  return (
    <div className={`PF-wrap${open ? " open" : ""}`} id="pf-wrap" ref={wrapRef}>
      <button
        type="button"
        className="PF-sel"
        id="pf-sel"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        <Folder size={13} strokeWidth={2} style={{ color: "var(--color-text-muted)", flexShrink: 0 }} />
        <span id="pf-label">{project?.label ?? "Bebidas Premium · Coca-Cola"}</span>
        <ChevronDown className="PF-chevron" size={16} strokeWidth={2.5} />
      </button>
      <div className="PF-dd" id="pf-dd">
        <div className="PF-dd-hd">Projetos</div>
        {dashboardProjects.map((p, idx) => (
          <div
            key={p.label}
            className={`PF-opt${projectIndex === idx ? " active" : ""}`}
            data-pf={idx}
            onClick={() => {
              setProjectIndex(idx);
              setOpen(false);
            }}
          >
            <span className={`PF-sdot ${p.status}`} />
            {p.label}
          </div>
        ))}
      </div>
    </div>
  );
}
