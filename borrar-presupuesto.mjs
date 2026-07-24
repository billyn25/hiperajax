import { ObjectId } from "mongodb";
import { getDatabase } from "./mongo.mjs";
import { json, methodNotAllowed, parseJsonBody } from "./http.mjs";

export async function handler(event) {
  if (!["POST", "DELETE"].includes(event.httpMethod)) return methodNotAllowed(["POST", "DELETE"]);

  const parsed = parseJsonBody(event);
  if (!parsed.ok) return json(400, { ok: false, mensaje: parsed.error });

  const params = event.queryStringParameters || {};
  const id = String(parsed.value.mongoId || parsed.value.id || params.id || "").trim();
  const numero = String(parsed.value.numero || params.numero || "").trim();

  if (!id && !numero) return json(400, { ok: false, mensaje: "Falta id o número de presupuesto" });
  if (id && !ObjectId.isValid(id)) return json(400, { ok: false, mensaje: "ID de presupuesto no válido" });

  try {
    const db = await getDatabase();
    const filter = id ? { _id: new ObjectId(id) } : { numero };
    const result = await db.collection("presupuestos").deleteOne(filter);
    if (!result.deletedCount) return json(404, { ok: false, mensaje: "Presupuesto no encontrado" });
    return json(200, { ok: true, mensaje: "Presupuesto borrado" });
  } catch (error) {
    console.error("[borrar-presupuesto]", error);
    return json(500, { ok: false, mensaje: "No se pudo borrar el presupuesto" });
  }
}
