# PhysikFlow Relatorios Beta

Laboratorio de teste do app de relatorios. Esta pasta parte da versao atual de producao em `/relatorioR1/`, mas usa cache/localStorage/manifest separados para validar novas telas antes de promover para o PWA principal.

- **Producao:** `/relatorioR1/`
- **Beta/Lab:** `/relatorioR1-beta/`

## IA

O chat da aba IA usa o Gemini diretamente no client por enquanto:

- Modelo: `gemini-3.5-flash-lite`
- Contexto: nenhuma leitura dos dados do relatorio nesta fase
- Chave: definida em `script.js` apenas para testes

## Fotos dos alunos

O PWA le `/app_config/physik_server` no Realtime Database apos o login/autorizacao. Esse no e publicado pelo PhysikFlow desktop que roda no PC do PhysikServer.

Campos esperados:

- `baseUrl`: URL publica atual do Cloudflare Tunnel.
- `status`: `online` para habilitar busca de fotos.
- `apiBearerToken`: token global da API PhysikServer, usado pelo PWA para gerar links temporarios de alunos e fotos.
- `pwaReadToken`: token read-only alternativo; usado apenas se `apiBearerToken` nao estiver publicado.
- `linkTtlSeconds`: TTL do link assinado, padrao `86400`.
