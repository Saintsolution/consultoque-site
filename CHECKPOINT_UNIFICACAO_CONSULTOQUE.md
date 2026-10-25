# Checkpoint ConsulToque — antes da homologação real

Data: 25/10/2026.

## Identificação e escopo autorizado

- Repositório local com origin `https://github.com/Saintsolution/consultoque-site.git`.
- Branch exclusiva: `dev/unificacao-coletivo`.
- Mensagem autorizada: `checkpoint: unificacao local ConsulToque antes da homologacao`.
- Implementação e inspeção visual concluídas; preservar aplicação, plano, relatório, documentação e testes.
- Nenhuma homologação real, merge, pull request, publicação, mudança de DNS ou alteração de backend nesta etapa.

## Validação do checkpoint

As quatro verificações foram executadas novamente antes do commit e terminaram com código 0:

| Comando | Resultado |
|---|---|
| npm run typecheck | Aprovado |
| npm run lint | Sem erros; cinco avisos herdados, documentados no relatório |
| npm run build | Aprovado; aviso conhecido de chunk acima de 500 kB |
| npm test | 15 testes aprovados; 132 funções comparadas com as versões originais B |

A revisão suplementar de diff apontou espaços finais em trechos de evidência, patch e código copiados. Esses espaços foram preservados para não fazer limpeza de código ou alterar o patch original neste checkpoint; não representam falha nas quatro validações solicitadas.

Os testes usam dados sintéticos e não enviam operações reais. Os testes de navegador da implementação continuam preservados, mas não foi necessário repetir a inspeção visual nesta etapa de checkpoint.

## Revisão de segurança e seleção de arquivos

Foram inspecionados os arquivos candidatos ao versionamento, inclusive código, documentação, fixtures e os arquivos já rastreados. A busca por chaves privadas, padrões de tokens de provedores, JWTs, atribuições de credenciais, arquivos .env e nomes de arquivos sensíveis não encontrou segredos reais. Resultados aparentes foram revisados: nomes de chaves de storage, constantes de endpoints e tokens fictícios de testes. Não foram encontrados cadastros, sessões ou dados reais de clientes; contatos comerciais públicos e placeholders existentes no site foram preservados. A revisão de padrões não equivale a uma garantia matemática de ausência de segredos.

Não incluir node_modules, dist, caches, .netlify, arquivos de ambiente, logs ou artefatos temporários. Nenhum desses caminhos está sendo adicionado ao checkpoint. O arquivo em backups já era rastreado e não foi alterado ou readicionado nesta etapa. A documentação do diff B e as fixtures de contratos são intencionais e necessárias à rastreabilidade da migração.

## Proteção de branches e do projeto B

Antes do checkpoint, main e developer locais apontavam para `bbd8154d9b6a3ff025cd9355fe81932db5d9cf18`. O commit deve avançar somente dev/unificacao-coletivo. As referências serão comparadas após a operação.

O conteúdo dos 81 arquivos não gerados de `cosultoque_empresas` foi registrado por SHA-256 para comparação após o checkpoint. Sua alteração preexistente em src/pages/AssociadoDashboard.tsx deve continuar intacta, sem stage ou commit em B.

## Netlify e decisão de push

Não há netlify.toml nem workflow GitHub Actions de deploy nos arquivos locais revisados. Não existem hooks Git ativos no diretório padrão e não há core.hooksPath personalizado configurado. Isso não garante a ausência de branch deploy no provedor.

A consulta somente leitura à API Netlify não retornou projetos ConsulToque acessíveis. A sessão disponível no navegador mostrou uma equipe sem esses projetos. O estado .netlify local não fornece identificação do site para validar a política remota. Assim, **não foi possível excluir a possibilidade de deploy automático ao enviar dev/unificacao-coletivo**.

**Decisão: criar o commit local autorizado e não executar push.** Nenhuma configuração do Netlify foi modificada. Não foram executados comandos de deploy, hooks remotos, DNS, workflows n8n, Asaas ou banco de dados. Antes de enviar a branch, abrir a conta/equipe Netlify correta e verificar produção, branch deploys, previews e qualquer automação associada ao repositório; pedir orientação do usuário conforme a restrição expressa.

## Ponto de retomada

1. Conferir o hash do checkpoint local em git log -1 e manter a branch dev/unificacao-coletivo.
2. Verificar, com acesso à conta Netlify correta, se o envio da branch pode gerar qualquer publicação automática. Não fazer push enquanto isso não estiver esclarecido.
3. Somente após a verificação satisfatória e dentro da autorização do usuário, enviar a branch ao origin, sem merge ou PR.
4. O próximo trabalho funcional é a homologação das integrações reais descrita no PLANO_UNIFICACAO_CONSULTOQUE.md e no RELATORIO_IMPLEMENTACAO_LOCAL.md. Não iniciar sem a autorização correspondente e a definição do ambiente/dados apropriados.

## Inventário inicial das mudanças

Classificação original do git status antes do staging. Renomes podem ser reconhecidos pelo Git após a inclusão no índice.

Contagem inicial: 17 M, 23 D, 45 ??.

```text
 M package-lock.json
 M package.json
 M src/App.tsx
 D src/components/CTA.tsx
 M src/components/CollectivePlansCall.tsx
 D src/components/CortesiasAdmin.tsx
 D src/components/Extra.tsx
 M src/components/Footer.tsx
 M src/components/HeaderVisual.tsx
 M src/components/Hero.tsx
 M src/components/PlanGrid.tsx
 D src/components/ScrollToTop.tsx
 D src/components/SolicitacaoValidacaoCpf.tsx
 D src/components/Specialties.tsx
 D src/components/TermoAdesaoAssociado.tsx
 D src/components/Testimonials.tsx
 M src/index.css
 D src/pages/AdminAsaas.tsx
 D src/pages/ClienteDashboard.tsx
 D src/pages/ColaboradorDashboard.tsx
 D src/pages/EmpresaDashboard.tsx
 M src/pages/FAQ.tsx
 D src/pages/FormColetivo.tsx
 D src/pages/FormFamiliar.tsx
 D src/pages/FormIndividual.tsx
 D src/pages/InscricaoColaborador.tsx
 D src/pages/MaterialPromocional.tsx
 D src/pages/MontarFolder.tsx
 D src/pages/PanfletosPromocionais.tsx
 D src/pages/Play.tsx
 M src/pages/Privacidade.tsx
 M src/pages/SejaAfiliado.tsx
 D src/pages/SolicitarImpressos.tsx
 M src/pages/Termos.tsx
 D src/pages/Vendas.tsx
 D src/pages/Vendas_asaas.tsx
 M src/pages/VideoAfiliados.tsx
 M tailwind.config.js
 M tsconfig.app.json
 M vite.config.ts
?? PLANO_UNIFICACAO_CONSULTOQUE.md
?? RELATORIO_IMPLEMENTACAO_LOCAL.md
?? docs/ALTERACAO_LOCAL_ASSOCIADO_DASHBOARD.patch
?? public/og-consultoque-coletivo-v3.png
?? scripts/check-contracts.mjs
?? scripts/test-local.mjs
?? src/app/ReferenciaComercial.tsx
?? src/app/rotas.ts
?? src/coletivo/components/CortesiasAdmin.tsx
?? src/coletivo/components/Footer.tsx
?? src/coletivo/components/Header.tsx
?? src/coletivo/components/TermoAdesaoAssociado.tsx
?? src/coletivo/components/home/Benefits.tsx
?? src/coletivo/components/home/Hero.tsx
?? src/coletivo/components/home/LegalCompliance.tsx
?? src/coletivo/components/home/Pricing.tsx
?? src/coletivo/components/home/SejaColaboradorCTA.tsx
?? src/coletivo/components/home/VideoSection.tsx
?? src/coletivo/pages/Admin.tsx
?? src/coletivo/pages/Associado.tsx
?? src/coletivo/pages/AssociadoDashboard.tsx
?? src/coletivo/pages/Colaborador.tsx
?? src/coletivo/pages/ColaboradorDashboard.tsx
?? src/coletivo/pages/CompletarAdesao.tsx
?? src/coletivo/pages/CriarSenha.tsx
?? src/coletivo/pages/FormColetivo.tsx
?? src/coletivo/pages/Home.tsx
?? src/coletivo/pages/MaterialPromocional.tsx
?? src/coletivo/pages/MontarFolder.tsx
?? src/coletivo/pages/PanfletosPromocionais.tsx
?? src/coletivo/pages/Play.tsx
?? src/coletivo/pages/SejaColaborador.tsx
?? src/coletivo/pages/SolicitarImpressos.tsx
?? src/lib/consultaCpf.ts
?? src/lib/cpf.ts
?? src/lib/pricing.ts
?? src/services/contratacao.ts
?? src/services/endpoints.ts
?? src/services/http.ts
?? src/services/referencia.ts
?? tests/browser-associado.cjs
?? tests/browser-local.cjs
?? tests/fixtures/form-coletivo-payload-original.txt
?? tests/fixtures/regras-originais.json
?? tests/unificacao.test.ts
```

Além do inventário inicial, este documento de checkpoint foi adicionado e o relatório recebeu uma nota que distingue a implementação anterior da autorização atual de commit.
