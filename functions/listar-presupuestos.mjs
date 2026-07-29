import { getDatabase } from "./mongo.mjs";
import { json, methodNotAllowed } from "./http.mjs";

export async function handler(event) {
  if (event.httpMethod !== "GET") return methodNotAllowed(["GET"]);

  try {
    const params = event.queryStringParameters || {};
    const tienda = String(params.tienda || "").trim();
    const comercial = String(params.comercial || "").trim();
    const q = String(params.q || "").trim();
    const limit = Math.min(Math.max(parseInt(params.limit || "500", 10) || 500, 1), 1000);

    const filter = {};
    if (tienda) filter.tienda = tienda;
    if (comercial) filter.comercial = comercial;
    if (q) {
      const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(safe, "i");
      filter.$or = [
        { numero: regex }, { cliente: regex }, { telefono: regex },
        { email: regex }, { tienda: regex }, { comercial: regex }, { identificador: regex }, { estado: regex }
      ];
    }

    const db = await getDatabase();
    const docs = await db.collection("presupuestos")
      .find(filter, {
        projection: {
          numero: 1, cliente: 1, telefono: 1, email: 1, tienda: 1, comercial: 1,
          fecha: 1, estado: 1, total: 1, lineas: 1, dtoGeneral: 1, iva: 1, identificador: 1,
          guardado: 1, createdAt: 1, updatedAt: 1, duplicadoDe: 1
        }
      })
      .sort({ updatedAt: -1, guardado: -1, createdAt: -1, _id: -1 })
      .limit(limit)
      .toArray();

    const presupuestos = docs.map((doc) => ({
      mongoId: String(doc._id),
      numero: doc.numero || "",
      cliente: doc.cliente || "",
      telefono: doc.telefono || "",
      email: doc.email || "",
      tienda: doc.tienda || "",
      comercial: doc.comercial || "",
      fecha: doc.fecha || "",
      estado: doc.estado || "Borrador",
      total: Number(doc.total) || 0,
      numeroLineas: Array.isArray(doc.lineas) ? doc.lineas.length : 0,
      lineas: Array.isArray(doc.lineas) ? doc.lineas : [],
      dtoGeneral: Number(doc.dtoGeneral) || 0,
      iva: Number(doc.iva) || 0,
      identificador: doc.identificador || "",
      guardado: doc.guardado || null,
      createdAt: doc.createdAt || null,
      updatedAt: doc.updatedAt || null,
      duplicadoDe: doc.duplicadoDe || null
    }));

    return json(200, { ok: true, total: presupuestos.length, presupuestos });
  } catch (error) {
    console.error("[listar-presupuestos]", error);
    return json(500, { ok: false, mensaje: "No se pudieron cargar los presupuestos" });
  }
}
