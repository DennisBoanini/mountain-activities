import { NextResponse } from "next/server";
import { CreateMountainActivity, MountainActivity, MountainActivityLink } from "@/models/MountainActivity";
import { getDb } from "@/lib/mongodb";
import { getActivities } from "@/lib/activities";

export async function GET(): Promise<NextResponse<MountainActivity[] | { error: string }>> {
    try {
        const list = await getActivities();
        return NextResponse.json(list);
    } catch (error: unknown) {
        console.error("Error fetching activities:", error);
        return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
    }
}

export async function POST(request: Request): Promise<NextResponse<MountainActivity | { error: string }>> {
    try {
        const body = (await request.json()) as CreateMountainActivity;
        const { name, done, tags, note, links, summitAltitude, mountainGroup, place } = body;

        if (!name || name.trim().length === 0) {
            return NextResponse.json({ error: "name is required" }, { status: 400 });
        }

        const parsedTags: string[] = Array.isArray(tags) ? tags.map((t) => t.trim()).filter((t) => t.length > 0) : [];

        const parsedLinks: MountainActivityLink[] = Array.isArray(links) ? links.filter((link) => link.link.length > 0 && link.name.length > 0) : [];

        const db = await getDb();
        const now = new Date();
        const docToInsert = {
            name: name.trim(),
            done: Boolean(done),
            tags: parsedTags,
            links: parsedLinks,
            note: note.trim(),
            place: place.trim(),
            summitAltitude,
            mountainGroup: mountainGroup.trim(),
            createdAt: now,
            updatedAt: now,
        };

        const insertResult = await db.collection("mountain_activities").insertOne(docToInsert);

        const created: MountainActivity = {
            _id: insertResult.insertedId.toString(),
            name: name.trim(),
            note: note.trim(),
            done: Boolean(done),
            tags: parsedTags,
            place,
            mountainGroup,
            summitAltitude: summitAltitude,
            links: parsedLinks,
            relation: "",
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
        };

        return NextResponse.json(created, { status: 201 });
    } catch (error: unknown) {
        console.error("Error creating attivita:", error);
        return NextResponse.json({ error: "Failed to create attivita" }, { status: 500 });
    }
}
