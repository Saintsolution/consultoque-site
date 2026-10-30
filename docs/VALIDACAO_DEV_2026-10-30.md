# Validação local em dev — 30/10/2026

Base validada: branch `dev/unificacao-coletivo`, commit `743f9b6`.

## Resultados

- `npm run typecheck`: aprovado.
- `npm run lint`: zero erros; cinco avisos de hooks já documentados no checkpoint.
- `npm run build`: aprovado; aviso de bundle JavaScript acima de 500 kB (605,82 kB antes de gzip).
- `npm test`: 15 testes aprovados; comparação de 132 funções operacionais com as versões originais aprovada.
- `npm run test:browser`: os dois scripts aprovados, sem alteração do código da aplicação.

O navegador verificou Home, Coletivo, cinco aliases, contratação PF com aceite e boleto simulado, indicação, complemento, autenticação administrativa e de colaborador, expiração, recuperação e política de senha, materiais e quatro larguras. O dashboard associado passou pelos cenários de login, consulta, edição, validação de CPF, resposta atrasada, inclusão com boleto simulado, exclusão, inadimplência, envelopes de resposta, 401/403 e logout.

## Ambiente e reprodução

Servidor local: `npm run dev -- --host 127.0.0.1`, em `http://127.0.0.1:5173/`.

Foi usado o Chromium já instalado, pois o executável padrão esperado pelo Playwright não estava disponível:

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE='/Users/macbookpro/Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-x64/chrome-headless-shell' TEST_ARTIFACTS=/private/tmp/consultoque-dev-2026-10-30 npm run test:browser
```

O sandbox bloqueou inicialmente a abertura da porta local; servidor e navegador foram executados com a permissão ampliada aprovada pelo ambiente. Capturas e resultados sintéticos ficaram no diretório temporário indicado acima.

## Limites e próximos passos

Os testes de navegador interceptam integrações e bloqueiam outras origens externas. Não foram criados cadastros, cobranças ou alterações reais. A aplicação aberta manualmente continua usando endpoints reais: os mocks pertencem somente ao navegador automatizado.

A validação local não certifica CORS, tokens aceitos pelo backend, Google Sheets, emails, Asaas, pagamentos ou comissões reais. Essas verificações exigem homologação controlada com ambiente e dados apropriados.

Nas referências Git locais, `main` está um commit atrás da branch de unificação e não há divergência. A branch remota rastreada aponta para `743f9b6`; a atualização do servidor remoto não foi consultada nesta rodada. O site/conta Netlify responsável pelo domínio principal ainda precisa ser confirmado, incluindo repositório, branch de produção, variáveis e política de publicação automática.

Não houve merge, commit, push, deploy, instalação de marketing ou alteração em produção. O projeto empresarial e sua alteração preexistente foram preservados.
