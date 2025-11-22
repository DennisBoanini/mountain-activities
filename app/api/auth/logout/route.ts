import { NextResponse } from "next/server";

export async function POST(): Promise<NextResponse<{ message: string }>> {
    const res = NextResponse.json({ message: "Logged out" });
    res.cookies.set("session", "", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 0,
    });
    return res;
}
