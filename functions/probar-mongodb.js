
exports.handler = async function () {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      ok: true,
      mensaje: "La función de Netlify funciona correctamente"
    })
  };
};
