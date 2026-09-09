const { test } = require("node:test");
const assert = require("node:assert/strict");
const { fazerLogin } = require("../../api/cidade-conectada");

const CIDADA = { email: "ana@exemplo.com",    password: "senha123" };
const GESTOR = { email: "gestor@exemplo.com", password: "senha123" };

test("LOGIN credenciais válidas de cidadão retornam 200", async () => {
  const { status } = await fazerLogin(CIDADA);
  assert.equal(status, 200);
});

test("LOGIN credenciais válidas de gestor retornam 200", async () => {
  const { status } = await fazerLogin(GESTOR);
  assert.equal(status, 200);
});

test("LOGIN resposta tem accessToken como string não vazia", async () => {
  const { body } = await fazerLogin(CIDADA);
  assert.equal(typeof body.accessToken, "string");
  assert.ok(body.accessToken.length > 0);
});

test("LOGIN resposta tem tokenType igual a Bearer", async () => {
  const { body } = await fazerLogin(CIDADA);
  assert.equal(body.tokenType, "Bearer");
});

test("LOGIN resposta tem expiresInSeconds como número positivo", async () => {
  const { body } = await fazerLogin(CIDADA);
  assert.equal(typeof body.expiresInSeconds, "number");
  assert.ok(body.expiresInSeconds > 0);
});

test("LOGIN resposta tem user com id e name", async () => {
  const { body } = await fazerLogin(CIDADA);
  assert.ok(body.user);
  assert.equal(typeof body.user.id,   "string");
  assert.equal(typeof body.user.name, "string");
});

test("LOGIN header content-type é application/json", async () => {
  const { headers } = await fazerLogin(CIDADA);
  assert.match(headers.get("content-type"), /application\/json/);
});

test("LOGIN senha errada retorna 401 INVALID_CREDENTIALS", async () => {
  const { status, body } = await fazerLogin({ email: CIDADA.email, password: "senhaErrada99" });
  assert.equal(status, 401);
  assert.equal(body.error.code, "INVALID_CREDENTIALS");
});

test("LOGIN email inexistente retorna 401 INVALID_CREDENTIALS", async () => {
  const { status, body } = await fazerLogin({ email: "naoexiste@exemplo.com", password: "senha123" });
  assert.equal(status, 401);
  assert.equal(body.error.code, "INVALID_CREDENTIALS");
});

test("LOGIN body vazio retorna 401 INVALID_CREDENTIALS", async () => {
  const { status, body } = await fazerLogin({});
  assert.equal(status, 401);
  assert.equal(body.error.code, "INVALID_CREDENTIALS");
});

test("LOGIN email em maiúsculas é aceito pois SUT normaliza para minúsculo", async () => {
  const { status } = await fazerLogin({ email: "ANA@EXEMPLO.COM", password: "senha123" });
  assert.equal(status, 200);
});
