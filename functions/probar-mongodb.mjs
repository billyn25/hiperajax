import { pingDatabase } from "./mongo.mjs";
import { json, methodNotAllowed } from "./http.mjs";

export async function handler(event) {
  if (event.httpMethod !== "GET") {
    return methodNotAllowed(["GET"]);
  }

  try {
    await pingDatabase();
    return json(200, {
      ok: true,
      message: "Conexión con MongoDB correcta",
      database: process.env.MONGODB_DB || "hiperajax"
    });
  } catch (error) {
    console.error("Error al conectar con MongoDB:", error);
    return json(500, {
      ok: false,
      error: "No se pudo conectar con MongoDB",
      detail: error?.message || "Error desconocido"
    });
  }
}
