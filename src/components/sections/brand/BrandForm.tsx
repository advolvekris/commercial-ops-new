import { useCallback, useEffect, useRef, useState } from "react";
import { CROSS_CLIENT_BRANDS } from "@/mocks/data";
import { getBrand, inferBrand, saveBrand } from "@/mocks/handlers";
import type { Brand } from "@/mocks/types";
import { useAppStore } from "@/store/app-store";

const VERTICALS = [
  { label: "B&C", value: "B&C (Bebidas e Comida)" },
  { label: "Bebidas", value: "Bebidas" },
  { label: "Restaurante", value: "Restaurante" },
  { label: "Mercado", value: "Mercado" },
  { label: "Farma", value: "Farma" },
  { label: "Pet", value: "Pet" },
  { label: "Shopping", value: "Shopping" },
];

function brandInitials(name: string) {
  return (
    name
      .split(/\s+/)
      .map((w) => w[0] || "")
      .join("")
      .slice(0, 2)
      .toUpperCase() || "??"
  );
}

export function BrandForm() {
  const selectedBrandId = useAppStore((s) => s.selectedBrandId);
  const setBrandSubView = useAppStore((s) => s.setBrandSubView);

  const [existingBrand, setExistingBrand] = useState<Brand | null>(null);
  const [name, setName] = useState("");
  const [verticals, setVerticals] = useState<string[]>([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const [suggestions, setSuggestions] = useState<typeof CROSS_CLIENT_BRANDS>([]);
  const [inferredPreview, setInferredPreview] = useState(false);
  const [previewFonts, setPreviewFonts] = useState<string[]>([]);
  const [inferring, setInferring] = useState(false);
  const [saving, setSaving] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bookInputRef = useRef<HTMLInputElement>(null);
  const fontInputRef = useRef<HTMLInputElement>(null);
  const [hasLogoUpload, setHasLogoUpload] = useState(false);
  const [hasBookUpload, setHasBookUpload] = useState(false);
  const [hasFontUpload, setHasFontUpload] = useState(false);
  const [fontUrls, setFontUrls] = useState<{ name: string; url: string }[]>([]);
  const [fontUrlInput, setFontUrlInput] = useState("");

  const isEdit = Boolean(selectedBrandId);

  const loadExisting = useCallback(async () => {
    if (!selectedBrandId) {
      setExistingBrand(null);
      setName("");
      setVerticals([]);
      setInferredPreview(false);
      return;
    }
    // TODO: Replace with real API call
    const data = await getBrand(selectedBrandId);
    if (data) {
      setExistingBrand(data);
      setName(data.name);
      setVerticals(data.verticals);
      if (data.inferred && data.fonts.length) {
        setInferredPreview(true);
        setPreviewFonts(data.fonts);
      }
    }
  }, [selectedBrandId]);

  useEffect(() => {
    void loadExisting();
  }, [loadExisting]);

  const handleNameChange = (value: string) => {
    setName(value);
    const q = value.trim().toLowerCase();
    if (q.length < 2) {
      setShowSuggest(false);
      return;
    }
    const matches = CROSS_CLIENT_BRANDS.filter(
      (b) => b.name.toLowerCase().includes(q) && b.name.toLowerCase() !== q,
    ).slice(0, 4);
    setSuggestions(matches);
    setShowSuggest(matches.length > 0);
  };

  const toggleVertical = (value: string) => {
    setVerticals((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  };

  const hasAsset = hasLogoUpload || hasBookUpload || hasFontUpload || fontUrls.length > 0;

  const handleInfer = async () => {
    if (!hasAsset || inferring) return;
    setInferring(true);
    try {
      // TODO: Replace with real API call
      await inferBrand(selectedBrandId ?? "new");
      const fonts = fontUrls.map((f) => f.name);
      if (!fonts.length) fonts.push("Sans Serif (inferida)", "Display Bold (inferida)");
      setPreviewFonts(fonts);
      setInferredPreview(true);
    } finally {
      setInferring(false);
    }
  };

  const handleSave = async () => {
    const nameVal = name.trim();
    if (!nameVal || saving) return;

    setSaving(true);
    try {
      const initials = brandInitials(nameVal);
      const fonts = [
        ...fontUrls.map((f) => f.name),
        ...(hasFontUpload ? ["Custom Font (upload)"] : []),
      ];
      const payload: Brand = existingBrand
        ? {
            ...existingBrand,
            name: nameVal,
            verticals: verticals.length ? verticals : existingBrand.verticals,
            hasLogo: existingBrand.hasLogo || hasLogoUpload,
            hasBrandbook: existingBrand.hasBrandbook || hasBookUpload,
            hasFonts: existingBrand.hasFonts || hasFontUpload || fontUrls.length > 0,
            inferred: existingBrand.inferred || inferredPreview,
            inferDate: inferredPreview || existingBrand.inferred ? "20/05/2026" : existingBrand.inferDate,
            fonts: inferredPreview && fonts.length ? fonts : existingBrand.fonts,
          }
        : {
            id: `bnr${Date.now()}`,
            name: nameVal,
            initials,
            color: "#7c3aed",
            cat: verticals.length ? verticals[0] : "Marca",
            verticals,
            hasLogo: hasLogoUpload,
            hasBrandbook: hasBookUpload,
            hasFonts: hasFontUpload || fontUrls.length > 0,
            inferred: inferredPreview,
            inferDate: inferredPreview ? "20/05/2026" : "",
            fonts: inferredPreview ? fonts : [],
            palette: [],
          };

      // TODO: Replace with real API call
      await saveBrand(payload);
      setBrandSubView("catalog");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => setBrandSubView("catalog");

  const addFontUrl = () => {
    const val = fontUrlInput.trim();
    if (!val) return;
    const match = val.match(/family=([^&:]+)/);
    const displayName = match
      ? decodeURIComponent(match[1].replace(/\+/g, " "))
      : val.replace(/^https?:\/\//, "").split("/")[0];
    setFontUrls((prev) => [...prev, { url: val, name: displayName }]);
    setFontUrlInput("");
    setHasFontUpload(true);
  };

  const title = isEdit ? `Editar diretrizes — ${existingBrand?.name ?? name}` : "Cadastrar nova marca";
  const subtitle = isEdit
    ? "Faça upload de novos assets e re-infira as diretrizes"
    : "Preencha as informações e faça upload dos assets — a IA infere as diretrizes automaticamente";

  return (
    <div className="BNDV">
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
        <button type="button" className="BGC-back-btn" onClick={handleCancel}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Marcas
        </button>
        <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.08)", flexShrink: 0 }} />
        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)" }}>{title}</span>
        <div className="BNR-hdr-actions">
          <button type="button" className="BNR-hdr-btn-cancel" onClick={handleCancel}>
            Cancelar
          </button>
          <button type="button" className="BNR-hdr-btn-save" onClick={() => void handleSave()} disabled={saving}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Salvar marca
          </button>
        </div>
      </div>

      <div style={{ marginBottom: 28 }}>
        <div className="BNR-form-title">{title}</div>
        <div className="BNR-form-sub" style={{ marginBottom: 0 }}>
          {subtitle}
        </div>
      </div>

      <div className="BNR-form-wrap">
        <div className="BNR-info-card">
          <div className="BNR-info-card-hdr">
            <div className="BNR-info-card-ico">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <div>
              <div className="BNR-info-card-title">Identidade da marca</div>
              <div className="BNR-info-card-sub">Nome comercial e categorização por vertical</div>
            </div>
          </div>
          <div className="BNR-info-fields">
            <div className="BNR-field">
              <div className="BNR-label">Nome da marca</div>
              <input
                type="text"
                className="BNR-input"
                placeholder="Ex: Coca-Cola, Heineken…"
                autoComplete="off"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                onBlur={() => setTimeout(() => setShowSuggest(false), 150)}
              />
              <div className={`BNR-suggest${showSuggest ? " show" : ""}`}>
                <div className="BNR-suggest-hdr">Marcas em outros clientes — associar também?</div>
                {suggestions.map((s) => (
                  <div
                    key={s.name}
                    className="BNR-suggest-item"
                    role="button"
                    tabIndex={0}
                    onMouseDown={() => {
                      setName(s.name);
                      setShowSuggest(false);
                    }}
                  >
                    <div className="BNR-suggest-av" style={{ background: s.color || "#7c3aed" }}>
                      {s.initials}
                    </div>
                    <div className="BNR-suggest-text">
                      <div className="BNR-suggest-name">{s.name}</div>
                      <div className="BNR-suggest-meta">Cadastrada em: {s.clients.join(", ")}</div>
                    </div>
                    <span className="BNR-suggest-tag">Associar</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="BNR-field">
              <div className="BNR-label">Verticais da marca</div>
              <div className="BNR-vert-pills-row">
                {VERTICALS.map((v) => (
                  <button
                    key={v.value}
                    type="button"
                    className={`BNR-vert-pill-btn${verticals.includes(v.value) ? " on" : ""}`}
                    onClick={() => toggleVertical(v.value)}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="BNR-assets-section">
        <div className="BNR-assets-hdr">
          <div className="BNR-assets-hdr-ico">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            </svg>
          </div>
          <div>
            <div className="BNR-assets-hdr-title">Assets da marca</div>
            <div className="BNR-assets-hdr-sub">
              Faça upload dos arquivos — a IA extrai cores, tipografia e diretrizes de identidade visual automaticamente
            </div>
          </div>
        </div>

        <div className="BNR-upload-panels">
          {[
            {
              title: "Logos",
              hint: "PNG, SVG, JPG",
              ref: logoInputRef,
              accept: ".png,.jpg,.jpeg,.svg",
              onChange: () => setHasLogoUpload(true),
            },
            {
              title: "Brandbook",
              hint: "PDF, PNG, JPG",
              ref: bookInputRef,
              accept: ".pdf,.png,.jpg,.jpeg",
              onChange: () => setHasBookUpload(true),
            },
            {
              title: "Fontes",
              hint: "Ou Google Fonts ↓",
              ref: fontInputRef,
              accept: ".ttf,.otf,.woff,.woff2",
              onChange: () => setHasFontUpload(true),
            },
          ].map((panel) => (
            <div key={panel.title} className="BNR-up-panel">
              <div className="BNR-up-panel-title">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                {panel.title}
              </div>
              <div
                className="BNR-drop"
                role="button"
                tabIndex={0}
                aria-label={`Área de upload de ${panel.title.toLowerCase()}`}
                onClick={() => panel.ref.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    panel.ref.current?.click();
                  }
                }}
              >
                <div className="BNR-drop-ico">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <div className="BNR-drop-lbl">{panel.title === "Fontes" ? "TTF, OTF, WOFF" : "Arrastar ou clicar"}</div>
                <div className="BNR-drop-hint">{panel.hint}</div>
              </div>
              <input
                ref={panel.ref}
                type="file"
                accept={panel.accept}
                multiple
                hidden
                onChange={panel.onChange}
              />
            </div>
          ))}
        </div>

        <div className="BNR-font-url-row" style={{ marginTop: 16 }}>
          <input
            type="text"
            className="BNR-font-url-inp"
            placeholder="URL Google Fonts…"
            value={fontUrlInput}
            onChange={(e) => setFontUrlInput(e.target.value)}
          />
          <button type="button" className="BNR-font-url-btn" title="Adicionar fonte" onClick={addFontUrl}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
        {fontUrls.length > 0 && (
          <div className="BNR-font-tags">
            {fontUrls.map((f, i) => (
              <span key={f.url} className="BNR-font-tag">
                {f.name}
                <button
                  type="button"
                  className="BNR-font-tag-x"
                  onClick={() => setFontUrls((prev) => prev.filter((_, idx) => idx !== i))}
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="BNR-infer-wrap">
          <button
            type="button"
            className="BNR-infer-btn"
            disabled={inferring}
            onClick={() => void handleInfer()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            </svg>
            <span>{inferring ? "Inferindo…" : "Inferir diretrizes da marca →"}</span>
          </button>

          <div className={`BNR-inferred-preview${inferredPreview ? " show" : ""}`}>
            <div className="BNR-inferred-preview-hdr">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Diretrizes inferidas com sucesso — logo e fontes detectadas
            </div>
            <div className="BNR-preview-row">
              <div className="BNR-preview-logo-av" style={{ background: existingBrand?.color ?? "#7c3aed" }}>
                {brandInitials(name || existingBrand?.name || "??")}
              </div>
              {previewFonts.map((font) => (
                <div key={font} className="BNR-preview-font-pill">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="4 7 4 4 20 4 20 7" />
                    <line x1="9" x2="15" y1="20" y2="20" />
                    <line x1="12" x2="12" y1="4" y2="20" />
                  </svg>
                  {font}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="BNR-form-wrap">
        <div className="BNR-footer">
          <button type="button" className="BNR-btn-cancel" onClick={handleCancel}>
            Cancelar
          </button>
          <button type="button" className="BNR-btn-save" onClick={() => void handleSave()} disabled={saving}>
            Salvar marca
          </button>
        </div>
      </div>
    </div>
  );
}
