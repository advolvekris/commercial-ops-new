import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { BRANDS } from "@/mocks/data";
import { useAppStore } from "@/store/app-store";

export function BrandDropdown() {
  const brandSubView = useAppStore((s) => s.brandSubView);
  const selectedBrandId = useAppStore((s) => s.selectedBrandId);
  const setBrandSubView = useAppStore((s) => s.setBrandSubView);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const visible = brandSubView === "detail";

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  if (!visible) return null;

  const selected = BRANDS.find((b) => b.id === selectedBrandId) ?? BRANDS[0];

  return (
    <div
      className={`PP-wrap${open ? " open" : ""}`}
      id="bnd-mh-wrap"
      ref={wrapRef}
    >
      <button
        type="button"
        className="PP-sel"
        id="bnd-mh-sel"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        <span id="bnd-mh-label">{selected.name}</span>
        <ChevronDown className="PP-chevron" size={16} strokeWidth={2.5} />
      </button>
      <div className="PP-dd" role="listbox" id="bnd-mh-dd">
        <div className="PP-dd-hdr">Selecionar marca</div>
        {BRANDS.map((b) => (
          <div
            key={b.id}
            className="PP-opt"
            role="option"
            data-brand={b.id}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
            onClick={() => {
              setBrandSubView("detail", b.id);
              setOpen(false);
            }}
          >
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: "50%",
                background: b.color,
                flexShrink: 0,
                display: "inline-block",
              }}
            />
            {b.name}
          </div>
        ))}
      </div>
    </div>
  );
}
