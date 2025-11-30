"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface LayoutHeaderProps {
    loggedUser?: null | string;
}

export default function LayoutHeader({ loggedUser }: LayoutHeaderProps) {
    const pathname = usePathname();
    const router = useRouter();
    const hideLayout = pathname === "/login";
    const [menuOpen, setMenuOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (hideLayout) return null;

    async function handleLogout() {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
    }

    return (
        <header>
            <h1>Attività alpinistiche</h1>
            <div ref={containerRef} className={`logged-user ${menuOpen ? "logged-user--open" : ""}`} onClick={() => setMenuOpen((prev) => !prev)}>
                <div className={"avatar"} />
                <p>{loggedUser}</p>

                <div className="user-menu">
                    <button type="button" className="danger" onClick={handleLogout} title={"Logout"}>
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
}
