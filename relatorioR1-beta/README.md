# PhysikFlow Relatorios Beta

Laboratorio de teste do app de relatorios. Esta pasta parte da versao atual de producao em `/relatorioR1/`, mas usa cache/localStorage/manifest separados para validar novas telas antes de promover para o PWA principal.

- **Producao:** `/relatorioR1/`
- **Beta/Lab:** `/relatorioR1-beta/`

## Memoria e arquivo da IA

O chat mantem uma janela curta visivel no navegador, envia o historico recente ao Gemini e mantem um caderno por usuario com resumo, fatos declarados, preferencias e lacunas de dados.

Quando as regras estiverem publicadas, todas as mensagens sao arquivadas em `ai_assistant/conversations/{uid}`. A memoria fica em `ai_assistant/memory/{uid}` e as lacunas em `ai_assistant/gaps/{uid}`.

As regras necessarias estao em `FIREBASE-AI-RULES.md`.

## IA

O chat da aba IA usa o Gemini diretamente no client por enquanto, lendo a configuracao do Firebase:

- Configuracao: `/app_config/gemini`
- Contexto: snapshot operacional + JSONs analiticos do PhysikServer quando disponiveis
- Historico visivel: ultimas 12 mensagens salvas por UID no `localStorage` do beta
- Continuidade: ate 10 mensagens recentes sao enviadas ao Gemini com limite de tamanho
- Memoria: resumo, fatos declarados, preferencias e lacunas sincronizados por UID
- Arquivo: todas as perguntas e respostas sao gravadas no Firebase quando as regras permitem
- Fila de envio: mensagens entram primeiro em uma fila local por UID e saem dela somente apos confirmacao do Firebase
- Cache de resposta: cache curto de 3 minutos por pergunta + contexto + historico + memoria
- Fallback Gemini: tenta o modelo configurado e depois modelos leves de fallback
- Plano tecnico: `AI-ARCHITECTURE.md`
- Cobertura de perguntas e datasets faltantes: `AI-QUESTION-COVERAGE.md`

Comandos locais do chat, sem gastar cota Gemini:

- `/help`: lista comandos disponiveis.
- `/mock`: gera resposta fake com Markdown completo.
- `/json`: busca `manifest`, `daily_summary` e `finance_rollup` da unidade atual via PhysikServer.
- `/json manifest`: busca apenas `manifest.json`.
- `/json daily`: busca apenas `daily_summary.json`.
- `/json finance`: busca apenas `finance_rollup.json`.
- `/json students`: testa o futuro `students_index.json`.
- `/json risk`: testa o futuro `risk_alerts.json`.
- `/json all`: testa todos os datasets conhecidos, inclusive os planejados.
- `/json finance 58780-000`: busca dataset de uma unidade especifica.
- `/context`: mostra o contexto analitico que seria enviado ao Gemini.
- `/context compact`: mostra a versao compactada enviada ao Gemini.
- `/context 58780-000`: mostra o contexto de uma unidade especifica.
- `/memory`: abre o caderno da conversa.
- `/desktop <pedido>`: gera um JSON `desktop_request` para dados/acoes que dependem do app desktop.

Configuracao opcional no Firebase:

```json
{
  "enabled": true,
  "apiKey": "SUA_CHAVE",
  "model": "gemini-flash-latest",
  "fallbackModels": [
    "gemini-3.5-flash-lite"
  ]
}
```

## Fotos dos alunos

O PWA le `/app_config/physik_server` no Realtime Database apos o login/autorizacao. Esse no e publicado pelo PhysikFlow desktop que roda no PC do PhysikServer.

Campos esperados:

- `baseUrl`: URL publica atual do Cloudflare Tunnel.
- `status`: `online` para habilitar busca de fotos.
- `apiBearerToken`: token global da API PhysikServer, usado pelo PWA para gerar links temporarios de alunos e fotos.
- `pwaReadToken`: token read-only alternativo; usado apenas se `apiBearerToken` nao estiver publicado.
- `linkTtlSeconds`: TTL do link assinado, padrao `86400`.
