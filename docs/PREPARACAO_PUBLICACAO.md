# Preparação da publicação unificada

Atualizado em 30/10/2026. Este documento complementa o checkpoint histórico de 25/10; não altera seu registro.

## Identidade e destino

- Pasta principal local: `consultoque-vendas` (sem o segundo “s”).
- Repositório Git configurado em `origin`: `https://github.com/Saintsolution/consultoque-site.git`.
- Branch de trabalho: `dev/unificacao-coletivo`.
- Branch de produção pretendida: `main`.
- Domínio pretendido: `https://consultoque.com.br`.
- Projeto antigo preservado: `cosultoque_empresas`, remoto `Saintsolution/consultoque-empresas`, subdomínio `coletivo.consultoque.com.br`.

Não renomear nem trocar o remoto para publicar. O nome da pasta local pode ser diferente do nome do repositório GitHub.

## Alterações finais

- A unificação está no commit `743f9b69eb47336448a7704e66c87d0c3d4b0ba7`.
- O botão “Quero ser colaborador” na página Coletivo agora leva a `/seja-afiliado`; essa página permite continuar ao cadastro com a indicação armazenada.
- Resultados dos testes locais em `VALIDACAO_DEV_2026-10-30.md`.
- O usuário informou emissão real de boleto bem-sucedida. O ciclo de confirmação de pagamento e comissão não foi homologado nesta sessão.

## Antes de autorizar publicação

1. Confirmar na conta Netlify correta o site que atende `consultoque.com.br`, o repositório conectado e a branch de produção. A identificação ainda não foi comprovada nesta sessão.
2. Conferir comando `npm run build`, diretório publicado `dist`, versão Node compatível com as dependências, variáveis VITE e política de deploy automático/previews. `public/_redirects` já contém o fallback SPA.
3. Consultar os heads atuais no GitHub e conferir eventuais mudanças desde as referências locais. A main local está em `bbd8154d9b6a3ff025cd9355fe81932db5d9cf18`; isso não comprova o commit atualmente publicado.
4. Registrar ID/URL do deploy de produção vigente e seu commit antes da troca. Esse é o ponto de restauração, ainda pendente de identificação no Netlify.
5. Revisar os arquivos pendentes e salvar um novo commit da branch dev somente no escopo autorizado. Qualquer push, merge ou publicação exige autorização expressa; merge/push podem disparar deploy automático.
6. Homologar ou aceitar explicitamente a pendência do retorno de pagamento, atualização de contrato, vínculo pai/filho e comissões. Os testes simulados não certificam a execução desses processos pelo backend.

## Publicação e verificação posterior

Após autorização, incorporar a branch validada à `main` do repositório principal e acompanhar o deploy do site Netlify correto. Verificar Home, `/coletivo`, `/contratar`, acessos diretos às rotas, indicação e sessões no domínio principal. Não desligar o site empresarial.

Se houver falha no frontend, restaurar o deploy anterior identificado no Netlify; depois alinhar o código Git por uma reversão revisada para que um novo deploy não reintroduza a falha. Restaurar o site não desfaz cadastros, contratos, pagamentos ou boletos no backend. Não executar comandos destrutivos para voltar a versão.

Nenhum script de marketing foi adicionado. Nenhuma mudança financeira, de backend ou de produção foi feita nesta preparação.
