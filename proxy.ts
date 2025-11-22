import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/jwt";

export default async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // 1. Tutte le API sono pubbliche, NON toccarle
    if (pathname.startsWith("/api")) {
        return NextResponse.next();
    }

    // 2. Login page è pubblica
    if (pathname === "/login") {
        return NextResponse.next();
    }

    // 3. Controllo cookie di sessione
    const token = req.cookies.get("session")?.value;

    if (!token) {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("from", pathname);
        return NextResponse.redirect(loginUrl);
    }

    try {
        // verifyAuthToken deve verificare il token creato da signSession
        await verifySession(token);
        return NextResponse.next();
    } catch (e) {
        console.error("Token non valido o scaduto", e);
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("from", pathname);
        return NextResponse.redirect(loginUrl);
    }
}

// Matcha tutte le pagine
export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
