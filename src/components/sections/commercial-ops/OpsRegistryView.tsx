import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  ChevronRight,
  Mail,
  Phone,
  Plus,
  Tag,
  User,
} from "lucide-react";
import {
  addBrandToBu,
  createContact,
  getAllManagedProjects,
  getBuRecords,
  getContacts,
} from "@/mocks/handlers";
import type { BuRecord, ContactPerson, ManagedProject } from "@/mocks/types";
import { COMMERCIAL_STATUS_LABELS } from "@/lib/commercial-status";
import { useAppStore } from "@/store/app-store";

type ClientDetailTab = "dados" | "projetos";

interface ClientDetail {
  record: BuRecord;
  contacts: ContactPerson[];
  projects: ManagedProject[];
}

export function OpsRegistryView() {
  const setCommercialOpsView = useAppStore((s) => s.setCommercialOpsView);
  const setOpsSelectedProjectId = useAppStore((s) => s.setOpsSelectedProjectId);

  const [buRecords, setBuRecords] = useState<BuRecord[]>([]);
  const [allContacts, setAllContacts] = useState<ContactPerson[]>([]);
  const [allProjects, setAllProjects] = useState<ManagedProject[]>([]);
  const [selected, setSelected] = useState<ClientDetail | null>(null);
  const [detailTab, setDetailTab] = useState<ClientDetailTab>("dados");

  /* edit state */
  const [editName, setEditName] = useState("");
  const [editCnpj, setEditCnpj] = useState("");
  const [editTipo, setEditTipo] = useState("");
  const [brandInput, setBrandInput] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const [bus, cts, projs] = await Promise.all([
      getBuRecords(),
      getContacts(),
      getAllManagedProjects(),
    ]);
    setBuRecords(bus);
    setAllContacts(cts);
    setAllProjects(projs);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function openClient(record: BuRecord) {
    const contacts = allContacts.filter((c) => c.bu === record.bu);
    const projects = allProjects.filter((p) => p.bu === record.bu);
    setSelected({ record, contacts, projects });
    setEditName(record.bu);
    setEditCnpj(record.cnpj ?? "");
    setEditTipo(record.tipo ?? "");
    setDetailTab("dados");
  }

  function closeClient() {
    setSelected(null);
    setBrandInput("");
    setContactName("");
    setContactEmail("");
    setContactPhone("");
  }

  async function handleAddBrand() {
    if (!selected || !brandInput.trim()) return;
    setSaving(true);
    await addBrandToBu(selected.record.bu, brandInput.trim());
    setBrandInput("");
    await load();
    const fresh = (await getBuRecords()).find((r) => r.bu === selected.record.bu);
    if (fresh) {
      setSelected((prev) =>
        prev ? { ...prev, record: fresh } : prev,
      );
    }
    setSaving(false);
  }

  async function handleAddContact() {
    if (!selected || !contactName.trim()) return;
    setSaving(true);
    await createContact({
      name: contactName.trim(),
      email: contactEmail.trim(),
      phone: contactPhone || undefined,
      bu: selected.record.bu,
      brands: [],
    });
    setContactName("");
    setContactEmail("");
    setContactPhone("");
    await load();
    const freshContacts = (await getContacts()).filter((c) => c.bu === selected.record.bu);
    setSelected((prev) => (prev ? { ...prev, contacts: freshContacts } : prev));
    setSaving(false);
  }

  /* ── List view ── */
  if (!selected) {
    return (
      <div className="OPS-view OPS-registry">
        <div className="CL-toolbar">
          <h3 className="CL-title">Clientes cadastrados</h3>
          <button
            type="button"
            className="OPS-btn OPS-btn-primary"
            onClick={() => setCommercialOpsView("new-client")}
          >
            <Plus size={14} />
            Novo cliente
          </button>
        </div>

        {buRecords.length === 0 ? (
          <p className="OPS-muted">Nenhum cliente cadastrado ainda.</p>
        ) : (
          <div className="CL-list">
            {/* Header */}
            <div className="CL-list-hdr">
              <span className="CL-col-name">Cliente</span>
              <span className="CL-col-cnpj">CNPJ</span>
              <span className="CL-col-tipo">Tipo</span>
              <span className="CL-col-marcas">Marcas</span>
              <span className="CL-col-contatos">Contatos</span>
              <span className="CL-col-action" />
            </div>
            {buRecords.map((r) => (
              <button
                key={r.bu}
                type="button"
                className="CL-list-row"
                onClick={() => openClient(r)}
              >
                <span className="CL-col-name">
                  <span className="CL-client-icon">
                    <Building2 size={14} strokeWidth={2} />
                  </span>
                  <strong>{r.bu}</strong>
                </span>
                <span className="CL-col-cnpj">{r.cnpj ?? "—"}</span>
                <span className="CL-col-tipo">
                  {r.tipo ? (
                    <span className="CL-tipo-badge">{r.tipo}</span>
                  ) : (
                    <span className="CL-muted">—</span>
                  )}
                </span>
                <span className="CL-col-marcas">
                  <span className="CL-count-badge">{r.brands.length}</span>
                </span>
                <span className="CL-col-contatos">
                  <span className="CL-count-badge">{r.contactIds.length}</span>
                </span>
                <span className="CL-col-action">
                  <ChevronRight size={14} strokeWidth={2} />
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ── Detail view ── */
  const { record, contacts, projects } = selected;
  return (
    <div className="OPS-view OPS-registry">
      <button type="button" className="CL-back" onClick={closeClient}>
        <ArrowLeft size={14} strokeWidth={2} />
        Voltar para clientes
      </button>

      <div className="CL-detail-header">
        <div className="CL-detail-icon">
          <Building2 size={22} strokeWidth={1.75} />
        </div>
        <div>
          <h3 className="CL-detail-name">{record.bu}</h3>
          {record.cnpj && <p className="CL-detail-cnpj">CNPJ {record.cnpj}</p>}
        </div>
      </div>

      {/* Tabs */}
      <div className="OPS-tabs">
        <button
          type="button"
          className={`OPS-tab${detailTab === "dados" ? " on" : ""}`}
          onClick={() => setDetailTab("dados")}
        >
          Dados do cliente
        </button>
        <button
          type="button"
          className={`OPS-tab${detailTab === "projetos" ? " on" : ""}`}
          onClick={() => setDetailTab("projetos")}
        >
          Projetos ({projects.length})
        </button>
      </div>

      {detailTab === "dados" && (
        <div className="CL-detail-body">
          {/* Informações básicas */}
          <div className="CL-section">
            <h4 className="CL-section-title">Informações</h4>
            <div className="CL-fields">
              <label className="OPS-field">
                Nome do cliente
                <input value={editName} onChange={(e) => setEditName(e.target.value)} />
              </label>
              <label className="OPS-field">
                CNPJ
                <input
                  value={editCnpj}
                  placeholder="XX.XXX.XXX/XXXX-XX"
                  onChange={(e) => setEditCnpj(e.target.value)}
                />
              </label>
              <label className="OPS-field">
                Tipo
                <select
                  className="OPS-select"
                  value={editTipo}
                  onChange={(e) => setEditTipo(e.target.value)}
                  style={{ width: "100%", height: "44px", borderRadius: "var(--radius-sm)" }}
                >
                  <option value="">Selecionar tipo…</option>
                  <option value="Agência">Agência</option>
                  <option value="Indústria">Indústria</option>
                  <option value="BU iFood">BU iFood</option>
                </select>
              </label>
            </div>
          </div>

          {/* Marcas */}
          <div className="CL-section">
            <h4 className="CL-section-title">Marcas</h4>
            <div className="OPS-tag-row" style={{ marginBottom: "10px" }}>
              {record.brands.length === 0 ? (
                <span className="CL-muted">Nenhuma marca cadastrada</span>
              ) : (
                record.brands.map((b) => (
                  <span key={b} className="OPS-tag">
                    <Tag size={10} strokeWidth={2} />
                    {b}
                  </span>
                ))
              )}
            </div>
            <div className="CL-inline-add">
              <input
                placeholder="Nome da marca"
                value={brandInput}
                onChange={(e) => setBrandInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void handleAddBrand();
                  }
                }}
              />
              <button
                type="button"
                className="OPS-btn OPS-btn-primary OPS-btn-sm"
                disabled={!brandInput.trim() || saving}
                onClick={() => void handleAddBrand()}
              >
                <Plus size={13} />
                Adicionar
              </button>
            </div>
          </div>

          {/* Contatos */}
          <div className="CL-section">
            <h4 className="CL-section-title">Contatos comerciais</h4>
            {contacts.length === 0 ? (
              <p className="CL-muted">Nenhum contato cadastrado.</p>
            ) : (
              <div className="CL-contacts-list">
                {contacts.map((c) => (
                  <div key={c.id} className="CL-contact-card">
                    <div className="CL-contact-icon">
                      <User size={14} strokeWidth={2} />
                    </div>
                    <div className="CL-contact-info">
                      <span className="CL-contact-name">{c.name}</span>
                      {c.email && (
                        <span className="CL-contact-meta">
                          <Mail size={10} strokeWidth={2} />
                          {c.email}
                        </span>
                      )}
                      {c.phone && (
                        <span className="CL-contact-meta">
                          <Phone size={10} strokeWidth={2} />
                          {c.phone}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="CL-contact-form">
              <h5 className="CL-contact-form-title">Novo contato</h5>
              <div className="CL-fields">
                <label className="OPS-field">
                  Nome
                  <input
                    placeholder="Nome completo"
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
              <button
                type="button"
                className="OPS-btn OPS-btn-primary"
                disabled={!contactName.trim() || saving}
                onClick={() => void handleAddContact()}
              >
                <Plus size={14} />
                Adicionar contato
              </button>
            </div>
          </div>
        </div>
      )}

      {detailTab === "projetos" && (
        <div className="CL-detail-body">
          {projects.length === 0 ? (
            <p className="CL-muted">Nenhum projeto encontrado para este cliente.</p>
          ) : (
            <div className="CL-projects-list">
              {projects.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="CL-project-row"
                  onClick={() => {
                    setCommercialOpsView("projects");
                    setOpsSelectedProjectId(p.id);
                  }}
                >
                  <div className="CL-project-info">
                    <span className="CL-project-name">{p.name}</span>
                    <span className="CL-project-brands">{p.brands.join(" · ")}</span>
                  </div>
                  <div className="CL-project-meta">
                    <span className={`PA-badge ${p.status}`}>
                      {COMMERCIAL_STATUS_LABELS[p.status as keyof typeof COMMERCIAL_STATUS_LABELS] ?? p.statusLabel}
                    </span>
                    <span className="CL-project-budget">{p.budget}</span>
                  </div>
                  <ChevronRight size={14} strokeWidth={2} className="CL-project-arrow" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
