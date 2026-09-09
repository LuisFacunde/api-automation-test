const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

async function requisitar(metodo, caminho, { token, corpo } = {}) {
   const cabecalhos = {};
   if (corpo !== undefined) cabecalhos["content-type"] = "application/json";
   if (token) cabecalhos["authorization"] = `Bearer ${token}`;

   const resposta = await fetch(`${BASE_URL}${caminho}`, {
      method: metodo,
      headers: cabecalhos,
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
   });

   const texto = await resposta.text();
   const body = texto ? JSON.parse(texto) : null;

   return { status: resposta.status, body, headers: resposta.headers };
}

const get = (caminho, opcoes) => requisitar("GET", caminho, opcoes);

const post = (caminho, corpo, opcoes) =>
   requisitar("POST", caminho, { ...opcoes, corpo });

const patch = (caminho, corpo, opcoes) =>
   requisitar("PATCH", caminho, { ...opcoes, corpo });

module.exports = { BASE_URL, requisitar, get, post, patch };
