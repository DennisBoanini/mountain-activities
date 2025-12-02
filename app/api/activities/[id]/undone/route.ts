import { getDb } from "@/lib/mongodb";
import { ObjectId } from "bson";
import { NextResponse } from "next/server";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        const db = await getDb();
        const _id = new ObjectId(id);

        const updateResult = await db.collection("mountain_activities").updateOne(
            { _id },
            {
                $set: {
                    done: false,
                    updatedAt: new Date(),
                },
            },
        );

        if (updateResult.matchedCount === 0) {
            return NextResponse.json({ error: "Attività non trovata" }, { status: 404 });
        }

        return NextResponse.json({ message: "Attività aggiornata" });
    } catch (error: unknown) {
        console.error("Error updating attivita:", error);
        return NextResponse.json({ error: "Failed to update attivita" }, { status: 500 });
    }
}
