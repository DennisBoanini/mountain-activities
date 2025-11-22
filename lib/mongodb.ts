import { Db, MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI as string;
const dbName = process.env.MONGODB_DB as string; // <-- IMPORTANTISSIMO

if (!uri) {
    throw new Error("MONGODB_URI non è definita");
}
if (!dbName) {
    throw new Error("MONGODB_DB non è definita");
}

let client: MongoClient | null = null;
let db: Db | null = null;

export async function getDb(): Promise<Db> {
    if (db) return db;

    if (!client) {
        client = new MongoClient(uri);
        await client.connect();
    }

    db = client.db(dbName);

    // crea l'indice TTL se non esiste
    await db.collection("login_attempts").createIndex({ createdAt: 1 }, { expireAfterSeconds: 3600 });
    await db.collection("sessions").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

    return db;
}
