import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "bson";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = (await request.json()) as { done: boolean; relation: string };

        const db = await getDb();
        const _id = new ObjectId(id);

        const actualActivity = await db.collection("mountain_activities").findOne({ _id });
        const updateResult = await db.collection("mountain_activities").updateOne(
            { _id },
            {
                $set: {
                    ...actualActivity,
                    done: body.done,
                    updatedAt: new Date(),
                    relation: body.relation,
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

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        const db = await getDb();
        const _id = new ObjectId(id);

        const deleteResult = await db.collection("mountain_activities").deleteOne({ _id });

        if (deleteResult.deletedCount === 0) {
            return NextResponse.json({ error: "Attività non trovata" }, { status: 404 });
        }

        return NextResponse.json({ message: "Attività eliminata" });
    } catch (error: unknown) {
        console.error("Error deleting attivita:", error);
        return NextResponse.json({ error: "Failed to delete attivita" }, { status: 500 });
    }
}
