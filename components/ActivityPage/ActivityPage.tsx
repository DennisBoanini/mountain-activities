"use client";
import { useMemo, useState } from "react";
import { CreateMountainActivity, MountainActivity } from "@/models/MountainActivity";
import CreateActivityModal from "@/components/ActivityPage/CreateActivityModal";
import { ToastNotification } from "@/components/Toast/ToastNotification";
import { ConfirmDeleteModal } from "@/components/ActivityPage/ConfirmDeleteModal";
import AddRelationToActivityAndSetCompletedModal from "@/components/ActivityPage/AddRelationToActivityAndSetCompletedModal";

type ToastState = {
    show: boolean;
    message: string;
    type: "success" | "error" | "info";
};

type FilterStatus = "all" | "todo" | "done";

interface ActivityPageProps {
    activities: MountainActivity[];
}

export function ActivityPage({ activities }: ActivityPageProps) {
    const [activitiesToShow, setActivitiesToShow] = useState<MountainActivity[]>(activities);
    const [showAddActivityModal, setShowAddActivityModal] = useState(false);
    const [showAddRelationAndSaveModal, setShowAddRelationAndSaveModal] = useState<MountainActivity | undefined>();
    const [loading, setLoading] = useState(false);
    const [cardLoadingId, setCardLoadingId] = useState<string | null>(null);
    const [activityToDelete, setActivityToDelete] = useState<MountainActivity | null>(null);
    const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
    const [filterTag, setFilterTag] = useState<string>("all");
    const [search, setSearch] = useState("");
    const [toast, setToast] = useState<ToastState>({
        show: false,
        message: "",
        type: "info",
    });

    function showToast(message: string, type: ToastState["type"] = "info") {
        setToast({ show: true, message, type });
    }

    async function apiFetch(input: RequestInfo, init?: RequestInit) {
        const res = await fetch(input, init);
        if (res.status === 401) {
            window.location.href = "/login";
            throw new Error("Unauthorized");
        }
        return res;
    }

    async function fetchActivities(): Promise<void> {
        setLoading(true);
        try {
            const res = await apiFetch("/api/activities");
            const data = (await res.json()) as MountainActivity[];
            setActivitiesToShow(data);
        } catch (error) {
            console.error("Error fetching attivita:", error);
        } finally {
            setLoading(false);
            setCardLoadingId(null);
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
        }
    }

    async function onSetDone(mountainActivity: MountainActivity): Promise<void> {
        setCardLoadingId(mountainActivity._id);
        setShowAddRelationAndSaveModal(undefined);
        try {
            await apiFetch(`/api/activities/${mountainActivity._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ done: !mountainActivity.done, relation: mountainActivity.relation }),
            });
            void fetchActivities();
            showToast("Attività aggiornata con successo", "success");
        } catch (error: unknown) {
            console.error("Error updating attivita:", error);
            setCardLoadingId(null);
        }
    }

    async function onSetUndone(id: string): Promise<void> {
        setCardLoadingId(id);
        try {
            await apiFetch(`/api/activities/${id}/undone`, {
                method: "PUT",
            });
            void fetchActivities();
            showToast("Attività aggiornata con successo", "success");
        } catch (error: unknown) {
            console.error("Error updating attivita:", error);
            setCardLoadingId(null);
        }
    }

    const stats = useMemo(() => {
        const total = activitiesToShow.length;
        const done = activitiesToShow.filter((a) => a.done).length;
        const todo = total - done;
        return { total, done, todo };
    }, [activitiesToShow]);

    const filteredActivities = useMemo(() => {
        return activitiesToShow
            .filter((a) => {
                if (filterStatus === "done" && !a.done) return false;
                if (filterStatus === "todo" && a.done) return false;

                return !(search.trim().length > 0 && !a.name.toLowerCase().includes(search.toLowerCase()));
            })
            .filter((a) => {
                if (filterTag === "all") return true;

                return a.tags.includes(filterTag);
            });
    }, [activitiesToShow, filterStatus, search, filterTag]);

    const tags = useMemo(() => {
        const set = new Set<string>();
        activities
            .map((ac) => ac.tags)
            .flatMap((tag) => tag)
            .forEach((tag) => set.add(tag));

        return Array.from(set);
    }, [activities]);

    function requestDelete(mountainActivity: MountainActivity) {
        setActivityToDelete(mountainActivity);
    }

    async function confirmDelete(): Promise<void> {
        if (!activityToDelete) return;

        const target = activityToDelete;
        setActivityToDelete(null);
        setCardLoadingId(target._id);

        try {
            const res = await apiFetch(`/api/activities/${target._id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                void fetchActivities();
                showToast("Attività eliminata", "success");
            } else {
                setCardLoadingId(null);
                showToast("Errore durante l'eliminazione dell'attività", "error");
            }
        } catch (error) {
            console.error("Error deleting attivita:", error);
            setCardLoadingId(null);
            showToast("Errore di rete durante l'eliminazione", "error");
        }
    }

    return (
        <main className="container">
            <ToastNotification
                show={toast.show}
                message={toast.message}
                type={toast.type}
                position="top-right"
                duration={3500}
                onClose={() => setToast((prev) => ({ ...prev, show: false }))}
            />
            {/* HEADER */}
            <div className="activities-header">
                <div>
                    <h2 className="page-title">Tieni d&apos;occhio le salite sognate e quelle già portate a casa</h2>
                    <p className="activities-counter page-subtitle">
                        Totali: <strong>{stats.total}</strong> · Da fare: <strong>{stats.todo}</strong> · Completate: <strong>{stats.done}</strong>
                    </p>
                </div>

                <div className="activities-header-right">
                    <button className="button" type="button" onClick={() => setShowAddActivityModal(true)}>
                        + Aggiungi attività
                    </button>
                </div>
            </div>

            {/* LISTA ATTIVITÀ */}
            <div className="activities-list-container">
                <div className={"activities-filters card-filters"}>
                    <input
                        type="search"
                        className="input"
                        placeholder="Filtra per nome attività..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <hr />

                    <div>
                        <h4>Filtri per stato</h4>
                        <div className="filter-chips">
                            <button
                                type="button"
                                className={filterStatus === "all" ? "chip chip-active" : "chip"}
                                onClick={() => setFilterStatus("all")}
                            >
                                Tutte
                            </button>
                            <button
                                type="button"
                                className={filterStatus === "todo" ? "chip chip-active" : "chip"}
                                onClick={() => setFilterStatus("todo")}
                            >
                                Da fare
                            </button>
                            <button
                                type="button"
                                className={filterStatus === "done" ? "chip chip-active" : "chip"}
                                onClick={() => setFilterStatus("done")}
                            >
                                Completate
                            </button>
                        </div>
                    </div>

                    <hr />

                    <div>
                        <h4>Filtri per tag</h4>
                        <div className="filter-chips">
                            <button type="button" className={filterTag === "all" ? "chip chip-active" : "chip"} onClick={() => setFilterTag("all")}>
                                Tutti
                            </button>
                            {tags.map((tag) => (
                                <button
                                    key={tag}
                                    type="button"
                                    className={filterTag === tag ? "chip chip-active" : "chip"}
                                    onClick={() => setFilterTag(tag)}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className={"activities-list"}>
                    {filteredActivities.length === 0 && !loading && (
                        <div className="empty-state card">
                            <h3 className="empty-title">Nessuna attività trovata</h3>
                            <p className="empty-text">Aggiungi una nuova salita o cambia i filtri per vedere le attività esistenti.</p>
                        </div>
                    )}

                    {filteredActivities.map((ac) => {
                        const isCardLoading = cardLoadingId === ac._id;

                        return (
                            <article key={ac._id} className={`card activity-card${isCardLoading ? " activity-card--loading" : ""}`}>
                                {isCardLoading && (
                                    <div className="activity-card-overlay">
                                        <span className="spinner" />
                                    </div>
                                )}

                                <div className="activity-content">
                                    <div className="activity-top-row">
                                        <div className="activity-main">
                                            <span
                                                className="activity-status-icon"
                                                title={ac.done ? "Completata" : "Da fare"}
                                                onClick={() => {
                                                    if (ac.done) {
                                                        onSetUndone(ac._id);
                                                    } else {
                                                        setShowAddRelationAndSaveModal(ac);
                                                    }
                                                }}
                                            >
                                                {ac.done ? "✔️" : "◻️"}
                                            </span>
                                            <div className="activity-info">
                                                <div className="activity-title">
                                                    <h3 className={`activity-name${ac.done ? " done" : ""}`}>
                                                        {ac.name}
                                                        {ac.place.length > 0 && <span> - {ac.place}</span>}
                                                    </h3>
                                                </div>

                                                {(ac.mountainGroup || ac.summitAltitude) && (
                                                    <div className="activity-extra">
                                                        {ac.mountainGroup && (
                                                            <div className="activity-extra-item">
                                                                <span className="activity-extra-icon">🗺️</span>
                                                                <span className="activity-extra-label">{ac.mountainGroup}</span>
                                                            </div>
                                                        )}

                                                        {ac.summitAltitude && (
                                                            <div className="activity-extra-item">
                                                                <span className="activity-extra-icon">🏔️</span>
                                                                <span className="activity-extra-label">
                                                                    {ac.summitAltitude}
                                                                    <span className="activity-extra-unit"> m</span>
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {ac.tags?.length > 0 && (
                                                    <div className="activity-tags">
                                                        {ac.tags.map((tag) => (
                                                            <span className="tag" key={`${ac._id}-tag-${tag}`}>
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {ac.note && <p className="activity-note">{ac.note}</p>}

                                    {ac.links?.length > 0 && (
                                        <div className="activity-links">
                                            {ac.links.map((link) => (
                                                <a
                                                    key={`${ac._id}-${link.link}`}
                                                    href={link.link}
                                                    className="activity-link-chip"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <span>🔗</span>
                                                    <span>{link.name || link.link}</span>
                                                </a>
                                            ))}
                                        </div>
                                    )}

                                    <p className="activity-meta">
                                        Creata il {new Date(ac.createdAt).toLocaleDateString("it-IT")} · Ultimo aggiornamento{" "}
                                        {new Date(ac.updatedAt).toLocaleDateString("it-IT")}
                                    </p>
                                </div>

                                <div className="activity-actions">
                                    <button className="danger" type="button" disabled={isCardLoading} onClick={() => requestDelete(ac)}>
                                        Elimina
                                    </button>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>

            {showAddActivityModal && (
                <CreateActivityModal
                    isLoading={loading}
                    onCloseModalAction={() => setShowAddActivityModal(false)}
                    onSaveActivityAction={onSaveActivity}
                />
            )}

            {showAddRelationAndSaveModal && (
                <AddRelationToActivityAndSetCompletedModal
                    onCloseModalAction={() => setShowAddRelationAndSaveModal(undefined)}
                    onSaveAction={(relation) => onSetDone({ ...showAddRelationAndSaveModal, relation })}
                />
            )}

            <ConfirmDeleteModal
                open={!!activityToDelete}
                activityName={activityToDelete?.name ?? ""}
                onCancel={() => setActivityToDelete(null)}
                onConfirm={confirmDelete}
                isLoading={!!activityToDelete && cardLoadingId === activityToDelete._id}
            />
        </main>
    );
}
