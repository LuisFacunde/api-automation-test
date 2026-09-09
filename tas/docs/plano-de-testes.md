# Plano de Testes e Relatório de Execução — Cidade Conectada

Documento de entrega da Test Automation Solution (TAS) para a disciplina de Testes Automatizados.

## 1. SUT utilizado

O Sistema Sob Teste é o `sut-didatico`, uma API REST em Node.js, executada localmente e mantida em memória. A aplicação disponibiliza a API em `http://localhost:3000/api/v1` e uma interface web em `http://localhost:3000/web`.

Usuários semeados:

| Usuário              | Perfil  | Senha      |
| -------------------- | ------- | ---------- |
| `ana@exemplo.com`    | Cidadão | `senha123` |
| `bruno@exemplo.com`  | Cidadão | `senha123` |
| `gestor@exemplo.com` | Gestor  | `senha123` |

## 2. Endpoints contemplados

| Método | Endpoint              | Cobertura atual                                                                                |
| ------ | --------------------- | ---------------------------------------------------------------------------------------------- |
| `POST` | `/api/v1/auth/login`  | Login válido, credenciais inválidas, body vazio, normalização de e-mail e contrato da resposta |
| `POST` | `/api/v1/demands`     | Criação válida, validação de categoria e autorização por perfil                                |
| `POST` | `/api/v1/_test/reset` | Endpoint de laboratório disponível no SUT para reset do estado                                 |

## 3. Cenários automatizados

### 3.1 Serviço/API

Arquivo: `tests/api/login.test.js`.

- Login de cidadão com credenciais válidas retorna `200`.
- Login de gestor com credenciais válidas retorna `200`.
- Resposta contém `accessToken` como string não vazia.
- Resposta contém `tokenType` igual a `Bearer`.
- Resposta contém `expiresInSeconds` positivo.
- Resposta contém usuário com `id` e `name`.
- Header de resposta é `application/json`.
- Senha incorreta retorna `401 INVALID_CREDENTIALS`.
- E-mail inexistente retorna `401 INVALID_CREDENTIALS`.
- Body vazio retorna `401 INVALID_CREDENTIALS`.
- E-mail em letras maiúsculas é aceito após normalização.

Arquivo: `tests/api/hu06-registro.test.js`.

- Registro válido cria uma demanda com status `RECEIVED` e protocolo válido.
- Categoria fora da lista fechada retorna `400 VALIDATION_ERROR`.
- Gestor não pode registrar demanda e recebe `403 FORBIDDEN`.

### 3.2 Componente/unidade

Arquivo: `tests/unidade/status.test.js`.

- Verifica as 25 combinações possíveis entre os estados `RECEIVED`, `UNDER_ANALYSIS`, `IN_PROGRESS`, `RESOLVED` e `REJECTED`.
- Confirma as transições permitidas:
   - `RECEIVED -> UNDER_ANALYSIS`
   - `RECEIVED -> REJECTED`
   - `UNDER_ANALYSIS -> IN_PROGRESS`
   - `UNDER_ANALYSIS -> REJECTED`
   - `IN_PROGRESS -> RESOLVED`
- Confirma a rejeição das demais transições.

### 3.3 E2E

O fluxo `e2e/maestro/web-registro-demanda.yaml` cobre login pela interface web, autenticação do cidadão, preenchimento da descrição, envio da demanda e validação da mensagem de sucesso e do protocolo gerado.

## 4. Configuração e execução

### Pré-requisitos

- Node.js `>= 20.11.0`.
- npm.
- Os diretórios `tas/` e `sut-didatico/` lado a lado.

### Execução

Terminal 1, na pasta `tas`:

```powershell
npm run sut
```

Terminal 2, também na pasta `tas`:

```powershell
npm test
```

Comandos específicos:

```powershell
npm run test:unidade
npm run test:api
```

## 5. Evidências e análise dos resultados

Execução realizada em 09/09/2026 contra o SUT didático em `http://localhost:3000`:

| Suíte   | Testes | Passaram | Falharam |
| ------- | -----: | -------: | -------: |
| Unidade |     25 |       25 |        0 |
| API     |     14 |       14 |        0 |
| Total   |     39 |       39 |        0 |

Comandos utilizados:

```powershell
npm run test:unidade
npm run test:api
npm test
```

### Análise

Os 39 testes automatizados foram aprovados. A suíte valida caminhos felizes, respostas de erro, autorização por perfil, contrato básico de autenticação e toda a matriz de transição de status. O resultado indica que o comportamento coberto do SUT está consistente com as expectativas documentadas.

Como limitação, os endpoints de cadastro, logout, perfil, listagem, detalhe, histórico e atualização de status ainda não têm testes de serviço implementados. O fluxo E2E também requer execução separada.
