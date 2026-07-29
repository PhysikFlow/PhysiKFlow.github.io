# PhysikFlow Relatorios Beta

Laboratorio de teste do app de relatorios. Esta pasta parte da versao atual de producao em `/relatorioR1/`, mas usa cache/localStorage/manifest separados para validar novas telas antes de promover para o PWA principal.

- **Producao:** `/relatorioR1/`
- **Beta/Lab:** `/relatorioR1-beta/`

## IA

O chat da aba IA usa o Gemini diretamente no client por enquanto, lendo a configuracao do Firebase:

- Configuracao: `/app_config/gemini`
- Contexto: snapshot operacional + JSONs analiticos do PhysikServer quando disponiveis
- Historico: ultimas 12 mensagens salvas no `localStorage` do beta
- Cache de resposta: cache curto de 3 minutos por pergunta + assinatura do contexto
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
