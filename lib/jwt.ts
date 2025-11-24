import { jwtVerify, SignJWT } from "jose";
import { getDb } from "@/lib/mongodb";
import { Session } from "@/models/Session";

const SECRET = process.env.AUTH_SECRET;
const SESSION_DAYS = process.env.SESSION_DAYS;

if (!SECRET || !SESSION_DAYS) {
    // In dev puoi anche lasciarlo di default, ma in produzione DEVE essere impostato.
    // Usiamo una stringa fissa per evitare crash in fase di build.
    console.error("AUTH_SECRET e/o SESSION_TTL_SECONDS non impostato.");
}

const key = new TextEncoder().encode(SECRET);

export type SessionPayload = {
    sub: string;
    username: string;
    sid: string;
};

export async function signSession(payload: SessionPayload): Promise<string> {
    const now = Math.floor(Date.now() / 1000);

    return await new SignJWT({
        sub: payload.sub,
        username: payload.username,
        sid: payload.sid,
    })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt(now)
        .setExpirationTime(now + 60 * 60 * 24 * Number(SESSION_DAYS))
        .sign(key);
}

export async function verifySession(token: string) {
    const { payload } = await jwtVerify(token, key);
    const userId = payload.sub as string | undefined;
    const username = payload.username as string | undefined;
    const sid = payload.sid as string | undefined;

    if (!userId || !sid) {
        throw new Error("Sessione non valida: campi mancanti");
    }

    const db = await getDb();
    const session = await db.collection("sessions").findOne<Session>({
        sessionId: sid,
        userId,
        revoked: false,
        expiresAt: { $gt: new Date() },
    });

    if (!session) {
        throw new Error("Sessione non trovata o revocata");
    }

    return {
        userId,
        username: username ?? session.username,
        sessionId: sid,
    };
}
