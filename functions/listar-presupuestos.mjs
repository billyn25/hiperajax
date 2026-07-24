import { getDatabase } from "./mongo.mjs";
import { json, methodNotAllowed, requireApiKey } from "./http.mjs";

export async function handler(event) {
  if (event.httpMethod !== "GET") {
    return methodNotAllowed(["GET"]);
  }

  const auth = requireApiKey(event);
  if (!auth.ok) return json(auth.statusCode, { ok: false, error: auth.error });

  try {
    const params = event.queryStringParameters || {};
    const tienda = String(params.tienda || "").trim();
    const query = String(params.q || "").trim();
    const limit = Math.min(Math.max(Number.parseInt(params.limit || "100", 10) || 100, 1), 250);

    const filter = {};
    if (tienda) filter.tienda = tienda;
    if (query) {
      const safe = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(safe, "i");
      filter.$or = [{ numero: regex }, { cliente: regex }, { tienda: regex }];
    }

    const db = await getDatabase();
    const presupuestos = await db
      .collection("presupuestos")
      .find(filter, { projection: { _id: 0, contenido: 0 } })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .toArray();

    return json(200, { ok: true, total: presupuestos.length, presupuestos });
  } catch (error) {
    console.error("Error al listar presupuestos:", error);
    return json(500, { ok: false, error: "No se pudieron listar los presupuestos" });
  }
}
