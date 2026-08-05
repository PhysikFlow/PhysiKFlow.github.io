# Firebase da IA

O PWA usa o no `ai_assistant` para memoria, lacunas de dados e arquivo integral das conversas.

## Dados manuais

Crie um no raiz com os UIDs que poderao analisar todas as conversas:

```json
{
  "ai_reviewers": {
    "UID_DO_REVISOR": true
  }
}
```

O proprio PWA cria os dados abaixo na primeira conversa. Nao e necessario cria-los manualmente:

```text
ai_assistant/
  conversations/{uid}/{sessionId}/
    meta
    messages/{messageId}
  memory/{uid}
  gaps/{uid}/{gapId}
```

## Regras

Adicione os blocos `ai_reviewers` e `ai_assistant` dentro de `rules`, no mesmo nivel de `authorized_users`, `app_config`, `relatorios` e `units`:

```json
{
  "rules": {
    "ai_reviewers": {
      ".read": false,
      ".write": false
    },
    "ai_assistant": {
      "conversations": {
        ".read": "auth != null && root.child('ai_reviewers').child(auth.uid).val() === true",
        "$uid": {
          ".read": "auth != null && auth.uid === $uid",
          "$sessionId": {
            "meta": {
              ".write": "auth != null && auth.uid === $uid && root.child('authorized_users').child(auth.uid).val() === true",
              ".validate": "newData.hasChildren(['schemaVersion', 'userUid', 'updatedAt']) && newData.child('userUid').val() === $uid"
            },
            "messages": {
              "$messageId": {
                ".write": "auth != null && auth.uid === $uid && root.child('authorized_users').child(auth.uid).val() === true && !data.exists() && newData.exists()",
                ".validate": "newData.hasChildren(['schemaVersion', 'role', 'text', 'createdAt']) && (newData.child('role').val() === 'user' || newData.child('role').val() === 'assistant') && newData.child('text').isString()"
              }
            }
          }
        }
      },
      "memory": {
        ".read": "auth != null && root.child('ai_reviewers').child(auth.uid).val() === true",
        "$uid": {
          ".read": "auth != null && auth.uid === $uid",
          ".write": "auth != null && auth.uid === $uid && root.child('authorized_users').child(auth.uid).val() === true",
          ".validate": "newData.hasChildren(['schemaVersion', 'updatedAt'])"
        }
      },
      "gaps": {
        ".read": "auth != null && root.child('ai_reviewers').child(auth.uid).val() === true",
        "$uid": {
          ".read": "auth != null && auth.uid === $uid",
          "$gapId": {
            ".write": "auth != null && auth.uid === $uid && root.child('authorized_users').child(auth.uid).val() === true",
            ".validate": "newData.hasChildren(['id', 'summary', 'status', 'updatedAt']) && newData.child('id').val() === $gapId"
          }
        }
      }
    }
  }
}
```

## Comportamento

- Cada usuario le e atualiza somente a propria memoria e as proprias lacunas.
- Mensagens podem ser criadas uma unica vez. O cliente nao pode editar nem apagar uma mensagem arquivada.
- UIDs em `ai_reviewers` podem ler todas as conversas, memorias e lacunas, mas nao podem altera-las.
- Firebase Admin SDK pode exportar e analisar os dados, pois nao e limitado pelas regras do cliente.
- Nao ha expiracao automatica das conversas.
