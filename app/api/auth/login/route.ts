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
        console.log("Entro con body", body);

        if (!username || !password) {
            return NextResponse.json({ error: "username and password are required" }, { status: 400 });
        }

        let userId: string | null = null;
        let uname: string | null = null;

        const db = await getDb();
        console.log(db);
        console.log("mi sono connesso al db");
        const user = await db.collection("users").findOne<{ _id: unknown; username: string; passwordHash: string }>({ username });
        if (!user) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        console.log("Ho recuperato lo user", user);
        const ok = await verifyPassword(password, user.passwordHash);
        console.log(ok);
        if (!ok) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        userId = String(user._id);
        uname = user.username;

        if (!userId || !uname) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        const token = await signSession({
            sub: userId,
            username: uname,
        });

        const res = NextResponse.json({ message: "Logged in" });
        const isProd = process.env.NODE_ENV === "production";

        res.cookies.set("session", token, {
            httpOnly: true,
            sameSite: "lax",
            secure: isProd,
            path: "/",
            maxAge: 60 * 60 * 24 * 30, // 30 giorni
        });

        return res;
    } catch (error: unknown) {
        console.error("Error logging in:", error);
        return NextResponse.json({ error: "Failed to login" }, { status: 500 });
    }
}
