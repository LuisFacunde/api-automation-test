# TAS — Test Automation Solution | Cidade Conectada

> Solução de Automação de Testes desenvolvida para a disciplina **Testes Automatizados · 2026.2** (CESAR School).

---

## 1. O que este repositório é

Este repositório contém exclusivamente a **TAS (Test Automation Solution)** do projeto _Cidade Conectada_. Ele é o ecossistema isolado de garantia de qualidade e automação de testes da squad.

### O que pertence a este repositório:

- **Documentação de testes**: documentação técnica da TAS e plano de testes da squad (`docs/`).
- **Suítes de testes automatizados**: testes de componente/unidade sem rede (`tests/unidade/`), testes de serviço e contratos HTTP (`tests/api/`) e testes de fluxos de interface (`e2e/maestro/`).
- **Camadas de apoio à automação**: adaptação ao SUT (`lib/`), negócio da automação (`api/`) e massa de dados/factories (`data/`).

### O que NÃO pertence a este repositório:

> [!IMPORTANT]
> **Este repositório NÃO contém e não deve receber código de produção.**
>
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

   _(No Windows PowerShell: `Copy-Item .env.example .env`)_

3. Se houver dependências no projeto, instale com:
   ```bash
   npm install
   ```

### Inicializando o SUT Didático

Em um terminal separado (ou via script a partir da raiz da TAS), inicie o SUT pedagógico:

```bash
npm run sut
```

_O SUT didático iniciará em `http://localhost:3000` (com a API disponível em `http://localhost:3000/api/v1` e a interface web em `http://localhost:3000/web`)._

### Executando os Testes (Requisito de Comando Único)

> [!NOTE]
> **O Teste do README:** A suíte deve rodar imediatamente a partir das instruções deste documento. O requisito de execução por comando único é atendido por:

```bash
npm test
```

### Comandos Específicos por Nível

| Comando                | Descrição                                                        |
| ---------------------- | ---------------------------------------------------------------- |
| `npm test`             | Executa todos os testes do repositório (`tests/**/*.test.js`)    |
| `npm run test:unidade` | Executa apenas os testes unitários/componente (`tests/unidade/`) |
| `npm run test:api`     | Executa os testes de serviço/API REST (`tests/api/`)             |
| `npm run sut`          | Inicia o servidor didático pedagógico local                      |

---

## 3. Estrutura e regra de dependência

A arquitetura da **TAS** é organizada nas seguintes camadas e diretórios:

```text
tas/
├── docs/                 # Documentação (tas.md · plano-de-testes.md)
├── lib/                  # Adaptação ao SUT (etapa 3)
├── api/                  # Negócio da automação (etapa 3)
├── data/                 # Massa de dados (etapa 3)
├── tests/
│   ├── unidade/          # Componente, sem rede (etapa 2)
│   └── api/              # Serviço (etapa 3)
├── e2e/maestro/          # Fluxos de interface (etapas 4 e 5)
├── .env.example          # Modelo de variáveis de ambiente
├── .gitignore            # Arquivos ignorados pelo Git
├── package.json          # Dependências e scripts de execução
└── README.md             # Interface do repositório
```

> [!NOTE]
> _O que cada camada faz fica claro na etapa 3, quando você construir os arquivos. Por ora, basta que as pastas existam e que a divisão esteja registrada no README._

### Divisão Arquitetural das Camadas

| Camada / Diretório | Responsabilidade      | Descrição                                                                                          | Etapa do Projeto |
| ------------------ | --------------------- | -------------------------------------------------------------------------------------------------- | ---------------- |
| `docs/`            | Documentação          | Especificação técnica da TAS (`tas.md`) e plano de testes da squad (`plano-de-testes.md`).         | Planejamento     |
| `lib/`             | Adaptação ao SUT      | Clientes HTTP de baixo nível, conectores e detalhes de infraestrutura técnica com o SUT.           | Etapa 3          |
| `api/`             | Negócio da automação  | Modelagem das ações de negócio, orquestração de operações da API e regras de domínio da automação. | Etapa 3          |
| `data/`            | Massa de dados        | _Factories_, geradores de dados, payloads padronizados e fixtures para os testes.                  | Etapa 3          |
| `tests/unidade/`   | Componente (sem rede) | Testes unitários puros e isolados (regras de status, lógica de domínio), sem chamadas de rede.     | Etapa 2          |
| `tests/api/`       | Serviço               | Testes de integração e contrato da API REST (endpoints, status HTTP, regras de autorização).       | Etapa 3          |
| `e2e/maestro/`     | Fluxos de interface   | Fluxos ponta a ponta (E2E) simulando a experiência do usuário em interface móvel com Maestro.      | Etapas 4 e 5     |

### Onde colocar um arquivo novo?

| Se você está criando...                                                         | O local correto é:                         |
| ------------------------------------------------------------------------------- | ------------------------------------------ |
| Documentação arquitetural ou estratégia de testes                               | `docs/tas.md` ou `docs/plano-de-testes.md` |
| Cliente HTTP ou adaptador de protocolo com o SUT                                | `lib/<cliente>.js`                         |
| Operação ou fluxo de negócio da automação (ex: autenticação, fluxo de demandas) | `api/<dominio>.js`                         |
| Gerador de massa de dados, template ou factory                                  | `data/<entidade>-factory.js`               |
| Teste de componente ou lógica pura (sem rede)                                   | `tests/unidade/<regra>.test.js`            |
| Teste de endpoint ou serviço HTTP                                               | `tests/api/<endpoint>.test.js`             |
| Fluxo de teste E2E com Maestro                                                  | `e2e/maestro/<fluxo>.yaml`                 |

### Regras de Dependência (Sentido Permitido)

Para evitar a erosão da arquitetura ao longo do semestre:

1. **Sentido das Dependências**:
   - `tests/` consome `api/`, `data/` e `lib/`.
   - `api/` (Negócio da Automação) consome `lib/` (Adaptação ao SUT) e `data/` (Massa de Dados).
   - `lib/` e `data/` são utilitários de base e **NUNCA** devem importar nada de `tests/` ou de `api/`.
2. **Isolamento de Unidade**:
   - Testes em `tests/unidade/` validam lógica pura em memória. **Não realizam chamadas de rede** e não dependem de servidores ativos.
3. **Fronteira com o SUT**:
   - Toda comunicação entre os testes de serviço (`tests/api/`) e o SUT ocorre através de conexões de rede (HTTP via `lib/` contra `BASE_URL`), nunca importando o código de produção ou o `server.js` diretamente para dentro do teste.

---

## 4. Convenções

### Nomenclatura

- **Arquivos de teste**: Devem terminar obrigatoriamente com o sufixo `.test.js` (ex.: `demandas.test.js`).
- **Arquivos auxiliares**: Usar `kebab-case.js` (ex.: `demand-factory.js`, `api-client.js`).
- **Blocos de teste**:
   - Usar `describe('NomeDoModuloOuRecurso', ...)` para agrupar contextos.
   - Usar `test('deve ... quando ...')` ou `it('deve ... quando ...')` com frases em português claro no indicativo, especificando a condição esperada.
   - Estrutura interna recomendada: padrão **AAA** (_Arrange, Act, Assert_).

### Onde ficam as asserções?

- **Dentro dos blocos de teste**: Toda e qualquer asserção (`assert.equal`, `assert.deepEqual`, `assert.rejects`) deve estar visível dentro do bloco `it(...)` / `test(...)`.
- **Proibido asserções ocultas**: Não coloque `assert` dentro de `lib/` ou `api/`. As camadas de apoio retornam dados ou respostas HTTP; quem afirma se o resultado é válido é o próprio caso de teste.
- **Módulo padrão**: Utilizar exclusivamente `node:assert/strict`.

### Onde ficam os dados (massa de teste)?

- **Centralizados na pasta `data/`**:
   - Evite dados _hardcoded_ espalhados em múltiplos arquivos de teste.
   - Implemente _factories_ com valores padrão válidos que permitam sobrescrever propriedades específicas para cada cenário de teste.

### Snippet / Prompt para Solicitação de Código à IA

Copie e cole este bloco de contexto quando solicitar auxílio de Inteligência Artificial para gerar ou refatorar testes neste repositório:

```markdown
Você é um especialista em automação de testes em Node.js. Escreva o código seguindo as convenções da nossa TAS:

- Arquitetura:
   - lib/ para adaptação ao SUT (chamadas HTTP/fetch nativo).
   - api/ para negócio da automação (fluxos e operações do domínio).
   - data/ para massa de dados e factories com suporte a overrides.
   - tests/unidade/ para testes de componente isolados sem chamadas de rede.
   - tests/api/ para testes de serviço e contrato HTTP.
   - e2e/maestro/ para fluxos de interface mobile.
- Ambiente: Node.js (>=20.11.0) utilizando runner nativo `node:test` e asserções estritas com `node:assert/strict`.
- Sem dependências externas de teste (sem Jest, Mocha, Chai ou Supertest).
- Padrão estrutural: AAA (Arrange, Act, Assert).
- Convenção de asserções: Coloque TODAS as asserções explicitamente dentro do bloco `it(...)`/`test(...)`. lib/ e api/ nunca devem conter asserts.
- Nomenclatura: Nomes descritivos no formato "deve [resultado esperado] quando [condição/cenário]".
```

---

## 5. Configuração

A configuração do ambiente de testes é parametrizada via variáveis de ambiente.

### Variáveis de Ambiente

| Variável           | Descrição / O que controla                                    | Valor Padrão / Exemplo Didático |
| ------------------ | ------------------------------------------------------------- | ------------------------------- |
| `NODE_ENV`         | Define o ambiente de execução                                 | `test`                          |
| `BASE_URL`         | Origem do SUT contra o qual os testes de API serão disparados | `http://localhost:3000`         |
| `SUT_PORT`         | Porta utilizada pelo servidor SUT didático local              | `3000`                          |
| `CITIZEN_EMAIL`    | E-mail de teste com perfil Cidadão semeado no SUT             | `ana@exemplo.com`               |
| `CITIZEN_PASSWORD` | Senha de teste para o perfil Cidadão                          | `senha123`                      |
| `MANAGER_EMAIL`    | E-mail de teste com perfil Gestor semeado no SUT              | `gestor@exemplo.com`            |
| `MANAGER_PASSWORD` | Senha de teste para o perfil Gestor                           | `senha123`                      |

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

| Nome                | E-mail             |
| ------------------- | ------------------ |
| André Felipe        | afsb@cesar.school  |
| Dayvid Cristiano    | dcvs2@cesar.school |
| Deyvison Conrado    | dmc2@cesar.school  |
| Jennifer Cristine   | jclc2@cesar.school |
| Letícia Gabriella   | lgcs@cesar.school  |
| Levi Moraes         | lmma@cesar.school  |
| Luis Henrique       | lhfs@cesar.school  |
| Manuele Macêdo      | mmps2@cesar.school |
| Maria Aparecida     | maers@cesar.school |
| Peterson Jesus      | pjfm@cesar.school  |
| Rhaldney Robert     | rrcd@cesar.school  |
| Victor César Matias | vcms@cesar.school  |

### Rastreabilidade e Transparência no Uso de IA

O uso de ferramentas de Inteligência Artificial generativa no desenvolvimento desta TAS é incentivado como acelerador produtivo, orientado pelas seguintes diretrizes de ética, transparência e governança:

1. **Ferramentas Autorizadas**:
   - Modelos de linguagem (LLMs) como Gemini, Claude, ChatGPT e assistentes de código (GitHub Copilot).
2. **Escopo de Aplicação de IA**:
   - Geração de esqueletos de teste e estruturas repetitivas de teste de API.
   - Brainstorming de casos de borda (_edge cases_), matrizes de particionamento de equivalência e testes de mutação.
   - Refatoração para melhoria de legibilidade e padronização com `node:test`.
3. **Responsabilidade e Validação Humana**:
   - **Nenhum teste entra no repositório sem validação**: Todo código sugerido por IA deve ser revisado criticamente por um integrante da squad e executado contra o SUT didático.
   - **Eliminação de Falsos Positivos**: Testes que passam sem testar a regra de fato ("testes tautológicos" ou que ignoram asserções) são terminantemente rejeitados na revisão.
   - **Rastreabilidade**: Ao utilizar IA para gerar um bloco substancial de código ou refatoração, mencione na mensagem de commit ou na descrição do Pull Request o prompt ou a ferramenta utilizada (ex.: `Refatora suíte de demandas usando Gemini`).
