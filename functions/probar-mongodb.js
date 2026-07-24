const { MongoClient, ServerApiVersion } = require("mongodb");

let clientPromise = null;

function getClient() {
  if (!clientPromise) {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error("Falta la variable MONGODB_URI en Netlify");
    }

    const client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
      },
      family: 4,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000
    });

    clientPromise = client.connect().catch((error) => {
      clientPromise = null;
      throw error;
    });
  }

  return clientPromise;
}

exports.handler = async function () {
  try {
    const client = await getClient();

    await client.db("hiperajax").command({ ping: 1 });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ok: true,
        mensaje: "Conexión con MongoDB correcta",
        database: "hiperajax"
      })
    };
  } catch (error) {
    clientPromise = null;

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ok: false,
        mensaje: "Error conectando con MongoDB",
        error: error.message
      })
    };
  }
};
