"use client";

type ConfirmDeleteModalProps = {
    open: boolean;
    activityName: string;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
};

export function ConfirmDeleteModal({ open, activityName, onConfirm, onCancel, isLoading = false }: ConfirmDeleteModalProps) {
    if (!open) return null;

    return (
        <div className="modal-overlay" onClick={isLoading ? undefined : onCancel}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal-title">Conferma eliminazione</h2>
                <p className="modal-text">
                    Stai per eliminare <strong>{activityName}</strong>. Questa azione non può essere annullata.
                </p>

                <div className="modal-footer">
                    <button type="button" className="secondary" onClick={onCancel} disabled={isLoading}>
                        Annulla
                    </button>
                    <button type="button" className="danger" onClick={onConfirm} disabled={isLoading}>
                        {isLoading ? "Eliminazione..." : "Elimina definitivamente"}
                    </button>
                </div>
            </div>
        </div>
    );
}
