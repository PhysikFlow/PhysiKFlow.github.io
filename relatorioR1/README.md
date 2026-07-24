# PhysikFlow Relatorios

Versao padrao do app de relatorios, com Inicio operacional, Financeiro e Alunos.

- **Producao:** `/relatorioR1/`
- **Versao antiga temporaria:** `/relatorioR1-old/`

A versao antiga fica disponivel temporariamente a partir da pagina Conta.

## Fotos dos alunos

O PWA le `/app_config/physik_server` no Realtime Database apos o login/autorizacao. Esse no e publicado pelo PhysikFlow desktop que roda no PC do PhysikServer.

Campos esperados:

- `baseUrl`: URL publica atual do Cloudflare Tunnel.
- `status`: `online` para habilitar busca de fotos.
- `apiBearerToken`: token global da API PhysikServer, usado pelo PWA para gerar links temporarios de alunos e fotos.
- `pwaReadToken`: token read-only alternativo; usado apenas se `apiBearerToken` nao estiver publicado.
- `linkTtlSeconds`: TTL do link assinado, padrao `86400`.
