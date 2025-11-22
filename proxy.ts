import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/jwt";

export default async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const token = req.cookies.get("session")?.value || null;

    // 1) API
    if (pathname.startsWith("/api")) {
        // endpoint auth pubblici
        if (pathname.startsWith("/api/auth")) {
            return NextResponse.next();
        }

        // tutte le altre API sono protette
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        try {
            await verifySession(token);
            return NextResponse.next();
        } catch (e) {
            console.error("Token non valido o scaduto (API)", e);
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
    }

    // 2) PAGINE

    // login page è sempre pubblica
    if (pathname === "/login") {
        return NextResponse.next();
    }

    // tutte le altre pagine sono protette
    if (!token) {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("from", pathname);
        return NextResponse.redirect(loginUrl);
    }

    try {
        await verifySession(token);
        return NextResponse.next();
    } catch (e) {
        console.error("Token non valido o scaduto (page)", e);
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("from", pathname);
        return NextResponse.redirect(loginUrl);
    }
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
