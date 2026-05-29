import { useState } from "react";
import {
  Check,
  Download,
  FileText,
  LayoutGrid,
  Mail,
  Send,
  X,
} from "lucide-react";
import { exportReport } from "@/mocks/handlers";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type ExportFmt = "PDF" | "PPTX";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExportDialog({ open, onOpenChange }: ExportDialogProps) {
  const [fmt, setFmt] = useState<ExportFmt>("PDF");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  function reset() {
    setFmt("PDF");
    setEmail("");
    setSubmitting(false);
    setDownloading(false);
    setSuccess(false);
    setSuccessMsg("");
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  async function handleDownload() {
    setDownloading(true);
    const format = fmt === "PDF" ? "pdf" : "pptx";
    try {
      // TODO: Replace with real API call
      const blob = await exportReport(format, fmt);
      const ext = fmt === "PDF" ? "pdf" : "pptx";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `relatorio-advolve.${ext}`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 200);
    } finally {
      setDownloading(false);
      setTimeout(() => handleOpenChange(false), 600);
    }
  }

  function handleSubmit() {
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      const el = document.getElementById("ex-email") as HTMLInputElement | null;
      el?.focus();
      if (el) {
        el.style.outline = "2px solid rgba(248,113,113,0.6)";
        setTimeout(() => {
          el.style.outline = "";
        }, 1800);
      }
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSuccessMsg(`O arquivo ${fmt} foi enviado para ${trimmed}.`);
      setSuccess(true);
      setSubmitting(false);
      setTimeout(() => handleOpenChange(false), 3200);
    }, 1600);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        overlayClassName={`EX-overlay${open ? " open" : ""}`}
        className="EX-panel"
        id="ex-panel"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <button type="button" className="EX-close" id="ex-close" onClick={() => handleOpenChange(false)}>
          <X size={14} strokeWidth={2} />
        </button>

        {!success ? (
          <div id="ex-form">
            <div className="EX-title">Exportar relatório</div>
            <p className="EX-sub">Escolha o formato para baixar ou enviar por e-mail.</p>

            <div className="EX-fmt">
              <button
                type="button"
                className={`EX-fmt-btn${fmt === "PDF" ? " sel" : ""}`}
                data-fmt="PDF"
                id="fmt-pdf"
                onClick={() => setFmt("PDF")}
              >
                <FileText size={16} strokeWidth={2} />
                PDF
              </button>
              <button
                type="button"
                className={`EX-fmt-btn${fmt === "PPTX" ? " sel" : ""}`}
                data-fmt="PPTX"
                id="fmt-pptx"
                onClick={() => setFmt("PPTX")}
              >
                <LayoutGrid size={16} strokeWidth={2} />
                PowerPoint
              </button>
            </div>

            <button
              type="button"
              className="EX-download"
              id="ex-download"
              disabled={downloading}
              onClick={handleDownload}
            >
              <Download size={15} strokeWidth={2} />
              <span id="ex-dl-label">{downloading ? `Preparando ${fmt}…` : "Baixar arquivo"}</span>
            </button>

            <div className="EX-sep">
              <span>ou enviar por e-mail</span>
            </div>

            <div className="EX-lbl">Enviar para</div>
            <div className="EX-input-wrap">
              <Mail size={16} strokeWidth={2} />
              <input
                id="ex-email"
                type="email"
                placeholder="seu@email.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              type="button"
              className="EX-submit"
              id="ex-submit"
              disabled={submitting}
              onClick={handleSubmit}
            >
              <Send size={15} strokeWidth={2} />
              <span id="ex-submit-label">{submitting ? `Gerando ${fmt}…` : "Gerar e enviar"}</span>
            </button>
          </div>
        ) : (
          <div className="EX-success show" id="ex-success">
            <div className="EX-success-icon">
              <Check size={24} strokeWidth={2.5} />
            </div>
            <h3>Relatório enviado!</h3>
            <p id="ex-success-msg">{successMsg || "O arquivo será entregue em alguns instantes."}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
