// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/jwt";
import { getDb } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get("session")?.value;
        const db = await getDb();

        if (token) {
            try {
                const { sessionId } = await verifySession(token);

                await db.collection("sessions").updateOne({ sessionId }, { $set: { revoked: true } });
            } catch {
                // se il token non è valido, ignora e continua a cancellare il cookie
            }
        }

        const res = NextResponse.json({ ok: true });
        res.cookies.set("session", "", {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 0,
        });

        return res;
    } catch (e) {
        console.error("Error during logout", e);
        return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
    }
}
