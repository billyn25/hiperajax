const { MongoClient, ObjectId } = require('mongodb');

let clientPromise;
function getClient(){
  if(!process.env.MONGODB_URI) throw new Error('Falta la variable MONGODB_URI');
  if(!clientPromise){
    const client = new MongoClient(process.env.MONGODB_URI);
    clientPromise = client.connect();
  }
  return clientPromise;
}

const headers = {
  'Content-Type':'application/json; charset=utf-8',
  'Access-Control-Allow-Origin':'*',
  'Access-Control-Allow-Headers':'Content-Type',
  'Access-Control-Allow-Methods':'POST,OPTIONS'
};

exports.handler = async (event) => {
  if(event.httpMethod === 'OPTIONS') return {statusCode:204, headers, body:''};
  if(event.httpMethod !== 'POST') return {statusCode:405, headers, body:JSON.stringify({ok:false,mensaje:'Método no permitido'})};

  let data = {};
  try{ data = event.body ? JSON.parse(event.body) : {}; }
  catch{ return {statusCode:400, headers, body:JSON.stringify({ok:false,mensaje:'JSON no válido'})}; }

  const id = String(data.mongoId || data.id || '').trim();
  if(!ObjectId.isValid(id)) return {statusCode:400, headers, body:JSON.stringify({ok:false,mensaje:'ID de presupuesto no válido'})};

  try{
    const client = await getClient();
    const db = client.db(process.env.MONGODB_DB || undefined);
    const presupuestos = db.collection('presupuestos');
    const original = await presupuestos.findOne({_id:new ObjectId(id)});
    if(!original) return {statusCode:404, headers, body:JSON.stringify({ok:false,mensaje:'Presupuesto original no encontrado'})};

    const now = new Date();
    const year = now.getFullYear();
    const counter = await db.collection('contadores').findOneAndUpdate(
      {_id:`presupuestos-${year}`},
      {$inc:{secuencia:1}, $setOnInsert:{createdAt:now}},
      {upsert:true, returnDocument:'after'}
    );
    const secuencia = Number(counter?.secuencia || counter?.value?.secuencia || 1);
    const numero = `HA-${year}-${String(secuencia).padStart(4,'0')}`;

    const copia = {...original};
    delete copia._id;
    copia.numero = numero;
    copia.duplicadoDe = String(original._id);
    copia.createdAt = now;
    copia.updatedAt = now;
    copia.guardado = now.toISOString();
    if(data.cliente !== undefined) copia.cliente = String(data.cliente || '');

    const inserted = await presupuestos.insertOne(copia);
    return {
      statusCode:201,
      headers,
      body:JSON.stringify({ok:true,mongoId:String(inserted.insertedId),numero,presupuesto:{...copia,mongoId:String(inserted.insertedId)}})
    };
  }catch(error){
    console.error('[duplicar-presupuesto]', error);
    if(error?.code === 11000) return {statusCode:409, headers, body:JSON.stringify({ok:false,mensaje:'Conflicto al generar el número; vuelve a intentarlo'})};
    return {statusCode:500, headers, body:JSON.stringify({ok:false,mensaje:'No se pudo duplicar el presupuesto'})};
  }
};
