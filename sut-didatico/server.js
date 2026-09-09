// sut-didatico/server.js   (recurso pedagogico)
//
// Implementa um SUBCONJUNTO do contrato da API Cidade Conectada, em memoria,
// sem nenhuma dependencia externa. Nao faz parte do Projeto Integrador.
// Serve para: (a) dar a todas as squads o mesmo ponto de partida,
//             (b) tornar os exemplos reproduziveis,
//             (c) ser quebrado de proposito em sala.
//
// Uso:  node sut-didatico/server.js          -> http://localhost:3000
//       PORT=3100 node sut-didatico/server.js

const http = require("node:http");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { transicaoPermitida } = require("./regras-status");

const PORT = Number(process.env.PORT || 3000);

// ---------------------------------------------------------------- estado
const CATEGORIAS = [
   "ROAD_MAINTENANCE",
   "PUBLIC_LIGHTING",
   "WASTE_DISPOSAL",
   "SANITATION",
   "INSPECTION",
];
const REGIOES = ["RPA_1", "RPA_2", "RPA_3", "RPA_4", "RPA_5", "RPA_6"];

const usuarios = []; // { id, name, email, password, role, createdAt, updatedAt }
const demandas = []; // { ...Demand, historico: [StatusChange] }
const sessoes = new Map(); // token -> userId
let sequencial = 0;

const agora = () => new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
const uuid = () => crypto.randomUUID();

function criarUsuario({ name, email, password, role }) {
   const u = {
      id: uuid(),
      name,
      email: String(email).toLowerCase(),
      password,
      role,
      createdAt: agora(),
      updatedAt: agora(),
   };
   usuarios.push(u);
   return u;
}

function semear() {
   criarUsuario({
      name: "Ana Cidada",
      email: "ana@exemplo.com",
      password: "senha123",
      role: "CITIZEN",
   });
   criarUsuario({
      name: "Bruno Cidadao",
      email: "bruno@exemplo.com",
      password: "senha123",
      role: "CITIZEN",
   });
   criarUsuario({
      name: "Gestora Publica",
      email: "gestor@exemplo.com",
      password: "senha123",
      role: "MANAGER",
   });
}
semear();

// ---------------------------------------------------------------- helpers
const publico = (u) => ({
   id: u.id,
   name: u.name,
   email: u.email,
   role: u.role,
   createdAt: u.createdAt,
   updatedAt: u.updatedAt,
});
const resumo = (u) => ({ id: u.id, name: u.name });

function saida(d, chamador) {
   const autor = usuarios.find((u) => u.id === d.authorId);
   const podeVerAutor =
      chamador && (chamador.role === "MANAGER" || chamador.id === d.authorId);
   return {
      id: d.id,
      protocol: d.protocol,
      category: d.category,
      description: d.description,
      status: d.status,
      location: d.location,
      photo: d.photo,
      author: podeVerAutor ? resumo(autor) : undefined,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
      resolvedAt: d.resolvedAt,
   };
}

function responder(res, status, corpo) {
   const texto = corpo === undefined ? "" : JSON.stringify(corpo);
   res.writeHead(status, {
      "content-type": "application/json; charset=utf-8",
      "content-length": Buffer.byteLength(texto),
   });
   res.end(texto);
}

const erro = (res, status, code, message, details) =>
   responder(res, status, {
      error: { code, message, details: details ?? undefined },
   });

function autenticar(req, res) {
   const cabecalho = req.headers.authorization || "";
   const token = cabecalho.startsWith("Bearer ") ? cabecalho.slice(7) : null;
   const userId = token && sessoes.get(token);
   if (!userId) {
      erro(res, 401, "UNAUTHORIZED", "Token de acesso ausente ou invalido.");
      return null;
   }
   return usuarios.find((u) => u.id === userId);
}

function validarDemanda(corpo) {
   const d = [];
   if (!CATEGORIAS.includes(corpo?.category))
      d.push({
         field: "category",
         issue: "Valor fora da lista fechada de DemandCategory.",
      });
   const desc = corpo?.description;
   if (typeof desc !== "string" || desc.length < 20 || desc.length > 1000)
      d.push({
         field: "description",
         issue: "Deve ter entre 20 e 1000 caracteres.",
      });
   const loc = corpo?.location;
   if (!loc || typeof loc !== "object") {
      d.push({ field: "location", issue: "Campo obrigatorio." });
   } else {
      if (
         typeof loc.latitude !== "number" ||
         loc.latitude < -90 ||
         loc.latitude > 90
      )
         d.push({
            field: "location.latitude",
            issue: "Deve ser numero entre -90 e 90.",
         });
      if (
         typeof loc.longitude !== "number" ||
         loc.longitude < -180 ||
         loc.longitude > 180
      )
         d.push({
            field: "location.longitude",
            issue: "Deve ser numero entre -180 e 180.",
         });
      if (!REGIOES.includes(loc.region))
         d.push({
            field: "location.region",
            issue: "Valor fora da lista fechada de Region.",
         });
   }
   return d;
}

// ---------------------------------------------------------------- rotas
const rotas = [];
const rota = (metodo, padrao, handler) =>
   rotas.push({ metodo, padrao, handler });

rota("POST", /^\/api\/v1\/auth\/register$/, (req, res, _m, corpo) => {
   const d = [];
   if (
      typeof corpo?.name !== "string" ||
      corpo.name.length < 3 ||
      corpo.name.length > 120
   )
      d.push({ field: "name", issue: "Deve ter entre 3 e 120 caracteres." });
   if (
      typeof corpo?.email !== "string" ||
      !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(corpo.email)
   )
      d.push({ field: "email", issue: "Formato de e-mail invalido." });
   if (
      typeof corpo?.password !== "string" ||
      corpo.password.length < 8 ||
      !/[a-zA-Z]/.test(corpo.password) ||
      !/\d/.test(corpo.password)
   )
      d.push({
         field: "password",
         issue: "Minimo de 8 caracteres, com ao menos uma letra e um numero.",
      });
   if (d.length)
      return erro(res, 400, "VALIDATION_ERROR", "Dados invalidos.", d);
   if (usuarios.some((u) => u.email === String(corpo.email).toLowerCase())) {
      return erro(
         res,
         409,
         "EMAIL_ALREADY_REGISTERED",
         "E-mail ja cadastrado.",
      );
   }
   const u = criarUsuario({ ...corpo, role: "CITIZEN" }); // autocadastro sempre CITIZEN
   return responder(res, 201, publico(u));
});

rota("POST", /^\/api\/v1\/auth\/login$/, (req, res, _m, corpo) => {
   const u = usuarios.find(
      (x) =>
         x.email === String(corpo?.email || "").toLowerCase() &&
         x.password === corpo?.password,
   );
   if (!u)
      return erro(res, 401, "INVALID_CREDENTIALS", "Credenciais invalidas.");
   const accessToken = crypto.randomBytes(24).toString("hex");
   sessoes.set(accessToken, u.id);
   return responder(res, 200, {
      accessToken,
      tokenType: "Bearer",
      expiresInSeconds: 86400,
      user: resumo(u),
   });
});

rota("POST", /^\/api\/v1\/auth\/logout$/, (req, res) => {
   const u = autenticar(req, res);
   if (!u) return;
   const token = req.headers.authorization.slice(7);
   sessoes.delete(token);
   return responder(res, 204);
});

rota("GET", /^\/api\/v1\/auth\/me$/, (req, res) => {
   const u = autenticar(req, res);
   if (!u) return;
   return responder(res, 200, publico(u));
});

rota("POST", /^\/api\/v1\/demands$/, (req, res, _m, corpo) => {
   const u = autenticar(req, res);
   if (!u) return;
   if (u.role !== "CITIZEN")
      return erro(
         res,
         403,
         "FORBIDDEN",
         "Operacao vedada ao perfil do chamador.",
      );
   const d = validarDemanda(corpo);
   if (d.length)
      return erro(res, 400, "VALIDATION_ERROR", "Dados invalidos.", d);

   sequencial += 1;
   const ts = agora();
   const demanda = {
      id: uuid(),
      protocol: `DEM-${new Date().getUTCFullYear()}-${String(sequencial).padStart(6, "0")}`,
      category: corpo.category,
      description: corpo.description,
      status: "RECEIVED", // <- quebre AQUI de proposito em sala
      location: { addressLabel: null, ...corpo.location },
      photo: null,
      authorId: u.id,
      createdAt: ts,
      updatedAt: ts,
      resolvedAt: null,
      historico: [
         {
            id: uuid(),
            fromStatus: null,
            toStatus: "RECEIVED",
            note: null,
            changedBy: resumo(u),
            createdAt: ts,
         },
      ],
   };
   demandas.push(demanda);
   return responder(res, 201, saida(demanda, u));
});

rota("GET", /^\/api\/v1\/demands$/, (req, res, _m, _c, url) => {
   const u = autenticar(req, res);
   if (!u) return;
   const page = Number(url.searchParams.get("page") || 1);
   const pageSize = Number(url.searchParams.get("pageSize") || 20);
   const status = url.searchParams.get("status");
   const category = url.searchParams.get("category");

   let itens =
      u.role === "MANAGER"
         ? [...demandas]
         : demandas.filter((d) => d.authorId === u.id);
   if (status) itens = itens.filter((d) => d.status === status);
   if (category) itens = itens.filter((d) => d.category === category);
   itens.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

   const totalItems = itens.length;
   const inicio = (page - 1) * pageSize;
   return responder(res, 200, {
      data: itens.slice(inicio, inicio + pageSize).map((d) => saida(d, u)),
      pagination: {
         page,
         pageSize,
         totalItems,
         totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
      },
   });
});

rota("GET", /^\/api\/v1\/demands\/([^/]+)$/, (req, res, m) => {
   const u = autenticar(req, res);
   if (!u) return;
   const d = demandas.find((x) => x.id === m[1]);
   if (!d) return erro(res, 404, "NOT_FOUND", "Demanda nao encontrada.");
   if (u.role !== "MANAGER" && d.authorId !== u.id)
      return erro(res, 404, "NOT_FOUND", "Demanda nao encontrada.");
   return responder(res, 200, saida(d, u));
});

rota("GET", /^\/api\/v1\/demands\/([^/]+)\/history$/, (req, res, m) => {
   const u = autenticar(req, res);
   if (!u) return;
   const d = demandas.find((x) => x.id === m[1]);
   if (!d) return erro(res, 404, "NOT_FOUND", "Demanda nao encontrada.");
   if (u.role !== "MANAGER" && d.authorId !== u.id)
      return erro(res, 404, "NOT_FOUND", "Demanda nao encontrada.");
   return responder(res, 200, {
      data: d.historico,
      pagination: {
         page: 1,
         pageSize: d.historico.length,
         totalItems: d.historico.length,
         totalPages: 1,
      },
   });
});

rota("PATCH", /^\/api\/v1\/demands\/([^/]+)\/status$/, (req, res, m, corpo) => {
   const u = autenticar(req, res);
   if (!u) return;
   if (u.role !== "MANAGER")
      return erro(
         res,
         403,
         "FORBIDDEN",
         "Operacao vedada ao perfil do chamador.",
      );
   const d = demandas.find((x) => x.id === m[1]);
   if (!d) return erro(res, 404, "NOT_FOUND", "Demanda nao encontrada.");
   const para = corpo?.status;
   if (
      ![
         "RECEIVED",
         "UNDER_ANALYSIS",
         "IN_PROGRESS",
         "RESOLVED",
         "REJECTED",
      ].includes(para)
   ) {
      return erro(res, 400, "VALIDATION_ERROR", "Dados invalidos.", [
         {
            field: "status",
            issue: "Valor fora da lista fechada de DemandStatus.",
         },
      ]);
   }
   if (!transicaoPermitida(d.status, para)) {
      return erro(
         res,
         409,
         "INVALID_STATUS_TRANSITION",
         `Transicao de ${d.status} para ${para} nao e permitida.`,
      );
   }
   const ts = agora();
   d.historico.push({
      id: uuid(),
      fromStatus: d.status,
      toStatus: para,
      note: corpo?.note ?? null,
      changedBy: resumo(u),
      createdAt: ts,
   });
   d.status = para;
   d.updatedAt = ts;
   if (para === "RESOLVED") d.resolvedAt = ts;
   return responder(res, 200, saida(d, u));
});

// Reset do estado. NAO faz parte do contrato: existe so para o laboratorio.
rota("POST", /^\/api\/v1\/_test\/reset$/, (req, res) => {
   demandas.length = 0;
   usuarios.length = 0;
   sessoes.clear();
   sequencial = 0;
   semear();
   return responder(res, 204);
});

// ------------------------------------------------- UI web minima (Atividade 6)
rota("GET", /^\/(web)?$/, (req, res) => {
   const arquivo = path.join(__dirname, "web", "index.html");
   const html = fs.readFileSync(arquivo);
   res.writeHead(200, {
      "content-type": "text/html; charset=utf-8",
      "content-length": html.length,
   });
   res.end(html);
});

// ---------------------------------------------------------------- servidor
const servidor = http.createServer((req, res) => {
   const url = new URL(req.url, `http://localhost:${PORT}`);
   const pedacos = [];
   req.on("data", (c) => pedacos.push(c));
   req.on("end", () => {
      let corpo = undefined;
      if (pedacos.length) {
         try {
            corpo = JSON.parse(Buffer.concat(pedacos).toString("utf8"));
         } catch {
            return erro(
               res,
               400,
               "MALFORMED_JSON",
               "Corpo da requisicao nao e JSON valido.",
            );
         }
      }
      for (const r of rotas) {
         if (r.metodo !== req.method) continue;
         const m = url.pathname.match(r.padrao);
         if (m) return r.handler(req, res, m, corpo, url);
      }
      return erro(res, 404, "NOT_FOUND", "Recurso nao encontrado.");
   });
});

servidor.listen(PORT, () => {
   console.log(`SUT didatico Cidade Conectada em http://localhost:${PORT}`);
   console.log(
      "API: /api/v1  ·  UI web: /web  ·  reset: POST /api/v1/_test/reset",
   );
});
