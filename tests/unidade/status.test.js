const { test } = require("node:test");
const assert = require("node:assert/strict");
const CAMINHO = process.env.REGRAS_STATUS || "../../../sut-didatico/regras-status";
const { transicaoPermitida } = require(CAMINHO);

const ESTADOS = [
  "RECEIVED",
  "UNDER_ANALYSIS",
  "IN_PROGRESS",
  "RESOLVED",
  "REJECTED",
];

const PERMITIDAS = new Set([
  "RECEIVED>UNDER_ANALYSIS",
  "RECEIVED>REJECTED",
  "UNDER_ANALYSIS>IN_PROGRESS",
  "UNDER_ANALYSIS>REJECTED",
  "IN_PROGRESS>RESOLVED",
]);

for (const de of ESTADOS) {
  for (const para of ESTADOS) {
    const esperado = PERMITIDAS.has(`${de}>${para}`);
    const rotulo = esperado ? "permitida" : "recusada";
    test(`HU-13 transicao ${de} -> ${para} e ${rotulo}`, () => {
      assert.equal(transicaoPermitida(de, para), esperado);
    });
  }
}
