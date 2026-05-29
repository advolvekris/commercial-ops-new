import type { ReactNode } from "react";

function escapeHtml(s: string) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fmtMd(s: string) {
  return escapeHtml(s)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>");
}

export function renderMarkdown(text: string): ReactNode[] {
  if (!text) return [];
  const lines = text.split("\n");
  const els: ReactNode[] = [];
  let inTbl = false;
  let tH: string[] = [];
  let tR: string[][] = [];
  let inLst = false;
  let lI: string[] = [];
  let lT: "ul" | "ol" = "ul";

  const flushList = () => {
    if (!lI.length) return;
    const Tag = lT;
    els.push(
      <Tag key={`l${els.length}`}>
        {lI.map((l, i) => (
          <li key={i} dangerouslySetInnerHTML={{ __html: fmtMd(l) }} />
        ))}
      </Tag>,
    );
    lI = [];
    inLst = false;
  };

  const flushTbl = () => {
    if (!tH.length) return;
    els.push(
      <table key={`t${els.length}`}>
        <thead>
          <tr>
            {tH.map((h, i) => (
              <th key={i}>{h.trim()}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tR.map((r, ri) => (
            <tr key={ri}>
              {r.map((c, ci) => (
                <td key={ci} dangerouslySetInnerHTML={{ __html: fmtMd(c.trim()) }} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>,
    );
    tH = [];
    tR = [];
    inTbl = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (!l.trim()) {
      flushList();
      if (inTbl) flushTbl();
      continue;
    }
    if (/^\|(.+)\|$/.test(l)) {
      flushList();
      const c = l.split("|").filter(Boolean);
      if (!inTbl) {
        tH = c;
        inTbl = true;
      } else if (/^\|[\s-:|]+\|$/.test(l)) continue;
      else tR.push(c);
      continue;
    } else if (inTbl) flushTbl();

    if (/^[-*]\s/.test(l)) {
      flushTbl();
      inLst = true;
      lT = "ul";
      lI.push(l.replace(/^[-*]\s/, ""));
      continue;
    }
    if (/^\d+\.\s/.test(l)) {
      flushTbl();
      inLst = true;
      lT = "ol";
      lI.push(l.replace(/^\d+\.\s/, ""));
      continue;
    }
    if (inLst && !/^[-*]\s/.test(l) && !/^\d+\.\s/.test(l)) flushList();

    if (l.startsWith("### ")) els.push(<h3 key={i}>{l.slice(4)}</h3>);
    else if (l.startsWith("## ")) els.push(<h2 key={i}>{l.slice(3)}</h2>);
    else if (l.trim()) els.push(<p key={i} dangerouslySetInnerHTML={{ __html: fmtMd(l) }} />);
  }
  flushList();
  flushTbl();
  return els;
}
