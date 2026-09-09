# API Automation Test

Repositório da solução de automação de testes (TAS) da disciplina de Testes Automatizados

## Conteúdo

- `tas/`: suíte de testes, documentação, clientes HTTP, massas de dados e fluxo E2E com Maestro.
- `sut-didatico/`: sistema sob teste didático, executado localmente para validar a suíte.

## Início rápido

Pré-requisito: Node.js `>= 20.11.0`.

Em um terminal, inicie o SUT:

```powershell
cd tas
npm run sut
```

Em outro terminal, execute a TAS:

```powershell
cd tas
npm run test
```

Detalhes dos cenários, endpoints, configuração, evidências e resultados estão em [tas/docs/plano-de-testes.md](tas/docs/plano-de-testes.md).
