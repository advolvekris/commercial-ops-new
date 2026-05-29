/**
 * Serve advolve-prototype.html and proxy chat to Anthropic (key stays server-side).
 * Usage: ANTHROPIC_API_KEY=sk-ant-... node server.mjs
 * Open: http://localhost:3780/
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT, 10) || 3780;
const HTML_FILE = path.join(__dirname, "advolve-prototype.html");
const DIST_DIR = path.join(__dirname, "dist");
const DIST_INDEX = path.join(DIST_DIR, "index.html");

const SYSTEM_PROMPT = `Você é o Agente de Mídia da Advolve — um assistente especialista em otimização de campanhas de performance digital.
Contexto do projeto atual:
- Cliente: marca CPG do ecossistema iFood
- Investimento mensal: R$ 250.000
- Plataformas ativas: Meta Ads, Google Ads, TikTok Ads
- Dados 1P: base de ~100MM de consumidores do iFood
- Objetivo: maximizar pedidos incrementais com ROAS > 4x
Você pode ajudar com:
1. CONSULTA DE AUDIÊNCIA — traga segmentos com dados comportamentais do iFood.
2. PLANO DE MÍDIA — distribuição de budget entre Google e Meta com tabela markdown.
3. NOVAS AUDIÊNCIAS — gere 3-4 hipóteses com nome, descrição, tamanho, ROAS previsto e confiança.
Regras: Responda SEMPRE em pt-BR. Seja direto, use dados. Use markdown. Seja proativo.`;

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514";

function readBody(req, limit = 1_000_000) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > limit) {
        req.destroy();
        reject(new Error("Payload too large"));
      }
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
}

function sendHtml(res, status, html) {
  res.writeHead(status, {
    "Content-Type": "text/html; charset=utf-8",
    "Content-Length": Buffer.byteLength(html),
  });
  res.end(html);
}

async function handleChat(body) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { status: 503, json: { error: "ANTHROPIC_API_KEY não definida no servidor." } };
  }

  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return { status: 400, json: { error: "Campo \"messages\" deve ser um array não vazio." } };
  }

  for (const m of messages) {
    if (!m || (m.role !== "user" && m.role !== "assistant")) {
      return { status: 400, json: { error: "Cada mensagem precisa de role \"user\" ou \"assistant\"." } };
    }
    if (typeof m.content !== "string" || !m.content.trim()) {
      return { status: 400, json: { error: "Conteúdo de mensagem inválido." } };
    }
  }

  const maxTokens = Math.min(Number.parseInt(String(body.max_tokens), 10) || 1000, 4096);

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: typeof body.model === "string" ? body.model : MODEL,
      max_tokens: maxTokens,
      system: SYSTEM_PROMPT,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  });

  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    const msg = data.error?.message || data.message || `Anthropic HTTP ${r.status}`;
    return { status: r.status >= 400 && r.status < 600 ? r.status : 502, json: { error: msg } };
  }

  const text =
    (data.content || [])
      .filter((b) => b.type === "text" && typeof b.text === "string")
      .map((b) => b.text)
      .join("\n") || "";

  return { status: 200, json: { text } };
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);

  if (req.method === "POST" && url.pathname === "/api/chat") {
    try {
      const body = await readBody(req);
      const out = await handleChat(body);
      sendJson(res, out.status, out.json);
    } catch (e) {
      sendJson(res, 400, { error: e.message || "JSON inválido" });
    }
    return;
  }

  if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html")) {
    try {
      const html = fs.readFileSync(HTML_FILE, "utf8");
      sendHtml(res, 200, html);
    } catch {
      sendHtml(res, 500, "<pre>advolve-prototype.html não encontrado.</pre>");
    }
    return;
  }

  // Serve static assets (images, fonts, etc.) from the project root
  if (req.method === "GET") {
    const MIME = {
      ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
      ".webp": "image/webp", ".svg": "image/svg+xml", ".gif": "image/gif",
      ".ico": "image/x-icon", ".woff2": "font/woff2", ".woff": "font/woff",
    };
    const ext = path.extname(url.pathname).toLowerCase();
    if (MIME[ext]) {
      const filePath = path.join(__dirname, url.pathname);
      // Prevent path traversal outside project root
      if (!filePath.startsWith(__dirname + path.sep) && filePath !== __dirname) {
        res.writeHead(403); res.end(); return;
      }
      try {
        const data = fs.readFileSync(filePath);
        res.writeHead(200, { "Content-Type": MIME[ext], "Content-Length": data.length });
        res.end(data);
        return;
      } catch {
        // fall through to 404
      }
    }
  }

  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Not found");
});

server.listen(PORT, () => {
  console.log(`Advolve prototype: http://localhost:${PORT}/`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log("Aviso: sem ANTHROPIC_API_KEY o /api/chat retorna 503; o front usa respostas simuladas.");
  }
});
