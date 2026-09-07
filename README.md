# TAS — Test Automation Solution | Cidade Conectada

> Solução de Automação de Testes desenvolvida para a disciplina **ADS033 — Testes Automatizados · 2026.2**.

---

## 1. O que este repositório é

Este repositório contém exclusivamente a **TAS (Test Automation Solution)** do projeto *Cidade Conectada*. Ele é o ecossistema isolado de garantia de qualidade e automação de testes da squad.

### O que pertence a este repositório:
- **Suítes de testes automatizados**: testes unitários, testes de serviço/API, testes de integração e testes ponta a ponta (E2E).
- **Camada de suporte à automação**: clientes HTTP para o SUT, geradores de massa de dados (*factories*), fixtures e utilitários de asserção e setup/teardown.
- **Scripts de validação**: checagens automatizadas de contratos, matriz de autorização e máquinas de estado da aplicação.

### O que NÃO pertence a este repositório:
> [!IMPORTANT]
> **Este repositório NÃO contém e não deve receber código de produção.**
> - **Não é o backend do Projeto Integrador (PI)**: Regras de negócio de produção, persistência de banco de dados e APIs reais pertencem ao repositório de backend do PI.
> - **Não é a aplicação móvel/web do PI**: Telas, componentes de interface e fluxos do usuário final pertencem aos repositórios de frontend do PI.
> 
> Manter esta fronteira impede a erosão arquitetural e garante que a suíte de testes permaneça como um avaliador neutro e independente do produto.

---

## 2. Como começar e como executar

### Estrutura de pastas (Seção 1.1)

Para que a suíte de testes localize e interaja corretamente com o ambiente didático, os repositórios da **TAS** e do **SUT Didático** devem estar clonados **lado a lado** dentro do mesmo diretório raiz (`cidade-conectada/`):

```text
cidade-conectada/
├── tas/              # Repositório da TAS (este repositório)
└── sut-didatico/     # Sistema Sob Teste pedagógico (fornecido na disciplina)
```

### Pré-requisitos

- **Node.js**: versão `>= 20.11.0` (LTS recomendada). A TAS utiliza o executor de testes nativo do Node (`node:test`) e asserções nativas (`node:assert/strict`), dispensando dependências externas pesadas.
- **npm**: gerenciador de pacotes padrão do Node.js.

### Instalação e Preparação

1. Clone os dois repositórios lado a lado:
   ```bash
   git clone <URL_DO_FORK_TAS> tas
   git clone <URL_DO_SUT_DIDATICO> sut-didatico
   ```

2. Acesse a pasta da TAS e configure as variáveis de ambiente:
   ```bash
   cd tas
   cp .env.example .env
   ```
   *(No Windows PowerShell: `Copy-Item .env.example .env`)*

3. Se houver dependências instaladas no projeto, execute:
   ```bash
   npm install
   ```

### Inicializando o SUT Didático

Em um terminal separado (ou via script na raiz da TAS), inicie o SUT:

```bash
npm run sut
```
*O SUT didático iniciará em `http://localhost:3000` (com a API disponível em `http://localhost:3000/api/v1` e a interface web em `http://localhost:3000/web`).*

### Executando os Testes (Requisito de Comando Único)

> [!NOTE]
> **O Teste do README:** A suíte deve rodar imediatamente a partir das instruções deste documento. O requisito de execução por comando único é atendido por:

```bash
npm test
```

### Comandos Específicos por Nível

| Comando | Descrição |
| --- | --- |
| `npm test` | Executa todos os testes do repositório (`tests/**/*.test.js`) |
| `npm run test:unidade` | Executa apenas os testes unitários e de regras isoladas |
| `npm run test:api` | Executa os testes de integração e contrato da API REST |
| `npm run sut` | Inicia o servidor didático pedagógico local |

---

## 3. Estrutura e regra de dependência

A organização dos arquivos garante manutenibilidade e evita acoplamento indevido entre camadas:

```text
tas/
├── tests/                    # Suíte de testes automatizados
│   ├── unidade/              # Testes unitários puros (lógica de regras, parsers, utilitários)
│   │   └── regras-status.test.js
│   ├── api/                  # Testes de serviço, integração e contrato HTTP
│   │   ├── auth.test.js
│   │   └── demandas.test.js
│   └── e2e/                  # Testes de fluxo ponta a ponta (E2E)
├── support/                  # Código e recursos de apoio à automação
│   ├── clients/              # Clientes HTTP e wrappers de endpoints da API (ex: ApiClient.js)
│   ├── fixtures/             # Geradores de massa de dados e factories (ex: demand-factory.js)
│   └── helpers/              # Utilitários de apoio, setup/teardown e reset de estado
├── .env.example              # Modelo de variáveis de ambiente do projeto
├── .gitignore                # Regras de exclusão do Git
├── package.json              # Configurações do pacote e scripts de execução
└── README.md                 # Documentação e guia da TAS
```

### Onde colocar um arquivo novo?

| Se você está criando... | O local correto é: |
| --- | --- |
| Teste de uma função ou regra de negócio pura | `tests/unidade/<dominio>.test.js` |
| Teste de endpoint, código de resposta HTTP ou validação de schema | `tests/api/<recurso>.test.js` |
| Teste de fluxo completo do usuário (E2E) | `tests/e2e/<fluxo>.test.js` |
| Wrapper/chamada HTTP reaproveitável para um endpoint | `support/clients/<recurso>-client.js` |
| Criação de massa de dados dinâmica ou payload pré-definido | `support/fixtures/<entidade>-factory.js` |
| Função utilitária de suporte (autenticação, reset de estado, datas) | `support/helpers/<utilitario>.js` |

### Regras de Dependência (Arquitetura Limpa nos Testes)

Para evitar a erosão da arquitetura ao longo do semestre, as seguintes regras de direção de dependência são mandatórias:

1. **`tests/` depende de `support/`**:
   - Os arquivos de teste podem importar livremente de `support/clients`, `support/fixtures` e `support/helpers`.
2. **`support/` NUNCA depende de `tests/`**:
   - Arquivos dentro de `support/` são utilitários agnósticos de teste e nunca devem referenciar arquivos de `tests/`.
3. **Fronteira Estrita com o SUT**:
   - Testes de API **não devem importar** o código interno de inicialização do servidor (`server.js`) para invocar controladores diretamente na memória. Toda a comunicação com a API deve ocorrer através da rede (chamadas HTTP reais contra a `API_BASE_URL`).
4. **Isolamento de Unidade**:
   - Testes em `tests/unidade/` devem validar regras puras (ex.: funções de transição de status) sem disparar chamadas de rede ou depender de estado em banco.

---

## 4. Convenções

### Nomenclatura
- **Arquivos de teste**: Devem terminar obrigatoriamente com o sufixo `.test.js` (ex.: `demandas.test.js`).
- **Arquivos de apoio**: Usar `kebab-case.js` (ex.: `demand-factory.js`, `api-client.js`).
- **Blocos de teste**: 
  - Usar `describe('NomeDoModuloOuRecurso', ...)` para agrupar contextos.
  - Usar `test('deve ... quando ...')` ou `it('deve ... quando ...')` com frases em português claro no indicativo, especificando a condição esperada.

### Onde ficam as asserções?
- **Dentro dos blocos de teste**: Toda e qualquer asserção (`assert.equal`, `assert.deepEqual`, `assert.rejects`) deve estar visível dentro do bloco `it(...)` / `test(...)`.
- **Proibido asserções ocultas**: Não coloque `assert` dentro de métodos de `support/clients` ou factories. Os clients retornam a resposta da requisição (`response`, `status`, `body`); quem decide e afirma se a resposta está correta é o teste. Isso torna a causa raiz de qualquer falha imediatamente visível no relatório.
- **Módulo padrão**: Utilizar exclusivamente `node:assert/strict`.

### Onde ficam os dados (massa de teste)?
- **Centralizados em `support/fixtures/`**:
  - Evite dados *hardcoded* duplicados em múltiplos testes.
  - Crie funções de *factory* (ex.: `criarDemandaValida(overrides = {})`) que forneçam payloads padrão válidos e permitam customizações apenas para o campo que está sendo testado no cenário.

### Snippet / Prompt para Solicitação de Código à IA
Copie e cole este bloco de contexto quando solicitar auxílio de Inteligência Artificial para gerar ou refatorar testes neste repositório:

```markdown
Você é um especialista em automação de testes em Node.js. Escreva o código seguindo as convenções da nossa TAS:
- Ambiente: Node.js (>=20.11.0) utilizando o runner nativo `node:test` e asserções estritas com `node:assert/strict`.
- Sem dependências de frameworks externos (sem Jest, Mocha, Chai ou Supertest externo; utilize `fetch` nativo ou os clients de suporte).
- Padrão estrutural: AAA (Arrange, Act, Assert).
- Convenção de asserções: Coloque TODAS as asserções explicitamente dentro do bloco `it(...)`/`test(...)`. Clientes e helpers nunca devem conter asserts.
- Massa de dados: Use ou proponha factories em `support/fixtures/` com suporte a overrides.
- Nomenclatura: Nomes de teste descritivos no formato "deve [resultado esperado] quando [condição/cenário]".
```

---

## 5. Configuração

A configuração do ambiente de testes é parametrizada via variáveis de ambiente.

### Variáveis de Ambiente

| Variável | Descrição / O que controla | Valor Padrão / Exemplo Didático |
| --- | --- | --- |
| `NODE_ENV` | Define o ambiente de execução | `test` |
| `API_BASE_URL` | URL base do SUT contra o qual os testes de API serão disparados | `http://localhost:3000/api/v1` |
| `SUT_PORT` | Porta utilizada pelo servidor SUT didático local | `3000` |
| `CITIZEN_EMAIL` | E-mail de teste com perfil Cidadão semeado no SUT | `ana@exemplo.com` |
| `CITIZEN_PASSWORD` | Senha de teste para o perfil Cidadão | `senha123` |
| `MANAGER_EMAIL` | E-mail de teste com perfil Gestor semeado no SUT | `gestor@exemplo.com` |
| `MANAGER_PASSWORD` | Senha de teste para o perfil Gestor | `senha123` |

### Arquivo `.env.example`
O repositório disponibiliza um arquivo [`.env.example`](file:///c:/Users/Luis%20Facunde/Desktop/cidade-conectada/tas/.env.example) versionado com valores didáticos. Ao configurar a máquina ou o ambiente de CI/CD:

```bash
cp .env.example .env
```

> [!WARNING]
> O arquivo `.env` com dados e segredos locais é ignorado pelo Git (definido no `.gitignore`). Nunca comite senhas ou chaves reais.

---

## 6. Time e uso de IA

### Integrantes da Squad

| Nome Completo | RA | Função Principal na Squad | GitHub / Contato |
| --- | --- | --- | --- |
| *[Nome do Aluno 1]* | *[RA 1]* | Automação de Testes de API | *[@usuario1]* |
| *[Nome do Aluno 2]* | *[RA 2]* | Automação de Testes Unitários e Fixtures | *[@usuario2]* |
| *[Nome do Aluno 3]* | *[RA 3]* | Testes E2E e Integração Contínua | *[@usuario3]* |

### Rastreabilidade e Transparência no Uso de IA

O uso de ferramentas de Inteligência Artificial generativa no desenvolvimento desta TAS é incentivado como acelerador produtivo, orientado pelas seguintes diretrizes de ética, transparência e governança:

1. **Ferramentas Autorizadas**:
   - Modelos de linguagem (LLMs) como Gemini, Claude, ChatGPT e assistentes de código (GitHub Copilot).
2. **Escopo de Aplicação de IA**:
   - Geração de esqueletos de teste e estruturas repetitivas de teste de API.
   - Brainstorming de casos de borda (*edge cases*), matrizes de particionamento de equivalência e testes de mutação.
   - Refatoração para melhoria de legibilidade e padronização com `node:test`.
3. **Responsabilidade e Validação Humana**:
   - **Nenhum teste entra no repositório sem validação**: Todo código sugerido por IA deve ser revisado criticamente por um integrante da squad e executado contra o SUT didático.
   - **Eliminação de Falsos Positivos**: Testes que passam sem testar a regra de fato ("testes tautológicos" ou que ignoram asserções) são terminantemente rejeitados na revisão.
   - **Rastreabilidade**: Ao utilizar IA para gerar um bloco substancial de código ou refatoração, mencione na mensagem de commit ou na descrição do Pull Request o prompt ou a ferramenta utilizada (ex.: `Refatora suíte de demandas usando Gemini`).
