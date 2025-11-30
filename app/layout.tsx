import type { Metadata } from "next";
import { Josefin_Sans } from "next/font/google";
import "./globals.css";
import LayoutHeader from "@/app/layoutHeader";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/jwt";

const poppins = Josefin_Sans({
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
            <body className={`${poppins.className} antialiased`}>
                <LayoutHeader loggedUser={completeName} />
                {children}
            </body>
        </html>
    );
}
