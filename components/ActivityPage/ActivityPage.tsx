"use client";
import { CreateMountainActivity, MountainActivity } from "@/models/MountainActivity";
import { useState } from "react";
import CreateActivityModal from "@/components/ActivityPage/CreateActivityModal";
import apiFetch from "@/lib/apiFetch";

interface ActivityPageProps {
    activities: MountainActivity[];
}

export function ActivityPage({ activities }: ActivityPageProps) {
    const [activitiesToShow, setActivitiesToShow] = useState<MountainActivity[]>(activities);
    const [showAddActivityModal, setShowAddActivityModal] = useState(false);
    const [loading, setLoading] = useState(false); // caricamento generale (fetch)
    const [loadingActivityId, setLoadingActivityId] = useState<string | null>(null); // loader per singola card

    async function fetchActivities(): Promise<void> {
        setLoading(true);
        try {
            const res = await apiFetch("/api/activities");
            const data = (await res.json()) as MountainActivity[];
            setActivitiesToShow(data);
        } catch (error: unknown) {
            console.error("Error fetching attivita:", error);
        } finally {
            setLoading(false);
        }
    }

    async function onSaveActivity(activityToCreate: CreateMountainActivity) {
        setLoading(true);
        try {
            const response = await apiFetch("/api/activities", {
                body: JSON.stringify(activityToCreate),
                headers: { "Content-Type": "application/json" },
                method: "POST",
            });

            if (response.ok) {
                setShowAddActivityModal(false);
                await fetchActivities();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    async function onDelete(mountainActivity: MountainActivity): Promise<void> {
        const confirmed: boolean = confirm(`Vuoi davvero eliminare "${mountainActivity.name}"?`);
        if (!confirmed) return;

        setLoadingActivityId(mountainActivity._id);

        try {
            await apiFetch(`/api/activities/${mountainActivity._id}`, {
                method: "DELETE",
            });
            void fetchActivities();
        } catch (error: unknown) {
            console.error("Error deleting attivita:", error);
        } finally {
            setLoadingActivityId(null);
        }
    }

    async function onSetDone(mountainActivity: MountainActivity): Promise<void> {
        setLoadingActivityId(mountainActivity._id);

        try {
            await apiFetch(`/api/activities/${mountainActivity._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ done: !mountainActivity.done }),
            });
            void fetchActivities();
        } catch (error: unknown) {
            console.error("Error updating attivita:", error);
        } finally {
            setLoadingActivityId(null);
        }
    }

    function formatDate(dateStr: string) {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString("it-IT", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    }

    const totalActivities = activitiesToShow.length;
    const completedActivities = activitiesToShow.filter((a) => a.done).length;

    return (
        <main className="container">
            {/* HEADER PAGINA */}
            <div className="activities-header">
                <div>
                    <h1>Attività alpinistiche</h1>
                    <p className="muted">Tieni d&apos;occhio le salite sognate e quelle completate.</p>
                </div>
                <div className="activities-header-right">
                    <span className="activities-counter">
                        {completedActivities}/{totalActivities} completate
                    </span>
                    <button type="button" onClick={() => setShowAddActivityModal(true)}>
                        + Aggiungi attività
                    </button>
                </div>
            </div>

            {loading && (
                <p className="muted" style={{ marginBottom: "0.75rem" }}>
                    Caricamento attività...
                </p>
            )}

            {!loading && activitiesToShow.length === 0 && (
                <div className="card empty-state">
                    <p className="empty-title">Nessuna attività ancora</p>
                    <p className="empty-text">Inizia aggiungendo qualcosa che sogni di scalare.</p>
                    <button type="button" onClick={() => setShowAddActivityModal(true)}>
                        + Aggiungi attività
                    </button>
                </div>
            )}

            <div className="activities-list">
                {activitiesToShow.map((ac) => {
                    const created = formatDate(ac.createdAt);
                    const updated = formatDate(ac.updatedAt);
                    const isCardLoading = loadingActivityId === ac._id;

                    return (
                        <div key={ac._id} className={`card activity-card ${ac.done ? "done" : ""} ${isCardLoading ? "loading" : ""}`}>
                            {isCardLoading && (
                                <div className="activity-card-overlay">
                                    <div className="activity-card-loading-content">
                                        <span className="activity-card-spinner" />
                                        <span>Caricamento...</span>
                                    </div>
                                </div>
                            )}

                            <div className="activity-content">
                                <div className="activity-title">
                                    <span className="activity-status-icon" title={ac.done ? "Completata" : "Da fare"}>
                                        {ac.done ? "🏔️✓" : "🏔️"}
                                    </span>
                                    <h2 className={`activity-name ${ac.done ? "done" : ""}`}>{ac.name}</h2>
                                </div>

                                {ac.tags.length > 0 && (
                                    <div className="activity-tags">
                                        {ac.tags.map((tag) => (
                                            <span className="tag" key={`${ac._id}-tag-${tag}`}>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {ac.note?.trim() && <p className="activity-note">{ac.note}</p>}

                                {ac.links?.length > 0 && (
                                    <div className="activity-links">
                                        {ac.links.map((link, i) => (
                                            <a
                                                key={`${ac._id}-link-${i}`}
                                                href={link.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="activity-link"
                                                title={link.name || "Link utile"}
                                            >
                                                <span className="link-icon">🔗</span>
                                                {link.name || "Link utile"}
                                            </a>
                                        ))}
                                    </div>
                                )}

                                <p className="activity-meta">
                                    {created && <span>Creata il {created}</span>}
                                    {created && updated && " • "}
                                    {updated && <span>Ultima modifica il {updated}</span>}
                                </p>
                            </div>

                            <div className="activity-actions">
                                <button type="button" className="secondary" onClick={() => onSetDone(ac)} disabled={isCardLoading}>
                                    {ac.done ? "Segna da fare" : "Segna fatta"}
                                </button>
                                <button type="button" className="danger" onClick={() => onDelete(ac)} disabled={isCardLoading}>
                                    Elimina
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {showAddActivityModal && (
                <CreateActivityModal isLoading={loading} onCloseModal={() => setShowAddActivityModal(false)} onSaveActivity={onSaveActivity} />
            )}
        </main>
    );
}
