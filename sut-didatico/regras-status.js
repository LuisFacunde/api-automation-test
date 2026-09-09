// sut-didatico/regras-status.js   (recurso pedagogico)
// Fonte: tabela "Maquina de estados de DemandStatus" do contrato da API.
const TRANSICOES = {
   RECEIVED: ["UNDER_ANALYSIS", "REJECTED"],
   UNDER_ANALYSIS: ["IN_PROGRESS", "REJECTED"],
   IN_PROGRESS: ["RESOLVED"],
   RESOLVED: [],
   REJECTED: [],
};

const transicaoPermitida = (de, para) => (TRANSICOES[de] || []).includes(para);

module.exports = { transicaoPermitida };
