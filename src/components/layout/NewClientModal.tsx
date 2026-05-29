import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { createBuBrand } from "@/mocks/handlers";
import { Dialog, DialogContent } from "@/components/ui/dialog";

function maskCnpj(raw: string): string {
  const v = raw.replace(/\D/g, "").slice(0, 14);
  if (v.length > 12) {
    return `${v.slice(0, 2)}.${v.slice(2, 5)}.${v.slice(5, 8)}/${v.slice(8, 12)}-${v.slice(12)}`;
  }
  if (v.length > 8) {
    return `${v.slice(0, 2)}.${v.slice(2, 5)}.${v.slice(5, 8)}/${v.slice(8)}`;
  }
  if (v.length > 5) {
    return `${v.slice(0, 2)}.${v.slice(2, 5)}.${v.slice(5)}`;
  }
  if (v.length > 2) {
    return `${v.slice(0, 2)}.${v.slice(2)}`;
  }
  return v;
}

interface NewClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (buName: string, brands: string[]) => void;
}

export function NewClientModal({ open, onOpenChange, onCreated }: NewClientModalProps) {
  const [nome, setNome] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [contato, setContato] = useState("");
  const [brands, setBrands] = useState<string[]>([]);
  const [brandInput, setBrandInput] = useState("");
  const nomeRef = useRef<HTMLInputElement>(null);

  function reset() {
    setNome("");
    setCnpj("");
    setContato("");
    setBrands([]);
    setBrandInput("");
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  useEffect(() => {
    if (open) {
      setTimeout(() => nomeRef.current?.focus(), 120);
    }
  }, [open]);

  function renderTags() {
    return brands.map((b, i) => (
      <span key={`${b}-${i}`} className="NC-tag">
        {b}
        <button
          type="button"
          className="NC-tag-x"
          onMouseDown={(e) => {
            e.preventDefault();
            setBrands((prev) => prev.filter((_, idx) => idx !== i));
          }}
        >
          &times;
        </button>
      </span>
    ));
  }

  function addBrand(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;
    setBrands((prev) => [...prev, trimmed]);
    setBrandInput("");
  }

  async function handleCreate() {
    const trimmed = nome.trim();
    if (!trimmed) {
      nomeRef.current?.focus();
      return;
    }
    const brandList = brands.slice();
    // TODO: Replace with real API call
    await createBuBrand(trimmed, brandList, {
      cnpj: cnpj || undefined,
      contact: contato.trim()
        ? { name: contato.trim(), email: "", phone: undefined }
        : undefined,
    });
    onCreated(trimmed, brandList);
    handleOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        overlayClassName={`NC-modal${open ? " nc-open" : ""}`}
        className="NC-panel"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
          <div className="NC-hdr">
            <div className="NC-title">
              Nova <em>BU de cliente</em>
            </div>
            <button type="button" className="NC-close" id="nc-close-btn" onClick={() => handleOpenChange(false)}>
              <X size={14} strokeWidth={2.5} />
            </button>
          </div>
          <div className="NC-form">
            <div className="NC-fg">
              <label className="NC-lbl">Nome do cliente</label>
              <div className="NC-iw">
                <input
                  ref={nomeRef}
                  type="text"
                  id="nc-nome"
                  placeholder="Ex: Pepsico, Nestlé, Unilever…"
                  autoComplete="off"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </div>
            </div>
            <div className="NC-fg">
              <label className="NC-lbl">CNPJ</label>
              <div className="NC-iw">
                <input
                  type="text"
                  id="nc-cnpj"
                  placeholder="00.000.000/0000-00"
                  autoComplete="off"
                  maxLength={18}
                  value={cnpj}
                  onChange={(e) => setCnpj(maskCnpj(e.target.value))}
                />
              </div>
            </div>
            <div className="NC-fg">
              <label className="NC-lbl">Pessoa de contato</label>
              <div className="NC-iw">
                <input
                  type="text"
                  id="nc-contato"
                  placeholder="Nome completo…"
                  autoComplete="off"
                  value={contato}
                  onChange={(e) => setContato(e.target.value)}
                />
              </div>
            </div>
            <div className="NC-fg">
              <label className="NC-lbl">Marca(s)</label>
              <div
                className="NC-tags-wrap"
                id="nc-tags-wrap"
                onClick={() => document.getElementById("nc-brand-input")?.focus()}
              >
                {renderTags()}
                <input
                  type="text"
                  className="NC-tag-input"
                  id="nc-brand-input"
                  placeholder="Digite uma marca e pressione Enter…"
                  autoComplete="off"
                  value={brandInput}
                  onChange={(e) => setBrandInput(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === "," || e.key === ";") && brandInput.trim()) {
                      e.preventDefault();
                      addBrand(brandInput);
                    } else if (e.key === "Backspace" && !brandInput && brands.length) {
                      setBrands((prev) => prev.slice(0, -1));
                    } else if (e.key === "Escape") {
                      handleOpenChange(false);
                    }
                  }}
                />
              </div>
              <p className="NC-tag-hint">↵ Enter para adicionar cada marca</p>
            </div>
          </div>
          <div className="NC-actions">
            <button type="button" className="NC-btn NC-btn-cancel" id="nc-cancel-btn" onClick={() => handleOpenChange(false)}>
              Cancelar
            </button>
            <button type="button" className="NC-btn NC-btn-create" id="nc-create-btn" onClick={handleCreate}>
              Criar cliente
            </button>
          </div>
      </DialogContent>
    </Dialog>
  );
}
