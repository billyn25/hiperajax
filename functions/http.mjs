const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store"
};

export function json(statusCode, body) {
  return {
    statusCode,
    headers: JSON_HEADERS,
    body: JSON.stringify(body)
  };
}

export function methodNotAllowed(allowed) {
  return {
    statusCode: 405,
    headers: {
      ...JSON_HEADERS,
      Allow: allowed.join(", ")
    },
    body: JSON.stringify({ ok: false, error: "Método no permitido" })
  };
}

export function requireApiKey(event) {
  const expected = process.env.HIPER_AJAX_API_KEY;
  if (!expected) {
    return { ok: false, statusCode: 503, error: "Falta configurar HIPER_AJAX_API_KEY" };
  }

  const received = event.headers?.["x-hiperajax-key"] || event.headers?.["X-HiperAjax-Key"];
  if (!received || received !== expected) {
    return { ok: false, statusCode: 401, error: "Acceso no autorizado" };
  }

  return { ok: true };
}

export function parseJsonBody(event) {
  try {
    return { ok: true, value: JSON.parse(event.body || "{}") };
  } catch {
    return { ok: false, error: "JSON no válido" };
  }
}
