import { useCallback, useEffect, useRef, useState } from "react";
import { getBrand, inferBrand, saveBrand } from "@/mocks/handlers";
import type { Brand } from "@/mocks/types";
import { useAppStore } from "@/store/app-store";

const DEFAULT_PALETTE = ["#F40009", "#E8000B", "#FFFFFF", "#111111", "#F5E6C8"];

const VOICE_CARDS = [
  {
    yes: true,
    quote: '"Abra uma Coca-Cola. Abra um sorriso."',
    why: "Alegre, inclusivo, momento de conexão humana.",
  },
  {
    yes: false,
    quote: '"Melhor que outras marcas."',
    why: "Comparações diretas violam a política da marca.",
  },
  {
    yes: true,
    quote: '"Gelada, com aquela condensação que diz tudo."',
    why: "Evocativo, sensorial, foca no produto com contexto.",
  },
  {
    yes: false,
    quote: '"Refrigerante com menos açúcar."',
    why: "Tom técnico/funcional não alinha com a identidade emocional da marca.",
  },
];

const PLATFORM_RULES = [
  {
    name: "Meta Feed",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
    rule: "1:1 ou 4:5 · Pessoas em contexto · Logo visível nos 3s iniciais",
  },
  {
    name: "Meta Stories",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
    rule: "9:16 · Vertical · CTA nos últimos 2s · Sem texto na zona de segurança",
  },
  {
    name: "Google Search",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    ),
    rule: "Headline ≤30 chars · Sem superlativo · CTA obrigatório",
  },
  {
    name: "YouTube",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect width="15" height="14" x="1" y="5" rx="2" ry="2" />
      </svg>
    ),
    rule: "Produto em 5s · Sem skip se ROAS > 4.5x · Legenda obrigatória",
  },
];

function swatchStyle(color: string) {
  const isLight = color === "#FFFFFF" || color === "#FFF";
  return {
    background: color,
    border: isLight ? "var(--border-interactive)" : undefined,
  };
}

function swatchLabelStyle(color: string) {
  const isLight = color === "#FFFFFF" || color === "#FFF";
  return isLight ? { color: "#111" } : undefined;
}

export function BrandDetail() {
  const selectedBrandId = useAppStore((s) => s.selectedBrandId);
  const setBrandSubView = useAppStore((s) => s.setBrandSubView);
  const currentBu = useAppStore((s) => s.currentBu);

  const [brand, setBrand] = useState<Brand | null>(null);
  const [inferring, setInferring] = useState(false);
  const [inferredLocal, setInferredLocal] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bookInputRef = useRef<HTMLInputElement>(null);
  const fontInputRef = useRef<HTMLInputElement>(null);

  const loadBrand = useCallback(async () => {
    if (!selectedBrandId) return;
    // TODO: Replace with real API call
    const data = await getBrand(selectedBrandId);
    if (data) {
      setBrand(data);
      setInferredLocal(data.inferred);
    }
  }, [selectedBrandId]);

  useEffect(() => {
    void loadBrand();
  }, [loadBrand]);

  const handleInfer = async () => {
    if (!brand || inferring) return;
    setInferring(true);
    try {
      // TODO: Replace with real API call
      await inferBrand(brand.id);
      const updated: Brand = {
        ...brand,
        inferred: true,
        inferDate: "20/05/2026",
        hasLogo: true,
        hasBrandbook: true,
        hasFonts: true,
        fonts: brand.fonts.length ? brand.fonts : ["Sans Serif (inferida)", "Display Bold (inferida)"],
        palette: brand.palette.length ? brand.palette : DEFAULT_PALETTE,
      };
      // TODO: Replace with real API call
      await saveBrand(updated);
      setBrand(updated);
      setInferredLocal(true);
    } finally {
      setInferring(false);
    }
  };

  if (!brand) {
    return (
      <div className="BNDV">
        <button type="button" className="BGC-back-btn" onClick={() => setBrandSubView("catalog")}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Marcas
        </button>
      </div>
    );
  }

  const missing: string[] = [];
  if (!brand.hasLogo) missing.push("logo");
  if (!brand.hasBrandbook) missing.push("brandbook");
  if (!brand.hasFonts) missing.push("fontes");

  const showInferred = brand.inferred || inferredLocal;
  const palette = brand.palette.length ? brand.palette : DEFAULT_PALETTE;
  const fonts = brand.fonts.length ? brand.fonts : ["LMAO Sans · Bebas Neue"];

  return (
    <div className="BNDV">
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 36 }}>
        <button type="button" className="BGC-back-btn" onClick={() => setBrandSubView("catalog")}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Marcas
        </button>
        <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.08)" }} />
        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)" }}>{brand.name}</span>
      </div>

      {!showInferred && (
        <div id="bnd-detail-upload-section">
          <div style={{ marginBottom: 28 }}>
            <div className="SH">
              <span />
              Assets pendentes
            </div>
            <div className="BNR-form-title">Completar assets — {brand.name}</div>
            <div className="BNR-form-sub" style={{ marginBottom: 0 }}>
              {missing.length
                ? `Pendências: ${missing.join(", ")} — faça o upload e infira as diretrizes`
                : "Faça upload dos assets e infira as diretrizes de identidade visual"}
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
            <div className="BAU-panels">
              {[
                { title: "Logos", hint: "PNG, JPG, JPEG, SVG", ref: logoInputRef, accept: ".png,.jpg,.jpeg,.svg" },
                { title: "Brandbook", hint: "PNG, JPG, JPEG, PDF", ref: bookInputRef, accept: ".png,.jpg,.jpeg,.pdf" },
                { title: "Fontes", hint: "TTF, OTF, WOFF", ref: fontInputRef, accept: ".ttf,.otf,.woff,.woff2" },
              ].map((panel) => (
                <div key={panel.title} className="BAU-panel">
                  <div className="BAU-panel-title">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    {panel.title}
                  </div>
                  <div
                    className="BAU-drop"
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
                    <div className="BAU-drop-ico">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </div>
                    <div className="BAU-drop-lbl">Arraste ou clique para enviar</div>
                    <div className="BAU-drop-hint">{panel.hint}</div>
                  </div>
                  <input ref={panel.ref} type="file" accept={panel.accept} multiple hidden />
                </div>
              ))}
            </div>
            <div className="BNR-infer-wrap">
              <button type="button" className="BAU-infer-btn" disabled={inferring} onClick={() => void handleInfer()}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                </svg>
                <span>{inferring ? "Inferindo…" : "Inferir diretrizes de marca →"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showInferred && (
        <div className="BND-inferred-bar">
          <div className="BND-inferred-bar-left">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Diretrizes inferidas por IA
            {brand.inferDate && <span className="BND-inferred-date">· atualizado em {brand.inferDate}</span>}
          </div>
          <button type="button" className="BND-inferred-edit-btn" onClick={() => setBrandSubView("new", brand.id)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Editar diretrizes
          </button>
        </div>
      )}

      {showInferred && (
        <div id="bnd-detail-sections">
          <div className="BND-hero">
            <div className="BND-hero-left">
              <div
                className="BND-logo-mark"
                style={{ background: brand.color, boxShadow: `0 0 24px ${brand.color}55` }}
              >
                {brand.initials}
              </div>
              <div>
                <div className="BND-brand-name">{brand.name} — iFood CPG</div>
                <div className="BND-brand-cat">
                  {brand.cat} · {currentBu}
                </div>
              </div>
            </div>
            <div className="BND-palette">
              {palette.map((color) => (
                <div key={color} className="BND-swatch" style={swatchStyle(color)}>
                  <span style={swatchLabelStyle(color)}>{color.replace(/^#/, "#").substring(0, 7)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="BND-section">
            <div className="BND-section-hdr">
              <div className="BND-section-ico pu">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="4 7 4 4 20 4 20 7" />
                  <line x1="9" x2="15" y1="20" y2="20" />
                  <line x1="12" x2="12" y1="4" y2="20" />
                </svg>
              </div>
              <div className="BND-section-hdr-text">
                <h3>Tipografia</h3>
                <p>Fontes autorizadas para campanhas e criativos</p>
              </div>
            </div>
            <div className="BND-type-row">
              <div className="BND-type-specimen">Aa</div>
              <div>
                <div className="BND-type-name">{fonts.join(" · ")}</div>
                <div className="BND-type-uses">Display · Headlines · CTAs · Embalagem</div>
              </div>
            </div>
          </div>

          <div className="BND-section">
            <div className="BND-section-hdr">
              <div className="BND-section-ico">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </div>
              <div className="BND-section-hdr-text">
                <h3>Tom de voz</h3>
                <p>Diretrizes para geração de copy por IA</p>
              </div>
            </div>
            <div className="BND-voice-grid">
              {VOICE_CARDS.map((card) => (
                <div key={card.quote} className={`BND-voice-card ${card.yes ? "yes" : "no"}`}>
                  <div className="BND-voice-tag">{card.yes ? "Usar" : "Evitar"}</div>
                  <p>{card.quote}</p>
                  <div className="BND-voice-why">{card.why}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="BND-section">
            <div className="BND-section-hdr">
              <div className="BND-section-ico gr">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="20" height="14" x="2" y="3" rx="2" />
                  <path d="M8 21h8" />
                  <path d="M12 17v4" />
                </svg>
              </div>
              <div className="BND-section-hdr-text">
                <h3>Regras por plataforma</h3>
                <p>Especificações de formato e conteúdo por canal</p>
              </div>
            </div>
            <div className="BND-plat-grid">
              {PLATFORM_RULES.map((plat) => (
                <div key={plat.name} className="BND-plat-card">
                  <div className="BND-plat-card-hd">
                    {plat.icon}
                    {plat.name}
                  </div>
                  <div className="BND-plat-rule">{plat.rule}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
