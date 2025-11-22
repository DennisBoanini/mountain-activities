"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type LoginFormProps = {
    from: string;
};

export default function LoginForm({ from }: LoginFormProps) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    async function handleLogin(e: FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

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

            router.push(from || "/");
        } catch (err) {
            console.error(err);
            setError("Errore di rete");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form className="login-form" onSubmit={handleLogin}>
            <h1 className="login-title">Accedi</h1>

            {error && (
                <p
                    style={{
                        color: "var(--color-danger)",
                        fontSize: "0.85rem",
                        margin: 0,
                    }}
                >
                    {error}
                </p>
            )}

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

            <button type="submit" className="button full-width" disabled={loading}>
                {loading ? "Accesso in corso..." : "Login"}
            </button>
        </form>
    );
}
