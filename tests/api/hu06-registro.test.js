const { test } = require("node:test");
const assert = require("node:assert/strict");
const { login, criarDemanda } = require("../../api/cidade-conectada");
const { valida, com, USUARIOS } = require("../../data/demandas");

test("HU-06 registro valido cria demanda em RECEIVED", async () => {
  const token = await login(USUARIOS.cidada);
  const { status, body } = await criarDemanda(token, valida());

  assert.equal(status, 201);
  assert.equal(body.status, "RECEIVED");
  assert.match(body.protocol, /^DEM-\d{4}-\d{6}$/);
});

test('HU-06 categoria fora da lista fechada e recusada', async () => {
  const token = await login(USUARIOS.cidada);
  const { status, body } = await criarDemanda(token, com({ category: 'BURACO' }));
 
  assert.equal(status, 400);
  assert.equal(body.error.code, 'VALIDATION_ERROR');
  assert.ok(body.error.details.some(d => d.field === 'category'));
});
 
test('HU-03 gestor nao pode registrar demanda', async () => {
  const token = await login(USUARIOS.gestor);
  const { status, body } = await criarDemanda(token, valida());
 
  assert.equal(status, 403);
  assert.equal(body.error.code, 'FORBIDDEN');
})
