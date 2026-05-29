import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md";
  minWidth?: number;
  prefix?: React.ReactNode;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Selecionar…",
  disabled,
  className,
  size = "md",
  minWidth,
  prefix,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div
      ref={wrapRef}
      className={`CS-wrap${size === "sm" ? " CS-wrap--sm" : ""}${open ? " open" : ""}${className ? ` ${className}` : ""}`}
      style={minWidth ? { minWidth } : undefined}
    >
      <button
        type="button"
        className={`CS-trigger${selected ? " has-value" : ""}`}
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
      >
        {prefix && <span className="CS-prefix">{prefix}</span>}
        <span className="CS-label">{selected?.label ?? placeholder}</span>
        <ChevronDown className="CS-chevron" size={11} strokeWidth={2.5} />
      </button>
      {open && (
        <div className="CS-dd">
          {placeholder && (
            <div
              className={`CS-opt${!value ? " on" : ""}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onChange(""); setOpen(false); }}
            >
              <span className="CS-opt-lbl">{placeholder}</span>
            </div>
          )}
          {options.map((opt) => (
            <div
              key={opt.value}
              className={`CS-opt${opt.value === value ? " on" : ""}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onChange(opt.value); setOpen(false); }}
            >
              <span className="CS-opt-lbl">{opt.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
