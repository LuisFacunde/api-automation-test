# SUT didático — Cidade Conectada

Recurso pedagógico da disciplina ADS033 — Testes Automatizados · 2026.2.

**Este repositório não faz parte do Projeto Integrador.** Ele não é produto,
não é entrega e não deve ser copiado para dentro da TAS da squad.

## Para que ele existe

1. Dar a todas as squads o mesmo ponto de partida.
2. Tornar cada exemplo do material reproduzível em qualquer máquina.
3. Oferecer um alvo que pode ser **quebrado de propósito** para ver um teste
   falhar — coisa que ninguém deve fazer com o backend da própria squad.

Ele implementa um subconjunto do contrato da API Cidade Conectada, em memória,
sem nenhuma dependência externa.

## Como rodar

Clone-o **ao lado** do seu fork da TAS, com este nome exato:

```
cidade-conectada/
├── tas/
└── sut-didatico/
```

```bash
npm start                   # http://localhost:3000
PORT=3100 npm start         # outra porta, se a 3000 estiver ocupada
```

| Recurso         | Endereço                       |
| --------------- | ------------------------------ |
| API             | `http://localhost:3000/api/v1` |
| Interface web   | `http://localhost:3000/web`    |
| Reset do estado | `POST /api/v1/_test/reset`     |

## Usuários semeados

| E-mail               | Perfil  | Senha      |
| -------------------- | ------- | ---------- |
| `ana@exemplo.com`    | CITIZEN | `senha123` |
| `bruno@exemplo.com`  | CITIZEN | `senha123` |
| `gestor@exemplo.com` | MANAGER | `senha123` |

## O que ele implementa

Autenticação, registro e listagem de demandas, detalhe, histórico e transição de
status, com a matriz de autorização, a máquina de estados e o formato de erro
padronizado do contrato. Paginação e filtros básicos. Sem upload de foto, sem
métricas, sem persistência: o estado vive na memória e desaparece ao reiniciar.

## Quebrando de propósito

Duas alterações úteis em sala, para exercitar diagnóstico de falhas:

| Onde                            | Mudança                                | O que deve acontecer                                             |
| ------------------------------- | -------------------------------------- | ---------------------------------------------------------------- |
| `server.js`, criação da demanda | `status: 'RECEIVED'` → `'NEW'`         | A suíte de serviço reprova. A mensagem basta para o diagnóstico? |
| `regras-status.js`              | acrescentar `REJECTED` a `IN_PROGRESS` | Exatamente um caso da suíte de componente reprova.               |

Desfaça a alteração depois. Se quiser guardá-las, use uma branch — nunca envie
para a branch principal.

## Endpoint que não é do contrato

`POST /api/v1/_test/reset` limpa o estado e resemeia os usuários. Ele existe
apenas para o laboratório e está marcado como tal no código. Um endpoint desses
em um sistema real é uma vulnerabilidade — vale a conversa com Segurança da
Informação sobre por que.
