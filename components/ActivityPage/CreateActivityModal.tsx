"use client";

import { ChangeEvent, useState } from "react";
import { CreateMountainActivity, MountainActivityLink } from "@/models/MountainActivity";

type Props = {
    isLoading: boolean;
    onSaveActivityAction: (activityToCreate: CreateMountainActivity) => void;
    onCloseModalAction: () => void;
};

export default function CreateActivityModal(props: Props) {
    const [activityName, setActivityName] = useState<string>("");
    const [activityDone, setActivityDone] = useState<boolean>(false);
    const [activityNote, setActivityNote] = useState<string>("");
    const [activityMountainGroup, setActivityMountainGroup] = useState<string>("");
    const [activitySummitAltitude, setActivitySummitAltitude] = useState<string>("");
    const [activityTags, setActivityTags] = useState<string>("");
    const [activityPlace, setActivityPlace] = useState<string>("");
    const [activityLinks, setActivityLinks] = useState<MountainActivityLink[]>([]);

    function handleLinkChange(index: number, field: keyof MountainActivityLink, value: string) {
        setActivityLinks((prev) => prev.map((link, i) => (i === index ? { ...link, [field]: value } : link)));
    }

    function addEmptyLink() {
        setActivityLinks((prev) => [...prev, { name: "", link: "" }]);
    }

    function removeLink(index: number) {
        setActivityLinks((prev) => prev.filter((_, i) => i !== index));
    }

    function prepareActivity() {
        const cleanedTags = activityTags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);

        const cleanedLinks = activityLinks.filter((l) => l.name.trim() !== "" || l.link.trim() !== "");

        const activityToCreate: CreateMountainActivity = {
            name: activityName,
            done: activityDone,
            note: activityNote,
            mountainGroup: activityMountainGroup,
            place: activityPlace,
            summitAltitude: Number(activitySummitAltitude),
            tags: cleanedTags,
            links: cleanedLinks,
        };

        props.onSaveActivityAction(activityToCreate);
    }

    return (
        <div className="modal-overlay">
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal-title">Aggiungi attività</h2>

                {!props.isLoading && (
                    <>
                        <div className="form-field">
                            <label htmlFor="activityName" className="form-label">
                                Nome attività
                            </label>
                            <input
                                id="activityName"
                                type="text"
                                className="input"
                                placeholder="Es. Cervino, via normale..."
                                value={activityName}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setActivityName(e.target.value)}
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="activityTags" className="form-label">
                                Tags (separa con virgola)
                            </label>
                            <input
                                id="activityTags"
                                type="text"
                                className="input"
                                placeholder="Es. Cresta, 4000, Invernale"
                                value={activityTags}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setActivityTags(e.target.value)}
                            />
                        </div>

                        <div className={"form-field-row"}>
                            <div className="form-field">
                                <label htmlFor="mountainGroup" className="form-label">
                                    Catena montuosa di appartenenza
                                </label>
                                <input
                                    id="mountainGroup"
                                    type="text"
                                    className="input"
                                    placeholder="Es. Alpi Apuane"
                                    value={activityMountainGroup}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setActivityMountainGroup(e.target.value)}
                                />
                            </div>
                            <div className="form-field">
                                <label htmlFor="summit" className="form-label">
                                    Altitudine raggiunta
                                </label>
                                <input
                                    id="summit"
                                    type="number"
                                    className="input"
                                    placeholder="Es. 1782"
                                    value={activitySummitAltitude}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setActivitySummitAltitude(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className={"form-field"}>
                            <label htmlFor="activityPlace" className="form-label">
                                Dove si trova
                            </label>
                            <input
                                id="activityPlace"
                                className="input"
                                type={"text"}
                                placeholder="Inserisci info utili su dove si trova questa attività"
                                value={activityPlace}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setActivityPlace(e.target.value)}
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="activityNote" className="form-label">
                                Note
                            </label>
                            <textarea
                                id="activityNote"
                                className="input"
                                placeholder="Es. Qualche nota utile"
                                value={activityNote}
                                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setActivityNote(e.target.value)}
                            />
                        </div>

                        {/* LINKS UTILi */}
                        <div
                            style={{
                                border: "solid 1px lightgray",
                                borderRadius: "10px",
                                padding: "10px",
                                marginBottom: "1rem",
                            }}
                        >
                            {activityLinks.map((link, index) => (
                                <div
                                    key={index}
                                    style={{
                                        borderBottom: index < activityLinks.length - 1 ? "1px solid #e5e7eb" : "none",
                                        paddingBottom: index < activityLinks.length - 1 ? "0.75rem" : 0,
                                        marginBottom: index < activityLinks.length - 1 ? "0.75rem" : 0,
                                    }}
                                >
                                    <div className="form-field">
                                        <label htmlFor={`link-name-${index}`} className="form-label">
                                            Nome link
                                        </label>
                                        <input
                                            id={`link-name-${index}`}
                                            type="text"
                                            className="input"
                                            placeholder="Es. Relazione, Articolo, Meteo..."
                                            value={link.name}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => handleLinkChange(index, "name", e.target.value)}
                                        />
                                    </div>

                                    <div className="form-field">
                                        <label htmlFor={`link-url-${index}`} className="form-label">
                                            URL
                                        </label>
                                        <input
                                            id={`link-url-${index}`}
                                            type="text"
                                            className="input"
                                            placeholder="https://..."
                                            value={link.link}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => handleLinkChange(index, "link", e.target.value)}
                                        />
                                    </div>

                                    <div style={{ textAlign: "right" }}>
                                        <button type="button" className="secondary danger" onClick={() => removeLink(index)}>
                                            Rimuovi link
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <button type="button" className="tertiary" onClick={addEmptyLink}>
                                + Aggiungi link utile
                            </button>
                        </div>

                        <div className="form-field">
                            <div className="checkbox-row">
                                <input
                                    type="checkbox"
                                    id="activityDone"
                                    checked={activityDone}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setActivityDone(e.target.checked)}
                                />
                                <label htmlFor="activityDone" className="form-label">
                                    Attività completata
                                </label>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="secondary" onClick={props.onCloseModalAction}>
                                Chiudi
                            </button>
                            <button type="button" onClick={prepareActivity}>
                                Salva
                            </button>
                        </div>
                    </>
                )}

                {props.isLoading && <p>Salvando...</p>}
            </div>
        </div>
    );
}
