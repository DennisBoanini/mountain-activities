"use client";

import { usePathname, useRouter } from "next/navigation";

export default function LayoutHeader() {
    const pathname = usePathname();
    const router = useRouter();
    const hideLayout = pathname === "/login";

    if (hideLayout) return null;

    async function handleLogout() {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
    }

    return (
        <header>
            <h1>Attività alpinistiche</h1>
            <button onClick={handleLogout}>Logout</button>
        </header>
    );
}
