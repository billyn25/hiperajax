import { randomUUID } from "node:crypto";
import { getDatabase } from "./mongo.mjs";
import { json, methodNotAllowed, parseJsonBody, requireApiKey } from "./http.mjs";

function normalizarTexto(value, maxLength = 180) {
  return String(value ?? "").trim().slice(0, maxLength);
}

function validarPresupuesto(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, error: "Presupuesto no válido" };
  }

  const tienda = normalizarTexto(raw.tienda || "Sin tienda asignada", 100);
  const cliente = normalizarTexto(raw.cliente, 180);
  const numero = normalizarTexto(raw.numero, 80);

  if (!numero) return { ok: false, error: "Falta el número de presupuesto" };
  if (!raw.contenido || typeof raw.contenido !== "object") {
    return { ok: false, error: "Falta el contenido del presupuesto" };
  }

  return {
    ok: true,
    value: {
      id: normalizarTexto(raw.id, 80) || randomUUID(),
      numero,
      tienda,
      cliente,
      estado: normalizarTexto(raw.estado || "Pendiente", 60),
      contenido: raw.contenido
    }
  };
}

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return methodNotAllowed(["POST"]);
  }

  const auth = requireApiKey(event);
  if (!auth.ok) return json(auth.statusCode, { ok: false, error: auth.error });

  const parsed = parseJsonBody(event);
  if (!parsed.ok) return json(400, { ok: false, error: parsed.error });

  const validated = validarPresupuesto(parsed.value);
  if (!validated.ok) return json(400, { ok: false, error: validated.error });

  try {
    const db = await getDatabase();
    const collection = db.collection("presupuestos");
    const now = new Date();
    const presupuesto = validated.value;

    await collection.createIndex({ numero: 1 }, { unique: true });
    await collection.createIndex({ tienda: 1, updatedAt: -1 });

    const result = await collection.updateOne(
      { id: presupuesto.id },
      {
        $set: { ...presupuesto, updatedAt: now },
        $setOnInsert: { createdAt: now }
      },
      { upsert: true }
    );

    return json(200, {
      ok: true,
      id: presupuesto.id,
      numero: presupuesto.numero,
      creado: result.upsertedCount === 1
    });
  } catch (error) {
    console.error("Error al guardar presupuesto:", error);
    if (error?.code === 11000) {
      return json(409, { ok: false, error: "Ya existe un presupuesto con ese número" });
    }
    return json(500, { ok: false, error: "No se pudo guardar el presupuesto" });
  }
}
