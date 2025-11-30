"use client";

import { ChangeEvent, useState } from "react";

type Props = {
    onCloseModalAction: () => void;
    onSaveAction: (relation: string) => void;
};

export default function AddRelationToActivityAndSetCompletedModal(props: Props) {
    const [activityRelation, setActivityRelation] = useState<string>("");

    return (
        <div className="modal-overlay">
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal-title">Aggiungi relazione, se vuoi</h2>

                <div className="form-field">
                    <label htmlFor="activityNote" className="form-label">
                        Relazione
                    </label>
                    <textarea
                        id="activityNote"
                        className="input"
                        placeholder="Es. Qualche nota utile"
                        value={activityRelation}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setActivityRelation(e.target.value)}
                    />
                </div>

                <div className="modal-footer">
                    <button type="button" className="secondary" onClick={props.onCloseModalAction}>
                        Chiudi
                    </button>
                    <button type="button" onClick={() => props.onSaveAction(activityRelation)}>
                        Salva
                    </button>
                </div>
            </div>
        </div>
    );
}
