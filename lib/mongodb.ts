import { Db, MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB!;

let client: MongoClient | null = null;
let db: Db | null = null;

export async function getDb(): Promise<Db> {
    if (db) return db;

    if (!client) {
        client = await MongoClient.connect(uri);
    }

    db = client.db(dbName);
    return db;
}
