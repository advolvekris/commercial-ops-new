import { useEffect, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";

interface OpsMultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  singleSelect?: boolean;
}

export function OpsMultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Buscar…",
  singleSelect = false,
}: OpsMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query.trim()
    ? options.filter((o) => o.toLowerCase().includes(query.toLowerCase()))
    : options;

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  function toggle(val: string) {
    if (singleSelect) {
      onChange(selected.includes(val) ? [] : [val]);
      setOpen(false);
      setQuery("");
      return;
    }
    if (selected.includes(val)) {
      onChange(selected.filter((s) => s !== val));
    } else {
      onChange([...selected, val]);
    }
  }

  function remove(val: string) {
    onChange(selected.filter((s) => s !== val));
  }

  const displayLabel =
    selected.length === 0
      ? null
      : singleSelect
        ? selected[0]
        : selected.length === 1
          ? selected[0]
          : `${selected[0]} +${selected.length - 1}`;

  return (
    <div className="OMS-wrap" ref={wrapRef}>
      <button
        type="button"
        className={`OMS-trigger${open ? " OMS-trigger--open" : ""}${selected.length > 0 ? " OMS-trigger--active" : ""}`}
        onClick={() => {
          setOpen((p) => !p);
          if (!open) setTimeout(() => inputRef.current?.focus(), 50);
        }}
      >
        <span className="OMS-trigger-label">
          {displayLabel ?? <span className="OMS-placeholder">{placeholder}</span>}
        </span>
        {selected.length > 0 && !singleSelect && (
          <button
            type="button"
            className="OMS-clear"
            onClick={(e) => {
              e.stopPropagation();
              onChange([]);
            }}
          >
            <X size={10} strokeWidth={3} />
          </button>
        )}
        <ChevronDown
          size={11}
          strokeWidth={2.5}
          className={`OMS-chevron${open ? " OMS-chevron--open" : ""}`}
        />
      </button>

      {open && (
        <div className="OMS-dropdown">
          <div className="OMS-search-wrap">
            <input
              ref={inputRef}
              className="OMS-search"
              placeholder="Buscar…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {!singleSelect && selected.length > 0 && (
            <div className="OMS-chips">
              {selected.map((s) => (
                <span key={s} className="OMS-chip">
                  {s}
                  <button type="button" className="OMS-chip-x" onClick={() => remove(s)}>
                    <X size={9} strokeWidth={3} />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="OMS-list">
            {filtered.length === 0 ? (
              <div className="OMS-empty">Nenhum resultado</div>
            ) : (
              filtered.map((opt) => {
                const checked = selected.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    className={`OMS-opt${checked ? " OMS-opt--checked" : ""}`}
                    onClick={() => toggle(opt)}
                  >
                    {!singleSelect && (
                      <span className={`OMS-checkbox${checked ? " OMS-checkbox--checked" : ""}`}>
                        {checked && (
                          <svg viewBox="0 0 10 10" fill="none" width="10" height="10">
                            <path
                              d="M2 5.5L4 7.5L8 3"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </span>
                    )}
                    {singleSelect && checked && (
                      <span className="OMS-radio-dot" />
                    )}
                    <span className="OMS-opt-label">{opt}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
