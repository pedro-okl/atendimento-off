# Registro Offline de Atendimentos

PWA em React + Vite para registrar atendimentos sociais sem internet, persistir os dados no dispositivo e sincronizar com Supabase quando houver conectividade.

## Tecnologias

- React + Vite
- IndexedDB com Dexie
- Supabase JS
- PWA com manifest e service worker

## Como executar

1. Instale as dependencias:

```bash
npm install
```

2. Crie o arquivo `.env` a partir do exemplo:

```bash
cp .env.example .env
```

3. Preencha as variaveis:

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_ANON
```

4. No Supabase, execute o arquivo `supabase.sql` no SQL Editor.

5. Rode o projeto:

```bash
npm run dev
```

6. Abra no navegador:

```text
http://localhost:5173
```

Para testar no celular fisico, use o IP do computador na mesma rede:

```text
http://IP-DO-COMPUTADOR:5173
```

No computador atual, o IP detectado foi:

```text
http://172.16.102.218:5173
```

Observacao: navegadores mobile exigem HTTPS para instalar PWA e registrar service worker. O acesso por IP local em HTTP serve para demonstrar o fluxo no navegador; para instalar como PWA com cache offline completo, publique o build em um host HTTPS, como Vercel, Netlify ou Supabase Hosting.

## Build de producao

```bash
npm run build
npm run preview
```

O preview fica em:

```text
http://localhost:4173
```

## Fluxo de uso

- O atendimento e salvo primeiro no IndexedDB.
- O status inicial e `pending`.
- Quando o app esta online, a fila tenta sincronizar com Supabase.
- Em sucesso, o status vira `synced`.
- Em erro, o status vira `failed`, com contagem de tentativas e mensagem da falha.
- O botao de retentativa executa a sincronizacao manual.

## Demonstracao offline

1. Abra o app no celular.
2. Desative Wi-Fi/dados moveis.
3. Cadastre um atendimento.
4. Feche e abra o app para confirmar persistencia local.
5. Reative a internet.
6. Aguarde a sincronizacao automatica ou toque em retentar.
7. Confira o registro na tabela `atendimentos` do Supabase.

## Observacoes

- Esta versao nao usa autenticacao.
- `client_id` evita duplicidade no Supabase durante retentativas.
- A PWA possui cache de arquivos do app, mas os dados operacionais ficam no IndexedDB.
