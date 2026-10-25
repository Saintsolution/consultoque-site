# Relatório da implementação local — ConsulToque

Data: 25/10/2026. Repositório de destino: `Saintsolution/consultoque-site`. Branch: `dev/unificacao-coletivo`.

## Estado da entrega

Implementação local concluída na branch autorizada, incluindo o dashboard do associado após confirmação expressa do usuário: “Sim, incluir essa versão local”. A homologação com serviços reais e qualquer publicação permanecem fora desta entrega e dependem de autorização futura.

Durante a implementação e a inspeção visual, não houve commit, push, merge, deploy, mudança de DNS, alteração de backend, workflow, Asaas ou dados de clientes. Posteriormente, o usuário autorizou um checkpoint Git exclusivo na branch de desenvolvimento; seu procedimento e a restrição de push por verificação pendente do Netlify estão registrados em CHECKPOINT_UNIFICACAO_CONSULTOQUE.md. Todos os testes de navegador interceptam os webhooks e bloqueiam outras origens externas. As URLs reais continuam no código operacional, sem alteração de contratos: os testes usam interceptação, não substituição de endpoints da aplicação.

## Incrementos realizados

1. Inventariado o diff local de `B/src/pages/AssociadoDashboard.tsx` antes de qualquer cópia. Guardado em `docs/ALTERACAO_LOCAL_ASSOCIADO_DASHBOARD.patch` e descrito abaixo. Confirmação recebida; versão local incorporada em `src/coletivo/pages/AssociadoDashboard.tsx`.
2. Criado namespace `src/coletivo` para apresentação, componentes e páginas operacionais de B. Um único BrowserRouter continua em `src/main.tsx` de A.
3. Home comercial `src/pages/Home.tsx` preservada byte a byte. HeaderVisual/Footer/Hero/PlanGrid receberam somente URLs internas; a única alteração comercial de conteúdo foi a chamada coletiva aprovada, no componente que já ocupava essa posição na Home.
4. Apresentação empresarial em `/coletivo`, com Hero, Benefits, Pricing, VideoSection, SejaColaboradorCTA, LegalCompliance, Header e Footer de B. Âncoras apontam à página coletiva; Início retorna à Home principal. Corrigido menu de tablet para usar navegação móvel abaixo de 1024px, evitando overflow.
5. FormColetivo de B em `/contratar`, com termo, prévia de impressão, validações e orientação de complemento antes do pagamento. Nenhum formulário pessoal antigo foi migrado.
6. Migração de login associado, colaborador, cadastro, criação/recuperação de senha, dashboards associado e colaborador, Admin e CortesiasAdmin atuais de B. Sessões, headers e verificações originais preservados; painel legado A não foi usado como autenticação alternativa.
7. Mantido `/completar-adesao` com consulta, validação de CPF, conferência obrigatória e atualização do boleto. Código responsável/contrato/token_complemento continuam com os mesmos nomes e tratamentos.
8. Migradas páginas de materiais, catálogo, montagem do folder, pedido de impressos e Play, com sessão B. Os globs relativos dos panfletos foram ajustados ao novo diretório para reutilizar a imagem existente em `src/assets/panfletos`, sem duplicar a arte. Links públicos e QR continuam apontando ao domínio principal.
9. Criados `src/services/endpoints.ts` e `http.ts` como catálogo e transporte, preservando defaults, overrides VITE, bodies, headers e parsers das páginas. Contratação ganhou builder puro em `contratacao.ts`, comparado com a expressão original B por fixtures sintéticas. Os demais contratos permanecem em suas implementações únicas migradas, sem um DTO universal que altere campos.
10. Indicador comercial passou a ser resolvido em `src/services/referencia.ts`, com coordenação de navegação em `src/app/ReferenciaComercial.tsx`. As páginas só são liberadas após a resolução. Novo código válido vence atribuição anterior; código direto estrito não passa por resolvedor de apelidos; respostas antigas/canceladas não gravam código. Referência explícita inválida ou falha de rede bloqueia continuidade e permite tentar novamente, sem atribuir venda silenciosamente a outra pessoa ou a 0001. Sem referência nova, preserva cookie/storage válidos ou venda direta 0001.
11. Tailwind recebeu os tokens de B, mantendo o `font-sans` padrão de A. Regras globais de tipografia/cor de B foram escopadas em `.coletivo-layout`. Alias @ configurado no Vite e TypeScript. Dependências de runtime mantidas; esbuild já presente foi declarado diretamente para o runner e Playwright foi adicionado como dependência de desenvolvimento.

## Alteração local do AssociadoDashboard — aprovada e incluída

Origem: `/Users/macbookpro/Developer/cosultoque_empresas/src/pages/AssociadoDashboard.tsx`, já modificado antes desta execução.

SHA-256 da versão local inspecionada: `4f0758f52355392814996c027922ace6b6a104db50c776792f9476f28683d4b1`.

O diff altera somente a interface de inclusão de titular:

- Destaca o bloco CPF com “Comece por aqui” e orientação para validar o documento.
- Acrescenta descrição acessível ao input de CPF.
- Bloqueia nome, nascimento, email, telefone e plano durante envio/consulta ou quando o CPF atual não corresponde ao CPF validado.
- Acrescenta estilos visuais de campo desabilitado.

O diff não troca endpoints, payloads, senha ou token. A inclusão dessa versão foi expressamente confirmada pelo usuário antes da cópia. Foram feitas somente adaptações de imports, centralização dos quatro endpoints e do transporte fetch, retorno comercial para `/` e remoção do import `Building2` não usado. A lógica da tela, os payloads, os tokens e os controles aprovados permaneceram equivalentes ao original. A verificação AST inclui as 39 funções dessa versão local.

Estado atual: login em `/associado`, dashboard em `/associado/dashboard` e alias `/dashboard` funcionais no ambiente local. Testes simulados cobrem consulta autenticada, edição do responsável e do titular, validação de CPF, inclusão com boleto, exclusão, resposta de inadimplência, envelopes de JSON, 401/403 e logout. Nenhum dado real foi utilizado.

## Rotas de compatibilidade

| URL antiga | Destino local |
|---|---|
| /formcoletivo | /contratar |
| /form-coletivo | /contratar |
| /formpessoal | /contratar |
| /form-individual | /contratar |
| /form-familiar | /contratar |
| /empresas | /coletivo |
| /cliente e /entrar | /associado |
| /dashboard | /associado/dashboard |
| /admin-asaas | /admin atual de B, com autenticação atual |
| /inscricao-colaborador | /seja-colaborador atual de B |

Aliases preservam query e hash, usam replace para não criar retorno em loop e não enviam dados automaticamente. Parâmetros antigos não são usados para reconstruir cadastros pessoais. Rotas comerciais/operacionais reservadas não são interpretadas como apelidos. `/play`, `/play/:video`, `/play/:video/:ref`, cadastro com indicador, FAQ, termos, privacidade, vídeos de afiliados e apresentação SejaAfiliado continuam presentes.

`/contratos/teste-2026-08-22-v1` não foi promovida como contratação: é artefato de teste de B, não necessário ao fluxo oficial. Não foi migrado ContratoTeste nem AssociadoPage (sem rota operacional ativa).

## Arquivos retirados de A

As implementações abaixo foram retiradas por estarem substituídas pelo fluxo B, serem pontes externas desnecessárias ou não possuírem consumidores no grafo final. Nos casos com URL pública, o endereço foi mantido como alias compatível.

- `src/pages/FormIndividual.tsx`
- `src/pages/FormFamiliar.tsx`
- `src/pages/FormColetivo.tsx`
- `src/pages/ClienteDashboard.tsx`
- `src/pages/ColaboradorDashboard.tsx`
- `src/pages/Vendas.tsx`
- `src/pages/Vendas_asaas.tsx`
- `src/pages/AdminAsaas.tsx`
- `src/pages/EmpresaDashboard.tsx`
- `src/pages/InscricaoColaborador.tsx`
- `src/pages/MaterialPromocional.tsx`
- `src/pages/MontarFolder.tsx`
- `src/pages/PanfletosPromocionais.tsx`
- `src/pages/SolicitarImpressos.tsx`
- `src/pages/Play.tsx`
- `src/components/SolicitacaoValidacaoCpf.tsx`
- `src/components/TermoAdesaoAssociado.tsx`
- `src/components/CortesiasAdmin.tsx`
- `src/components/Extra.tsx`
- `src/components/CTA.tsx`
- `src/components/Specialties.tsx`
- `src/components/Testimonials.tsx`
- `src/components/ScrollToTop.tsx`

Não foram copiados FormPessoal, ContratoTeste, AssociadoPage nem CTASection não utilizado de B. Nenhum arquivo original B foi apagado. `src/coletivo/components/TermoAdesaoAssociado.tsx` e `CortesiasAdmin.tsx` são as versões B que substituem as versões antigas retiradas de A.

## Testes e evidências

### Executados

- `npm test`: 15 testes aprovados e comparação AST de 132 funções com o original B. O comparador ignora comentários/formatação, mudança de nome do transporte fetch e retorno comercial do domínio principal para `/`, além do escape redundante de underscore em regex corrigido pelo lint. Não ignora mudanças na lógica de autenticação ou validação.
- Testes de referência: códigos curtos/4 dígitos, apelidos contendo números, normalização, consulta correta, resposta negativa, HTTP inválido, JSON inválido, falha de rede, cancelamento, resposta atrasada, precedência do cookie/storage, sincronização das chaves e atributos do cookie, URLs reservadas e encoding inválido.
- Testes de contratação: igualdade do builder com payload B para PF/PJ e 1/9/10/11 titulares; códigos 2878/2880, origem, termo, documentos, nomes, datas, descontos e cálculo misto. Indicação não confirmada é rejeitada. Nenhum desses testes usa rede.
- Transporte simulado: preservação de corpo/header de autorização/status 403 e ausência de retry automático.
- `npm run typecheck`: aprovado na verificação final.
- `npm run lint`: aprovado sem erros na verificação final; cinco avisos herdados em Admin, AssociadoDashboard, CompletarAdesao, MontarFolder e SolicitarImpressos. Não foram alteradas dependências de effects que controlam autenticação para apenas silenciar avisos.
- `npm run build`: aprovado na verificação final; aviso de chunk maior que 500 kB. Verificação final também aprovada após os ajustes de assets e testes.
- Primeiro conjunto no navegador aprovado: Home/chamada, /coletivo, cinco aliases com query/hash sem envio automático, PF com CPF/aceite/boleto simulados, atribuição por vídeo/cadastro, bloqueio de referência inválida, abertura do complemento, bloqueio de dashboard colaborador sem sessão, alias administrativo e ausência de overflow em quatro larguras.

### Cenários adicionais aprovados

O script persistido `tests/browser-local.cjs` passou também no envio do complemento com conferência prévia, login e header de token de admin/colaborador, limpeza de sessão em 401/403, recuperação, rejeição de senha fraca, criação simulada com senha forte e montagem da arte/QR. Corrigidos três globs de assets relativos durante a migração. Não houve exceções JavaScript de página no conjunto final. O comparador preserva 132 funções originais; esse número inclui agora o dashboard associado aprovado.

### Dashboard associado — cenários adicionais

`tests/browser-associado.cjs` verifica acesso sem sessão (sem consulta ao backend), login com o contrato original, header `X-Associado-Token` e corpo de consulta, edição com `alvo_edicao` correto para responsável/titular, bloqueio de nome/nascimento/email/telefone/plano antes de validar CPF e durante consulta/envio, rejeição de resposta atrasada após troca de CPF, payload e boleto de inclusão, payload de exclusão e recarga, bloqueio de inclusão em contrato vencido, JSON em array/envelope, limpeza de sessão em HTTP 401/403, logout e largura em 360/390/768/1280px. As capturas e resultados sintéticos são gravados no diretório temporário de testes. O script faz parte de `npm run test:browser`. A regressão final conjunta dos dois scripts foi aprovada após a inclusão do teste de edição do titular, sem exceções JavaScript de página.

### Limites da homologação

Nenhuma cobrança, email, cadastro, alteração financeira ou edição real foi provocada pelos testes. Workflows e conta Asaas não foram acessados. CORS real, entrega de email, aceitação dos tokens pelo backend, pagamentos, comissões, ativação e conciliação continuam dependentes da homologação externa autorizada. Não confundir respostas simuladas com certificação do backend.

## Como reproduzir localmente

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run dev -- --host 127.0.0.1
```

Em outro terminal, com o navegador de testes disponível:

```sh
npx playwright install chromium
npm run test:browser
```

`PLAYWRIGHT_CHROMIUM_EXECUTABLE` permite usar um Chromium já instalado; foi usado nesta máquina para aproveitar o binário existente. `TEST_BASE_URL` permite indicar outra porta local e `TEST_ARTIFACTS` define o diretório de capturas/resultados (padrão: diretório temporário). O script intercepta webhooks e bloqueia outros serviços externos. A instalação de navegador é somente ferramenta de desenvolvimento, não publicação.

A aplicação normal conserva os endpoints reais. Para testar formulários sem efeitos externos, usar o runner com interceptação; abrir a aplicação manualmente não ativa mocks.

## Integridade e pendências

- Conferência por SHA-256 dos 81 arquivos não gerados de B: idênticos ao início da implementação, incluindo a alteração local preexistente. `git status` B continua mostrando somente `src/pages/AssociadoDashboard.tsx` previamente modificado.
- A Home original permaneceu byte a byte igual; componentes comerciais ativos mantêm aparência/conteúdo salvo a chamada aprovada e os destinos internos.
- Condição 5 atendida: alteração local identificada, documentada, aprovada pelo usuário e incorporada; dashboard do associado testado com integrações simuladas.
- Pendente: homologação externa futura autorizada de integrações, emails, Asaas, CORS e comissões. Sessões de outro subdomínio podem exigir novo login no domínio principal; não foram transferidas pela URL ou por cookie comercial.
- Pendente antes de publicação: configurar/revisar Netlify e URLs externas de retorno, executar plano de homologação/rollback e obter autorização explícita. Não houve tentativa de deploy.
- Melhorias posteriores: divisão de bundle para reduzir o aviso de tamanho e avaliação dos avisos de effects herdados, com testes próprios e sem alterar autorização.
