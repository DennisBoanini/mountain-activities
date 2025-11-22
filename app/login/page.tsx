"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const from = searchParams.get("from") || "/";

    async function handleLogin(e: FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        console.log(username, password);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setError(data.error || "Login fallito");
                return;
            }

            router.push(from);
        } catch (err) {
            console.error(err);
            setError("Errore di rete");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="login-container">
            <form className="login-form" onSubmit={handleLogin}>
                <h1 className="login-title">Accedi</h1>

                <div className="form-field">
                    <label className="form-label" htmlFor="username">
                        Username
                    </label>
                    <input id="username" type="text" className="input" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>

                <div className="form-field">
                    <label className="form-label" htmlFor="password">
                        Password
                    </label>
                    <input id="password" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>

                <button type="submit" className="button full-width">
                    Login
                </button>
            </form>
        </main>
    );
}
