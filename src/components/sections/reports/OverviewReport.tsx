import type { CSSProperties } from "react";
import { useMemo } from "react";
import {
  AlertCircle,
  Briefcase,
  CheckCircle2,
  DollarSign,
  FilePlus,
  Image,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { useAppStore } from "@/store/app-store";

function initialsOf(name: string) {
  return (
    name
      .replace(/[—–-]/g, " ")
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w[0] ?? "")
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}

const BRAND_PALETTE: Record<string, string> = {
  "Coca-Cola": "#E8000B",
  "Ambev — Skol": "#F5A623",
  Heineken: "#00843D",
  "Red Bull": "#CC1E4A",
  "Smirnoff Ice": "#0052A5",
};

const BUDGET_DATA = [
  { name: "Coca-Cola", color: "var(--color-accent-light)", solid: "#a78bfa", pct: 33, val: "R$ 220K" },
  { name: "Nestlé", color: "#34d399", solid: "#34d399", pct: 24, val: "R$ 160K" },
  { name: "Heineken", color: "#60a5fa", solid: "#60a5fa", pct: 18, val: "R$ 120K" },
  { name: "Skol", color: "#fb923c", solid: "#fb923c", pct: 14, val: "R$ 95K" },
  { name: "Red Bull", color: "#94a3b8", solid: "#94a3b8", pct: 12, val: "R$ 80K" },
];

const PROJECT_DATA = [
  { name: "Coca-Cola — Reativação Premium", period: "01/05 – 30/06", status: "Ativo", color: "var(--color-highlight)", solid: "#a3e635", budget: "R$ 220K" },
  { name: "Heineken 0.0 — Lançamento Sem Álcool", period: "08/05 – 15/06", status: "Setup", color: "var(--color-accent-light)", solid: "#a78bfa", budget: "R$ 120K" },
  { name: "Ambev Skol — Fim de Semana", period: "25/04 – 31/05", status: "Faturado", color: "#fb923c", solid: "#fb923c", budget: "R$ 95K" },
  { name: "Nestlé — Comfort Foods Inverno", period: "12/05 – 15/07", status: "Contrato", color: "#60a5fa", solid: "#60a5fa", budget: "R$ 160K" },
  { name: "Red Bull — Festival Season", period: "20/04 – 30/06", status: "Negociação", color: "#94a3b8", solid: "#94a3b8", budget: "R$ 80K" },
];

const PIPELINE_STAGES = [
  { label: "Ativo", count: 1, color: "#a3e635" },
  { label: "Setup", count: 1, color: "#a78bfa" },
  { label: "Faturado", count: 1, color: "#fb923c" },
  { label: "Contrato", count: 1, color: "#60a5fa" },
  { label: "Negociação", count: 1, color: "#94a3b8" },
];

const OPP_DATA = [
  {
    title: "Audiência sazonal Inverno",
    sub: "Coca-Cola — pico de conversão em dias frios detectado nos últimos 3 anos",
    icon: TrendingUp,
    accent: "hi",
    color: "var(--color-highlight)",
    bg: "rgba(163,230,53,0.12)",
    roas: "4.8x",
    users: "~2.1MM",
    conf: "Alta",
  },
  {
    title: "Lookalike premium Heineken",
    sub: "680K usuários inativos 30–90 dias — janela de reativação identificada",
    icon: Users,
    accent: "pu",
    color: "var(--color-accent-light)",
    bg: "rgba(196,181,253,0.12)",
    roas: "5.2x",
    users: "~680K",
    conf: "Alta",
  },
  {
    title: "Janela noturna Skol",
    sub: "Heavy buyers com CPM reduzido na janela noturna de fim de semana (sex–dom 19–22h)",
    icon: AlertCircle,
    accent: "am",
    color: "#fcd34d",
    bg: "rgba(251,191,36,0.12)",
    roas: "5.8x",
    users: "~3.2MM",
    conf: "Média",
  },
  {
    title: "Red Bull gaming 18–28",
    sub: "Alta frequência de sessão — associação com momento de performance (e-sports + festivais)",
    icon: Image,
    accent: "bd",
    color: "#60a5fa",
    bg: "rgba(96,165,250,0.12)",
    roas: "4.2x",
    users: "~5.8MM",
    conf: "Média",
  },
];

const ACT_DATA = [
  { time: "hoje 14:32", color: "var(--color-highlight)", title: "Briefing confirmado", sub: "Coca-Cola Reativação Premium · R$ 220K aprovado" },
  { time: "hoje 11:08", color: "var(--color-accent-light)", title: "Nova hipótese aceita", sub: "Heineken 0.0 · Lookalike compradores de bebidas não alcoólicas premium" },
  { time: "ontem 17:45", color: "#60a5fa", title: "Contrato assinado", sub: "Nestlé Comfort Foods · início 12/05/2026" },
  { time: "ontem 09:22", color: "#fcd34d", title: "Draft criado", sub: "Skol Verão 2026 · aguardando aprovação interna" },
  { time: "17/05 16:01", color: "var(--color-highlight)", title: "Faturamento registrado", sub: "Ambev Skol Fim de Semana · nota fiscal emitida" },
  { time: "16/05 10:30", color: "#34d399", title: "7 novas oportunidades identificadas", sub: "IA detectou sinais para iFood Bebidas — ver Notificações" },
];

function BudgetDonut() {
  const radius = 56;
  const stroke = 18;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;
  const segments = BUDGET_DATA.map((b) => {
    const length = (b.pct / 100) * circumference;
    const seg = { length, gap: circumference - length, dashoffset: -offset, color: b.solid };
    offset += length;
    return seg;
  });

  return (
    <div className="OVV-donut-wrap">
      <svg className="OVV-donut" viewBox="0 0 160 160" aria-hidden="true">
        <circle cx="80" cy="80" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
        {segments.map((s, i) => (
          <circle
            key={i}
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke={s.color}
            strokeWidth={stroke}
            strokeDasharray={`${s.length} ${s.gap}`}
            strokeDashoffset={s.dashoffset}
            transform="rotate(-90 80 80)"
            strokeLinecap="butt"
            style={{ animation: `ovv-donut-in .9s cubic-bezier(.16,1,.3,1) both`, animationDelay: `${0.1 + i * 0.08}s` } as CSSProperties}
          />
        ))}
        <text x="80" y="74" textAnchor="middle" className="OVV-donut-currency">R$</text>
        <text x="80" y="98" textAnchor="middle" className="OVV-donut-val">675K</text>
        <text x="80" y="116" textAnchor="middle" className="OVV-donut-lbl">budget total</text>
      </svg>
      <div className="OVV-donut-legend">
        {BUDGET_DATA.map((b) => (
          <div className="OVV-donut-leg-row" key={b.name}>
            <span className="OVV-donut-leg-dot" style={{ background: b.solid }} />
            <span className="OVV-donut-leg-name">{b.name}</span>
            <span className="OVV-donut-leg-pct">{b.pct}%</span>
            <span className="OVV-donut-leg-val">{b.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PipelineBar() {
  const total = PIPELINE_STAGES.reduce((s, x) => s + x.count, 0);
  return (
    <div className="OVV-pipeline-wrap">
      <div className="OVV-pipeline-bar">
        {PIPELINE_STAGES.map((s, i) => (
          <div
            key={s.label}
            className="OVV-pipeline-seg"
            style={{ "--seg-width": `${(s.count / total) * 100}%`, background: s.color, animationDelay: `${0.15 + i * 0.07}s` } as CSSProperties}
            title={`${s.label}: ${s.count}`}
          >
            <span className="OVV-pipeline-seg-num">{s.count}</span>
          </div>
        ))}
      </div>
      <div className="OVV-pipeline-legend">
        {PIPELINE_STAGES.map((s) => (
          <div className="OVV-pipeline-leg" key={s.label}>
            <span className="OVV-pipeline-leg-dot" style={{ background: s.color, boxShadow: `0 0 6px ${s.color}` }} />
            <span className="OVV-pipeline-leg-lbl">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function OverviewReport() {
  const currentBu = useAppStore((s) => s.currentBu);
  const currentBrands = useAppStore((s) => s.currentBrands);

  const brandCount = currentBrands.length || 5;
  const buSubtitle = useMemo(() => `${currentBu} · ${brandCount} marcas`, [currentBu, brandCount]);

  return (
    <>
      <div className="OVV-page-head">
        <div className="SH">
          <span />
          Dashboard
        </div>
        <h2 className="SH2">Visão Geral</h2>
        <p className="SP">Resumo operacional da conta — marcas, projetos e oportunidades identificadas.</p>
      </div>

      {/* Hero KPI tiles */}
      <div className="OVV-kpi-strip">
        <div className="OVV-kpi-tile bd" style={{ "--kpi-i": 0 } as CSSProperties}>
          <div className="OVV-kpi-ico"><Briefcase size={18} strokeWidth={2.2} /></div>
          <div className="OVV-kpi-num">5</div>
          <div className="OVV-kpi-lbl">projetos em andamento</div>
          <div className="OVV-kpi-foot"><CheckCircle2 size={11} /> 2 ativos · 3 em setup</div>
        </div>
        <div className="OVV-kpi-tile em" style={{ "--kpi-i": 1 } as CSSProperties}>
          <div className="OVV-kpi-ico"><Sparkles size={18} strokeWidth={2.2} /></div>
          <div className="OVV-kpi-num">7</div>
          <div className="OVV-kpi-lbl">oportunidades novas</div>
          <div className="OVV-kpi-foot"><TrendingUp size={11} /> identificadas pela IA</div>
        </div>
        <div className="OVV-kpi-tile pu" style={{ "--kpi-i": 2 } as CSSProperties}>
          <div className="OVV-kpi-ico"><DollarSign size={18} strokeWidth={2.2} /></div>
          <div className="OVV-kpi-num"><span className="OVV-kpi-currency">R$</span>675K</div>
          <div className="OVV-kpi-lbl">budget total</div>
          <div className="OVV-kpi-foot">distribuído em 5 marcas</div>
        </div>
        <div className="OVV-kpi-tile am" style={{ "--kpi-i": 3 } as CSSProperties}>
          <div className="OVV-kpi-ico"><FilePlus size={18} strokeWidth={2.2} /></div>
          <div className="OVV-kpi-num">3</div>
          <div className="OVV-kpi-lbl">drafts pendentes</div>
          <div className="OVV-kpi-foot">aguardando aprovação interna</div>
        </div>
      </div>

      <div className="OVV-bento">
        {/* Donut budget */}
        <div className="OVV-card OVV-span-5" style={{ "--ovv-i": 0 } as CSSProperties}>
          <div className="OVV-card-head">
            <div>
              <div className="OVV-card-eyebrow">Distribuição</div>
              <div className="OVV-card-title">Budget por marca</div>
            </div>
            <span className="OVV-card-tag">5 marcas</span>
          </div>
          <div className="OVV-card-body">
            <BudgetDonut />
          </div>
        </div>

        {/* Pipeline + project rows */}
        <div className="OVV-card OVV-span-7" style={{ "--ovv-i": 1 } as CSSProperties}>
          <div className="OVV-card-head">
            <div>
              <div className="OVV-card-eyebrow">Pipeline</div>
              <div className="OVV-card-title">Projetos em andamento</div>
            </div>
            <span className="OVV-card-tag bd">5 projetos</span>
          </div>
          <div className="OVV-card-body">
            <PipelineBar />
            <div className="OVV-proj-list">
              {PROJECT_DATA.map((p) => (
                <div className="OVV-proj-row" key={p.name}>
                  <div className="OVV-proj-accent" style={{ background: p.color }} />
                  <div className="OVV-proj-name">{p.name}</div>
                  <span className="OVV-proj-date">{p.period}</span>
                  <span
                    className="OVV-proj-status"
                    style={{
                      color: p.solid,
                      borderColor: `${p.solid}55`,
                      background: `${p.solid}1a`,
                    }}
                  >
                    {p.status}
                  </span>
                  <div className="OVV-proj-budget">{p.budget}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Oportunidades */}
        <div className="OVV-card OVV-span-7" style={{ "--ovv-i": 2 } as CSSProperties}>
          <div className="OVV-card-head">
            <div>
              <div className="OVV-card-eyebrow">Inteligência</div>
              <div className="OVV-card-title">Oportunidades identificadas</div>
            </div>
            <span className="OVV-card-tag em">7 esta semana</span>
          </div>
          <div className="OVV-card-body">
            <div className="OVV-opp-grid">
              {OPP_DATA.map((o, i) => {
                const Icon = o.icon;
                return (
                  <div className={`OVV-opp-tile ${o.accent}`} key={o.title} style={{ "--opp-i": i } as CSSProperties}>
                    <div className="OVV-opp-tile-hd">
                      <div className="OVV-opp-tile-ico" style={{ background: o.bg, color: o.color }}>
                        <Icon size={16} strokeWidth={2} />
                      </div>
                      <div className="OVV-opp-tile-roas">
                        <span className="OVV-opp-tile-roas-val" style={{ color: o.color }}>{o.roas}</span>
                        <span className="OVV-opp-tile-roas-lbl">ROAS</span>
                      </div>
                    </div>
                    <div className="OVV-opp-tile-title">{o.title}</div>
                    <div className="OVV-opp-tile-sub">{o.sub}</div>
                    <div className="OVV-opp-tile-foot">
                      <span className="OVV-opp-tile-stat"><Users size={10} strokeWidth={2.2} />{o.users}</span>
                      <span className="OVV-opp-tile-stat">Confiança {o.conf}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Marcas ativas */}
        <div className="OVV-card OVV-span-5" style={{ "--ovv-i": 3 } as CSSProperties}>
          <div className="OVV-card-head">
            <div>
              <div className="OVV-card-eyebrow">{currentBu}</div>
              <div className="OVV-card-title">Marcas ativas</div>
            </div>
            <span className="OVV-card-tag pu">{buSubtitle}</span>
          </div>
          <div className="OVV-card-body">
            <div className="OVV-brand-grid">
              {currentBrands.map((brand) => {
                const color = BRAND_PALETTE[brand] ?? "var(--color-accent-light)";
                return (
                  <div className="OVV-brand-tile" key={brand}>
                    <span className="OVV-brand-tile-av" style={{ background: color }}>
                      {initialsOf(brand)}
                    </span>
                    <div className="OVV-brand-tile-info">
                      <div className="OVV-brand-tile-name">{brand}</div>
                      <div className="OVV-brand-tile-meta">ativa</div>
                    </div>
                    <span className="OVV-brand-tile-dot" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="OVV-card OVV-span-8" style={{ "--ovv-i": 4 } as CSSProperties}>
          <div className="OVV-card-head">
            <div>
              <div className="OVV-card-eyebrow">Histórico</div>
              <div className="OVV-card-title">Atividade recente</div>
            </div>
            <span className="OVV-card-tag">últimos 7 dias</span>
          </div>
          <div className="OVV-card-body">
            <div className="OVV-timeline">
              {ACT_DATA.map((act, i) => (
                <div className="OVV-act-row" key={i} style={{ "--act-i": i } as CSSProperties}>
                  <div className="OVV-act-time">{act.time}</div>
                  <div className="OVV-act-dot" style={{ background: act.color, boxShadow: `0 0 8px ${act.color}` }} />
                  <div className="OVV-act-body">
                    <div className="OVV-act-title">{act.title}</div>
                    <div className="OVV-act-sub">{act.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Drafts */}
        <div className="OVV-card OVV-span-4" style={{ "--ovv-i": 5 } as CSSProperties}>
          <div className="OVV-card-head">
            <div>
              <div className="OVV-card-eyebrow">Em produção</div>
              <div className="OVV-card-title">Drafts pendentes</div>
            </div>
            <span className="OVV-card-tag am">3 drafts</span>
          </div>
          <div className="OVV-card-body">
            <div className="OVV-draft-list">
              {[
                { name: "Skol Verão 2026", date: "ontem" },
                { name: "Coke Zero — Lançamento SP", date: "15/05" },
                { name: "Red Bull — Back to School", date: "12/05" },
              ].map((d) => (
                <div className="OVV-draft-row" key={d.name}>
                  <span className="OVV-draft-dot" />
                  <div className="OVV-draft-name">{d.name}</div>
                  <div className="OVV-draft-date">{d.date}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
