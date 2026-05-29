import { useMemo } from "react";
import { weeklyData } from "@/mocks/data";

export function AreaChart() {
  const svg = useMemo(() => {
    const W = 460;
    const H = 160;
    const pad = { t: 8, r: 8, b: 24, l: 36 };
    const innerW = W - pad.l - pad.r;
    const innerH = H - pad.t - pad.b;
    const maxV = Math.max(...weeklyData.map((d) => d.pedidos));
    const n = weeklyData.length;
    const pts = weeklyData.map((d, i) => {
      const x = pad.l + (i / (n - 1)) * innerW;
      const y = pad.t + innerH - (d.pedidos / maxV) * innerH;
      return { x, y, name: d.name, v: d.pedidos };
    });
    let pathL = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      pathL += ` L ${pts[i].x} ${pts[i].y}`;
    }
    const pathArea = `${pathL} L ${pts[pts.length - 1].x} ${pad.t + innerH} L ${pts[0].x} ${pad.t + innerH} Z`;
    const ticksY = [0, Math.round(maxV / 2), maxV];

    return (
      <svg className="chart-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={pathArea} fill="url(#gP)" stroke="none" />
        <path d={pathL} fill="none" stroke="#8B5CF6" strokeWidth="2" />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="#8B5CF6" stroke="#07070C" strokeWidth="1.5" />
        ))}
        {ticksY.map((tv, i) => {
          const yy = pad.t + innerH - (tv / maxV) * innerH;
          return (
            <text
              key={i}
              x={pad.l - 8}
              y={yy + 4}
              textAnchor="end"
              fill="#63637A"
              fontSize="11"
              fontFamily="JetBrains Mono,monospace"
            >
              {tv.toLocaleString("pt-BR")}
            </text>
          );
        })}
        {weeklyData.map((d, i) => {
          const x = pad.l + (i / (n - 1)) * innerW;
          return (
            <text
              key={d.name}
              x={x}
              y={H - 6}
              textAnchor="middle"
              fill="#63637A"
              fontSize="11"
              fontFamily="DM Sans,sans-serif"
            >
              {d.name}
            </text>
          );
        })}
      </svg>
    );
  }, []);

  return <div className="chart-wrap" id="area-chart-host">{svg}</div>;
}
