import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Plus, X } from "lucide-react";
import { createBuBrand } from "@/mocks/handlers";
import { BU_OPTIONS } from "@/mocks/data";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { useAppStore } from "@/store/app-store";

const TIPO_OPTIONS = [
  { value: "Agência", label: "Agência" },
  { value: "Indústria", label: "Indústria" },
  { value: "BU iFood", label: "BU iFood" },
];

function formatCnpj(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12)
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

export function NewClientView() {
  const setCommercialOpsView = useAppStore((s) => s.setCommercialOpsView);

  const [clientName, setClientName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [tipo, setTipo] = useState("");
  const [brandInput, setBrandInput] = useState("");
  const [brands, setBrands] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const brandWrapRef = useRef<HTMLDivElement>(null);

  const allKnownBrands = useMemo(
    () => [...new Set(BU_OPTIONS.flatMap((o) => o.brands))].sort(),
    [],
  );

  const suggestions = useMemo(() => {
    const q = brandInput.trim().toLowerCase();
    if (!q) return [];
    return allKnownBrands
      .filter((b) => b.toLowerCase().includes(q) && !brands.includes(b))
      .slice(0, 7);
  }, [brandInput, brands, allKnownBrands]);

  const isExactMatch = suggestions.some(
    (b) => b.toLowerCase() === brandInput.trim().toLowerCase(),
  );

  useEffect(() => {
    if (!showSuggestions) return;
    function onOutside(e: MouseEvent) {
      if (brandWrapRef.current && !brandWrapRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [showSuggestions]);

  function addBrand(value?: string) {
    const v = (value ?? brandInput).trim();
    if (!v || brands.includes(v)) return;
    setBrands((prev) => [...prev, v]);
    setBrandInput("");
    setShowSuggestions(false);
  }

  function removeBrand(b: string) {
    setBrands((prev) => prev.filter((x) => x !== b));
  }

  function handleBrandKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setShowSuggestions(false);
      return;
    }
    if (e.key === "Enter" || e.key === "," || e.key === ";") {
      e.preventDefault();
      addBrand();
    } else if (e.key === "Backspace" && !brandInput && brands.length) {
      setBrands((prev) => prev.slice(0, -1));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clientName.trim()) return;
    setSaving(true);
    await createBuBrand(clientName.trim(), brands, {
      cnpj: cnpj || undefined,
      tipo: tipo || undefined,
      contact: contactName.trim()
        ? {
            name: contactName.trim(),
            email: contactEmail.trim(),
            phone: contactPhone || undefined,
          }
        : undefined,
    });
    setSaving(false);
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="OPS-view">
        <div className="NCV-success">
          <div className="NCV-success-icon">✓</div>
          <h3 className="NCV-success-title">Cliente cadastrado com sucesso!</h3>
          <p className="NCV-success-sub">
            <strong>{clientName}</strong> foi adicionado à base de clientes.
          </p>
          <div className="NCV-success-actions">
            <button
              type="button"
              className="OPS-btn OPS-btn-primary"
              onClick={() => setCommercialOpsView("registry")}
            >
              Ver lista de clientes
            </button>
            <button
              type="button"
              className="OPS-btn"
              onClick={() => {
                setClientName("");
                setCnpj("");
                setTipo("");
                setBrands([]);
                setBrandInput("");
                setContactName("");
                setContactEmail("");
                setContactPhone("");
                setSuccess(false);
              }}
            >
              Cadastrar outro cliente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="OPS-view">
      <button
        type="button"
        className="CL-back"
        onClick={() => setCommercialOpsView("registry")}
      >
        <ArrowLeft size={14} strokeWidth={2} />
        Voltar para clientes
      </button>

      <form className="NCV-form" onSubmit={(e) => void handleSubmit(e)}>
        <div className="NCV-form-header">
          <h3 className="NCV-form-title">Novo cliente</h3>
          <p className="NCV-form-sub">Preencha os dados do novo cliente para cadastrá-lo.</p>
        </div>

        {/* Identificação */}
        <div className="NCV-section">
          <h4 className="NCV-section-title">Identificação</h4>
          <div className="NCV-fields">
            <label className="OPS-field">
              Nome do cliente *
              <input
                required
                placeholder="Ex: iFood Bebidas, Nestlé Brasil…"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </label>

            <label className="OPS-field">
              CNPJ
              <input
                placeholder="XX.XXX.XXX/XXXX-XX"
                value={cnpj}
                onChange={(e) => setCnpj(formatCnpj(e.target.value))}
                maxLength={18}
              />
            </label>

            <div className="OPS-field" style={{ gridColumn: "1 / -1" }}>
              Tipo de cliente
              <CustomSelect
                value={tipo}
                onChange={setTipo}
                options={TIPO_OPTIONS}
                placeholder="Selecionar tipo…"
              />
            </div>
          </div>
        </div>

        {/* Marcas */}
        <div className="NCV-section">
          <h4 className="NCV-section-title">Marcas</h4>
          <div className="NCV-brand-wrap" ref={brandWrapRef}>
            <div className="NCV-brand-input-wrap">
              {brands.map((b) => (
                <span key={b} className="NCV-brand-tag">
                  {b}
                  <button
                    type="button"
                    className="NCV-brand-remove"
                    onClick={() => removeBrand(b)}
                  >
                    <X size={10} strokeWidth={2.5} />
                  </button>
                </span>
              ))}
              <input
                className="NCV-brand-input"
                placeholder={brands.length === 0 ? "Buscar ou adicionar marca…" : ""}
                value={brandInput}
                onChange={(e) => {
                  setBrandInput(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => brandInput && setShowSuggestions(true)}
                onKeyDown={handleBrandKeyDown}
              />
            </div>

            {showSuggestions && (suggestions.length > 0 || (brandInput.trim() && !isExactMatch)) && (
              <div className="NCV-brand-dd">
                {suggestions.map((b) => (
                  <div
                    key={b}
                    className="NCV-brand-dd-opt"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => addBrand(b)}
                  >
                    {b}
                  </div>
                ))}
                {brandInput.trim() && !isExactMatch && (
                  <div
                    className="NCV-brand-dd-opt NCV-brand-dd-new"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => addBrand()}
                  >
                    <Plus size={12} strokeWidth={2.5} />
                    Adicionar &ldquo;{brandInput.trim()}&rdquo; como nova marca
                  </div>
                )}
              </div>
            )}
          </div>
          <p className="NCV-hint">
            Digite para buscar marcas existentes ou adicionar uma nova (Enter ou vírgula).
          </p>
        </div>

        {/* Contato comercial */}
        <div className="NCV-section">
          <h4 className="NCV-section-title">Contato comercial</h4>
          <div className="NCV-fields">
            <label className="OPS-field">
              Nome
              <input
                placeholder="Nome do contato principal"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
              />
            </label>
            <label className="OPS-field">
              E-mail
              <input
                type="email"
                placeholder="email@empresa.com"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
            </label>
            <label className="OPS-field">
              Telefone
              <input
                placeholder="(11) 99999-9999"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="NCV-actions">
          <button
            type="button"
            className="OPS-btn"
            onClick={() => setCommercialOpsView("registry")}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="OPS-btn OPS-btn-primary"
            disabled={!clientName.trim() || saving}
          >
            <Plus size={14} />
            {saving ? "Cadastrando…" : "Cadastrar cliente"}
          </button>
        </div>
      </form>
    </div>
  );
}
