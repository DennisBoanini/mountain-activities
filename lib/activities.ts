import {
    MountainActivity,
    MountainActivityLink,
} from "@/models/MountainActivity";
import { getDb } from "@/lib/mongodb";

export async function getActivities() {
    const db = await getDb();
    const docs = await db
        .collection("mountain_activities")
        .find({})
        .sort({ _id: -1 })
        .toArray();

    const list: MountainActivity[] = docs.map((d) => ({
        _id: d._id.toString(),
        name: d.name as string,
        done: Boolean(d.done),
        note: d.note as string,
        tags: Array.isArray(d.tags) ? (d.tags as string[]) : [],
        links: d.links as MountainActivityLink[],
        createdAt: (d.createdAt ?? new Date()).toString(),
        updatedAt: d.updatedAt ? d.updatedAt.toString() : undefined,
    }));

    return list;
}
