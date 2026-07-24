import { MongoClient, ServerApiVersion } from "mongodb";

const DATABASE_NAME = process.env.MONGODB_DB || "hiperajax";

let client;
let clientPromise;

function getUri() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Falta la variable de entorno MONGODB_URI");
  }
  return uri;
}

export async function getDatabase() {
  if (!clientPromise) {
    client = new MongoClient(getUri(), {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
      },
      maxPoolSize: 10,
      minPoolSize: 0,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 10000
    });
    clientPromise = client.connect();
  }

  const connectedClient = await clientPromise;
  return connectedClient.db(DATABASE_NAME);
}

export async function pingDatabase() {
  const db = await getDatabase();
  await db.command({ ping: 1 });
  return true;
}
