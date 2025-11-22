export default async function apiFetch(input: RequestInfo, init?: RequestInit) {
    const res = await fetch(input, init);

    if (res.status === 401) {
        // sessione non valida → porto l'utente al login
        window.location.href = "/login";
        return Promise.reject(new Error("Unauthorized"));
    }

    return res;
}
