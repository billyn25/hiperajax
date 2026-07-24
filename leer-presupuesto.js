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
  'Access-Control-Allow-Methods':'GET,OPTIONS'
};

exports.handler = async (event) => {
  if(event.httpMethod === 'OPTIONS') return {statusCode:204, headers, body:''};
  if(event.httpMethod !== 'GET') return {statusCode:405, headers, body:JSON.stringify({ok:false,mensaje:'Método no permitido'})};

  const id = String(event.queryStringParameters?.id || '').trim();
  if(!ObjectId.isValid(id)) return {statusCode:400, headers, body:JSON.stringify({ok:false,mensaje:'ID de presupuesto no válido'})};

  try{
    const client = await getClient();
    const db = client.db(process.env.MONGODB_DB || undefined);
    const doc = await db.collection('presupuestos').findOne({_id:new ObjectId(id)});
    if(!doc) return {statusCode:404, headers, body:JSON.stringify({ok:false,mensaje:'Presupuesto no encontrado'})};

    const presupuesto = {...doc, mongoId:String(doc._id)};
    delete presupuesto._id;
    return {statusCode:200, headers, body:JSON.stringify({ok:true,presupuesto})};
  }catch(error){
    console.error('[leer-presupuesto]', error);
    return {statusCode:500, headers, body:JSON.stringify({ok:false,mensaje:'No se pudo leer el presupuesto'})};
  }
};
