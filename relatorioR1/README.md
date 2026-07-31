# PhysikFlow Relatorios

Versao padrao do app de relatorios, com Inicio operacional, Financeiro, Alunos e IA em testes.

- **Producao:** `/relatorioR1/`
- **Versao antiga temporaria:** `/relatorioR1-old/`

A versao antiga fica disponivel temporariamente a partir da pagina Conta.

## IA em testes

A aba IA usa o Gemini com contexto operacional e JSONs analiticos do PhysikServer quando disponiveis.

- Mantem as ultimas 12 mensagens visiveis por usuario.
- Envia ao modelo uma janela limitada das mensagens recentes.
- Mantem memoria de fatos declarados, preferencias e lacunas de dados.
- Arquiva perguntas, respostas, comandos locais e erros no Firebase.
- Usa uma fila local por UID ate o Firebase confirmar cada mensagem.
- Exibe um aviso de que a IA pode cometer erros e que decisoes importantes devem ser confirmadas nos dados oficiais.

**Pendencia:** publicar os blocos `ai_reviewers` e `ai_assistant` descritos em `FIREBASE-AI-RULES.md`. Ate isso acontecer, o chat continua funcionando, mas o arquivo em nuvem permanece na fila local.

## Fotos dos alunos

O PWA le `/app_config/physik_server` no Realtime Database apos o login/autorizacao. Esse no e publicado pelo PhysikFlow desktop que roda no PC do PhysikServer.

Campos esperados:

- `baseUrl`: URL publica atual do Cloudflare Tunnel.
- `status`: `online` para habilitar busca de fotos.
- `apiBearerToken`: token global da API PhysikServer, usado pelo PWA para gerar links temporarios de alunos e fotos.
- `pwaReadToken`: token read-only alternativo; usado apenas se `apiBearerToken` nao estiver publicado.
- `linkTtlSeconds`: TTL do link assinado, padrao `86400`.
