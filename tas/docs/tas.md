# Arquitetura e Especificação da TAS — Cidade Conectada

> Documento de especificação técnica e arquitetura da Test Automation Solution (TAS).

## 1. Visão Geral
Este documento descreve as decisões arquiteturais, padrões adotados e detalhamento de cada camada da TAS:
- `lib/`: Camada de adaptação técnica e clientes HTTP para o SUT.
- `api/`: Camada de negócio da automação e casos de uso de teste.
- `data/`: Estratégia de massa de dados, factories e fixtures.
- `tests/`: Organização das suítes de testes (unidade e serviço).
- `e2e/maestro/`: Estratégia para fluxos ponta a ponta em interface móvel.
