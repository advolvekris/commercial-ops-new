import { managedProjectsSeed } from "@/mocks/data";
import type { PlannerPreload } from "@/store/app-store";

export interface Opportunity {
  id: string;
  type: "scale" | "seasonal";
  title: string;
  description: string;
  meta: string;
  pill: string;
  pillColor: "gr" | "cy";
  ctaLabel: string;
  preload: PlannerPreload;
}

export function buildOpportunities(bu: string, brands: string[]): Opportunity[] {
  const opportunities: Opportunity[] = [];

  const activeProjects = managedProjectsSeed.filter(
    (p) => p.bu === bu && p.status === "pa-ativo",
  );

  for (const project of activeProjects) {
    if (!project.perf) continue;

    const roasMetric = project.perf.metrics.find((m) =>
      m.lbl.toLowerCase().includes("roas"),
    );
    if (roasMetric) {
      const projectBrands = brands.length > 0
        ? project.brands.filter((b) => brands.includes(b))
        : project.brands;

      opportunities.push({
        id: `scale-${project.id}`,
        type: "scale",
        title: `Oportunidade de escala: ${project.name}`,
        description: `${project.name} apresenta ${roasMetric.val} — ${roasMetric.meta}. Aumentar budget pode gerar pedidos incrementais adicionais.`,
        meta: `Detectado agora · ${project.brands.join(", ")} · ${project.midia?.canais.join(", ") ?? "Mídia"}`,
        pill: `ROAS ${roasMetric.val}`,
        pillColor: "gr",
        ctaLabel: "Criar plano de escala",
        preload: {
          brands: projectBrands.length > 0 ? projectBrands : project.brands,
          budget: project.budget,
          produtos: project.produtos,
          contextMsg: `Escala de campanha — ${project.name}. ${project.perf.txt.replace(/<[^>]+>/g, " ").trim().slice(0, 200)}`,
        },
      });
    }
  }

  // Oportunidade sazonal: buscar projetos finalizados recentemente com bom desempenho
  const finishedWithPerf = managedProjectsSeed.filter(
    (p) =>
      p.bu === bu &&
      p.status === "pa-finalizado" &&
      p.perf != null &&
      (brands.length === 0 || p.brands.some((b) => brands.includes(b))),
  );

  for (const project of finishedWithPerf) {
    if (!project.perf) continue;

    opportunities.push({
      id: `seasonal-${project.id}`,
      type: "seasonal",
      title: `Oportunidade sazonal: ${project.name}`,
      description: `Histórico de ${project.name} apresenta boa performance. Replique a estratégia no próximo ciclo para maximizar resultados.`,
      meta: `Histórico · ${project.brands.join(", ")} · Planejamento`,
      pill: "Histórico validado",
      pillColor: "cy",
      ctaLabel: "Planejar campanha sazonal",
      preload: {
        brands: project.brands.filter((b) => brands.length === 0 || brands.includes(b)),
        budget: project.budget,
        produtos: project.produtos,
        contextMsg: `Campanha sazonal baseada em ${project.name}. Período anterior: ${project.start} – ${project.end}. ${project.briefing.slice(0, 200)}`,
      },
    });
    break; // uma oportunidade sazonal por vez
  }

  return opportunities;
}
