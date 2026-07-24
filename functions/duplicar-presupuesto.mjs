import { ObjectId } from "mongodb";
import { getDatabase } from "./mongo.mjs";
import { json, methodNotAllowed, parseJsonBody } from "./http.mjs";

async function siguienteNumero(db, now) {
  const year = now.getFullYear();
  const counter = await db.collection("contadores").findOneAndUpdate(
    { _id: `presupuestos-${year}` },
    { $inc: { secuencia: 1 }, $setOnInsert: { createdAt: now } },
    { upsert: true, returnDocument: "after" }
  );
  const doc = counter?.value || counter;
  const secuencia = Number(doc?.secuencia || 1);
  return `HA-${year}-${String(secuencia).padStart(4, "0")}`;
}

export async function handler(event) {
  if (event.httpMethod !== "POST") return methodNotAllowed(["POST"]);

  const parsed = parseJsonBody(event);
  if (!parsed.ok) return json(400, { ok: false, mensaje: parsed.error });

  const id = String(parsed.value.mongoId || parsed.value.id || "").trim();
  if (!ObjectId.isValid(id)) return json(400, { ok: false, mensaje: "ID de presupuesto no válido" });

  try {
    const db = await getDatabase();
    const collection = db.collection("presupuestos");
    const original = await collection.findOne({ _id: new ObjectId(id) });
    if (!original) return json(404, { ok: false, mensaje: "Presupuesto original no encontrado" });

    const now = new Date();
    const numero = await siguienteNumero(db, now);
    const copia = { ...original };
    delete copia._id;
    delete copia.mongoId;
    copia.numero = numero;
    copia.estado = "Borrador";
    copia.fecha = now.toISOString().slice(0, 10);
    copia.duplicadoDe = String(original._id);
    copia.createdAt = now;
    copia.updatedAt = now;
    copia.guardado = now.toISOString();
    if (parsed.value.tienda) copia.tienda = String(parsed.value.tienda).trim();

    const result = await collection.insertOne(copia);
    return json(201, {
      ok: true,
      operacion: "duplicado",
      mongoId: String(result.insertedId),
      numero,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    });
  } catch (error) {
    console.error("[duplicar-presupuesto]", error);
    if (error?.code === 11000) return json(409, { ok: false, mensaje: "Conflicto al generar el número; vuelve a intentarlo" });
    return json(500, { ok: false, mensaje: "No se pudo duplicar el presupuesto" });
  }
}
