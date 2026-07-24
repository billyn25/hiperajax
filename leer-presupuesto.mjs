import { ObjectId } from "mongodb";
import { getDatabase } from "./mongo.mjs";
import { json, methodNotAllowed } from "./http.mjs";

export async function handler(event) {
  if (event.httpMethod !== "GET") return methodNotAllowed(["GET"]);

  const params = event.queryStringParameters || {};
  const id = String(params.id || params.mongoId || "").trim();
  const numero = String(params.numero || "").trim();

  if (!id && !numero) return json(400, { ok: false, mensaje: "Falta id o número de presupuesto" });
  if (id && !ObjectId.isValid(id)) return json(400, { ok: false, mensaje: "ID de presupuesto no válido" });

  try {
    const db = await getDatabase();
    const filter = id ? { _id: new ObjectId(id) } : { numero };
    const doc = await db.collection("presupuestos").findOne(filter);
    if (!doc) return json(404, { ok: false, mensaje: "Presupuesto no encontrado" });

    const presupuesto = { ...doc, mongoId: String(doc._id) };
    delete presupuesto._id;
    return json(200, { ok: true, presupuesto });
  } catch (error) {
    console.error("[leer-presupuesto]", error);
    return json(500, { ok: false, mensaje: "No se pudo leer el presupuesto" });
  }
}
