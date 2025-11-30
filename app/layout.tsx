import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LayoutHeader from "@/app/layoutHeader";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/jwt";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Mountaneering",
    description: "Applicazione per attività alpinistiche",
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    let completeName: string | undefined = undefined;
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("session")?.value;
        if (token) {
            const { completeName: sessionCompleteName } = await verifySession(token);
            completeName = sessionCompleteName;
        }
    } catch (e: unknown) {
        console.error(e);
    }
    return (
        <html lang="it">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <LayoutHeader />
                {children}
            </body>
        </html>
    );
}
