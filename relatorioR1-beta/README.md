# PhysikFlow Relatórios — Beta (operacional/financeiro)

Versão em testes com Início operacional, segmento Financeiro e opção **Todas as unidades**.

- **Beta (testes):** `/relatorioR1-beta/`
- **Produção (usuários):** `/relatorioR1/`

Instale o PWA a partir deste link apenas para validação interna. Usuários finais devem continuar em `/relatorioR1/`.

---

## Modo Demo (Desenvolvimento)

### Como usar:
Para testar o **layout e design** sem Firebase:
1. Abra a página em localhost
2. Clique no botão **"Modo Demo - Entrar"** que aparecerá na tela de login
3. O app carregará várias unidades mockadas para validar cards, colunas e larguras

### Como remover:
**Em produção**, remova o modo demo:

**No `script.js` (linha 4):**
```javascript
const DEMO_MODE = false; // Mude true → false
```

**Localizar e remover:**
- Procure por `MOCK/DEMO DATA - REMOVE BEFORE PRODUCTION`
- Procure por `MOCK/DEMO CONTROLS - REMOVE BEFORE PRODUCTION`
- Remova os botões `demoButtons` do HTML
- Remova a função `showDemoButtons()`
- Remova os dados `DEMO_DATA`
- Restaure a lógica padrão de auth na função `init()`

**Search & Replace:**
```
Busque por: MOCK/DEMO
Remova todas as seções marcadas
```
