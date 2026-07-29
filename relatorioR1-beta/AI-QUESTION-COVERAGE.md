# Cobertura de Perguntas da IA

Este arquivo acompanha quais perguntas o chat IA consegue responder com os JSONs atuais e quais dados inteligentes o app desktop deve gerar para melhorar as respostas.

Data de referencia: 2026-07-28.

## Legenda

- `OK`: o beta ja tem dados suficientes para responder de forma objetiva.
- `Parcial`: da para responder algo, mas com ressalva ou granularidade limitada.
- `Falta`: precisa de novo dataset, recorte sob demanda ou campo derivado no desktop.

## Datasets atuais

Hoje a unidade Itaporanga (`58780-000`) publica:

- `manifest.json`
- `daily_summary.json`
- `finance_rollup.json`

Com isso a IA consegue responder bem perguntas de resumo geral, receita agregada, ticket medio, acessos agregados e picos por hora quando o dataset traz essas chaves.

## Matriz de cobertura

| Pergunta / familia | Status atual | Motivo | Dataset inteligente necessario |
|---|---:|---|---|
| Quantos alunos ativos temos hoje? | OK | `daily_summary.students.active` e snapshot operacional tem ativos. | Manter em `daily_summary`. |
| Quantos alunos em atraso/inativos temos? | OK | `daily_summary.students.overdue` e snapshot operacional tem atrasados. | Manter em `daily_summary`. |
| Qual e o horario de maior movimento? | OK | `daily_summary.attendance.peakHours` traz medias por hora. | Manter e ampliar para menor movimento. |
| Qual e o ticket medio por aluno? | OK | `finance_rollup.totals.ticketAverageOverall` e `ticketAverage30d`. | Manter em `finance_rollup`. |
| Qual e a receita mensal/30 dias? | OK | `finance_rollup.monthly` e `daily_summary.windows.last30Days`. | Manter em `finance_rollup`. |
| Quanto entrou hoje/semana/mes? | OK parcial | Hoje, 7d e 30d existem; quinzena e ano ainda nao estao padronizados. | `finance_periods.json`. |
| Quantas diarias foram vendidas hoje/semana? | OK parcial | Existem `avulsosTotal` e `avulsosCount` em janelas atuais. | Manter e detalhar por tipo em `sales_mix.json`. |
| Qual metodo de pagamento e mais usado? | Falta | JSON atual nao separa dinheiro/Pix/cartao. | `payment_methods_rollup.json`. |
| Quantos pagaram em dinheiro/Pix/cartao? | Falta | Falta agregacao por metodo e periodo. | `payment_methods_rollup.json`. |
| Quanto saiu hoje? | Falta | O snapshot atual parece focado em entrada, nao despesas/saidas. | `cashflow_rollup.json`. |
| Qual foi o lucro de hoje? | Falta | Precisa receita - despesas/custos. | `cashflow_rollup.json` + `expense_rollup.json`. |
| Quanto ainda temos para receber? | Falta | Precisa recebiveis/vencimentos futuros e inadimplencia aberta. | `receivables_rollup.json`. |
| Quem esta com pagamento atrasado/inadimplente? | Falta | Precisa lista por aluno, nao apenas contagem. | `student_finance_rollup.json` ou recorte `get_overdue_students`. |
| Quantos alunos novos entraram hoje/semana/mes? | Falta | Precisa eventos de matricula por periodo. | `student_lifecycle_rollup.json`. |
| Quantos alunos cancelaram este mes? | Falta | Precisa eventos/status de cancelamento. | `student_lifecycle_rollup.json`. |
| Qual e a taxa de retencao? | Falta | Precisa cohort, alunos que renovaram, churn e periodo. | `retention_summary.json`. |
| Estamos ganhando ou perdendo alunos? | Parcial | Ativos/atrasados existem, mas nao ha fluxo de entrada/saida. | `student_lifecycle_rollup.json`. |
| Quais alunos estao em risco de cancelar? | Falta | Precisa score por aluno e motivos. | `risk_alerts.json`. |
| Quais alunos estao ha 7/15/30 dias sem ir? | Falta | Precisa ultimo acesso por aluno e buckets. | `student_activity_rollup.json`. |
| Quem esta ha mais tempo sem frequentar? | Falta | Precisa ranking por ultimo acesso. | `student_activity_rollup.json`. |
| Quais alunos pararam de ir de repente? | Falta | Precisa comparar frequencia recente vs historica por aluno. | `student_activity_rollup.json` + `risk_alerts.json`. |
| Quantas pessoas foram hoje/ontem/semana? | Parcial | Hoje/7d existem como unicos; ontem nao padronizado. | `attendance_rollup.json`. |
| Qual dia da semana tem mais/menos movimento? | Falta | Precisa agregacao por weekday. | `attendance_rollup.json`. |
| Qual horario tem menor movimento? | Parcial | `peakHours` ajuda no maior; menor exige matriz completa por hora. | `attendance_rollup.json`. |
| Quantas pessoas vao manha/tarde/noite? | Falta | Precisa buckets por turno. | `attendance_rollup.json`. |
| Quem costuma treinar as 13h? | Falta | Precisa perfil de frequencia por aluno/hora. | Recorte `get_students_by_attendance_window`. |
| Alguem frequenta domingo as 13h? | Falta | Precisa matriz aluno x dia x hora. | Recorte `get_students_by_attendance_window`. |
| Quem frequenta todos os dias/so fim de semana/1x semana? | Falta | Precisa classificacao de habito por aluno. | `student_activity_rollup.json`. |
| Quantas pessoas estao na academia agora? | Falta | Precisa estado atual de entrada/saida/catraca. | `live_occupancy.json` ou endpoint live. |
| Quem esta na academia agora? | Falta sensivel | Precisa presenca atual por aluno. Melhor sob demanda. | Recorte `get_current_occupancy`. |
| Ha quanto tempo cada pessoa esta na academia? | Falta | Precisa eventos entrada/saida e sessoes abertas. | `live_occupancy.json`. |
| Tempo medio de treino/permanencia | Falta | Precisa parear entrada e saida por aluno/sessao. | `training_duration_rollup.json`. |
| Qual foi o dia mais movimentado/parado do mes? | Falta | Precisa serie diaria de acessos. | `attendance_rollup.json`. |
| Qual horario fica lotado/tem espaco? | Falta | Precisa capacidade por horario e uso medio/pico. | `attendance_capacity_rollup.json`. |
| Quais planos vencem hoje/semana/mes? | Falta | Precisa vencimentos por aluno/plano. | `renewals_rollup.json`. |
| Quem ainda nao renovou? | Falta | Precisa plano vencido, status e renovacao. | `renewals_rollup.json` ou `student_finance_rollup.json`. |
| Quanto devemos receber de renovacoes esta semana? | Falta | Precisa forecast de renovacao e valores por vencimento. | `receivables_rollup.json`. |
| Quem esta perto de vencer e nao foi avisado? | Falta | Precisa vencimento + historico de contato/avisos. | `renewals_rollup.json` + `communication_rollup.json`. |
| Quais alunos podem receber promocao para renovar? | Falta | Precisa regra de elegibilidade, risco e valor/plano. | `campaign_opportunities.json`. |
| Quantos alunos antigos voltaram este mes? | Falta | Precisa evento de retorno/reativacao. | `student_lifecycle_rollup.json`. |
| Diaria/aula experimental que nao virou matricula | Falta | Precisa funil trial/diaria -> matricula. | `conversion_funnel.json`. |
| Qual funcionario realizou mais matriculas? | Falta | Precisa operador/vendedor nos eventos. | `staff_performance_rollup.json`. |
| Qual funcionario recebeu mais pagamentos? | Falta | Precisa operador nos pagamentos. | `staff_performance_rollup.json`. |
| Professor/turma com mais alunos | Falta | Precisa agenda/turmas/professor vinculados a alunos/acessos. | `classes_rollup.json`. |
| Horarios que precisam de mais/menos funcionarios | Falta | Precisa movimento por horario + escala/capacidade. | `staffing_recommendations.json`. |
| Como hoje compara com ontem? | Parcial | Hoje existe; ontem precisa serie diaria padronizada. | `daily_trends.json`. |
| Como faturamento deste mes compara com mes passado? | OK parcial | `finance_rollup.monthly` permite comparar meses, mas sem meta/dias uteis. | Manter e adicionar `finance_periods.json`. |
| Estamos perto de bater a meta? Quanto falta? | Falta | Precisa metas por unidade/periodo. | `goals_progress.json`. |
| Melhor/pior mes do ano | OK parcial | `finance_rollup.monthly` permite por receita, nao por lucro/alunos. | `finance_rollup` + `student_lifecycle_rollup`. |
| Perfil mais comum dos alunos | Falta | Precisa agregacao de idade/genero/plano/tag sem expor dados sensiveis. | `student_profile_rollup.json`. |
| Plano mais contratado/menos vendido/gera mais dinheiro | Parcial | PWA tem `topPlanosGlobal`, mas ainda nao esta padronizado no contexto analitico. | `plan_rollup.json`. |
| Plano com maior taxa de cancelamento | Falta | Precisa churn por plano. | `plan_rollup.json` + `retention_summary.json`. |
| Campanha que trouxe mais matriculas | Falta | Precisa origem/campanha em leads/matriculas. | `marketing_attribution_rollup.json`. |
| Por que leads nao fecham matricula? | Falta | Precisa CRM/leads/motivos de perda. | `lead_funnel_rollup.json`. |
| Quais campanhas criar para proximo mes? | Falta | Precisa historico de campanha, perfil, sazonalidade e oportunidades. | `campaign_opportunities.json`. |
| Como aumentar matriculas/reduzir cancelamentos/trazer antigos de volta? | Parcial | A IA pode sugerir genericamente, mas nao com diagnostico especifico. | `recommendations_daily.json`. |
| Alunos para renovacao/upgrade/oferta/indicacao | Falta | Precisa segmentacao e score por aluno. | `campaign_opportunities.json`. |
| Servicos adicionais por perfil | Falta | Precisa perfil + consumo + regras de oferta. | `student_profile_rollup.json` + `campaign_opportunities.json`. |
| Reclamacoes/elogios/satisfacao | Falta | Precisa origem textual ou NPS/feedback. | `feedback_rollup.json`. |
| Equipamentos com mais reclamacoes/manutencao | Falta | Precisa chamados/manutencao/equipamentos. | `equipment_rollup.json`. |
| Problemas operacionais que precisam de atencao | Falta | Precisa alertas derivados multi-area. | `operations_alerts.json`. |
| O que fazer hoje para melhorar resultados? | Parcial | Pode responder com base em poucos agregados, mas ainda raso. | `recommendations_daily.json`. |
| Resumo completo da academia hoje | Parcial | Ja existe resumo financeiro/frequencia basico, mas faltam pessoas, riscos, metas, operacao. | `daily_executive_summary.json`. |

## Pacotes de JSON recomendados

### Pacote 1: base operacional ampliada

Prioridade alta. Resolve muitas perguntas comuns sem expor banco cru.

```text
analytics/{unitId}/student_lifecycle_rollup.json
analytics/{unitId}/attendance_rollup.json
analytics/{unitId}/plan_rollup.json
analytics/{unitId}/finance_periods.json
analytics/{unitId}/receivables_rollup.json
```

### Pacote 2: alunos e risco

Prioridade alta para a IA virar assistente operacional.

```text
analytics/{unitId}/students_index.json
analytics/{unitId}/student_activity_rollup.json
analytics/{unitId}/student_finance_rollup.json
analytics/{unitId}/retention_summary.json
analytics/{unitId}/risk_alerts.json
analytics/{unitId}/renewals_rollup.json
```

### Pacote 3: comercial e campanhas

Prioridade media. Depende de o desktop ter origem/campanha/leads.

```text
analytics/{unitId}/conversion_funnel.json
analytics/{unitId}/lead_funnel_rollup.json
analytics/{unitId}/marketing_attribution_rollup.json
analytics/{unitId}/campaign_opportunities.json
```

### Pacote 4: operacao, equipe e qualidade

Prioridade media/baixa se esses dados ainda nao existem estruturados no app.

```text
analytics/{unitId}/live_occupancy.json
analytics/{unitId}/training_duration_rollup.json
analytics/{unitId}/staff_performance_rollup.json
analytics/{unitId}/classes_rollup.json
analytics/{unitId}/feedback_rollup.json
analytics/{unitId}/equipment_rollup.json
analytics/{unitId}/operations_alerts.json
analytics/{unitId}/goals_progress.json
analytics/{unitId}/daily_executive_summary.json
```

## Shapes sugeridos

### `student_lifecycle_rollup.json`

```json
{
  "schemaVersion": "1.0.0",
  "kind": "student_lifecycle_rollup",
  "unitId": "58780-000",
  "generatedAt": "2026-07-28T00:00:00-03:00",
  "periods": {
    "today": { "newStudents": 0, "cancelledStudents": 0, "reactivatedStudents": 0 },
    "thisWeek": { "newStudents": 0, "cancelledStudents": 0, "reactivatedStudents": 0 },
    "thisMonth": { "newStudents": 0, "cancelledStudents": 0, "reactivatedStudents": 0 }
  },
  "monthly": [
    { "month": "2026-07", "newStudents": 0, "cancelledStudents": 0, "reactivatedStudents": 0, "netGrowth": 0 }
  ]
}
```

### `attendance_rollup.json`

```json
{
  "schemaVersion": "1.0.0",
  "kind": "attendance_rollup",
  "unitId": "58780-000",
  "generatedAt": "2026-07-28T00:00:00-03:00",
  "periods": {
    "today": { "accessGranted": 0, "uniqueStudents": 0 },
    "yesterday": { "accessGranted": 0, "uniqueStudents": 0 },
    "thisWeek": { "accessGranted": 0, "uniqueStudents": 0 },
    "thisMonth": { "accessGranted": 0, "uniqueStudents": 0 }
  },
  "byWeekday": [
    { "weekday": 1, "name": "segunda", "averageAccess": 0, "averageUniqueStudents": 0 }
  ],
  "byHour": [
    { "hour": 13, "averageAccess": 0, "averageUniqueStudents": 0, "capacityUsagePercent": null }
  ],
  "byShift": {
    "morning": 0,
    "afternoon": 0,
    "night": 0
  }
}
```

### `student_activity_rollup.json`

```json
{
  "schemaVersion": "1.0.0",
  "kind": "student_activity_rollup",
  "unitId": "58780-000",
  "generatedAt": "2026-07-28T00:00:00-03:00",
  "buckets": {
    "inactive7d": 0,
    "inactive15d": 0,
    "inactive30d": 0
  },
  "topInactive": [
    { "studentId": 123, "name": "Aluno Exemplo", "lastAccessAt": "2026-07-01T18:30:00-03:00", "daysWithoutAccess": 27 }
  ],
  "habitSegments": {
    "daily": 0,
    "weeklyOnce": 0,
    "weekendOnly": 0,
    "suddenDrop": 0
  }
}
```

### `student_finance_rollup.json`

```json
{
  "schemaVersion": "1.0.0",
  "kind": "student_finance_rollup",
  "unitId": "58780-000",
  "generatedAt": "2026-07-28T00:00:00-03:00",
  "totals": {
    "overdueStudents": 0,
    "openReceivables": 0,
    "discountedStudents": 0,
    "discountsTotal": 0,
    "averageDiscount": 0
  },
  "overdueStudents": [
    { "studentId": 123, "name": "Aluno Exemplo", "dueDate": "2026-07-10", "daysOverdue": 18, "openAmount": 120 }
  ],
  "discountedStudentsSample": [
    { "studentId": 123, "name": "Aluno Exemplo", "discountValue": 20, "discountPercent": 14.3 }
  ]
}
```

### `risk_alerts.json`

```json
{
  "schemaVersion": "1.0.0",
  "kind": "risk_alerts",
  "unitId": "58780-000",
  "generatedAt": "2026-07-28T00:00:00-03:00",
  "riskBuckets": {
    "high": 0,
    "medium": 0,
    "low": 0
  },
  "students": [
    {
      "studentId": 123,
      "name": "Aluno Exemplo",
      "riskScore": 86,
      "riskLevel": "high",
      "reasons": ["15 dias sem acesso", "plano vence em 3 dias"],
      "recommendedAction": "Enviar mensagem de recuperacao"
    }
  ]
}
```

### `daily_executive_summary.json`

```json
{
  "schemaVersion": "1.0.0",
  "kind": "daily_executive_summary",
  "unitId": "58780-000",
  "date": "2026-07-28",
  "highlights": [
    "Receita de hoje acima da media dos ultimos 7 dias"
  ],
  "alerts": [
    { "severity": "high", "area": "retention", "message": "12 alunos com risco alto de evasao" }
  ],
  "recommendedActions": [
    { "priority": "high", "action": "Contatar alunos que vencem esta semana e nao frequentam ha 15 dias" }
  ]
}
```

## Observacoes importantes

- Algumas perguntas sao de resposta generica, como "como aumentar matriculas?". A IA ate responde hoje, mas sem dados comerciais ela vira consultora generica. Para ficar util, precisa de funil, campanhas, perfil e oportunidades.
- Perguntas com "quem" geralmente precisam de dataset por aluno ou recorte sob demanda. Melhor nao colocar listas enormes no contexto padrao.
- Perguntas com "agora" exigem dados live. Isso provavelmente deve ser endpoint curto no PhysikServer, nao JSON estatico de longa validade.
- Perguntas de lucro exigem despesas. Se o app desktop nao registra saidas/custos, a IA deve responder "receita" e nao "lucro".
