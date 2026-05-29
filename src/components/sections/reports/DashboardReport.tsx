import { useEffect, useMemo } from "react";
import {
  ArrowDown,
  Award,
  ChevronDown,
  DollarSign,
  Eye,
  FileText,
  Image as ImageIcon,
  Lightbulb,
  Play,
  ShoppingCart,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { Reveal } from "@/hooks/useScrollReveal";
import {
  CR_COLORS,
  PROJECT_DATA,
  SCALE_TILE_COLORS,
  STATUS_LABELS,
  dashboardProjects,
} from "@/mocks/data";
import { useAppStore } from "@/store/app-store";
import { AreaChart } from "./AreaChart";

const INSIGHT_ICON_MAP = {
  gr: TrendingUp,
  pu: Target,
  am: Lightbulb,
  bl: Users,
} as const;

const CREATIVE_ICONS = [ImageIcon, Play, FileText];

function StatusBadge({ projectIndex }: { projectIndex: number }) {
  const project = dashboardProjects[projectIndex];
  if (!project) return null;
  return (
    <div className={`PS-badge ${project.status}`} id="ps-badge-dash">
      <span className="PS-dot" />
      <span className="PS-lbl">{STATUS_LABELS[project.status]}</span>
    </div>
  );
}

export function DashboardReport() {
  const projectIndex = useAppStore((s) => s.projectIndex);
  const d = PROJECT_DATA[projectIndex] ?? PROJECT_DATA[0];

  const budgetDash = useMemo(() => {
    const C = 534.07;
    const da = (C * d.budgetDonutPct) / 100;
    return `${da.toFixed(1)} ${(C - da).toFixed(1)}`;
  }, [d.budgetDonutPct]);

  useEffect(() => {
    const t = setTimeout(() => {
      document.querySelectorAll("#platform-bars .PF[data-w]").forEach((el, i) => {
        const node = el as HTMLElement;
        node.style.width = `${node.getAttribute("data-w")}%`;
        node.style.transitionDelay = `${i * 0.18}s`;
      });
    }, 600);
    return () => clearTimeout(t);
  }, [projectIndex, d.platforms]);

  return (
    <>
      <section className="SL2">
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 32 }}>
          <div className="OL" id="rpt-period">
            <span />
            {d.period}
          </div>
          <StatusBadge projectIndex={projectIndex} />
        </div>
        <h1>
          Sua campanha gerou
          <br />
          <em id="rpt-hero-orders">{d.heroOrders}</em>
          <br />
          que não existiriam
          <br />
          sem a Advolve.
        </h1>
        <p className="HSB">
          Impacto real medido por incrementalidade — vendas que só aconteceram porque a campanha existiu.
        </p>
        <div className="HSC">
          <ChevronDown size={16} strokeWidth={2} />
          Role para ver os resultados
        </div>
        <div className="hero-float" id="hero-float">
          <div className="hf-card">
            <div className="hf-label">Pedidos Incrementais</div>
            <div className="hf-value pu">{d.hfIncrVal}</div>
            <div className="hf-delta">
              <TrendingUp size={14} strokeWidth={2} />
              vs. linha de base
            </div>
          </div>
          <div className="hf-card">
            <div className="hf-label">ROAS da Campanha</div>
            <div className="hf-value gr">{d.hfRoasVal}</div>
            <div className="hf-delta">
              <TrendingUp size={14} strokeWidth={2} />
              {d.hfRoasDelta}
            </div>
          </div>
          <div className="hf-card">
            <div className="hf-label">Redução de CAC</div>
            <div className="hf-value gr">{d.hfCacVal}</div>
            <div className="hf-delta">
              <TrendingUp size={14} strokeWidth={2} />
              {d.hfCacDelta}
            </div>
          </div>
        </div>
      </section>

      <div className="SEP" />

      <section className="dash-section compact">
        <Reveal>
          <div style={{ marginBottom: 32 }}>
            <div className="SH">
              <span />
              Números da campanha
            </div>
            <h2 className="SH2">Performance que fala por si.</h2>
          </div>
        </Reveal>
        <div className="BNG" id="big-numbers-grid">
          <Reveal delay={0.1}>
            <div className="BN">
              <div className="BNL">
                <Eye size={16} strokeWidth={2} />
                Impressões
              </div>
              <div className="BNV">
                <em>{d.bnImpVal}</em>
              </div>
              <div className="BNC">Alcance total em todas as plataformas ativas.</div>
              <div className="BND">
                <TrendingUp size={14} strokeWidth={2} />
                {d.bnImpDelta}
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="BN">
              <div className="BNL">
                <ShoppingCart size={16} strokeWidth={2} />
                Pedidos Totais
              </div>
              <div className="BNV">
                <em>{d.bnOrdVal}</em>
              </div>
              <div className="BNC">Conversões mensuradas dentro do app. Closed loop.</div>
              <div className="BND">
                <TrendingUp size={14} strokeWidth={2} />
                {d.bnOrdDelta}
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="BN">
              <div className="BNL">
                <DollarSign size={16} strokeWidth={2} />
                ROAS
              </div>
              <div className="BNV G">
                <em>{d.bnRoasVal}</em>
              </div>
              <div className="BNC">{d.bnRoasSub}</div>
              <div className="BND">
                <TrendingUp size={14} strokeWidth={2} />
                {d.bnRoasDelta}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <div className="SEP" />

      <section className="NR">
        <Reveal className="NRT">
          <div className="NRO">
            <span />
            Eficiência
          </div>
          <h2 id="cac-h2">
            O CAC caiu
            <br />
            <span className="G">{d.cacPct}</span> — de
            <br />
            {d.cacBefore} para
            <br />
            {d.cacAfter}.
          </h2>
          <p id="cac-p">
            A otimização contínua pela IA da Advolve reduziu o custo de aquisição ao menor nível dos últimos 6
            meses. Economia acumulada: {d.cacSavings}.
          </p>
        </Reveal>
        <Reveal className="NRV" delay={0.2}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 32 }}>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: 80,
                    height: 160,
                    background: "rgba(255,255,255,0.04)",
                    borderRadius: "var(--radius-sm)",
                    position: "relative",
                    overflow: "hidden",
                    border: "var(--border-subtle)",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      width: "100%",
                      height: "100%",
                      background: "linear-gradient(to top,rgba(248,113,113,0.22),rgba(248,113,113,0.06))",
                      borderRadius: "var(--radius-sm)",
                    }}
                  />
                </div>
                <div
                  id="cac-bar-before"
                  style={{
                    marginTop: 10,
                    fontFamily: "var(--font-mono)",
                    fontSize: 18,
                    fontWeight: 600,
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {d.cacBefore}
                </div>
                <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 2 }}>Antes</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: 80,
                    height: 160,
                    background: "rgba(255,255,255,0.04)",
                    borderRadius: "var(--radius-sm)",
                    position: "relative",
                    overflow: "hidden",
                    border: "var(--border-subtle)",
                  }}
                >
                  <div
                    id="cac-bar-fill"
                    style={{
                      position: "absolute",
                      bottom: 0,
                      width: "100%",
                      height: `${d.cacBarPct}%`,
                      background: "linear-gradient(to top,rgba(163,230,53,0.22),rgba(163,230,53,0.06))",
                      borderRadius: "var(--radius-sm)",
                    }}
                  />
                </div>
                <div
                  id="cac-bar-after"
                  style={{
                    marginTop: 10,
                    fontFamily: "var(--font-mono)",
                    fontSize: 18,
                    fontWeight: 600,
                    color: "var(--color-highlight)",
                  }}
                >
                  {d.cacAfter}
                </div>
                <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 2 }}>Agora</div>
              </div>
            </div>
            <div
              id="cac-badge"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(163,230,53,0.09)",
                border: "1px solid rgba(163,230,53,0.16)",
                padding: "8px 20px",
                borderRadius: 100,
                fontSize: 14,
                fontWeight: 600,
                color: "var(--color-highlight)",
                boxShadow: "0 0 20px rgba(163,230,53,0.1)",
              }}
            >
              <ArrowDown size={16} strokeWidth={2} />−{d.cacPct} no CAC
            </div>
          </div>
        </Reveal>
      </section>

      <div className="SEP" />

      <section className="NR" style={{ flexDirection: "row-reverse" }}>
        <Reveal className="NRT">
          <div className="NRO">
            <span />
            Orçamento
          </div>
          <h2 id="budget-h2">
            <span className="G">{d.budgetWaste}</span> menos
            <br />
            desperdício de
            <br />
            budget.
          </h2>
          <p id="budget-p">
            O agente realocou investimento de audiências de baixa performance para as com ROAS acima de 4x em tempo
            real. {d.budgetAmount} que seriam perdidos foram redirecionados para conversões reais.
          </p>
        </Reveal>
        <Reveal className="NRV" delay={0.2}>
          <div style={{ textAlign: "center" }}>
            <div style={{ position: "relative", width: 200, height: 200, margin: "0 auto" }}>
              <svg viewBox="0 0 200 200" style={{ width: 200, height: 200 }}>
                <circle cx="100" cy="100" r="85" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="16" />
                <circle
                  cx="100"
                  cy="100"
                  r="85"
                  fill="none"
                  stroke="url(#grd)"
                  strokeWidth="16"
                  id="budget-donut-circle"
                  strokeDasharray={budgetDash}
                  strokeDashoffset="133.5"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="grd" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#A3E635" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
                <text
                  id="budget-donut-pct"
                  x="100"
                  y="92"
                  textAnchor="middle"
                  fill="var(--color-text-primary)"
                  fontFamily="var(--font-display)"
                  fontSize="36"
                  fontWeight="800"
                >
                  {d.budgetDonutPct}%
                </text>
                <text x="100" y="116" textAnchor="middle" fill="var(--color-text-secondary)" fontFamily="var(--font-body)" fontSize="13">
                  investido com eficiência
                </text>
              </svg>
            </div>
            <div id="budget-before" style={{ marginTop: 16, fontSize: 13, color: "var(--color-text-muted)" }}>
              Antes: apenas {d.budgetBefore} do budget era eficiente
            </div>
          </div>
        </Reveal>
      </section>

      <div className="SEP" />

      <section className="NR">
        <Reveal className="NRT">
          <div className="NRO">
            <span />
            Distribuição
          </div>
          <h2>
            Budget otimizado
            <br />
            entre <em>3 plataformas</em>
            <br />
            em tempo real.
          </h2>
          <p>O agente de IA realoca budget automaticamente priorizando onde o ROAS é maior e o CAC menor.</p>
        </Reveal>
        <Reveal className="NRV" delay={0.2}>
          <div style={{ width: "100%", maxWidth: 440 }}>
            <div className="PB" id="platform-bars">
              {d.platforms.map((pl) => (
                <div className="PR" key={pl.n}>
                  <div className="PN">{pl.n}</div>
                  <div className="PT">
                    <div
                      className="PF"
                      data-w={pl.p}
                      style={{
                        width: "0%",
                        background: pl.c,
                        color: pl.t || undefined,
                      }}
                    >
                      {pl.p}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="CW">
              <h3>Evolução semanal — pedidos</h3>
              <AreaChart />
            </div>
          </div>
        </Reveal>
      </section>

      <div className="SEP" />

      <section className="dash-section">
        <Reveal>
          <div className="SH">
            <span />
            Criativos
          </div>
          <h2 className="SH2">
            3 criativos concentram
            <br />
            <span style={{ color: "var(--color-accent-light)" }}>78% das conversões.</span>
          </h2>
          <p className="SP">
            Gerados e otimizados com IA — cada peça testada em múltiplos formatos e audiências automaticamente.
          </p>
        </Reveal>
        <div className="CG" id="creatives-grid">
          {d.creatives.map((cr, i) => {
            const Icon = CREATIVE_ICONS[i] ?? FileText;
            return (
              <Reveal key={cr.n} delay={0.15 + i * 0.1}>
                <div className={`CC${i === 0 ? " ft" : ""}`}>
                  <div className="CH">
                    <div className="CHB" style={{ background: CR_COLORS[i] }} />
                    <div className="CR">
                      <Award size={12} strokeWidth={2} /> #{i + 1}
                    </div>
                    <Icon size={32} strokeWidth={2} />
                  </div>
                  <div className="CB">
                    <h4>{cr.n}</h4>
                    <div className="csub">{cr.t}</div>
                    <div className="CSG">
                      <div className="CS">
                        <div className="cl">CTR</div>
                        <div className="cv">{cr.ctr}</div>
                      </div>
                      <div className="CS">
                        <div className="cl">ROAS</div>
                        <div className="cv pu">
                          {cr.roas}
                        </div>
                      </div>
                      <div className="CS">
                        <div className="cl">Conversões</div>
                        <div className="cv">{cr.conv}</div>
                      </div>
                      <div className="CS">
                        <div className="cl">Rank</div>
                        <div className="cv" style={{ color: "var(--color-highlight)" }}>
                          Top {i + 1}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      <div className="SEP" />

      <section className="dash-section">
        <Reveal>
          <div className="SH">
            <span />
            Insights
          </div>
          <h2 className="SH2">
            O que os dados
            <br />
            estão <span style={{ color: "var(--color-highlight)" }}>nos dizendo.</span>
          </h2>
          <p className="SP">
            Recomendações acionáveis geradas pelo agente de IA a partir dos resultados da campanha.
          </p>
        </Reveal>
        <div className="IL" id="insights-list">
          {d.insights.map((ins, i) => {
            const Icon = INSIGHT_ICON_MAP[ins.c];
            return (
              <Reveal key={ins.t} delay={0.1 + i * 0.1}>
                <div className={`II ${ins.c}`}>
                  <div className="IIC">
                    <Icon size={18} strokeWidth={2} />
                  </div>
                  <div className="IB">
                    <h4>{ins.t}</h4>
                    <p>{ins.d}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      <div className="SEP" />

      <section className="NR" style={{ flexDirection: "row-reverse" }}>
        <Reveal className="NRT">
          <div className="NRO">
            <span />
            Escala criativa
          </div>
          <h2 id="scale-h2">
            <span className="G">{d.scaleMult}</span> mais
            <br />
            variações criativas
            <br />
            geradas com IA.
          </h2>
          <p id="scale-p">
            O sistema de multi-agents da Advolve gerou e testou {d.scaleTotal} variações de anúncios a partir de{" "}
            {d.scaleBase} peças base, distribuindo automaticamente entre formatos, canais e audiências.
          </p>
        </Reveal>
        <Reveal className="NRV" delay={0.2}>
          <div
            id="creative-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,52px)",
              gap: 10,
              transform: "rotate(-3deg)",
            }}
          >
            {Array.from({ length: 16 }, (_, i) => (
              <div
                key={i}
                style={{
                  width: 52,
                  height: 68,
                  borderRadius: 8,
                  border: "var(--border-default)",
                  animation: `fu .4s ${0.3 + i * 0.05}s ease-out both`,
                  backdropFilter: "blur(4px)",
                  background: `linear-gradient(${135 + i * 15}deg, ${SCALE_TILE_COLORS[i % 6]}, rgba(255,255,255,0.02))`,
                  opacity: 0.45 + (i % 4) * 0.14,
                }}
              />
            ))}
          </div>
        </Reveal>
      </section>

      <div className="SEP" />

      <section className="CT">
        <div className="halo-wrap">
          <div className="halo h1a" />
          <div className="halo h2a" />
          <div className="halo h3a" />
        </div>
        <Reveal>
          <h2>
            Dados viram inteligência.
            <br />
            <em>Inteligência vira performance.</em>
          </h2>
          <p>Powered by iFood. Automated by Advolve.</p>
          <div className="CTB">
            <Zap size={14} strokeWidth={2} color="var(--color-highlight)" />
            Campanha ativa · Otimização em tempo real
          </div>
        </Reveal>
      </section>
    </>
  );
}
