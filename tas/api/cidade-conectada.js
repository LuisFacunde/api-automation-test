const http = require("../lib/http");
const SENHA_PADRAO = process.env.SENHA_PADRAO || "senha123";

async function login(email, senha = SENHA_PADRAO) {
  const { status, body } = await http.post("/api/v1/auth/login", {
    email,
    password: senha,
  });
  if (status !== 200) {
    throw new Error(
      `Login de ${email} falhou com status ${status}: ` + JSON.stringify(body),
    );
  }
  return body.accessToken;
}

const criarDemanda = (token, demanda) =>
  http.post("/api/v1/demands", demanda, { token });

const mudarStatus = (token, id, status, note = null) =>
  http.patch(`/api/v1/demands/${id}/status`, { status, note }, { token });

module.exports = { login, criarDemanda, mudarStatus };
