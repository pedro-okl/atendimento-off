# Documento Tecnico

## Arquitetura

A solucao foi implementada como PWA com React + Vite. A interface roda no navegador mobile, pode ser instalada no dispositivo e continua acessivel offline por meio do service worker.

A aplicacao foi separada em camadas:

- `src/components`: formulario, dashboard, lista e badges de status.
- `src/hooks`: estado dos atendimentos, conexao e sincronizacao.
- `src/db`: banco IndexedDB e repositorio local.
- `src/services`: cliente Supabase e servico de sincronizacao.

## Gerenciamento de Estado

O estado principal fica no hook `useAttendances`. Ele assina alteracoes do IndexedDB com `liveQuery`, calcula os indicadores do dashboard e expoe as acoes de cadastro e sincronizacao.

Os estados de sincronizacao sao:

- `pending`: registro local ainda nao enviado.
- `syncing`: registro em envio.
- `synced`: registro persistido no Supabase.
- `failed`: envio falhou e pode ser retentado.

## Persistencia Local

Os atendimentos sao armazenados no IndexedDB usando Dexie. O cadastro nao depende de rede: todo registro e gravado localmente antes de qualquer tentativa de envio.

Campos locais principais:

- `clientId`
- `nomeAtendido`
- `descricao`
- `atendimentoEm`
- `syncStatus`
- `retryCount`
- `lastSyncAttempt`
- `lastError`

## Fluxo de Sincronizacao

Quando o app detecta conexao online, ou quando o usuario toca em retentar, o servico busca registros `pending` e `failed`.

Cada registro e enviado para a tabela `atendimentos` do Supabase com `upsert` usando `client_id` como chave de conflito. Isso evita duplicidades caso a sincronizacao seja repetida.

Em sucesso, o registro local recebe status `synced`. Em falha, o app incrementa `retryCount`, salva `lastError` e muda o status para `failed`.

## Tratamento de Excecoes

A aplicacao trata:

- ausencia de internet;
- Supabase nao configurado;
- erro de permissao/RLS no Supabase;
- duplicidade por retentativa;
- sincronizacao interrompida antes de concluir.

## Limitacoes Tecnicas

- Nao ha autenticacao de usuarios.
- As policies do Supabase usadas para apresentacao permitem acesso anonimo.
- A resolucao de conflitos e simples: o app envia o registro local usando `client_id` e atualiza a linha remota correspondente.

## Melhorias Futuras

- Login por usuario ou equipe.
- Edicao de atendimentos ainda pendentes.
- Exportacao CSV.
- Sincronizacao em segundo plano com Background Sync API.
- Criptografia local dos dados sensiveis.
- Filtros por data, status e nome do atendido.
