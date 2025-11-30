import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { verifyPassword } from "@/lib/password";
import { signSession } from "@/lib/jwt";

type LoginBody = {
    username: string;
    password: string;
};

export async function POST(request: Request): Promise<NextResponse<{ message: string } | { error: string }>> {
    try {
        const body = (await request.json()) as LoginBody;
        const { username, password } = body;

        if (!username || !password) {
            return NextResponse.json({ error: "username and password are required" }, { status: 400 });
        }

        let userId: string | null = null;
        let uname: string | null = null;

        const db = await getDb();

        const ip = (request.headers.get("x-forwarded-for") || "").split(",")[0] || "unknown";
        const now = new Date();
        const windowStart = new Date(now.getTime() - Number(process.env.WINDOW_MINUTES) * 60 * 1000);

        const recentAttempts = await db.collection("login_attempts").countDocuments({
            username,
            ip,
            createdAt: { $gte: windowStart },
        });
        if (recentAttempts >= Number(process.env.MAX_ATTEMPTS)) {
            return NextResponse.json(
                {
                    error: "Troppi tentativi di accesso. Riprova più tardi",
                },
                { status: 429 },
            );
        }

        const user = await db
            .collection("users")
            .findOne<{ _id: unknown; username: string; passwordHash: string; completeName: string }>({ username });
        if (!user) {
            await db.collection("login_attempts").insertOne({
                username,
                ip,
                createdAt: new Date(),
            });
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        const ok = await verifyPassword(password, user.passwordHash);
        if (!ok) {
            await db.collection("login_attempts").insertOne({
                username,
                ip,
                createdAt: new Date(),
            });
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        userId = String(user._id);
        uname = user.username;

        const sessionId = crypto.randomUUID();
        const expiresAt = new Date(now.getTime() + Number(process.env.SESSION_DAYS) * 24 * 60 * 60 * 1000);

        await db.collection("sessions").insertOne({
            sessionId,
            userId,
            username: uname,
            createdAt: now,
            expiresAt,
            revoked: false,
            ip,
            userAgent: request.headers.get("user-agent") || "",
        });

        const token = await signSession({
            sub: userId,
            username: uname,
            completeName: user.completeName,
            sid: sessionId,
        });

        const res = NextResponse.json({ message: "Logged in" });
        const isProd = process.env.NODE_ENV === "production";

        res.cookies.set("session", token, {
            httpOnly: true,
            sameSite: "lax",
            secure: isProd,
            path: "/",
            maxAge: 60 * 60 * 24 * Number(process.env.SESSION_DAYS),
        });

        return res;
    } catch (error: unknown) {
        console.error("Error logging in:", error);
        return NextResponse.json({ error: "Failed to login" }, { status: 500 });
    }
}
