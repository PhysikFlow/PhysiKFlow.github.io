# IA no RelatorioR1 Beta

Este documento define o que ja existe no PWA beta, o que ainda falta para a IA trabalhar com dados reais e como a IA deve pedir leituras/acoes usando JSON.

Para a matriz detalhada de perguntas reais e dados faltantes, veja `AI-QUESTION-COVERAGE.md`.

## Estado atual

O beta ja tem:

- Aba `IA` no PWA.
- Chat visual com Markdown basico, tabelas, codigo, citacoes e botao de copiar.
- Configuracao Gemini lida do Firebase em `/app_config/gemini`.
- Firebase Auth e autorizacao por `/authorized_users/{uid}`.
- Dados leves do relatorio carregados do Realtime Database.
- Dados de alunos carregados sob demanda via PhysikServer/MinIO usando signed URLs.
- Fotos de alunos carregadas sob demanda via PhysikServer/MinIO.
- Comandos locais de laboratorio: `/help`, `/mock`, `/json`, `/context` e `/desktop`.
- Contexto real para Gemini montado a partir do snapshot operacional e dos JSONs analiticos publicados.
- Compactacao do contexto antes da chamada Gemini para reduzir cortes por limite de tokens.
- Historico local das ultimas 12 mensagens no `localStorage` do beta.
- Cache curto de respostas Gemini por pergunta + assinatura do contexto.
- Fallback de modelo: primario do Firebase, depois `fallbackModels`, depois modelos leves padrao.
- Contrato `desktop_request` para pedir novos datasets ao app desktop.
- Service worker, cache e localStorage isolados do PWA de producao.

Hoje a IA ja usa contexto real do relatorio, mas ainda fica limitada aos datasets publicados por unidade. Em 28/07/2026, a unidade Itaporanga (`58780-000`) ja publica `manifest.json`, `daily_summary.json` e `finance_rollup.json`.

## Dados disponiveis hoje no PWA

### Firebase RTD

O PWA le estes caminhos depois de login/autorizacao:

- `/authorized_users/{uid}`: controle de acesso.
- `/app_config/gemini`: configuracao do Gemini.
- `/app_config/physik_server`: discovery do PhysikServer.
- `/units`: metadados das unidades.
- `/relatorios/{unitId}/{field}`: relatorios leves por unidade.
- `/pagamentosByDate/{unitId}/{yyyy-mm-dd}`: pagamentos do dia.

Campos leves de relatorio usados no PWA:

```js
[
  "meta",
  "resumo",
  "frequencia",
  "mesAMes",
  "diarias",
  "diariasMensais",
  "picoHoras",
  "topPessoas",
  "topPlanosGlobal"
]
```

### PhysikServer/MinIO

O PWA descobre `baseUrl` e token no Firebase, depois pede signed URLs:

- `alunos/{unidadeId}/alunos.json`
- `fotos/{unidadeId}/{cartao}.jpg`

O PWA normaliza `alunos.json` em memoria com:

- `id`
- `cartao`
- `unidadeId`
- `physikUnitId`
- demais campos vindos do JSON publicado

## Direcao de arquitetura

A IA nao deve receber o `.db` cru e tambem nao deve ficar limitada para sempre ao JSON leve atual. A direcao recomendada e criar um dataset analitico do portal, derivado do banco local, versionado e publicado pelo PhysikServer.

Esse dataset nao e exclusivo da IA. Ele tambem pode alimentar cards, alertas, buscas, relatorios e comparacoes no PWA.

### Camadas de dados

1. Snapshot operacional leve

O que o PWA ja usa hoje: dados pequenos, rapidos e diretos para tela.

Exemplos:

- `/relatorios/{unitId}/{field}` no Firebase.
- `/pagamentosByDate/{unitId}/{yyyy-mm-dd}` no Firebase.
- `alunos/{unitId}/alunos.json` no MinIO.

2. Snapshot analitico

Agregados e indices prontos para portal e IA. Devem ser derivados do `.db`, mas filtrados e seguros.

Sugestao de objetos por unidade:

```text
analytics/{unitId}/manifest.json
analytics/{unitId}/daily_summary.json
analytics/{unitId}/finance_rollup.json
analytics/{unitId}/students_index.json
analytics/{unitId}/student_activity_rollup.json
analytics/{unitId}/student_finance_rollup.json
analytics/{unitId}/retention_summary.json
analytics/{unitId}/risk_alerts.json
```

3. Recortes sob demanda

Consultas mais profundas que nao devem virar um JSON gigante permanente.

Exemplos:

- historico financeiro de um aluno;
- pagamentos filtrados por periodo/status;
- eventos por periodo;
- auditoria especifica;
- detalhes de retencao de um grupo.

Esses recortes devem vir por ferramenta/endpoints do PhysikServer, com permissao e escopo bem definidos.

### Manifest analitico

Antes de publicar varios JSONs, criar um `manifest.json` por unidade:

```json
{
  "schemaVersion": 1,
  "unitId": "unidade_1",
  "generatedAt": "2026-07-28T00:00:00.000Z",
  "source": {
    "kind": "physikflow_bridge_db",
    "snapshotId": "2026-07-28T00:00:00.000Z"
  },
  "datasets": {
    "daily_summary": {
      "path": "analytics/unidade_1/daily_summary.json",
      "version": 3,
      "hash": "sha256...",
      "updatedAt": "2026-07-28T00:00:00.000Z"
    },
    "finance_rollup": {
      "path": "analytics/unidade_1/finance_rollup.json",
      "version": 2,
      "hash": "sha256...",
      "updatedAt": "2026-07-28T00:00:00.000Z"
    }
  }
}
```

O PWA pode consultar o manifest, comparar versao/hash e buscar apenas os datasets necessarios.

## O que falta para a IA ser mais util

### 1. Montador de contexto

Status: implementado no beta.

O PWA monta um pacote com:

- unidade atual;
- unidades disponiveis;
- snapshot operacional leve;
- status dos datasets analiticos;
- `manifest`, `daily_summary` e `finance_rollup`;
- lacunas conhecidas;
- template `desktop_request` quando faltar dado.

O comando `/context` mostra o pacote completo. O comando `/context compact` mostra a versao compactada usada na chamada Gemini.

### Cache, historico e fallback

Status: implementado no beta.

- Historico visual: salva as ultimas 12 mensagens por UID em `relatorio_beta_ai_chat_history_v1:{uid}`.
- Continuidade do modelo: envia ate 10 mensagens recentes, limitadas a 12 mil caracteres, junto da pergunta atual.
- Memoria persistente: resumo, fatos declarados e preferencias em `relatorio_beta_ai_memory_v1:{uid}` e `/ai_assistant/memory/{uid}`.
- Lacunas de dados: registradas separadamente em `/ai_assistant/gaps/{uid}/{gapId}`.
- Arquivo integral: perguntas, respostas, comandos locais e erros ficam em `/ai_assistant/conversations/{uid}/{sessionId}/messages`.
- Fila confiavel: cada mensagem entra em `relatorio_beta_ai_cloud_outbox_v1:{uid}` antes do upload e so e removida apos confirmacao.
- Retencao na nuvem: sem expiracao automatica; mensagens sao append-only pelas regras do cliente.
- Cache de resposta: salva ate 20 respostas por 3 minutos em `relatorio_beta_ai_reply_cache_v1`.
- Chave do cache: pergunta + contexto compacto + historico recente + memoria + plano de modelos.
- Invalidacao: cache curto por tempo e limpeza ao atualizar os caches do app.
- Fallback: tenta primeiro o `model` configurado em `/app_config/gemini`, depois `fallbackModels`, depois os padroes do beta.
- Fallback padrao atual: `gemini-3.5-flash-lite` e `gemini-flash-latest`, sem duplicar o modelo primario.
- Sem fallback para erro de credencial/autorizacao (`401`, `403`, `UNAUTHENTICATED`), porque nesses casos todos os modelos tenderiam a falhar com a mesma chave.
- Retry/fallback ativo para erro transitorio, cota, modelo invalido/indisponivel e falhas 4xx/5xx selecionadas.

Observacao: o cache e curto de proposito. Dados financeiros e operacionais mudam rapido; cache longo economizaria cota, mas aumentaria o risco de resposta velha.

Exemplo de contexto inicial:

```json
{
  "scope": "relatorio_r1",
  "generatedAt": "2026-07-28T00:00:00.000Z",
  "activeTab": "financeiro",
  "selectedUnitId": "unidade_1",
  "units": [
    {
      "id": "unidade_1",
      "nome": "Unidade Centro"
    }
  ],
  "summary": {
    "totalAlunos": 0,
    "ativos": 0,
    "atrasados": 0,
    "receita30d": 0,
    "ticketMedio30d": 0
  },
  "availableData": {
    "reports": true,
    "studentsLoaded": false,
    "todayPaymentsLoaded": true
  }
}
```

Regra: mandar para a IA apenas o que ela precisa para responder. Evitar mandar listas completas de alunos/pagamentos sem necessidade.

### 2. Ferramentas locais de leitura

Status: planejado.

Antes de qualquer acao que altere dados, a IA deve conseguir pedir leituras estruturadas.

Ferramentas iniciais sugeridas:

- `get_units`
- `get_dashboard_summary`
- `get_unit_report`
- `get_today_payments`
- `search_students`
- `get_student_snapshot`
- `compare_units`
- `build_finance_summary`

Essas ferramentas podem rodar no proprio PWA porque usam dados ja carregados ou dados read-only obtidos pelo fluxo atual.

### 3. Contrato JSON para pedidos da IA

Status: parcialmente implementado via `/desktop`.

A IA nao deve "executar" texto solto. Ela deve devolver um JSON estruturado quando quiser usar uma ferramenta.

Formato proposto:

```json
{
  "type": "tool_call",
  "id": "call_20260728_001",
  "tool": "search_students",
  "args": {
    "query": "joao",
    "unitId": "unidade_1",
    "limit": 10
  },
  "requiresConfirmation": false,
  "reason": "Encontrar alunos para responder a pergunta do usuario."
}
```

Resposta da ferramenta para a IA:

```json
{
  "type": "tool_result",
  "id": "call_20260728_001",
  "ok": true,
  "data": {
    "students": [
      {
        "nome": "Joao Silva",
        "cartao": "123",
        "status": "ativo",
        "vencimento": "2026-08-10"
      }
    ]
  },
  "error": null
}
```

Resposta final ao usuario:

```json
{
  "type": "final",
  "message": "Encontrei 1 aluno chamado Joao Silva..."
}
```

### 4. Loop de ferramenta

Status: planejado.

O fluxo recomendado:

```text
Usuario pergunta
PWA monta contexto minimo
PWA chama Gemini
Gemini responde final OU pede tool_call
PWA valida tool_call
PWA executa ferramenta permitida
PWA manda tool_result ao Gemini
Gemini responde ao usuario
```

Limites importantes:

- Maximo de 3 tool calls por pergunta no beta.
- Toda ferramenta deve ter allowlist.
- Argumentos devem ser validados antes de executar.
- Ferramentas read-only nao precisam de confirmacao.
- Ferramentas que alteram estado precisam de confirmacao explicita.

## .db cru vs JSON para IA

### Por que nao usar `.db` direto no PWA

Nao e o melhor caminho para a IA web porque:

- Browser/PWA nao abre SQLite nativamente.
- `sql.js` aumenta bundle e complexidade.
- O `.db` cru traz dados sensiveis demais.
- O PWA atual ja foi desenhado para consumo remoto via JSON/signed URLs.
- O modelo nao precisa de banco inteiro; precisa de contexto filtrado.

### Onde o `.db` faz sentido

O `physikflow_bridge.db` continua valioso para:

- hooks Python locais;
- analises pesadas no desktop;
- geracao de snapshots/JSONs melhores;
- auditorias e rotinas internas.

### Recomendacao

Para a IA no PWA, usar JSON/RTD/MinIO como fonte. Para tarefas mais profundas, o desktop ou um worker local pode ler o `.db`, gerar datasets analiticos seguros e publicar esses resumos.

Exemplo de `daily_summary.json` ou `risk_alerts.json` util para portal e IA:

```json
{
  "unitId": "unidade_1",
  "period": "last_30_days",
  "generatedAt": "2026-07-28T00:00:00.000Z",
  "metrics": {
    "newStudents": 12,
    "cancelledStudents": 3,
    "latePayments": 18,
    "revenue": 12500
  },
  "alerts": [
    {
      "type": "late_payment_risk",
      "count": 18,
      "severity": "medium"
    }
  ]
}
```

### Students index com cuidado

Evitar um `students_index.json` completo demais no inicio.

Campos aceitaveis para primeira versao:

- id interno estavel;
- nome;
- status;
- plano atual;
- tags/grupo;
- ultimo acesso;
- vencimento;
- indicadores resumidos.

Campos que devem ficar fora do indice e ir para recortes sob demanda:

- CPF;
- telefone;
- historico financeiro detalhado;
- observacoes sensiveis;
- auditoria;
- dados internos de operadores.

## Pedido para desktop ja engatilhado

O comando `/desktop <pedido>` gera um contrato read-only para orientar o app desktop/worker. Para pedidos de risco de evasao, o beta ja sugere:

```json
{
  "type": "desktop_request",
  "schemaVersion": "1.0.0",
  "unitId": "58780-000",
  "reason": "ranking de alunos com maior risco de evasao",
  "missingData": [
    "students_index com id, nome, status, plano atual, vencimento e ultimo_acesso",
    "student_activity_rollup com frequencia por aluno em 7/30/60/90 dias",
    "student_finance_rollup com atraso, valor em aberto e historico resumido de pagamentos",
    "retention_summary com funil de risco por unidade",
    "risk_alerts com score, motivos e data de calculo por aluno"
  ],
  "suggestedDatasets": [
    "students_index",
    "student_activity_rollup",
    "student_finance_rollup",
    "retention_summary",
    "risk_alerts"
  ],
  "priority": "high",
  "status": "draft"
}
```

Esses arquivos devem ser publicados no manifest quando estiverem prontos. O beta ja tenta descobrir novos datasets pelo `manifest.json`, entao nao deve precisar de mudanca no PWA para comecar a usa-los no contexto.

## Execucao de acoes

### Fase 1: apenas leitura

No beta, com as regras atuais read-only, a IA deve apenas:

- ler contexto;
- responder perguntas;
- explicar indicadores;
- comparar unidades;
- localizar alunos;
- resumir pagamentos;
- sugerir acoes para o gestor.

### Fase 2: fila de acoes

Quando quisermos acoes reais, existem duas opcoes melhores:

1. Cloud Function autenticada.
2. Desktop bridge que consulta uma fila de pedidos autorizados.

Contrato sugerido para uma acao futura:

```json
{
  "type": "action_request",
  "id": "act_20260728_001",
  "action": "create_follow_up",
  "args": {
    "studentCard": "123",
    "unitId": "unidade_1",
    "note": "Entrar em contato sobre vencimento."
  },
  "requestedBy": {
    "uid": "firebase_uid",
    "email": "usuario@email.com"
  },
  "requiresConfirmation": true,
  "status": "pending"
}
```

No Firebase atual, isso exigiria uma regra nova e bem limitada. Se a regra continuar com `.write: false`, entao acoes reais nao podem ir pelo PWA direto.

## Regras de seguranca da IA

- Nunca mandar tokens do PhysikServer para o modelo.
- Nunca mandar a Gemini key para o modelo.
- Nao mandar lista completa de alunos se a pergunta pedir apenas resumo.
- Nao executar acao sem allowlist.
- Nao executar escrita sem confirmacao.
- Registrar `tool_call`, `tool_result` e erro tecnico no console/debug, nao como texto bruto para usuario final.

## Proximos passos

1. Publicar os mesmos 3 JSONs para as demais unidades.
2. Adicionar `students_index.json` enxuto.
3. Adicionar `student_activity_rollup.json` e `student_finance_rollup.json`.
4. Adicionar `retention_summary.json` e `risk_alerts.json`.
5. Criar allowlist de ferramentas read-only no PWA.
6. Adaptar prompt do Gemini para responder final ou `tool_call`.
7. Implementar loop de ferramentas com limite de chamadas.
8. Depois adicionar recortes sob demanda e decidir se acoes reais vao por Cloud Function ou desktop bridge.
