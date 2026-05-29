import type { BuFinancialRow } from "@/lib/ops-aggregates";
import { formatMoneyBR } from "@/lib/ops-aggregates";

interface BuBreakdownTableProps {
  rows: BuFinancialRow[];
}

export function BuBreakdownTable({ rows }: BuBreakdownTableProps) {
  if (rows.length === 0) {
    return <p className="OPS-empty">Nenhuma BU com projetos no filtro atual.</p>;
  }

  return (
    <div className="OPS-bu-table-wrap">
      <table className="OPS-bu-table">
        <thead>
          <tr>
            <th>BU</th>
            <th>Projetos</th>
            <th>Budget</th>
            <th>Fee</th>
            <th>Mídia</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.bu}>
              <td>{row.bu}</td>
              <td>{row.projectCount}</td>
              <td>{formatMoneyBR(row.budget)}</td>
              <td>{formatMoneyBR(row.fee)}</td>
              <td>{formatMoneyBR(row.midia)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
