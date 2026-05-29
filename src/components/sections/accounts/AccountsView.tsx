import { useCallback, useEffect, useMemo, useState } from "react";
import { addAccount, getAccounts, verifyAccount } from "@/mocks/handlers";
import type { AccountEntry } from "@/mocks/types";
import { useAppStore } from "@/store/app-store";
import { CustomSelect } from "@/components/ui/CustomSelect";

const PLAT_NAMES: Record<string, string> = {
  google: "Google Ads",
  meta: "Meta Ads",
  tiktok: "TikTok Ads",
};

const TYPE_MAP: Record<string, { cls: string; txt: string }> = {
  ifood: { cls: "ifood", txt: "iFood Managed" },
  new: { cls: "new", txt: "Client Managed (new)" },
  existing: { cls: "existing", txt: "Client Managed (existing)" },
};

const STATUS_INFO: Record<string, { cls: string; txt: string }> = {
  ok: { cls: "ok", txt: "✓ Acesso completo" },
  partial: { cls: "partial", txt: "⚡ Acesso parcial" },
  pending: { cls: "pending", txt: "⏳ Pendente" },
};

const CHK_LABELS: Record<string, string[]> = {
  google: ["Acesso à conta Google Ads", "Permissão de administrador", "Aprovação de cobrança"],
  meta: ["Acesso ao Business Manager", "Permissão de anúncios", "Aprovação de conta de anúncios"],
  tiktok: ["Acesso ao Gerenciador TikTok", "Permissão de criação de campanha", "Aprovação de método de pagamento"],
};

const BRAND_OPTIONS = ["Coca-Cola", "Heineken", "Ambev Skol", "Nike Brasil", "Samsung"];
const PROJECT_OPTIONS = ["Q1 2025", "Brand Launch", "Campanha Verão", "Mídia Outono"];

const GoogleIcon = ({ size = 22 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const MetaIcon = ({ size = 16 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size}>
    <path
      d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
      fill="#1877F2"
    />
  </svg>
);

const TikTokIcon = ({ size = 16 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size}>
    <path
      d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-6.34 6.28 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.97a8.16 8.16 0 0 0 4.79 1.52V7.03a4.85 4.85 0 0 1-1.01-.34z"
      fill={size >= 20 ? "white" : "rgba(255,255,255,0.85)"}
    />
  </svg>
);

function PlatIcon({ plat, large }: { plat: string; large?: boolean }) {
  if (plat === "google") return <GoogleIcon size={large ? 22 : 13} />;
  if (plat === "meta") return <MetaIcon size={large ? 20 : 13} />;
  return <TikTokIcon size={large ? 20 : 13} />;
}

export function AccountsView() {
  const accountsSubView = useAppStore((s) => s.accountsSubView);
  const setAccountsSubView = useAppStore((s) => s.setAccountsSubView);

  const [accounts, setAccounts] = useState<AccountEntry[]>([]);
  const [filterPlat, setFilterPlat] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [filterProj, setFilterProj] = useState("");

  const [addPlat, setAddPlat] = useState<string | null>(null);
  const [addType, setAddType] = useState<AccountEntry["type"]>("ifood");
  const [addId, setAddId] = useState("");
  const [addBrands, setAddBrands] = useState<string[]>([]);
  const [addProjects, setAddProjects] = useState<string[]>([]);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verifyChecks, setVerifyChecks] = useState<{ label: string; ok: boolean }[]>([]);
  const [verifyBanner, setVerifyBanner] = useState<{ cls: string; title: string; sub: string } | null>(null);

  const loadAccounts = useCallback(async () => {
    // TODO: Replace with real API call
    const data = await getAccounts();
    setAccounts(data);
  }, []);

  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);

  const filtered = useMemo(() => {
    return accounts.filter((a) => {
      if (filterPlat && a.plat !== filterPlat) return false;
      if (filterBrand && !a.brands.includes(filterBrand)) return false;
      if (filterProj && !a.projects.includes(filterProj)) return false;
      return true;
    });
  }, [accounts, filterPlat, filterBrand, filterProj]);

  const resetAdd = () => {
    setAddPlat(null);
    setAddType("ifood");
    setAddId("");
    setAddBrands([]);
    setAddProjects([]);
    setVerifying(false);
    setVerified(false);
    setVerifyChecks([]);
    setVerifyBanner(null);
  };

  const showMain = () => {
    setAccountsSubView("main");
    void loadAccounts();
  };

  const showAdd = () => {
    resetAdd();
    setAccountsSubView("add");
  };

  const handleVerify = async () => {
    if (!addPlat || !addId.trim() || verifying) return;
    setVerifying(true);
    setVerified(false);
    setVerifyBanner(null);
    setVerifyChecks([]);

    try {
      // TODO: Replace with real API call
      const result = await verifyAccount(addPlat, addId.trim());

      if (addType === "ifood") {
        setVerifyBanner({
          cls: "ifood",
          title: "Acesso garantido pela iFood Ads",
          sub: "Conta centralizada — nenhuma ação adicional necessária.",
        });
        setVerified(true);
        return;
      }

      const labels = CHK_LABELS[addPlat] ?? CHK_LABELS.google;
      const checks = labels.map((label, i) => ({
        label,
        ok: i < result.checks.length,
      }));
      setVerifyChecks(checks);

      const allOk = checks.every((c) => c.ok);
      const someOk = checks.some((c) => c.ok);
      setVerifyBanner({
        cls: allOk ? "ok" : "partial",
        title: allOk
          ? "✓ Acesso completo"
          : someOk
            ? `⚡ ${checks.filter((c) => c.ok).length} de ${checks.length} permissões concedidas`
            : "⏳ Acesso pendente",
        sub: allOk
          ? "Todas as permissões foram concedidas. A conta está pronta para uso."
          : someOk
            ? "Solicite as permissões pendentes ao responsável pela conta antes de iniciar campanhas."
            : "Nenhuma permissão foi encontrada. Solicite acesso ao responsável pela conta.",
      });
      setVerified(true);
    } finally {
      setVerifying(false);
    }
  };

  const handleSave = async () => {
    if (!addPlat || !addId.trim()) return;

    let status: AccountEntry["status"] = "pending";
    if (addType === "ifood") status = "ok";
    else if (verified) {
      const allOk = verifyChecks.length > 0 && verifyChecks.every((c) => c.ok);
      const someOk = verifyChecks.some((c) => c.ok);
      status = allOk ? "ok" : someOk ? "partial" : "pending";
    }

    const entry: AccountEntry = {
      plat: addPlat,
      type: addType,
      id: addId.trim(),
      brands: addBrands,
      projects: addProjects,
      status,
    };

    // TODO: Replace with real API call
    await addAccount(entry);
    showMain();
  };

  const togglePill = (value: string, list: string[], setter: (v: string[]) => void) => {
    setter(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);
  };

  if (accountsSubView === "add") {
    return (
      <div className="ACCV">
        <div id="acc-add-view">
          <button className="AC-back" type="button" onClick={showMain}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Contas de provedores
          </button>
          <div className="SH">
            <span />
            Nova conta
          </div>
          <h2 className="SH2" style={{ marginBottom: 22 }}>
            Adicionar conta de provedor
          </h2>

          <div className="AC-step">
            <div className="AC-step-title">
              <span className="AC-step-num">1</span>Selecione a plataforma
            </div>
            <div className="AC-pgrid">
              {(["google", "meta", "tiktok"] as const).map((plat) => (
                <button
                  key={plat}
                  type="button"
                  className={`AC-pcard ${plat}${addPlat === plat ? " sel" : ""}`}
                  onClick={() => {
                    setAddPlat(plat);
                    setVerified(false);
                    setVerifyBanner(null);
                    setVerifyChecks([]);
                  }}
                >
                  <div className={`AC-pcard-ico ${plat}`}>
                    <PlatIcon plat={plat} large />
                  </div>
                  <div className="AC-pcard-name">{PLAT_NAMES[plat]}</div>
                  <div className="AC-pcard-fmt">
                    {plat === "google" ? "000-000-0000" : plat === "meta" ? "act_XXXXXXXXXX" : "adv_XXXXXXXXXX"}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="AC-step">
            <div className="AC-step-title">
              <span className="AC-step-num">2</span>Tipo de conta
            </div>
            <div className="AC-tgrid">
              {(
                [
                  {
                    type: "ifood" as const,
                    name: "iFood Managed",
                    sub: "Conta centralizada — acesso garantido pela iFood",
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ff7a3d" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                    ),
                  },
                  {
                    type: "new" as const,
                    name: "Client Managed (new)",
                    sub: "Nova conta criada pelo cliente — verificação de permissão necessária",
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-light)" strokeWidth="2">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <line x1="19" y1="8" x2="19" y2="14" />
                        <line x1="22" y1="11" x2="16" y2="11" />
                      </svg>
                    ),
                  },
                  {
                    type: "existing" as const,
                    name: "Client Managed (existing)",
                    sub: "Conta existente do cliente — verificação de acesso necessária",
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2">
                        <rect x="2" y="7" width="20" height="14" rx="2" />
                        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                        <line x1="12" y1="12" x2="12" y2="16" />
                        <line x1="10" y1="14" x2="14" y2="14" />
                      </svg>
                    ),
                  },
                ] as const
              ).map((t) => (
                <button
                  key={t.type}
                  type="button"
                  className={`AC-tcard${addType === t.type ? ` sel ${t.type}` : ""}`}
                  onClick={() => {
                    setAddType(t.type);
                    setVerified(false);
                    setVerifyBanner(null);
                    setVerifyChecks([]);
                  }}
                >
                  <div className={`AC-tcard-ico ${t.type}`}>{t.icon}</div>
                  <div className="AC-tcard-name">{t.name}</div>
                  <div className="AC-tcard-sub">{t.sub}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="AC-step">
            <div className="AC-step-title">
              <span className="AC-step-num">3</span>Account ID e verificação de permissão
            </div>
            <div className="AC-id-row">
              <input
                className="ACC-id-input"
                placeholder={
                  addPlat
                    ? addPlat === "google"
                      ? "Ex: 492-381-0247"
                      : addPlat === "meta"
                        ? "Ex: act_1820394752"
                        : "Ex: adv_8834712094"
                    : "Selecione a plataforma primeiro"
                }
                style={{ flex: 1 }}
                value={addId}
                onChange={(e) => setAddId(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleVerify();
                }}
              />
              <button type="button" className={`AC-vbtn${verifying ? " loading" : ""}`} onClick={() => void handleVerify()}>
                {verifying ? (
                  <>
                    <svg className="AC-spin" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                      <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48 2.83-2.83" />
                    </svg>
                    Verificando…
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                      <circle cx="12" cy="12" r="10" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                    Verificar permissão
                  </>
                )}
              </button>
            </div>
            {(verifying || verifyBanner) && (
              <div className="AC-chkzone">
                {verifying && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "14px 16px",
                      background: "rgba(255,255,255,0.02)",
                      border: "var(--border-subtle)",
                      borderRadius: "var(--radius-sm)",
                    }}
                  >
                    <svg className="AC-spin" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                      <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48 2.83-2.83" />
                    </svg>
                    <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Conectando à plataforma e verificando permissões…</span>
                  </div>
                )}
                {verifyBanner && !verifying && (
                  <>
                    <div className={`AC-chkbanner ${verifyBanner.cls}`}>
                      {verifyBanner.cls === "ifood" ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ff7a3d" strokeWidth="2" width="20" height="20">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          <path d="m9 12 2 2 4-4" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke={verifyBanner.cls === "ok" ? "var(--color-highlight)" : "#fbbf24"} strokeWidth="2" width="20" height="20">
                          <circle cx="12" cy="12" r="10" />
                          {verifyBanner.cls === "ok" ? <path d="m9 12 2 2 4-4" /> : <path d="M12 8v4m0 4h.01" />}
                        </svg>
                      )}
                      <div className="AC-chkbanner-body">
                        <div className="AC-chkbanner-title">{verifyBanner.title}</div>
                        <div className="AC-chkbanner-sub">{verifyBanner.sub}</div>
                      </div>
                    </div>
                    {verifyChecks.length > 0 && (
                      <div className="AC-chkitems">
                        {verifyChecks.map((check) => (
                          <div key={check.label} className="AC-chkitem">
                            <div className={`AC-chkitem-dot ${check.ok ? "ok" : "fail"}`}>
                              {check.ok ? (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="9" height="9">
                                  <path d="m5 12 4 4 8-8" />
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="9" height="9">
                                  <path d="M12 8v4m0 4h.01" />
                                </svg>
                              )}
                            </div>
                            <span className="AC-chkitem-lbl">{check.label}</span>
                            <span className={`AC-chkitem-tag ${check.ok ? "ok" : "fail"}`}>{check.ok ? "Concedido" : "Pendente"}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          <div className="AC-step">
            <div className="AC-step-title">
              <span className="AC-step-num">4</span>Marcas e projetos associados
            </div>
            <div className="AC-assoc-lbl">Marcas</div>
            <div className="AC-pill-box" style={{ marginBottom: 16 }}>
              {BRAND_OPTIONS.map((brand) => (
                <button
                  key={brand}
                  type="button"
                  className={`AC-pill brand${addBrands.includes(brand) ? " on" : ""}`}
                  onClick={() => togglePill(brand, addBrands, setAddBrands)}
                >
                  {brand}
                </button>
              ))}
            </div>
            <div className="AC-assoc-lbl">Projetos</div>
            <div className="AC-pill-box">
              {PROJECT_OPTIONS.map((proj) => (
                <button
                  key={proj}
                  type="button"
                  className={`AC-pill proj${addProjects.includes(proj) ? " on" : ""}`}
                  onClick={() => togglePill(proj, addProjects, setAddProjects)}
                >
                  {proj}
                </button>
              ))}
            </div>
          </div>

          <div className="AC-save-row">
            <button type="button" className="AC-canbtn" onClick={showMain}>
              Cancelar
            </button>
            <button type="button" className="AC-savebtn" onClick={() => void handleSave()}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              Salvar conta
            </button>
          </div>
        </div>
      </div>
    );
  }

  const plats = filterPlat ? [filterPlat] : ["google", "meta", "tiktok"];
  const groups = plats
    .map((plat) => ({
      plat,
      accs: filtered.filter((a) => a.plat === plat),
    }))
    .filter((g) => g.accs.length > 0 || (!filterPlat && !filterBrand && !filterProj));

  return (
    <div className="ACCV">
      <div id="acc-main-view">
        <div className="AC-hdr">
          <div className="AC-hdr-text">
            <div className="SH">
              <span />
              Integrações
            </div>
            <h2 className="SH2">Contas de provedores</h2>
            <p className="SP" style={{ marginBottom: 0 }}>
              Contas de mídia vinculadas a este cliente — Google Ads, Meta Ads e TikTok Ads.
            </p>
          </div>
          <button className="AC-add-btn" type="button" onClick={showAdd}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nova conta
          </button>
        </div>

        <div className="AC-filterbar">
          <div className="AC-seg">
            <button type="button" className={`AC-seg-btn${filterPlat === "" ? " on" : ""}`} onClick={() => setFilterPlat("")}>
              Todas
            </button>
            <button type="button" className={`AC-seg-btn${filterPlat === "google" ? " on" : ""}`} onClick={() => setFilterPlat("google")}>
              <GoogleIcon size={13} />
              Google
            </button>
            <button type="button" className={`AC-seg-btn${filterPlat === "meta" ? " on" : ""}`} onClick={() => setFilterPlat("meta")}>
              <MetaIcon size={13} />
              Meta
            </button>
            <button type="button" className={`AC-seg-btn${filterPlat === "tiktok" ? " on" : ""}`} onClick={() => setFilterPlat("tiktok")}>
              <TikTokIcon size={13} />
              TikTok
            </button>
          </div>
          <CustomSelect
            value={filterBrand}
            onChange={setFilterBrand}
            options={BRAND_OPTIONS.map((b) => ({ value: b, label: b }))}
            placeholder="Todas as marcas"
          />
          <CustomSelect
            value={filterProj}
            onChange={setFilterProj}
            options={PROJECT_OPTIONS.map((p) => ({ value: p, label: p }))}
            placeholder="Todos os projetos"
          />
          <span className="AC-count">
            {filtered.length} conta{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="AC-groups">
          {groups.length === 0 ? (
            <div className="AC-global-empty">
              <div className="AC-global-empty-ico">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <div className="AC-global-empty-title">Nenhuma conta encontrada</div>
              <div className="AC-global-empty-sub">Ajuste os filtros ou adicione uma nova conta</div>
            </div>
          ) : (
            groups.map(({ plat, accs }) => (
              <div key={plat} className="AC-group">
                <div className="AC-ghdr">
                  <div className={`AC-ghdr-ico ${plat}`}>
                    <PlatIcon plat={plat} large />
                  </div>
                  <span className="AC-ghdr-name">{PLAT_NAMES[plat]}</span>
                  <span className="AC-ghdr-ct">
                    · {accs.length} conta{accs.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="AC-rows">
                  {accs.length === 0 ? (
                    <div className="AC-empty-grp">Nenhuma conta {PLAT_NAMES[plat]} com os filtros aplicados</div>
                  ) : (
                    <>
                      <div className="AC-rows-hdr">
                        <span>Tipo</span>
                        <span>Account ID</span>
                        <span>Marcas e projetos</span>
                        <span className="AC-rows-hdr-end">Status</span>
                      </div>
                      {accs.map((acc) => {
                      const tb = TYPE_MAP[acc.type];
                      const si = STATUS_INFO[acc.status];
                      const chips = acc.brands.map((b) => (
                        <span key={b} className="ACC-brand-tag">
                          {b}
                        </span>
                      ));
                      const projChips = acc.projects.map((p) => (
                        <span key={p} className="ACC-project-tag">
                          {p}
                        </span>
                      ));
                      return (
                        <div key={`${acc.plat}-${acc.id}`} className="AC-row">
                          <span className={`ACC-type-badge ${tb.cls}`}>{tb.txt}</span>
                          <span className="AC-row-id">{acc.id}</span>
                          <div className="AC-row-chips">
                            {chips}
                            {projChips}
                            {acc.brands.length === 0 && acc.projects.length === 0 && (
                              <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>—</span>
                            )}
                          </div>
                          <div className="AC-row-end">
                            <span className={`ACC-access-badge ${si.cls}`}>{si.txt}</span>
                          </div>
                        </div>
                      );
                    })}
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
