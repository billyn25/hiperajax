const { MongoClient } = require("mongodb");

let client;

exports.handler = async function () {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      return {
        statusCode: 500,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ok: false,
          mensaje: "Falta la variable MONGODB_URI en Netlify"
        })
      };
    }

    if (!client) {
      client = new MongoClient(uri);
      await client.connect();
    }

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
