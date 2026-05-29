import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getStatusLabel } from "@/lib/commercial-status";
import type { CommercialProjectStatus } from "@/types";

interface StatusChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  nextStatus: CommercialProjectStatus | null;
  onConfirm: () => void;
  loading?: boolean;
}

export function StatusChangeDialog({
  open,
  onOpenChange,
  projectName,
  nextStatus,
  onConfirm,
  loading,
}: StatusChangeDialogProps) {
  const isCancel = nextStatus === "pa-cancelado";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="OPS-dialog">
        <h3 className="OPS-dialog-title">
          {isCancel ? "Cancelar projeto?" : "Confirmar alteração de status"}
        </h3>
        <p className="OPS-dialog-body">
          {isCancel ? (
            <>
              Você está prestes a cancelar <strong>{projectName}</strong>. Esta ação deve ser
              usada com cautela — confirme apenas se tiver certeza de que o projeto não seguirá
              no fluxo comercial.
            </>
          ) : (
            <>
              Alterar status de <strong>{projectName}</strong> para{" "}
              <strong>{nextStatus ? getStatusLabel(nextStatus) : ""}</strong>?
            </>
          )}
        </p>
        <div className="OPS-dialog-actions">
          <button type="button" className="OPS-btn OPS-btn-ghost" onClick={() => onOpenChange(false)}>
            Voltar
          </button>
          <button
            type="button"
            className={`OPS-btn${isCancel ? " OPS-btn-danger" : " OPS-btn-primary"}`}
            disabled={loading}
            onClick={onConfirm}
          >
            {loading ? "Salvando…" : isCancel ? "Sim, cancelar projeto" : "Confirmar"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
