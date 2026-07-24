const { MongoClient, ObjectId } = require('mongodb');

let clientPromise = null;

function getClient() {
  if (!process.env.MONGODB_URI) {
    throw new Error('Falta la variable de entorno MONGODB_URI');
  }

  if (!clientPromise) {
    const client = new MongoClient(process.env.MONGODB_URI, {
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

function respuesta(statusCode, contenido) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    },
    body: JSON.stringify(contenido)
  };
}

function limpiarTexto(valor, maximo = 500) {
  return String(valor ?? '').trim().slice(0, maximo);
}

function normalizarLineas(lineas) {
  if (!Array.isArray(lineas)) return [];

  return lineas
    .filter((linea) => linea && typeof linea === 'object')
    .map((linea) => {
      const tipoEntrada = limpiarTexto(linea.tipo, 50).toLowerCase();
      const separador = linea.separador === true || tipoEntrada === 'separador';
      const manual = linea.manual === true || separador || tipoEntrada === 'linea-vacia' || tipoEntrada === 'linea_vacia' || tipoEntrada === 'manual';
      const tipo = separador ? 'separador' : ((tipoEntrada === 'linea_vacia') ? 'linea-vacia' : tipoEntrada);
      const name = limpiarTexto(linea.name || (separador ? linea.texto : ''), 250);

      return {
        name,
        brand: limpiarTexto(linea.brand, 100),
        desc: limpiarTexto(linea.desc, 1000),
        pvp: separador ? 0 : (Number(linea.pvp) || 0),
        qty: separador ? 1 : Math.max(1, Number(linea.qty) || 1),
        dto: separador ? 0 : Math.min(100, Math.max(0, Number(linea.dto) || 0)),
        manual,
        separador,
        tipo,
        texto: limpiarTexto(linea.texto || (separador ? name : ''), 1000)
      };
    });
}

function prepararPresupuesto(datos) {
  return {
    tienda: limpiarTexto(datos.tienda, 150),
    cliente: limpiarTexto(datos.cliente, 250),
    telefono: limpiarTexto(datos.telefono, 100),
    email: limpiarTexto(datos.email, 250),
    fecha: limpiarTexto(datos.fecha, 20),
    estado: limpiarTexto(datos.estado || 'Borrador', 50),
    validez: limpiarTexto(datos.validez, 20),
    observaciones: limpiarTexto(datos.observaciones, 5000),
    dtoGeneral: Number(datos.dtoGeneral) || 0,
    iva: Number(datos.iva) || 0,
    lineas: normalizarLineas(datos.lineas),
    versionApp: limpiarTexto(datos.versionApp, 50)
  };
}

async function obtenerNumero(db) {
  const year = new Date().getUTCFullYear();
  const contadorId = `presupuestos-${year}`;

  const resultado = await db.collection('contadores').findOneAndUpdate(
    { _id: contadorId },
    {
      $inc: { secuencia: 1 },
      $setOnInsert: {
        tipo: 'presupuestos',
        year,
        creadoEn: new Date()
      },
      $set: {
        actualizadoEn: new Date()
      }
    },
    {
      upsert: true,
      returnDocument: 'after'
    }
  );

  if (!resultado || !Number.isFinite(resultado.secuencia)) {
    throw new Error('No se pudo obtener el contador de presupuestos');
  }

  return `HA-${year}-${String(resultado.secuencia).padStart(4, '0')}`;
}

exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') {
    return respuesta(204, {});
  }

  if (event.httpMethod !== 'POST') {
    return respuesta(405, {
      ok: false,
      mensaje: 'Método no permitido'
    });
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const presupuestoEntrada = body.presupuesto || body;
    const mongoId = limpiarTexto(
      body.mongoId || presupuestoEntrada.mongoId || presupuestoEntrada._id,
      100
    );

    const presupuesto = prepararPresupuesto(presupuestoEntrada);

    if (!presupuesto.lineas.length) {
      return respuesta(400, {
        ok: false,
        mensaje: 'El presupuesto debe contener al menos una línea'
      });
    }

    const client = await getClient();
    const db = client.db('hiperajax');
    const coleccion = db.collection('presupuestos');

    /*
     * El número visible también queda protegido mediante un índice único.
     * Si ya existe, MongoDB impedirá que se guarde otro igual.
     */
    await coleccion.createIndex(
      { numero: 1 },
      {
        unique: true,
        name: 'numero_presupuesto_unico'
      }
    );

    /*
     * EDITAR:
     * Si llega mongoId, se mantiene el mismo _id y el mismo número.
     */
    if (mongoId) {
      if (!ObjectId.isValid(mongoId)) {
        return respuesta(400, {
          ok: false,
          mensaje: 'El identificador del presupuesto no es válido'
        });
      }

      const existente = await coleccion.findOne({
        _id: new ObjectId(mongoId)
      });

      if (!existente) {
        return respuesta(404, {
          ok: false,
          mensaje: 'No se encontró el presupuesto que quieres actualizar'
        });
      }

      const ahora = new Date();

      await coleccion.updateOne(
        { _id: existente._id },
        {
          $set: {
            ...presupuesto,
            numero: existente.numero,
            updatedAt: ahora
          }
        }
      );

      return respuesta(200, {
        ok: true,
        operacion: 'actualizado',
        mensaje: 'Presupuesto actualizado correctamente',
        mongoId: existente._id.toString(),
        numero: existente.numero,
        createdAt: existente.createdAt,
        updatedAt: ahora
      });
    }

    /*
     * NUEVO O DUPLICADO:
     * Si no llega mongoId, se genera un _id y un número nuevos.
     */
    const numero = await obtenerNumero(db);
    const ahora = new Date();

    const nuevoPresupuesto = {
      ...presupuesto,
      numero,
      createdAt: ahora,
      updatedAt: ahora,
      duplicadoDe: limpiarTexto(body.duplicadoDe, 100) || null
    };

    const resultado = await coleccion.insertOne(nuevoPresupuesto);

    return respuesta(201, {
      ok: true,
      operacion: body.duplicadoDe ? 'duplicado' : 'creado',
      mensaje: body.duplicadoDe
        ? 'Presupuesto duplicado correctamente'
        : 'Presupuesto guardado correctamente',
      mongoId: resultado.insertedId.toString(),
      numero,
      createdAt: ahora,
      updatedAt: ahora
    });
  } catch (error) {
    console.error('[guardar-presupuesto]', error);

    if (error && error.code === 11000) {
      return respuesta(409, {
        ok: false,
        mensaje: 'El número de presupuesto ya existe. Vuelve a intentarlo.'
      });
    }

    return respuesta(500, {
      ok: false,
      mensaje: 'Error guardando el presupuesto en MongoDB',
      error: error instanceof Error
        ? error.message
        : String(error)
    });
  }
};
