const { MongoClient } = require('mongodb');

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

  try{
    const client = await getClient();
    const db = client.db(process.env.MONGODB_DB || undefined);
    const items = await db.collection('presupuestos')
      .find({}, {
        projection:{
          numero:1, cliente:1, fecha:1, estado:1, total:1,
          guardado:1, createdAt:1, updatedAt:1, duplicadoDe:1
        }
      })
      .sort({updatedAt:-1, guardado:-1, createdAt:-1, _id:-1})
      .limit(1000)
      .toArray();

    const presupuestos = items.map(p => ({
      mongoId:String(p._id),
      numero:p.numero || '',
      cliente:p.cliente || '',
      fecha:p.fecha || '',
      estado:p.estado || 'Borrador',
      total:Number(p.total) || 0,
      guardado:p.guardado || null,
      createdAt:p.createdAt || null,
      updatedAt:p.updatedAt || null,
      duplicadoDe:p.duplicadoDe || null
    }));

    return {statusCode:200, headers, body:JSON.stringify({ok:true,presupuestos})};
  }catch(error){
    console.error('[listar-presupuestos]', error);
    return {statusCode:500, headers, body:JSON.stringify({ok:false,mensaje:'No se pudieron cargar los presupuestos'})};
  }
};
