# PLANO DE UNIFICAÇÃO CONSULTOQUE

Auditoria local em 25/10/2026. Plano aprovado pelo usuário para implementação exclusivamente local na branch dev/unificacao-coletivo. O conteúdo abaixo registra a auditoria original; o andamento, alterações e verificações da implementação constam em RELATORIO_IMPLEMENTACAO_LOCAL.md. Não há autorização de commit, push, merge ou publicação.

Convenções de evidência: **A** = `/Users/macbookpro/Developer/consultoque-vendas`; **B** = `/Users/macbookpro/Developer/cosultoque_empresas`. Caminhos relativos abaixo sempre indicam A ou B. Os apêndices incluem arquivos e linhas reais.

## 1. Resumo executivo

Unificar em A, repositório `Saintsolution/consultoque-site`, branch já existente `dev/unificacao-coletivo`, preservando a Home comercial e incorporando a Home de B em **/coletivo**. Essa rota prevalece sobre a proposta inicial /empresas. A apresentação já contém uma chamada coletiva em `A/src/components/CollectivePlansCall.tsx`; adaptar seu conteúdo para “ATENDEMOS EMPRESAS E PLANOS COLETIVOS”, texto da ordem de serviço e botão “SAIBA MAIS” apontando para /coletivo.

A implementação operacional de referência é B, mas isso NÃO torna todo código de A obsoleto: A ainda expõe formulários antigos, cadastro de colaborador e dois painéis administrativos por rotas próprias. A auditoria distingue “alcançável no código”, “sem rota/importação ativa” e “uso real em produção não comprovado”. O usuário confirmou nesta sessão que todas as vendas oficiais usam o Coletivo e que FormPessoal não é mais utilizado. A busca local confirmou que /formpessoal só é referenciado pelo próprio registro de rota/layout de B, sem links de entrada nos demais componentes. Sem logs de tráfego e execuções do backend, não é possível comprovar a disponibilidade dos endpoints nem excluir acesso por links externos antigos.

Nenhuma regra de login, senha, sessão, autorização, contratação ou comissão deve mudar. Não substituir por Supabase Auth. Não modificar B, main/developer, infraestrutura ou dados. Nesta etapa só este documento é criado; não há commit, push, merge ou deploy.

## 2. Arquitetura atual

A: React 18 + TypeScript + Vite 7 + Tailwind 3. `src/main.tsx` fornece BrowserRouter; `src/App.tsx` define rotas, captura indicação e redireciona acessos para B. Home monta HeaderVisual, Hero, Benefits, ClubBenefits, Problem, Telemedicine, PlanGrid, CollectivePlansCall, LegalCompliance, AffiliateCall e Footer. Há integrações diretamente em componentes e páginas, sem camada única de API.

B: React 18 + TypeScript + Vite 5 + Tailwind 3. BrowserRouter está dentro de `src/App.tsx`; main usa StrictMode. Layout distingue páginas com navegação própria e páginas comerciais com Header/Footer. Alias `@` existe em vite.config.ts e tsconfig.app.json. `src/lib` contém cpf, consultaCpf e pricing. Não há contextos de autenticação centralizados: páginas leem/gravam storage diretamente.

Estado local: A estava limpo e na branch de trabalho. B está em main e já tinha modificação não commitada em `src/pages/AssociadoDashboard.tsx`. Ela NÃO foi criada nem alterada pela auditoria. A versão analisada é a do workspace, não uma certificação do bundle publicado; confirmar versão canônica antes de copiar.

## 3. Inventário de rotas e conflitos

Inventário completo extraído dos dois App.tsx no apêndice A. Decisões propostas:

| Origem/rota | Situação atual | Destino proposto |
|---|---|---|
| A / | Home comercial | Preservar |
| B / | Home empresarial | /coletivo |
| A /form-coletivo | Ponte externa com query preservada | Alias local de /contratar |
| B /formcoletivo | FormColetivo operacional | Alias local de /contratar |
| A /form-individual, /form-familiar | Formulários próprios ainda acessíveis | Alias para FormColetivo, preservando seleção de plano sem envio automático |
| B /formpessoal | FormPessoal próprio, mesmo endpoint coletivo | Não migrar FormPessoal; manter /formpessoal como alias para FormColetivo |
| A /cliente | Redireciona a B /associado sem query | Alias local de /associado |
| B /associado, /associado/dashboard | Login e dashboard atuais | Preservar; /entrar e /dashboard apenas aliases opcionais |
| A/B /colaborador | A redireciona, B autentica | Usar login B |
| B /colaborador/dashboard | Dashboard com token | Preservar |
| A/B /admin | A EmpresaDashboard, B Admin | Consolidar a partir de B, comparar contratos antes |
| A /admin-asaas | AdminAsaas legado alcançável | Não promover nem apagar sem decisão; preservar compatibilidade sob análise específica |
| A /inscricao-colaborador | Cadastro legado ativo por URL | Migrar para cadastro B após equivalência aprovada |
| A /seja-afiliado | Apresentação com link ao cadastro B | Preservar conteúdo e encaminhar internamente |
| B /seja-colaborador e /seja-colaborador/:indicador | Cadastro atual | Preservar |
| B /criar-senha | Criação/recuperação com token na query | Preservar literalmente rota e token |
| B /completar-adesao | Complemento antes do pagamento | Preservar |
| A/B /material-promocional, /panfletos-promocionais, /montar-folder, /solicitar-impressos | Duas implementações com sessões diferentes | Usar B e validar assets/conteúdo de A |
| A/B /play/:video/:ref e /play/:video | Vídeos e atribuição comercial | Consolidar preservando referências e catálogo |
| A /play | Tela sem vídeo | Preservar resposta compatível |
| A /videoafiliados, /faq, /termos, /privacidade | Conteúdo comercial | Preservar |
| B /contratos/teste-2026-08-22-v1 | Contrato de teste roteado | Não confundir com contratação oficial; decisão explícita sobre exposição |
| A /* e B /*, /:indicador | Home fallback e resolução de referências | Priorizar rotas reais e reservar todos os novos nomes |

`/associado/inscricao` aparece na lista de layout exclusivo de B, mas não possui Route própria. Não tratá-la como funcionalidade implementada. Novas rotas /coletivo, /contratar, /empresas, /entrar, /dashboard e /associado devem entrar nas reservas do resolvedor A; caso contrário podem ser enviadas como apelido ao n8n. /empresas pode ser alias de /coletivo por compatibilidade, não segunda página.

## 4. Inventário de componentes

Apêndice B lista todos os arquivos de src de ambos os projetos e imports locais. Componentes comerciais A devem permanecer visualmente estáveis. `Specialties`, `Testimonials`, `CTA`, `Extra` não fazem parte da composição direta de Home; conferir o grafo antes de os considerar em uso. `Vendas.tsx`, `Vendas_asaas.tsx`, `ClienteDashboard.tsx` e `ColaboradorDashboard.tsx` de A não são os componentes montados nas rotas de App. Dashboards antigos não podem substituir os de B.

B Home utiliza `components/home/Hero`, Benefits, Pricing, VideoSection, SejaColaboradorCTA e LegalCompliance. `CTASection.tsx` existe, mas não é montado pela Home. Header e Footer vêm do Layout de App. Migrar essa composição como ColetivoPage com layout comercial próprio, sem montar outro BrowserRouter. Corrigir links /#beneficios, /#planos e /#institucional do Header B para /coletivo#... quando o alvo pertencer à apresentação coletiva.

Há colisões de nomes e arquivos públicos (Home, Hero, Benefits, LegalCompliance, Footer, banner_desk.png, banner_cel.png, logos e panfleto). Comparar conteúdo/hash e usar namespace para imagens diferentes; não sobrescrever por nome. Preservar TermoAdesaoAssociado de B, sua versão e aceite, comparando com A antes da troca. CortesiasAdmin possui endpoints distintos em A e B.

### Limpeza autorizada para a implementação futura

O usuário autorizou retirar código não utilizado. Essa autorização será aplicada à implementação local depois da aprovação do plano, sem alterações em B e sem operações Git/publicação.

| Código | Evidência e decisão |
|---|---|
| B/src/pages/FormPessoal.tsx | Descontinuado pelo usuário; só importado/roteado em B/App. Não copiar para A; alias /formpessoal → /contratar. Não transportar seu contrato histórico para as vendas novas. |
| A/src/pages/FormIndividual.tsx e FormFamiliar.tsx | Ainda roteados, mas substituídos comercialmente por FormColetivo conforme usuário. Remover implementações depois de trocar suas rotas por aliases que preservem intenção de plano e referência. |
| A/src/pages/ClienteDashboard.tsx e ColaboradorDashboard.tsx | Não importados no App nem por outros módulos encontrados. Remover versões antigas; manter dashboards B e aliases públicos. |
| A/src/pages/Vendas.tsx e Vendas_asaas.tsx | Sem importação/rota ativa encontrada; versão Asaas contém placeholders. Remover na limpeza. |
| A/src/components/SolicitacaoValidacaoCpf.tsx | Dependência dos formulários antigos; retirar se ficar sem consumidores após substituição, sem desligar webhook backend. |
| B/src/pages/AssociadoPage.tsx e AssociadoDashboard não são equivalentes | AssociadoPage não aparece no roteador atual; migrar somente a cadeia operacional montada por App e suas dependências. |
| A/src/pages/AdminAsaas.tsx e EmpresaDashboard.tsx | Estão roteados: não classificar automaticamente como não usados. Header/Footer A apontam ao Admin B. Consolidar Admin B e avaliar aliases/aposentadoria dos painéis A com cuidado. |
| A/src/pages/InscricaoColaborador.tsx | Roteado, mas apresentação SejaAfiliado encaminha ao cadastro B. Substituir pela cadeia atual B com alias, preservando cadastro/indicação/segurança. |
| Componentes comerciais sem consumidores | Remover apenas após confirmar grafo de imports; não excluir conteúdo exclusivo utilizado na Home, FAQ, vídeos ou materiais. |

Retirar código morto não autoriza desativar workflows: outras entradas externas podem continuar usando endpoints históricos. Remover handlers redundantes no projeto unificado e manter rotas públicas como aliases são ações diferentes.

## 5. Dependências e configuração técnica

Versões resolvidas dos lockfiles:

| Pacote | A | B |
|---|---|---|
| react/react-dom | 18.3.1 | 18.3.1 |
| react-router-dom | 7.17.0 | 7.18.1 |
| vite | 7.3.5 | 5.4.8 |
| typescript | 5.9.3 | 5.6.3 |
| tailwindcss | 3.4.19 | 3.4.17 |
| axios | 1.17.0 | 1.19.0 |
| @supabase/supabase-js | 2.108.1 | 2.57.4 |

Os manifests também declaram lucide-react e qrcode.react em ambos; o apêndice registra dependências completas. Não copiar package-lock de B sobre A. Manter toolchain de A inicialmente, reconciliar versões e validar imports antes de atualizar pacotes. A não possui alias @; adicionar equivalência na futura implementação. A exige noUnusedLocals/noUnusedParameters, B não; isso explica parte da diferença no typecheck.

Tailwind A tem extend vazio. B depende de cores ocean/mint/brand, fontes Sora/Plus Jakarta Sans, sombras, gradientes, animações e classes de `src/index.css`. Incorporar tokens, mas escopar estilos globais de body/headings ao layout coletivo para não mudar a identidade visual A. Garantir também CSS de Header e responsividade de navegação.

Verificações executadas sem correção: A `npm run typecheck` falhou com 9 diagnósticos de imports não usados; A lint: 44 erros e 7 avisos. B typecheck passou; B lint: 4 erros e 5 avisos. Exemplos: A AdminAsaas/Extra/FAQ/Termos/Privacidade/Vendas; B Building2, QrCode, escape de regex e função de transferência não usada. Build de produção e testes de navegador NÃO foram executados nesta auditoria; não há certificação de funcionamento completo.

## 6. Interligações e dados em navegação

A Hero, PlanGrid e CTA montam URL absoluta B /formcoletivo?ref=NNNN; `FormColetivo` A é apenas ponte que copia a query e injeta ref. CollectivePlansCall aponta à raiz B. App A redireciona /cliente e /colaborador com location.replace, sem preservar query/hash. HeaderVisual/Footer A apontam admin para B; /admin local A continua acessível. SejaAfiliado A encaminha ao cadastro de colaborador B com indicação. B contém retornos absolutos para o domínio principal.

A preserva `referenciador_id` em localStorage/cookie e `indicador_consultoque` compartilhado. B usa `indicador_colab` no localStorage e o cookie compartilhado. O cookie comercial tem 30 dias, Path=/, SameSite=Lax e, nos domínios ConsulToque, Domain=.consultoque.com.br e Secure. Não é token de autenticação.

Risco concreto: FormColetivo B não lê diretamente `?ref`; sua escolha usa cookie/localStorage/default 0001. Logo o parâmetro transportado por A não garante sozinho a indicação numa origem de preview ou com cookie ausente. O resolvedor A roda em efeito inicial, mas links comerciais são calculados durante render sem assinatura reativa do storage; uma resolução assíncrona pode deixar o link com código anterior até novo render. Não declarar esse fluxo garantido sem testes.

Parâmetros e leituras reais constam do apêndice E. Incluem token de senha, ref, indicador no path, video/ref no Play e parâmetros de modelos de panfleto. Preservar query, hash, parâmetros e histórico nos aliases; usar navegação interna para páginas e replace somente em aliases/limpeza de referência conforme comportamento original.

Formulários guardam quase todos os campos em estado React: mudar página/recarregar pode perder dados. A transferência FormPessoal → FormColetivo usa `consultoque_transferencia_coletivo` com validade de 30 minutos, mas a função produtora é indicada como não usada pelo lint. Não afirmar que o botão atual transfere os dados. Planejar bloqueio de saída com dados não enviados e teste de transferência, sem persistir PII adicional por conveniência sem análise.

## 7. Mapa dos payloads e contratos

O apêndice C é um mapa textual exato das construções JSON e chamadas Axios, incluindo campos condicionais e linhas de origem; não contém dados reais de clientes. Todos os envios identificados são POST. Não há camada de serviço separada hoje, exceto consultaCpf de B. O caminho atual é componente/página → fetch ou axios → webhook. Extrair para serviço deve preservar bytes semânticos, campos vazios, omitidos, datas, códigos, finalidade e origem.

**Contratação canônica B/FormColetivo:** `origem=site_consultoque_empresas`, enviado_em, cod_colab; nome_assoc/cpf_assoc/nasc_assoc/email_assoc/tel_assoc; empresa/cnpj/tipo_doc_cobranca; assoc_cpf_validado/assoc_maior_idade/assoc_consulta_id; qtd_individual/qtd_familiar/vl_individual/vl_familiar/vl_total; desconto_coletivo/economia_mensal; termos_aceitos/termos_aceitos_em/versao_termo; titulares[] com cpf_titular/nome_titular/nasc_titular/email_titular/tel_titular/cod_plano. Planos 2878 individual e 2880 familiar; nascimento DD/MM/AAAA; documentos/telefones numéricos; nome normalizado em maiúsculas sem acentos; email minúsculo. PF envia empresa/cnpj vazios; PJ envia CNPJ validado e tipo_doc_cobranca=CNPJ. Retorno exige HTTP ok e url_pagamento HTTP(S); consome status/message/dt_vencimento/dia_vencimento/email. Falha permanece na tela com erro e encerra submitting.

**FormPessoal B (descontinuado pelo usuário):** mesmo endpoint, porém origem=site_consultoque_pessoal, empresa/cnpj vazios e sem tipo_doc_cobranca. Registrar como contrato histórico, sem migrar seu builder nem manter vendas nessa origem. /formpessoal deve encaminhar ao FormColetivo oficial. Não modificar o arquivo original em B. A mudança proposta é aposentar essa entrada de contratação descontinuada, mantendo intacto o contrato oficial de FormColetivo.

**Regras do formulário B:** ao menos um titular, CPF matematicamente válido e validado pelo serviço, retorno deve corresponder ao documento enviado, responsável maior de idade, email e telefone do responsável, rejeição de CPFs repetidos entre titulares, aceite obrigatório e bloqueio durante envio. Titular permite contato opcional conforme validação existente; não tornar obrigatório na extração. Preço 33/66 ou 30/60 a partir de 10 titulares, somando ambos os planos (`B/src/lib/pricing.ts`). Não confundir quantidade de titulares/adesões com dependentes de um plano familiar. O cadastro do responsável é separado do titular.

**Formulários legados A:** individual-pessoal e familiar-pessoal usam origem=site_consultoque, origem_form, códigos p1380/p1382 e tipo_plano 1380/1382, assoc_* (ordem inversa do nome de campos B), tit_ind/tit_fam/tit_total, vl_ind/vl_fam/vl_total, status_venda=pendente, titulares e versao_termos. Retorno aceita aliases invoiceUrl/dueDate. Esses contratos NÃO são intercambiáveis com B por simples renomeação de endpoint.

Campos obrigatórios aqui significam os exigidos pelo código local; exigências adicionais do servidor não estão comprovadas. Tipos de resposta são expectativas do frontend, não contrato formal validado do workflow.

## 8. Endpoints n8n: origem → contrato → resposta → ação

Base comum `https://n8n.saintsolution.com.br/webhook/`. Inventário literal completo com arquivos/linhas no apêndice D.

| Endpoint | Origem e envio | Resposta/comportamento esperado |
|---|---|---|
| resolver-referencia-publica | App A/B; {referencia} | encontrado/cod_colab; salva código ou mantém anterior |
| coletivo-empresarial | FormColetivo/FormPessoal B; contrato da seção 7 | url_pagamento; exibe boleto |
| validar-cpf-cadastro | FormColetivo/FormPessoal/SejaColaborador e lib/consultaCpf B; cpf, origem ASSOCIADO/TITULAR/COLABORADOR | sucesso/cpf_validado/maior_idade/consulta_id/nome/nascimento; preenche e bloqueia inconsistências |
| validar-cnpj-cadastro | FormColetivo B; cnpj/origem | sucesso/cnpj_validado/razao_social e dados da empresa; valida cobrança PJ |
| consultar-adesao-pendente | CompletarAdesao B; cpf_assoc | sucesso, contrato.num_contrato, token_complemento e titulares; habilita complemento |
| complementar-adesao-pendente | CompletarAdesao B; token_complemento,num_contrato,cpf_assoc,titulares_adicionados[] incluindo consulta_id | sucesso/mensagem/url_pagamento; mostra atualização |
| associado-login | Associado B; cpf_assoc,senha | autenticação, token_sessao/token_expira ou precisa_criar_senha/codigo; salva sessão ou informa email |
| associado-recuperar-senha | Associado B; cpf_assoc | sucesso/requisicao_valida/mensagem; informa envio de link |
| criar-senha | CriarSenha B; finalidade DEFINIR_SENHA,token,senha,enviado_em | sucesso/mensagem/tipo_usuario/destino; limpa senha e oferece login |
| associado-dashboard | AssociadoDashboard B; cpf_assoc,token_sessao + X-Associado-Token | contrato, associado, titulares, financeiro; HTTP 401/403 limpa sessão |
| associado-editar-dados | Mesmo; alvo_edicao,cpf_titular condicional,email,telefone + token no header | sucesso/mensagem; recarrega painel; tolera JSON ausente conforme código |
| associado-incluir-titular | Mesmo; nome/cpf/nasc/email/tel_titular,cod_plano + header | sucesso/mensagem/dados de inclusão e cobrança; não ativar pelo frontend |
| associado-excluir-titular | Mesmo; cpf_titular + header | sucesso/mensagem; recarrega painel |
| colaborador-cadastro | SejaColaborador B; cadastro, cod_pai, apelido, senha, aceite e consulta CPF (apêndice C) | sucesso/status/cod_colab; mostra confirmação |
| valida-apelido-colaborador | Cadastro B: apelido_referencia; dashboard B: apelido_referencia,referencia,cod_colab | disponibilidade; parsers diferentes devem ser preservados |
| colaborador-login | Colaborador B; origem,finalidade LOGIN_COLABORADOR,tipo_usuario,cpf_colab,senha,enviado_em | status,token,colaborador e informações; grava sessão |
| colaborador-recuperar-senha | Mesmo; finalidade REDEFINIR_SENHA,tipo_usuario,cpf_colab,origem,enviado_em | mensagem/status; informa recuperação |
| colaborador-dashboard | Dashboard B; cod_colab + X-Colaborador-Token | dados do colaborador, indicadores e financeiro; parser texto/JSON/array |
| colaborador-atualiza-dados | Mesmo; cod_colab,email_colab,tel_colab,pix_colab,apelido opcional,senha_atual,nova_senha + token | status/mensagem/colaborador; atualiza sessão |
| admin-login | EmpresaDashboard A / Admin B; cod_admin,senha_admin | autorizado,token_sessao,expira_sessao,admin |
| admin-dashboard | Mesmo; {} + X-Admin-Token | status=sucesso; 401/autorizado=false encerra sessão |
| admin-cortesias | CortesiasAdmin A; cadastro/status + X-Admin-Token | rota/mensagem/autorizado; atualiza painel |
| emp-admin-cortesias | CortesiasAdmin B; mesmo grupo funcional + header | distinto do endpoint A; não trocar silenciosamente |
| pedido-impressos | SolicitarImpressos A/B; cadastro/endereço/modelo/quantidade=100/arte_base64 | objeto ou array; duplicado/ja_solicitado; timeout 60s |
| individual-pessoal / familiar-pessoal | FormIndividual/FormFamiliar A | pagamento com aliases; legados ainda roteados |
| BuscaCPF | FormIndividual/FormFamiliar A; cpf e campos do apêndice | JSON de consulta; valida/preenche e permite fluxo manual previsto |
| solicitar-validacao-cpf | SolicitacaoValidacaoCpf A; origem,tipo_solicitacao,origem_form,cod_pai,cpf,contatos,motivo,mensagens,enviado_em | status/mensagem; confirma solicitação manual |
| BuscaCPFcolab / insertcolab | InscricaoColaborador A; CPF / cadastro com senha_login e aceite | objeto/array; status erro bloqueia; limpa sessão anterior após cadastro |
| aa35fc51-82dc-468c-8334-b8d0b6c73bf3 | AdminAsaas A; nome,cpf,email,whatsapp,pix,tipo,idPai,id_pai | apenas HTTP ok; alerta de cadastro |
| login-cliente / edita-associado | ClienteDashboard A sem rota; assoc_cpf/assoc_nasc e alteração num_contrato/assoc_* | lista de contratos e edição local; não migrar como autenticação atual |
| login_dash_colab / get-dados-colaborador / edita-colab | ColaboradorDashboard A sem rota; credenciais antigas / código / dados | status/dados; storage legado não é sessão atual |

Não foi chamado nenhum webhook: até consultas podem disparar email, validações cobradas ou side effects. Não se certificou CORS, permissões dos workflows, expiração backend, idempotência, hashing ou presença real desses endpoints. Variáveis VITE podem substituir defaults em B, portanto a URL no código pode não ser a URL efetiva do deploy.

## 9. Asaas e outras integrações

Os componentes operacionais enviam ao n8n e exibem links de pagamento retornados; não há cliente Asaas direto nesses fluxos. `A/src/pages/Vendas_asaas.tsx` contém links `www.asaas.com/c/seu_link...` e `seu-n8n.com/...`, placeholders em arquivo sem rota ativa. Não usar como integração válida.

`B/docs/04-regras-de-negocio.md` e ADR-002 descrevem cobrança inicial simples, assinatura após primeiro pagamento, ativação, pró-rata, comissão e eventos de inadimplência. São documentação de intenção/estado relatado; workflows e conta Asaas não foram inspecionados. Nenhuma mudança nesses sistemas está autorizada nesta fase. A validade dos links de boleto, vencimentos, assinatura, externalReference, COLETIVO...ALT... e ativação depende de homologação externa autorizada.

Wistia executa embeds/scripts nos vídeos; materiais usam pastas/arquivos Drive; há links WhatsApp, redes sociais, telemedicina e clube de benefícios. Preservar serviços externos legítimos: só links entre A e B devem se tornar internos. Disponibilidade/conteúdo desses serviços não foi testada.

## 10. Autenticação e dashboards

B é referência para login associado, colaborador e senha. Associado usa sessionStorage `associado_sessao` e `associado_token_sessao`; token também enviado no corpo da consulta do dashboard e header X-Associado-Token. Preservar token_expira e verificação existente; inclusão/exclusão têm limpeza em HTTP 401/403. Não uniformizar à força o parser ou tratamento de erros entre operações.

Colaborador grava `colaborador`, `colaborador_dados`, `colaborador_token` em sessionStorage. Dashboard usa X-Colaborador-Token; materiais B leem sessão atual, enquanto A depende de cod_colab/nome_colab no localStorage. Não fabricar sessão/token a partir desses códigos. B Admin e A EmpresaDashboard usam `consultoque_admin_token`, `consultoque_admin_expira`, `consultoque_admin_dados`; header X-Admin-Token e validação local da data além da resposta backend.

CriarSenha B recebe ?token, rejeita token com menos de 20 caracteres, exige senha de pelo menos 8 caracteres com maiúscula, minúscula, número e especial, além de confirmação. Envia a senha ao backend HTTPS já existente, que deve validar token e armazenar hash; isso último não é verificável só pelo comentário do cadastro. Preservar também regras próprias de cadastro e alteração de senha sem substituir por uma política nova.

**Continuidade de acesso:** localStorage/sessionStorage são isolados por origem; sessões de coletivo.consultoque.com.br não aparecem em consultoque.com.br. Manter as credenciais e backend preserva contas existentes, mas pode exigir novo login ao entrar no domínio principal. Não copiar token pela URL, cookie compartilhado ou código de colaborador. Manter subdomínio funcionando durante transição. Explicar novo login na homologação; sessão transparente entre origens exigiria mecanismo backend e autorização própria, fora deste escopo.

AdminAsaas A está roteado sem gate de token visível no componente, diferente do Admin atual. Registrar revisão de exposição sem alterar regras de segurança automaticamente. Dashboards legados sem rota não são prova de backend desativado. Pendências de `B/docs/07-pendencias.md` sobre autenticação administrativa parecem anteriores ao código atual com token; usar código como evidência local e confirmar backend, não repetir documentação antiga como fato atual.

## 11. Colaboradores e comissões

A aceita ?ref e path simples não reservado; códigos de 1–4 dígitos são preenchidos à esquerda para quatro; apelidos normalizados são resolvidos via n8n. B aceita /:indicador e /seja-colaborador/:indicador; Play também armazena referência. Resolução inválida/falha mantém atribuição anterior. Código padrão 0001 quando ausente. Diferenciar `cod_pai` no cadastro de colaborador de `cod_colab` na venda.

Materiais B geram links principais, QR e vídeos no domínio consultoque.com.br, usando informações do colaborador da sessão; preservar apelido e código, além de dados de arte entre montagem e pedido. A gera links usando localStorage antigo; escolher a versão B evita depender de login antigo. O endpoint pedido-impressos continua existindo nas duas aplicações: não é material estático apenas.

A frontend não calcula/liquida as comissões operacionais. Documentação B descreve primeira adesão 50%, recorrência 20%, nível pai 10% e alteração 50% sobre valor líquido. Confirmar no backend, sem modificar percentuais nem contratos. Testar código correto no payload e a associação contrato/colaborador; indicação no link sozinha não prova comissão gerada.

## 12. Arquitetura unificada proposta

Um BrowserRouter em A/main, um mapa de rotas com aliases explícitos, Home comercial A, ColetivoPage com apresentação B, FormColetivo B como única implementação de contratação, páginas operacionais B e conteúdo comercial A. Não copiar App.tsx B inteiro, não aninhar routers, não fundir logins antigos com atuais.

Captura de indicação única e reativa antes de liberar CTA dependente da resolução; compatibilidade de chaves antigas com precedência explícita de nova referência válida → cookie compartilhado → storage normalizado → padrão. Essa precedência é proposta de consolidação e precisa de testes de regressão dos comportamentos atuais; não é autorização para mudar comissões. Manter credenciais/tokens separados da indicação pública.

## 13. Diretórios propostos

```text
src/
  app/                  # rotas, layouts, aliases
  pages/                # Home, ColetivoPage, páginas legais
  features/
    contratacao/        # FormColetivo, builders, tipos e validações atuais
    associado/          # login e dashboard B
    colaborador/        # cadastro, login, dashboard e indicação
    admin/              # Admin e Cortesias com contratos explícitos
    materiais/          # materiais, folder, impressão e Play
    senha/              # CriarSenha existente
  components/           # componentes realmente compartilháveis
  services/
    endpoints.ts        # defaults e env atuais, sem segredos
    contratacao.ts
    associado.ts
    colaborador.ts
    admin.ts
    impressos.ts
    referencia.ts
  lib/                  # cpf, pricing e utilitários puros
  styles/               # escopo comercial e coletivo
public/coletivo/         # apenas assets distintos após comparação
```

Estrutura proposta, não criada. Não mover tudo antes de provar equivalência; migração incremental reduz impacto.

## 14. Migração dos componentes

Primeiro registrar baselines visuais e contratos. Trazer tokens Tailwind/alias/assets necessários para A, em caminhos sem colisão. Incorporar apresentação B em /coletivo e manter navegação principal A. Migrar operação B com mínimas adaptações de imports/layout/links, respeitando a alteração local preexistente. Incorporar login/senha/dashboards como conjunto coerente. Depois migrar materiais B e conservar conteúdos exclusivos A.

Somente então converter rotas antigas de contratação para aliases do FormColetivo. Conforme a confirmação do usuário, não migrar FormPessoal nem seus builders. Remover em A os formulários individuais/familiares substituídos e os dashboards antigos sem rota, depois de eliminar imports e preservar aliases públicos. Nenhum webhook será desativado ou alterado por essa limpeza. Guardar histórico no Git apenas quando houver autorização de commit.

## 15. Centralização dos serviços

Extrair builders puros e tipos de request/response a partir dos objetos atuais, sem inventar um DTO universal. Preservar null, strings vazias, undefined omitido, formato de datas, nomes e códigos de planos. Validações CPF/CNPJ, adulto, duplicidade, aceite, preços e regras do dashboard migram sem relaxamento. Serviço por domínio funcional mantém os headers e parsers atuais: objeto/array/envelope json/texto/JSON opcional não são equivalentes.

Não adicionar retries automáticos a contratação, inclusão, exclusão ou impressão: pode duplicar operações sem idempotência comprovada. Não transformar resposta HTTP 200 em sucesso universal. Não logar senhas, tokens ou payloads pessoais para comparar contratos. Usar fixtures sintéticas e fetch mockado.

Variáveis VITE são públicas no bundle. Não colocar chaves Asaas/n8n privilegiadas nelas. Supabase já consta como dependência em ambos, mas não foi encontrado createClient/uso de persistência Supabase em src. A preparação futura é uma interface de serviços; não adicionar tabelas, Auth, cliente ou migração. Persistência/backend continuam onde estão.

## 16. Plano de homologação

Fase local com rede de produção bloqueada e respostas simuladas. Dados sintéticos, sem envio aos workflows reais. Comparar payloads antes/depois por contrato, incluindo opcionais omitidos e headers. Nenhum teste financeiro real nesta auditoria.

| Grupo | Casos e aceite |
|---|---|
| Comercial | Home A preservada; chamada exata; /coletivo direto e mobile; âncoras e retorno à Home |
| Rotas | Deep link + refresh de todas as rotas; aliases preservam query/hash; desconhecida não vira indicação indevida |
| Indicação | Código curto/4 dígitos, apelido válido/inválido, resolvedor lento/offline, ref direta, cookie/storage conflitantes, passagem por vídeos e materiais; código final correto |
| Contratação | Individual/familiar/misto; 1,9,10,11 titulares; PF/PJ; adulto/menor; CPF inválido/duplicado/retorno divergente; CNPJ; aceite; duplo clique; erro/rede/JSON inválido |
| Compatibilidade | /formpessoal e formulários antigos abrem FormColetivo; novos envios usam exclusivamente seu contrato oficial; IDs 2878/2880 sem confusão com legados 1380/1382 |
| Senha/login | Primeiro acesso, recuperação, token ausente/curto/expirado/usado; mesma política de senha; credencial inválida; logout/expiração/reabertura; separação de papéis |
| Dashboards | Acesso direto sem sessão; 401/403; payload/header correto por papel; edição; inclusão/exclusão permitida/bloqueada conforme contrato; retorno de erro |
| Materiais | Sessão B reconhecida, QR/link com apelido/código, modelo/query, arte entre telas, pedido duplicado, timeout, conteúdo Drive/Wistia |
| Visual | 360/390/768/1280 px; menus, modais, termos, tabela de titulares, formulário e boleto legíveis sem overflow |

Depois, somente com autorização e ambiente externo apropriado, validar CORS real para origem principal/preview, emails de senha e destinos, cobrança inicial, pagamento, assinatura, recorrência, inclusão pró-rata paga/não paga, exclusão, inadimplência e comissão. Usar sandbox/workflow de homologação fornecido, sem substituir endpoints de produção nesta fase. Critério: nenhum contrato divergente, nenhuma regressão de autorização, build/typecheck/lint aprovados ou pendências aceitas explicitamente, evidências de cenários e plano de rollback ensaiado.

## 17. Publicação única Netlify

Configuração local: ambos têm `public/_redirects` com fallback `/* /index.html 200`; não há netlify.toml encontrado nem funções serverless no código inventariado. A tem `.netlify/state.json`, vínculo local não é comprovação da configuração remota. Não há arquivos .env* nas raízes. Variáveis consumidas estão no apêndice E; valores reais de deploy não foram obtidos.

Proposta futura: manter Netlify principal ligado ao repositório definitivo; comando npm run build, publish dist, versão Node compatível com Vite do lockfile e build validado. Consolidar um único fallback SPA após aliases; manter todos os tokens de query em links antigos. Configurar ambientes de preview sem side effects em produção antes de disponibilizar testes funcionais. Revisar canonical/OG de index.html: rota coletiva numa SPA pode precisar de estratégia específica para preview social, sem prometer metadados por rota hoje.

Antes do corte obter configuração remota de build/env/headers/redirects e lista de origens permitidas do n8n. Headers X-Associado-Token, X-Colaborador-Token, X-Admin-Token exigem preflight permitido; não remover headers para contornar CORS. Confirmar URLs de email de senha, boleto e retorno configuradas no backend. Redirecionamento antigo depende da rota: raiz do subdomínio → /coletivo, formulário/dashboard/senha → rotas equivalentes preservando query. Não redirecionar tudo à Home. Manter subdomínio operacional nesta preparação; qualquer alteração futura nele é etapa autorizada separadamente.

## 18. Rollback

Antes do deploy autorizado, registrar deploy Netlify atual do domínio principal, configuração de build/env e commit aprovado; manter deploy anterior e B disponíveis. Não mudar schema/workflows/Asaas junto com frontend. Se houver falha de acesso, cobrança, indicação ou navegação: interromper novas divulgações e restaurar deploy anterior do Netlify principal; preservar B como operação alternativa. Se redirects tiverem sido alterados em etapa posterior, restaurá-los também, evitando loops/cache permanente.

Rollback de frontend não desfaz cobranças/cadastros criados. Conciliar qualquer evento já enviado com responsáveis operacionais, sem excluir/reexecutar dados automaticamente. Conferir login, links existentes e indicação após restauração. Sem desativar subdomínio nem usar 301 permanente antes da validação da transição.

## 19. Riscos, limitações e pendências

- P0: fluxos reais n8n/Asaas, CORS, validação de token e versão publicada não comprovados pelo workspace. Confirmar com responsáveis e evidência de homologação; não chamar webhook para “ver se existe”.
- P0: B/AssociadoDashboard possui alteração local; confirmar inclusão dessa versão na migração, sem revertê-la ou sobrescrevê-la.
- P0: preservar exatamente autenticação/senhas e não expor dashboard legado como substituto.
- P1: A mantém formulários legados roteados, IDs antigos e AdminAsaas sem gate visível. Uso real exige logs; não eliminar webhooks por inferência.
- P1: indicação pode depender de cookie entre domínios; ref isolada e resolvedor assíncrono não garantem atribuição hoje.
- P1: mudança de origem exige novo login; não transportar sessão inseguramente para simular continuidade.
- P1: lint/typecheck existentes impedem afirmar baseline integralmente verde.
- P1: diferenças históricas em origem, tipo_doc_cobranca, códigos e campos dos legados devem permanecer documentadas; os aliases de vendas passam ao contrato oficial de FormColetivo conforme confirmado pelo usuário.
- P1: estilos globais, imagens com mesmo nome, namespaces e dois routers podem quebrar UI se copiados literalmente.
- P1: links de emails e materiais já distribuídos precisam de aliases; arquivos/QR impressos não são atualizados pelo deploy.
- P2: documentação B sobre pendências está parcialmente desatualizada em relação aos componentes; não confundir intenção documentada com execução backend.
- Acessos não usados nesta auditoria: painel Netlify, logs de tráfego, GitHub remoto, workflows n8n, Asaas, base operacional, pastas Drive e conteúdo de emails. Não há necessidade de pesquisa web para descrever o código local; configurações externas continuam pendentes.

## 20. Ordem recomendada de implementação

1. Aprovar este plano e confirmar versão local de B/AssociadoDashboard e tratamento do admin legado; FormPessoal já foi confirmado como descontinuado.
2. Registrar baseline de telas/contratos com dados sintéticos, corrigir pendências relevantes somente em A na branch de trabalho.
3. Preparar alias, tokens CSS escopados e assets sem colisão; manter toolchain A.
4. Migrar serviços/builders e operação B preservando regras; validar contratos e autenticação com mocks.
5. Incorporar /coletivo, chamada comercial e navegação; manter Home A.
6. Consolidar FormColetivo e aliases, com atribuição reativa testada; aposentar implementações de vendas legadas sem migrar FormPessoal.
7. Migrar materiais/Play/pedidos usando sessão B; validar QR, modelos e links públicos.
8. Homologar localmente build/typecheck/lint e matriz funcional, depois integrações externas em ambiente autorizado.
9. Preparar configuração concreta e reversível de publicação/redirects, obter autorização de publicação e executar corte em etapa própria.
10. Acompanhar acesso, contratações e indicação; manter rollback e subdomínio enquanto necessário. Só aposentar legados com evidência de ausência de uso e autorização.

A aprovação solicitada é exclusivamente para a futura implementação local na branch dev/unificacao-coletivo. Não inclui commit, push, merge, deploy, mudança em B ou mudança de regras de segurança.

## Apêndice A — Rotas literais

**A/src/App.tsx**

- Linha 436: `/`
- Linha 441: `/form-individual`
- Linha 448: `/form-familiar`
- Linha 455: `/form-coletivo`
- Linha 466: `/cliente`
- Linha 482: `/colaborador`
- Linha 494: `/material-promocional`
- Linha 501: `/panfletos-promocionais`
- Linha 508: `/montar-folder`
- Linha 515: `/solicitar-impressos`
- Linha 526: `/admin`
- Linha 537: `/admin-asaas`
- Linha 544: `/seja-afiliado`
- Linha 551: `/inscricao-colaborador`
- Linha 564: `/play/:video/:ref`
- Linha 578: `/play/:video`
- Linha 590: `/play`
- Linha 597: `/videoafiliados`
- Linha 604: `/faq`
- Linha 611: `/termos`
- Linha 618: `/privacidade`
- Linha 630: `*`

**B/src/App.tsx**

- Linha 411: `/`
- Linha 417: `/formcoletivo`
- Linha 425: `/completar-adesao`
- Linha 431: `/formpessoal`
- Linha 439: `/contratos/teste-2026-08-22-v1`
- Linha 447: `/admin`
- Linha 453: `/associado`
- Linha 459: `/associado/dashboard`
- Linha 467: `/seja-colaborador`
- Linha 475: `/seja-colaborador/:indicador`
- Linha 483: `/colaborador`
- Linha 491: `/colaborador/dashboard`
- Linha 499: `/material-promocional`
- Linha 507: `/panfletos-promocionais`
- Linha 515: `/montar-folder`
- Linha 523: `/solicitar-impressos`
- Linha 531: `/play/:video/:ref`
- Linha 537: `/play/:video`
- Linha 543: `/criar-senha`
- Linha 551: `/:indicador`
- Linha 559: `*`

## Apêndice B — Inventário de src e dependências locais

### Projeto A

| Arquivo | Imports locais |
|---|---|
| src/App.tsx | `./components/ScrollToTop`, `./pages/Home`, `./pages/FormIndividual`, `./pages/FormFamiliar`, `./pages/FormColetivo`, `./pages/SejaAfiliado`, `./pages/InscricaoColaborador`, `./pages/AdminAsaas`, `./pages/MaterialPromocional`, `./pages/PanfletosPromocionais`, `./pages/MontarFolder`, `./pages/SolicitarImpressos`, `./pages/EmpresaDashboard`, `./pages/Play`, `./pages/VideoAfiliados`, `./pages/FAQ`, `./pages/Termos`, `./pages/Privacidade` |
| src/components/AffiliateCall.tsx |  |
| src/components/Benefits.tsx |  |
| src/components/CTA.tsx |  |
| src/components/ClubBenefits.tsx |  |
| src/components/CollectivePlansCall.tsx |  |
| src/components/CortesiasAdmin.tsx |  |
| src/components/Extra.tsx |  |
| src/components/Footer.tsx |  |
| src/components/HeaderVisual.tsx |  |
| src/components/Hero.tsx |  |
| src/components/LegalCompliance.tsx |  |
| src/components/PlanGrid.tsx |  |
| src/components/Problem.tsx |  |
| src/components/ScrollToTop.tsx |  |
| src/components/SolicitacaoValidacaoCpf.tsx |  |
| src/components/Specialties.tsx |  |
| src/components/Telemedicine.tsx |  |
| src/components/TermoAdesaoAssociado.tsx |  |
| src/components/Testimonials.tsx |  |
| src/index.css |  |
| src/main.tsx | `./App` |
| src/pages/AdminAsaas.tsx |  |
| src/pages/ClienteDashboard.tsx |  |
| src/pages/ColaboradorDashboard.tsx |  |
| src/pages/EmpresaDashboard.tsx | `../components/CortesiasAdmin` |
| src/pages/FAQ.tsx | `../components/HeaderVisual`, `../components/Footer` |
| src/pages/FormColetivo.tsx |  |
| src/pages/FormFamiliar.tsx | `../components/TermoAdesaoAssociado`, `../components/SolicitacaoValidacaoCpf` |
| src/pages/FormIndividual.tsx | `../components/TermoAdesaoAssociado`, `../components/SolicitacaoValidacaoCpf` |
| src/pages/Home.tsx | `../components/HeaderVisual`, `../components/CollectivePlansCall`, `../components/Hero`, `../components/Problem`, `../components/Telemedicine`, `../components/PlanGrid`, `../components/Benefits`, `../components/ClubBenefits`, `../components/LegalCompliance`, `../components/AffiliateCall`, `../components/Footer` |
| src/pages/InscricaoColaborador.tsx | `../components/SolicitacaoValidacaoCpf` |
| src/pages/MaterialPromocional.tsx |  |
| src/pages/MontarFolder.tsx |  |
| src/pages/PanfletosPromocionais.tsx |  |
| src/pages/Play.tsx |  |
| src/pages/Privacidade.tsx | `../components/HeaderVisual`, `../components/Footer` |
| src/pages/SejaAfiliado.tsx |  |
| src/pages/SolicitarImpressos.tsx |  |
| src/pages/Termos.tsx | `../components/HeaderVisual`, `../components/Footer` |
| src/pages/Vendas.tsx | `../components/HeaderVisual`, `../components/Hero`, `../components/Benefits`, `../components/Extra`, `../components/CTA` |
| src/pages/Vendas_asaas.tsx |  |
| src/pages/VideoAfiliados.tsx |  |
| src/vite-env.d.ts |  |

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.57.4",
    "axios": "^1.17.0",
    "lucide-react": "^0.344.0",
    "qrcode.react": "^4.2.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^7.17.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.9.1",
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.18",
    "eslint": "^9.9.1",
    "eslint-plugin-react-hooks": "^5.1.0-rc.0",
    "eslint-plugin-react-refresh": "^0.4.11",
    "globals": "^15.9.0",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.5.3",
    "typescript-eslint": "^8.3.0",
    "vite": "^7.3.1"
  }
}
```

### Projeto B

| Arquivo | Imports locais |
|---|---|
| src/App.tsx | `@/components/Header`, `@/components/Footer`, `@/pages/Home`, `@/pages/FormColetivo`, `@/pages/FormPessoal`, `@/pages/ContratoTeste`, `@/pages/Admin`, `@/pages/Associado`, `@/pages/AssociadoDashboard`, `@/pages/Colaborador`, `@/pages/ColaboradorDashboard`, `@/pages/SejaColaborador`, `@/pages/CriarSenha`, `@/pages/MaterialPromocional`, `@/pages/PanfletosPromocionais`, `@/pages/MontarFolder`, `@/pages/SolicitarImpressos`, `@/pages/CompletarAdesao`, `@/pages/Play` |
| src/components/CortesiasAdmin.tsx |  |
| src/components/Footer.tsx |  |
| src/components/Header.tsx |  |
| src/components/TermoAdesaoAssociado.tsx |  |
| src/components/home/Benefits.tsx |  |
| src/components/home/CTASection.tsx |  |
| src/components/home/Hero.tsx |  |
| src/components/home/LegalCompliance.tsx |  |
| src/components/home/Pricing.tsx |  |
| src/components/home/SejaColaboradorCTA.tsx |  |
| src/components/home/VideoSection.tsx |  |
| src/index.css |  |
| src/lib/consultaCpf.ts | `./cpf` |
| src/lib/cpf.ts |  |
| src/lib/pricing.ts |  |
| src/main.tsx | `./App.tsx` |
| src/pages/Admin.tsx | `../components/CortesiasAdmin` |
| src/pages/Associado.tsx |  |
| src/pages/AssociadoDashboard.tsx | `@/lib/cpf`, `@/lib/consultaCpf` |
| src/pages/AssociadoPage.tsx |  |
| src/pages/Colaborador.tsx |  |
| src/pages/ColaboradorDashboard.tsx |  |
| src/pages/CompletarAdesao.tsx | `@/lib/pricing`, `@/lib/cpf`, `@/lib/consultaCpf` |
| src/pages/ContratoTeste.tsx | `@/components/TermoAdesaoAssociado` |
| src/pages/CriarSenha.tsx |  |
| src/pages/FormColetivo.tsx | `@/components/TermoAdesaoAssociado`, `@/lib/pricing`, `@/lib/cpf` |
| src/pages/FormPessoal.tsx | `@/components/TermoAdesaoAssociado`, `@/lib/pricing`, `@/lib/cpf` |
| src/pages/Home.tsx | `@/components/home/Hero`, `@/components/home/Benefits`, `@/components/home/Pricing`, `@/components/home/VideoSection`, `@/components/home/SejaColaboradorCTA`, `@/components/home/LegalCompliance` |
| src/pages/MaterialPromocional.tsx |  |
| src/pages/MontarFolder.tsx |  |
| src/pages/PanfletosPromocionais.tsx |  |
| src/pages/Play.tsx |  |
| src/pages/SejaColaborador.tsx | `@/lib/cpf` |
| src/pages/SolicitarImpressos.tsx |  |
| src/vite-env.d.ts |  |

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.57.4",
    "axios": "^1.19.0",
    "lucide-react": "^0.344.0",
    "qrcode.react": "^4.2.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^7.18.1"
  },
  "devDependencies": {
    "@eslint/js": "^9.9.1",
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.18",
    "eslint": "^9.9.1",
    "eslint-plugin-react-hooks": "^5.1.0-rc.0",
    "eslint-plugin-react-refresh": "^0.4.11",
    "globals": "^15.9.0",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.5.3",
    "typescript-eslint": "^8.3.0",
    "vite": "^5.4.2"
  }
}
```

## Apêndice C — Construções e envios de payloads (evidência literal)

Os trechos abaixo são código estático, não requisições executadas. Campos de senha são nomes de variáveis, não credenciais. Incluem componentes sem rota para distinguir legado de operação canônica.

### A/src/App.tsx

Linhas 250–256:

```tsx
            'application/json',
        },
        body: JSON.stringify({
          referencia,
        }),
      }
    );
```

### A/src/components/CortesiasAdmin.tsx

Linhas 178–182:

```tsx
        "X-Admin-Token": token,
      },
      body: JSON.stringify(payload),
    });

```

### A/src/components/SolicitacaoValidacaoCpf.tsx

Linhas 139–171:

```tsx
    : '0001';

const payload = {
  origem: 'site_consultoque',
  tipo_solicitacao: 'validacao_manual_cpf',
  origem_form: origemFormulario,
  cod_pai: codPai,

  cpf: cpfLimpo,

  nome_responsavel:
    nomeResponsavel.trim(),

  email_responsavel:
    emailResponsavel.trim().toLowerCase(),

  telefone_responsavel:
    telefoneLimpo,

  motivo:
    motivo || 'cpf_nao_localizado',

  mensagem_api:
    mensagemApi.trim(),

  mensagem_usuario:
    mensagem.trim(),

  enviado_em:
    new Date().toISOString(),
};
    try {
      const response = await fetch(
```

Linhas 177–181:

```tsx
              'application/json',
          },
          body: JSON.stringify(payload),
        }
      );
```

### A/src/pages/AdminAsaas.tsx

Linhas 14–18:

```tsx
  const handleCadastrar = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData, id_pai: formData.tipo === 'Subcolaborador' ? formData.idPai : 'Nenhum' };
    
    try {
```

Linhas 20–24:

```tsx
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
      });
      if (response.ok) {
```

### A/src/pages/ClienteDashboard.tsx

Linhas 106–117:

```tsx

    try {
      const response = await axios.post(
        WEBHOOK_LOGIN_CLIENTE,
        {
          assoc_cpf: loginData.assoc_cpf.replace(/\D/g, ''),
          assoc_nasc: formatarNascimento(loginData.assoc_nasc),
        },
        { timeout: 20000 }
      );

      console.log('Resposta login cliente:', response.data);
```

Linhas 150–158:

```tsx

    try {
      await axios.post(WEBHOOK_EDITA_ASSOCIADO, {
        num_contrato: editandoAssociado.num_contrato,
        assoc_cpf: editandoAssociado.assoc_cpf,
        ...editAssocData,
      });

      setDados((prev) =>
```

### A/src/pages/ColaboradorDashboard.tsx

Linhas 94–106:

```tsx

    try {
      const response = await axios.post(
        WEBHOOK_DADOS_COLAB,
        {
          cod_colab: formatCod(cod),
        },
        {
          timeout: 15000,
        }
      );

      setDados(normalizarPayload(response.data));
```

Linhas 132–145:

```tsx

    try {
      const response = await axios.post(
        WEBHOOK_LOGIN_COLAB,
        {
          cpf_colab: cpfNormalizado,
          senha_login: senha,
        },
        {
          timeout: 15000,
        }
      );

      const login = Array.isArray(response.data)
```

Linhas 330–345:

```tsx

    try {
      await axios.post(
        WEBHOOK_UPDATE_COLAB,
        {
          cod_colab: codLogado,
          email_colab: editData.email_colab,
          tel_colab: editData.tel_colab,
          pix_colab: editData.pix_colab,
        },
        {
          timeout: 15000,
        }
      );

      setDados((prev: any) => ({
```

### A/src/pages/EmpresaDashboard.tsx

Linhas 525–529:

```tsx
          "X-Admin-Token": token,
        },
        body: JSON.stringify({}),
      });

```

Linhas 604–611:

```tsx
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cod_admin: codAdmin,
          senha_admin: senhaAdmin,
        }),
      });

```

### A/src/pages/FormFamiliar.tsx

Linhas 402–409:

```tsx
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cpf,
            tipo_consulta: 'associado',
          }),
        }
      );
```

Linhas 594–601:

```tsx
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cpf,
            tipo_consulta: 'titular',
          }),
        }
      );
```

Linhas 809–841:

```tsx
    const totalTitulares = 1;

    const payload = {
      origem: 'site_consultoque',
      origem_form: 'familiar',
      cod_colab: codColab,
      cod_plano: 'p1382',
      tipo_plano: '1382',

      assoc_nome: somenteTexto(formData.assoc_nome),
      assoc_cpf: somenteNumeros(formData.assoc_cpf),
      assoc_nasc: formatarData(formData.assoc_nasc),
      assoc_email: somenteTexto(formData.assoc_email),
      assoc_tel: somenteTexto(formData.assoc_tel),

      tit_ind: 0,
      tit_fam: totalTitulares,
      tit_total: totalTitulares,

      vl_ind: 0,
      vl_fam: 66 * totalTitulares,
      vl_total: 66 * totalTitulares,

      status_venda: 'pendente',
      titulares: [titular],

      termos_aceitos: true,
      termos_aceitos_em: new Date().toISOString(),
      versao_termos:
        VERSAO_TERMO_ASSOCIADO,
    };

    try {
```

Linhas 845–849:

```tsx
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

```

### A/src/pages/FormIndividual.tsx

Linhas 437–444:

```tsx
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cpf,
            tipo_consulta: 'associado',
          }),
        }
      );
```

Linhas 641–648:

```tsx
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cpf,
            tipo_consulta: 'titular',
          }),
        }
      );
```

Linhas 893–936:

```tsx
    const totalTitulares = 1;

    const payload = {
      origem: 'site_consultoque',
      origem_form: 'individual',
      cod_colab: codColab,
      cod_plano: 'p1380',
      tipo_plano: '1380',

      assoc_nome: somenteTexto(
        formData.assoc_nome
      ),
      assoc_cpf: somenteNumeros(
        formData.assoc_cpf
      ),
      assoc_nasc: formatarData(
        formData.assoc_nasc
      ),
      assoc_email: somenteTexto(
        formData.assoc_email
      ),
      assoc_tel: somenteTexto(
        formData.assoc_tel
      ),

      tit_ind: totalTitulares,
      tit_fam: 0,
      tit_total: totalTitulares,

      vl_ind: 33 * totalTitulares,
      vl_fam: 0,
      vl_total: 33 * totalTitulares,

      status_venda: 'pendente',
      titulares: [titular],

      termos_aceitos: true,
      termos_aceitos_em:
        new Date().toISOString(),
      versao_termos:
        VERSAO_TERMO_ASSOCIADO,
    };

    try {
```

Linhas 943–947:

```tsx
              'application/json',
          },
          body: JSON.stringify(payload),
        }
      );
```

### A/src/pages/InscricaoColaborador.tsx

Linhas 165–171:

```tsx
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cpf,
        }),
      });

```

Linhas 428–452:

```tsx
    const cpf = somenteNumeros(formData.cpf_colab);

    const payload = {
      cod_pai: refId || "0001",

      nome_colab: formData.nome_colab.trim(),

      email_colab: formData.email_colab.trim().toLowerCase(),

      tel_colab: somenteNumeros(formData.tel_colab),

      cpf_colab: cpf,

      pix_colab: formData.pix_colab.trim(),

      senha_login: formData.senha_login,

      dt_cad: new Date().toLocaleDateString("pt-BR"),

      aceite_termo: true,
      versao_termo: VERSAO_TERMO_COLABORADOR,
      dt_aceite_termo: dataAceiteTermo.toISOString(),
    };

    try {
```

Linhas 456–460:

```tsx
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

```

### A/src/pages/SolicitarImpressos.tsx

Linhas 288–319:

```tsx

    try {
      const response = await axios.post(
        WEBHOOK_PEDIDO_IMPRESSOS,
        {
          cod_colab: codColab,
          nome_colab: formData.nome_colab.trim(),
          email_colab: formData.email_colab.trim(),
          tel_colab: somenteNumeros(
            formData.tel_colab
          ),
          modelo_folder: panfleto.id,
          nome_modelo: panfleto.titulo,
          quantidade: 100,
          cep: somenteNumeros(formData.cep),
          endereco: formData.endereco.trim(),
          numero: formData.numero.trim(),
          complemento: formData.complemento.trim(),
          bairro: formData.bairro.trim(),
          cidade: formData.cidade.trim(),
          estado: formData.estado
            .trim()
            .toUpperCase(),
          referencia: formData.referencia.trim(),
          arte_base64: artePersonalizada,
        },
        {
          timeout: 60000,
        }
      );

      const retorno = Array.isArray(response.data)
```

### A/src/pages/Vendas_asaas.tsx

Linhas 48–58:

```tsx
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          corretor_id: corretorId,
          acao: acao,
          plano: plano || 'nenhum',
          timestamp: new Date().toISOString(),
          origem: 'pagina_asaas'
        })
      });
    } catch (error) {
```

### B/src/App.tsx

Linhas 118–124:

```tsx
            'application/json',
        },
        body: JSON.stringify({
          referencia,
        }),
      }
    );
```

### B/src/components/CortesiasAdmin.tsx

Linhas 183–187:

```tsx
        "X-Admin-Token": token,
      },
      body: JSON.stringify(payload),
    });

```

### B/src/lib/consultaCpf.ts

Linhas 22–26:

```tsx
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cpf, origem: "TITULAR" }),
  });
  const raw = (await response.json().catch(() => null)) as
```

### B/src/pages/Admin.tsx

Linhas 532–536:

```tsx
          "X-Admin-Token": token,
        },
        body: JSON.stringify({}),
      });

```

Linhas 611–618:

```tsx
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cod_admin: codAdmin,
          senha_admin: senhaAdmin,
        }),
      });

```

### B/src/pages/Associado.tsx

Linhas 104–110:

```tsx
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cpf_assoc: cpfLimpo,
          }),
        }
      );
```

Linhas 181–188:

```tsx
        },

        body: JSON.stringify({
          cpf_assoc: cpfLimpo,
          senha: password,
        }),
      });

```

### B/src/pages/AssociadoDashboard.tsx

Linhas 435–442:

```tsx
          'X-Associado-Token': sessaoAtual.token_sessao,
        },
        body: JSON.stringify({
          cpf_assoc: sessaoAtual.cpf_assoc,
          token_sessao: sessaoAtual.token_sessao,
        }),
      });

```

Linhas 641–657:

```tsx
        },

        body: JSON.stringify({
          alvo_edicao:
            edicao.alvo_edicao,

          cpf_titular:
            edicao.alvo_edicao ===
            'TITULAR'
              ? edicao.cpf_titular
              : undefined,

          email,
          telefone,
        }),
      }
    );
```

Linhas 794–805:

```tsx
        'X-Associado-Token': sessao.token_sessao,
      },
      body: JSON.stringify({
        nome_titular: nome,
        cpf_titular: cpf,
        nasc_titular: dataInputParaBr(nascimento),
        email_titular: email,
        tel_titular: telefone,
        cod_plano: inclusao.cod_plano,
      }),
    });

```

Linhas 861–867:

```tsx
        'X-Associado-Token': sessao.token_sessao,
      },
      body: JSON.stringify({
        cpf_titular: texto(titularExclusao.cpf_titular).replace(/\D/g, ''),
      }),
    });

```

### B/src/pages/Colaborador.tsx

Linhas 158–178:

```tsx
            },

            body: JSON.stringify({
              origem:
                'site_consultoque_empresas',

              finalidade:
                'REDEFINIR_SENHA',

              tipo_usuario:
                'COLABORADOR',

              cpf_colab:
                cpfLimpo,

              enviado_em:
                new Date()
                  .toISOString(),
            }),
          }
        );
```

Linhas 270–292:

```tsx
            },

            body: JSON.stringify({
              origem:
                'site_consultoque_empresas',

              finalidade:
                'LOGIN_COLABORADOR',

              tipo_usuario:
                'COLABORADOR',

              cpf_colab:
                cpfLimpo,

              senha,

              enviado_em:
                new Date()
                  .toISOString(),
            }),
          }
        );
```

### B/src/pages/ColaboradorDashboard.tsx

Linhas 994–1008:

```tsx


              body:

                JSON.stringify({

                  cod_colab:

                    colaboradorAtual

                      .cod_colab,

                }),

            }
```

Linhas 1556–1568:

```tsx
        },

        body: JSON.stringify({

          apelido_referencia: apelido,

          referencia: apelido,

          cod_colab: colaborador?.cod_colab,

        }),

      });
```

Linhas 1914–1964:

```tsx


            body:

              JSON.stringify({

                cod_colab:

                  colaboradorAtual.cod_colab,



                email_colab:

                  email,



                tel_colab:

                  telefone,



                pix_colab:

                  pix,



                ...(apelido

                  ? { apelido_referencia: apelido }

                  : {}),



                senha_atual:

                  senhaAtual,



                nova_senha:

                  novaSenha,

              }),

          }
```

### B/src/pages/CompletarAdesao.tsx

Linhas 170–174:

```tsx
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpf_assoc: cpf }),
      });
      const result = (await response
```

Linhas 284–301:

```tsx
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token_complemento: dados.token_complemento || "",
          num_contrato: dados.contrato.num_contrato,
          cpf_assoc: somenteNumerosCpf(cpfAssoc),
          titulares_adicionados: novos.map((titular) => ({
            cpf_titular: somenteNumerosCpf(titular.cpf),
            nome_titular: titular.nome,
            nasc_titular: nascimentoBr(titular.nascimento),
            email_titular: titular.email.trim().toLowerCase(),
            tel_titular: onlyDigits(titular.telefone),
            cod_plano: titular.plan === "familia" ? "2880" : "2878",
            consulta_id: titular.consultaId,
          })),
        }),
      });
      const result = (await response.json().catch(() => null)) as {
```

### B/src/pages/CriarSenha.tsx

Linhas 192–206:

```tsx
          },

          body: JSON.stringify({
            finalidade:
              'DEFINIR_SENHA',

            token,

            senha,

            enviado_em:
              new Date().toISOString(),
          }),
        }
      );
```

### B/src/pages/FormColetivo.tsx

Linhas 361–368:

```tsx
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cnpj: documento,
          origem: "COBRANCA_CNPJ",
        }),
      });

```

Linhas 419–426:

```tsx
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cpf,
          origem: "ASSOCIADO",
        }),
      });

```

Linhas 587–594:

```tsx
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cpf,
          origem: "TITULAR",
        }),
      });

```

Linhas 894–938:

```tsx
    const codColab = getCodColab();

    const payload = {
      origem: "site_consultoque_empresas",
      enviado_em: agora,

      cod_colab: codColab,

      nome_assoc: normalizarNome(responsibleName.trim()),
      cpf_assoc: onlyDigits(responsibleCpf),
      nasc_assoc: formatBirthDateBR(responsibleBirthDate),
      email_assoc: responsibleEmail.trim().toLowerCase(),
      tel_assoc: onlyDigits(responsiblePhone),
      empresa: cobrancaEmpresa ? companyName.trim() : "",
      cnpj: cobrancaEmpresa ? onlyDigits(cnpj) : "",
      tipo_doc_cobranca: cobrancaEmpresa ? "CNPJ" : "CPF",

      assoc_cpf_validado: Boolean(responsibleCpfValidation?.cpf_validado),
      assoc_maior_idade: Boolean(responsibleCpfValidation?.maior_idade),
      assoc_consulta_id: responsibleCpfValidation?.consulta_id || "",

      qtd_individual: breakdown.individualCount,
      qtd_familiar: breakdown.familyCount,
      vl_individual: breakdown.individualCount * breakdown.individualUnit,
      vl_familiar: breakdown.familyCount * breakdown.familyUnit,
      vl_total: breakdown.totalMonthly,

      desconto_coletivo: breakdown.hasBulkDiscount,
      economia_mensal: breakdown.savings,

      termos_aceitos: true,
      termos_aceitos_em: agora,
      versao_termo: VERSAO_TERMO_ASSOCIADO,

      titulares: holders.map((holder) => ({
        cpf_titular: onlyDigits(holder.cpf),
        nome_titular: normalizarNome(holder.name.trim()),
        nasc_titular: formatBirthDateBR(holder.birthDate),
        email_titular: holder.email.trim().toLowerCase(),
        tel_titular: onlyDigits(holder.phone),
        cod_plano: holder.plan === "individual" ? "2878" : "2880",
      })),
    };

    try {
```

Linhas 940–944:

```tsx
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

```

### B/src/pages/FormPessoal.tsx

Linhas 257–264:

```tsx
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cpf,
          origem: "ASSOCIADO",
        }),
      });

```

Linhas 503–510:

```tsx
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cpf,
          origem: "TITULAR",
        }),
      });

```

Linhas 788–832:

```tsx
    const codColab = getCodColab();

    const payload = {
      origem: "site_consultoque_pessoal",
      enviado_em: agora,

      cod_colab: codColab,

      nome_assoc: normalizarNome(responsibleName.trim()),
      cpf_assoc: onlyDigits(responsibleCpf),
      nasc_assoc: formatBirthDateBR(responsibleBirthDate),
      email_assoc: responsibleEmail.trim().toLowerCase(),
      tel_assoc: onlyDigits(responsiblePhone),
      /* Mantidos vazios para compatibilidade com o fluxo atual. */
      empresa: "",
      cnpj: "",

      assoc_cpf_validado: Boolean(responsibleCpfValidation?.cpf_validado),
      assoc_maior_idade: Boolean(responsibleCpfValidation?.maior_idade),
      assoc_consulta_id: responsibleCpfValidation?.consulta_id || "",

      qtd_individual: breakdown.individualCount,
      qtd_familiar: breakdown.familyCount,
      vl_individual: breakdown.individualCount * breakdown.individualUnit,
      vl_familiar: breakdown.familyCount * breakdown.familyUnit,
      vl_total: breakdown.totalMonthly,

      desconto_coletivo: breakdown.hasBulkDiscount,
      economia_mensal: breakdown.savings,

      termos_aceitos: true,
      termos_aceitos_em: agora,
      versao_termo: VERSAO_TERMO_ASSOCIADO,

      titulares: holders.map((holder) => ({
        cpf_titular: onlyDigits(holder.cpf),
        nome_titular: normalizarNome(holder.name.trim()),
        nasc_titular: formatBirthDateBR(holder.birthDate),
        email_titular: holder.email.trim().toLowerCase(),
        tel_titular: onlyDigits(holder.phone),
        cod_plano: holder.plan === "individual" ? "2878" : "2880",
      })),
    };

    try {
```

Linhas 834–838:

```tsx
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

```

### B/src/pages/SejaColaborador.tsx

Linhas 311–318:

```tsx
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cpf,
          origem: "COLABORADOR",
        }),
      });

```

Linhas 387–393:

```tsx
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apelido_referencia: apelido,
        }),
      });

```

Linhas 541–585:

```tsx
    const agora = new Date().toISOString();

    const payload = {
      origem: "site_consultoque_empresas",

      finalidade: "CADASTRO_COLABORADOR",

      enviado_em: agora,

      cod_pai: codigoPai,

      nome_colab: formulario.nome_colab.trim().replace(/\s+/g, " "),

      cpf_colab: somenteNumeros(formulario.cpf_colab),

      cpf_validado: true,

      cpf_consulta_id: validacaoCpf?.consulta_id || "",

      cpf_nascimento: validacaoCpf?.nascimento || "",

      email_colab: formulario.email_colab.trim().toLowerCase(),

      tel_colab: somenteNumeros(formulario.tel_colab),

      pix_colab: formulario.pix_colab.trim(),

      apelido_referencia: normalizarApelido(
        formulario.apelido_referencia,
      ),
      /*
       * O n8n receberá a senha,
       * criará o hash e gravará
       * somente senha_hash.
       */
      senha: formulario.senha,

      termos_aceitos: true,

      termos_aceitos_em: agora,

      versao_termo: "COLABORADOR_V1",
    };

    try {
```

Linhas 591–595:

```tsx
        },

        body: JSON.stringify(payload),
      });

```

### B/src/pages/SolicitarImpressos.tsx

Linhas 328–359:

```tsx

    try {
      const response = await axios.post(
        WEBHOOK_PEDIDO_IMPRESSOS,
        {
          cod_colab: codColab,
          nome_colab: formData.nome_colab.trim(),
          email_colab: formData.email_colab.trim(),
          tel_colab: somenteNumeros(
            formData.tel_colab
          ),
          modelo_folder: panfleto.id,
          nome_modelo: panfleto.titulo,
          quantidade: 100,
          cep: somenteNumeros(formData.cep),
          endereco: formData.endereco.trim(),
          numero: formData.numero.trim(),
          complemento: formData.complemento.trim(),
          bairro: formData.bairro.trim(),
          cidade: formData.cidade.trim(),
          estado: formData.estado
            .trim()
            .toUpperCase(),
          referencia: formData.referencia.trim(),
          arte_base64: artePersonalizada,
        },
        {
          timeout: 60000,
        }
      );

      const retorno = Array.isArray(response.data)
```

## Apêndice D — URLs de integração por arquivo

URLs são referências do código; presença não comprova disponibilidade ou tráfego.
- `A/src/App.tsx:83` → `https://coletivo.consultoque.com.br/associado`
- `A/src/App.tsx:86` → `https://coletivo.consultoque.com.br/colaborador`
- `A/src/App.tsx:107` → `https://n8n.saintsolution.com.br/webhook/resolver-referencia-publica`
- `A/src/components/CTA.tsx:4` → `https://coletivo.consultoque.com.br/formcoletivo`
- `A/src/components/CollectivePlansCall.tsx:2` → `https://coletivo.consultoque.com.br`
- `A/src/components/CortesiasAdmin.tsx:15` → `https://n8n.saintsolution.com.br/webhook/admin-cortesias`
- `A/src/components/Footer.tsx:134` → `https://coletivo.consultoque.com.br/admin`
- `A/src/components/HeaderVisual.tsx:13` → `https://coletivo.consultoque.com.br/admin`
- `A/src/components/Hero.tsx:2` → `https://coletivo.consultoque.com.br/formcoletivo`
- `A/src/components/PlanGrid.tsx:2` → `https://coletivo.consultoque.com.br/formcoletivo`
- `A/src/components/SolicitacaoValidacaoCpf.tsx:5` → `https://n8n.saintsolution.com.br/webhook/solicitar-validacao-cpf`
- `A/src/pages/AdminAsaas.tsx:5` → `https://n8n.saintsolution.com.br/webhook/aa35fc51-82dc-468c-8334-b8d0b6c73bf3`
- `A/src/pages/ClienteDashboard.tsx:4` → `https://n8n.saintsolution.com.br/webhook/login-cliente`
- `A/src/pages/ClienteDashboard.tsx:5` → `https://n8n.saintsolution.com.br/webhook/edita-associado`
- `A/src/pages/ColaboradorDashboard.tsx:5` → `https://n8n.saintsolution.com.br/webhook/edita-colab`
- `A/src/pages/ColaboradorDashboard.tsx:8` → `https://n8n.saintsolution.com.br/webhook/get-dados-colaborador`
- `A/src/pages/ColaboradorDashboard.tsx:11` → `https://n8n.saintsolution.com.br/webhook/login_dash_colab`
- `A/src/pages/EmpresaDashboard.tsx:22` → `https://n8n.saintsolution.com.br/webhook/admin-login`
- `A/src/pages/EmpresaDashboard.tsx:25` → `https://n8n.saintsolution.com.br/webhook/admin-dashboard`
- `A/src/pages/FormColetivo.tsx:4` → `https://coletivo.consultoque.com.br/formcoletivo`
- `A/src/pages/FormFamiliar.tsx:9` → `https://n8n.saintsolution.com.br/webhook/familiar-pessoal`
- `A/src/pages/FormFamiliar.tsx:12` → `https://n8n.saintsolution.com.br/webhook/BuscaCPF`
- `A/src/pages/FormIndividual.tsx:9` → `https://n8n.saintsolution.com.br/webhook/individual-pessoal`
- `A/src/pages/FormIndividual.tsx:12` → `https://n8n.saintsolution.com.br/webhook/BuscaCPF`
- `A/src/pages/InscricaoColaborador.tsx:6` → `https://n8n.saintsolution.com.br/webhook/BuscaCPFcolab`
- `A/src/pages/InscricaoColaborador.tsx:9` → `https://n8n.saintsolution.com.br/webhook/insertcolab`
- `A/src/pages/SejaAfiliado.tsx:10` → `https://coletivo.consultoque.com.br/seja-colaborador`
- `A/src/pages/SolicitarImpressos.tsx:10` → `https://n8n.saintsolution.com.br/webhook/pedido-impressos`
- `A/src/pages/Vendas_asaas.tsx:7` → `https://www.asaas.com/c/seu_link_plano_individual`
- `A/src/pages/Vendas_asaas.tsx:8` → `https://www.asaas.com/c/seu_link_plano_familiar`
- `A/src/pages/Vendas_asaas.tsx:12` → `https://seu-n8n.com/webhook/consultoque-leads`
- `B/src/App.tsx:47` → `https://n8n.saintsolution.com.br/webhook/resolver-referencia-publica`
- `B/src/components/CortesiasAdmin.tsx:20` → `https://n8n.saintsolution.com.br/webhook/emp-admin-cortesias`
- `B/src/lib/consultaCpf.ts:4` → `https://n8n.saintsolution.com.br/webhook/validar-cpf-cadastro`
- `B/src/pages/Admin.tsx:27` → `https://n8n.saintsolution.com.br/webhook/admin-login`
- `B/src/pages/Admin.tsx:31` → `https://n8n.saintsolution.com.br/webhook/admin-dashboard`
- `B/src/pages/Associado.tsx:17` → `https://n8n.saintsolution.com.br/webhook/associado-login`
- `B/src/pages/Associado.tsx:20` → `https://n8n.saintsolution.com.br/webhook/associado-recuperar-senha`
- `B/src/pages/AssociadoDashboard.tsx:35` → `https://n8n.saintsolution.com.br/webhook/associado-dashboard`
- `B/src/pages/AssociadoDashboard.tsx:39` → `https://n8n.saintsolution.com.br/webhook/associado-editar-dados`
- `B/src/pages/AssociadoDashboard.tsx:43` → `https://n8n.saintsolution.com.br/webhook/associado-incluir-titular`
- `B/src/pages/AssociadoDashboard.tsx:47` → `https://n8n.saintsolution.com.br/webhook/associado-excluir-titular`
- `B/src/pages/Colaborador.tsx:27` → `https://n8n.saintsolution.com.br/webhook/colaborador-login`
- `B/src/pages/Colaborador.tsx:32` → `https://n8n.saintsolution.com.br/webhook/colaborador-recuperar-senha`
- `B/src/pages/ColaboradorDashboard.tsx:75` → `https://n8n.saintsolution.com.br/webhook/colaborador-dashboard`
- `B/src/pages/ColaboradorDashboard.tsx:87` → `https://n8n.saintsolution.com.br/webhook/colaborador-atualiza-dados`
- `B/src/pages/ColaboradorDashboard.tsx:93` → `https://n8n.saintsolution.com.br/webhook/valida-apelido-colaborador`
- `B/src/pages/CompletarAdesao.tsx:27` → `https://n8n.saintsolution.com.br/webhook/consultar-adesao-pendente`
- `B/src/pages/CompletarAdesao.tsx:31` → `https://n8n.saintsolution.com.br/webhook/complementar-adesao-pendente`
- `B/src/pages/CriarSenha.tsx:24` → `https://n8n.saintsolution.com.br/webhook/criar-senha`
- `B/src/pages/FormColetivo.tsx:41` → `https://n8n.saintsolution.com.br/webhook/coletivo-empresarial`
- `B/src/pages/FormColetivo.tsx:44` → `https://n8n.saintsolution.com.br/webhook/validar-cpf-cadastro`
- `B/src/pages/FormColetivo.tsx:47` → `https://n8n.saintsolution.com.br/webhook/validar-cnpj-cadastro`
- `B/src/pages/FormPessoal.tsx:36` → `https://n8n.saintsolution.com.br/webhook/coletivo-empresarial`
- `B/src/pages/FormPessoal.tsx:39` → `https://n8n.saintsolution.com.br/webhook/validar-cpf-cadastro`
- `B/src/pages/SejaColaborador.tsx:23` → `https://n8n.saintsolution.com.br/webhook/colaborador-cadastro`
- `B/src/pages/SejaColaborador.tsx:26` → `https://n8n.saintsolution.com.br/webhook/validar-cpf-cadastro`
- `B/src/pages/SejaColaborador.tsx:29` → `https://n8n.saintsolution.com.br/webhook/valida-apelido-colaborador`
- `B/src/pages/SolicitarImpressos.tsx:10` → `https://n8n.saintsolution.com.br/webhook/pedido-impressos`

## Apêndice E — Storage, parâmetros e variáveis de ambiente

Trechos estáticos com contexto de leituras/escritas; não incluem valores de sessão.

**A/src/App.tsx**

```text
92: const CHAVE_REFERENCIADOR_LOCAL =
93:   'referenciador_id';
94: 
95: const COOKIE_REFERENCIADOR_ANTIGO =
96:   'referenciador_id';
97: 
98: /*
99:  * Cookie compartilhado entre:
100:  * consultoque.com.br
101:  * coletivo.consultoque.com.br
103: const COOKIE_INDICADOR_COMPARTILHADO =
104:   'indicador_consultoque';
105: 
106: const URL_RESOLVER_REFERENCIA =
107:   'https://n8n.saintsolution.com.br/webhook/resolver-referencia-publica';
108: 
109: const ROTAS_RESERVADAS = new Set([
141:     document.cookie
142:       .split(';')
143:       .map((item) =>
144:         item.trim()
145:       )
146:       .find((item) =>
147:         item.startsWith(prefixo)
200:   localStorage.setItem(
201:     CHAVE_REFERENCIADOR_LOCAL,
202:     refFormatado
203:   );
204: 
205:   document.cookie = [
206:     `${COOKIE_REFERENCIADOR_ANTIGO}=${refFormatado}`,
207:     'Path=/',
208:     `Max-Age=${validadeEmSegundos}`,
209:     'SameSite=Lax',
210:   ].join('; ');
211: 
236:   document.cookie =
237:     partesCookieCompartilhado.join('; ');
238: }
239: 
240: async function resolverReferencia(
241:   referencia: string
242: ) {
335:       params.get('ref');
336: 
337:     const caminhoCompleto =
338:       window.location.pathname.substring(
339:         1
340:       );
341: 
```

**A/src/components/CTA.tsx**

```text
18:     localStorage.getItem(
19:       'referenciador_id'
20:     );
21: 
22:   const numeros =
23:     String(armazenado ?? '')
24:       .replace(/\D/g, '');
```

**A/src/components/Hero.tsx**

```text
6:     localStorage.getItem(
7:       'referenciador_id'
8:     );
9: 
10:   const numeros =
11:     String(armazenado ?? '')
12:       .replace(/\D/g, '');
```

**A/src/components/PlanGrid.tsx**

```text
6:     localStorage.getItem(
7:       'referenciador_id'
8:     );
9: 
10:   const numeros =
11:     String(armazenado ?? '')
12:       .replace(/\D/g, '');
```

**A/src/components/SolicitacaoValidacaoCpf.tsx**

```text
130:   localStorage.getItem('referenciador_id');
131: 
132: const somenteNumerosReferencia =
133:   somenteNumeros(referenciaSalva || '');
134: 
135: const codPai =
136:   somenteNumerosReferencia.length >= 1 &&
```

**A/src/pages/ColaboradorDashboard.tsx**

```text
84:     const cod = localStorage.getItem('cod_colab');
85: 
86:     if (cod) {
87:       setLogado(true);
88:       buscarDados(cod);
89:     }
90:   }, []);
152:         localStorage.setItem('cod_colab', codFormatado);
153:         localStorage.setItem('nome_colab', login.nome_colab || '');
154: 
155:         setLogado(true);
156: 
157:         await buscarDados(codFormatado);
158:       } else {
159:         alert('CPF ou senha incorretos.');
261:     dados.cod_colab || localStorage.getItem('cod_colab')
262:   );
263: 
264:   const colaboradorLogado = dados.colaborador || {};
265:   const codPai = formatCod(colaboradorLogado.cod_pai || '');
266: 
267:   const vendas = asArray(dados.vendas);
397:             {localStorage.getItem('nome_colab') ||
398:               colaboradorLogado.nome_colab ||
399:               'colaborador'}
400:           </h1>
401: 
402:           <p className="text-sm text-slate-500 mt-1">
403:             Seu código de colaborador: <strong>{codLogado}</strong>
520:               localStorage.removeItem('cod_colab');
521:               localStorage.removeItem('nome_colab');
522:               window.location.href = '/';
523:             }}
524:           >
525:             Sair
526:           </button>
527:         </div>
```

**A/src/pages/EmpresaDashboard.tsx**

```text
27: const CHAVE_TOKEN_ADMIN = "consultoque_admin_token";
28: const CHAVE_EXPIRACAO_ADMIN = "consultoque_admin_expira";
29: const CHAVE_DADOS_ADMIN = "consultoque_admin_dados";
30: 
31: type Aba =
32:   | "resumo"
33:   | "contratos"
34:   | "vendas"
35:   | "associados"
504:     sessionStorage.removeItem(CHAVE_TOKEN_ADMIN);
505:     sessionStorage.removeItem(CHAVE_EXPIRACAO_ADMIN);
506:     sessionStorage.removeItem(CHAVE_DADOS_ADMIN);
507: 
508:     setLogado(false);
509:     setAdmin(null);
510:     setDashboard(null);
511:     setAba("resumo");
512:     setBusca("");
563:     const token = sessionStorage.getItem(CHAVE_TOKEN_ADMIN);
564:     const expiracao = sessionStorage.getItem(CHAVE_EXPIRACAO_ADMIN);
565:     const adminSalvo = sessionStorage.getItem(CHAVE_DADOS_ADMIN);
566: 
567:     if (!token || !sessaoAindaValida(expiracao)) {
568:       encerrarSessao();
569:       return;
570:     }
571: 
576:         sessionStorage.removeItem(CHAVE_DADOS_ADMIN);
577:       }
578:     }
579: 
580:     setLogado(true);
581:     buscarDashboard(token);
582:   }, []);
626:       sessionStorage.setItem(CHAVE_TOKEN_ADMIN, resultado.token_sessao);
627:       sessionStorage.setItem(CHAVE_EXPIRACAO_ADMIN, resultado.expira_sessao);
628: 
629:       if (resultado.admin) {
630:         sessionStorage.setItem(
631:           CHAVE_DADOS_ADMIN,
632:           JSON.stringify(resultado.admin),
633:         );
634:         setAdmin(resultado.admin);
635:       }
636: 
658:     const token = sessionStorage.getItem(CHAVE_TOKEN_ADMIN);
659: 
660:     if (!token) {
661:       encerrarSessao("Entre novamente para continuar.");
662:       return;
663:     }
664: 
1328:               token={sessionStorage.getItem(CHAVE_TOKEN_ADMIN) || ""}
1329:               onAtualizar={atualizarDashboard}
1330:               onSessaoExpirada={() =>
1331:                 encerrarSessao(
1332:                   "Sua sessão expirou. Entre novamente para continuar.",
1333:                 )
1334:               }
```

**A/src/pages/FormColetivo.tsx**

```text
9:     params.get('ref') || localStorage.getItem('referenciador_id') || '0001';
10: 
11:   params.set('ref', referencia);
12: 
13:   const destino = `${URL_FORMULARIO_COLETIVO}?${params.toString()}`;
14: 
15:   useEffect(() => {
```

**A/src/pages/FormFamiliar.tsx**

```text
784:       localStorage.getItem('referenciador_id') ||
785:       '0001';
786: 
787:     const titular = mesmoTitular
788:       ? {
789:           tit_nome: somenteTexto(formData.assoc_nome),
790:           tit_cpf: somenteNumeros(formData.assoc_cpf),
```

**A/src/pages/FormIndividual.tsx**

```text
847:       localStorage.getItem(
848:         'referenciador_id'
849:       ) || '0001';
850: 
851:     const titular = mesmoTitular
852:       ? {
853:           tit_nome: somenteTexto(
```

**A/src/pages/InscricaoColaborador.tsx**

```text
77:     localStorage.removeItem(chave);
78:     sessionStorage.removeItem(chave);
79:   });
80: }
81: 
82: export function InscricaoColaborador() {
83:   const [refId, setRefId] = useState("0001");
84: 
121:     const savedRef = localStorage.getItem("referenciador_id");
122: 
123:     if (savedRef) {
124:       setRefId(somenteNumeros(savedRef).padStart(4, "0"));
125:     }
126:   }, []);
127: 
```

**A/src/pages/MaterialPromocional.tsx**

```text
78:   const codColab = formatCod(localStorage.getItem('cod_colab'));
79:   const nomeColab =
80:     localStorage.getItem('nome_colab') || 'colaborador';
81: 
82:   const linkVenda = codColab
83:     ? `https://consultoque.com.br/${codColab}`
84:     : '';
85: 
86:   async function copiarLink() {
```

**A/src/pages/MontarFolder.tsx**

```text
72:   const modeloId = params.get('modelo') || '';
73: 
74:   const panfleto = panfletos.find(
75:     (item) => item.id === modeloId
76:   );
77: 
78:   const codColab = formatCod(
79:     localStorage.getItem('cod_colab')
80:   );
81: 
82:   const linkVenda = codColab
83:     ? `https://consultoque.com.br/${codColab}`
84:     : '';
85: 
265:       sessionStorage.setItem(
266:         'arte_personalizada',
267:         artePersonalizada
268:       );
269: 
270:       sessionStorage.setItem(
271:         'arte_modelo',
272:         panfleto.id
273:       );
274: 
275:       window.location.href =
276:         `/solicitar-impressos?modelo=${encodeURIComponent(
```

**A/src/pages/PanfletosPromocionais.tsx**

```text
49:     localStorage.getItem('cod_colab') || ''
50:   )
51:     .replace(/\D/g, '')
52:     .padStart(4, '0');
53: 
54:   const nomeColab =
55:     localStorage.getItem('nome_colab') || 'colaborador';
56: 
57:   if (!localStorage.getItem('cod_colab')) {
58:     return (
59:       <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
60:         <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-xl p-8 text-center">
61:           <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-blue-100 flex items-center justify-center text-3xl">
62:             🔒
63:           </div>
```

**A/src/pages/Play.tsx**

```text
131:       localStorage.getItem(
132:         "referenciador_id"
133:       );
134: 
135:     const referenciaSalvaValida =
136:       referenciaSalva &&
137:       /^\d{4}$/.test(referenciaSalva);
145:     localStorage.setItem(
146:       "referenciador_id",
147:       codigo
148:     );
149: 
150:     document.cookie = [
151:       `referenciador_id=${codigo}`,
152:       "path=/",
153:       `max-age=${60 * 60 * 24 * 30}`,
154:       "SameSite=Lax",
155:     ].join("; ");
156: 
```

**A/src/pages/SejaAfiliado.tsx**

```text
14:     localStorage.getItem(
15:       'referenciador_id'
16:     );
17: 
18:   const numeros =
19:     String(armazenado ?? '')
20:       .replace(/\D/g, '');
```

**A/src/pages/SolicitarImpressos.tsx**

```text
72:   const modeloId = params.get('modelo') || '';
73: 
74:   const panfleto = panfletos.find(
75:     (item) => item.id === modeloId
76:   );
77: 
78:   const codColab = formatCod(
79:     localStorage.getItem('cod_colab')
80:   );
81: 
82:   const linkVenda = codColab
83:     ? `https://consultoque.com.br/${codColab}`
84:     : '';
85: 
87:     sessionStorage.getItem('arte_modelo') === modeloId
88:       ? sessionStorage.getItem('arte_personalizada') || ''
89:       : '';
90: 
91:   const [enviando, setEnviando] = useState(false);
92:   const [pedidoEnviado, setPedidoEnviado] = useState(false);
93:   const [numeroPedido, setNumeroPedido] = useState('');
94:   const [artePersonalizada, setArtePersonalizada] =
103:       localStorage.getItem('nome_colab') || '',
104:     email_colab: '',
105:     tel_colab: '',
106:     cep: '',
107:     endereco: '',
108:     numero: '',
109:     complemento: '',
168:       sessionStorage.setItem(
169:         'arte_personalizada',
170:         novaArte
171:       );
172:       sessionStorage.setItem('arte_modelo', panfleto.id);
173: 
174:       setArtePersonalizada(novaArte);
175:       setPreparandoArte(false);
176:     };
177: 
178:     imagemBase.onerror = () => {
348:       sessionStorage.removeItem('arte_personalizada');
349:       sessionStorage.removeItem('arte_modelo');
350: 
351:       window.scrollTo({
352:         top: 0,
353:         behavior: 'smooth',
354:       });
355:     } catch (error) {
```

**A/src/pages/Vendas_asaas.tsx**

```text
27:       document.cookie = `consultoque_ref=${id}; expires=${date.toUTCString()}; path=/`;
28:       setRefCode(id);
29:       notificarN8n(id, 'visita');
30:     } else {
31:       const match = document.cookie.match(/(?:^|; )consultoque_ref=([^;]*)/);
32:       if (match && match[1]) {
33:         setRefCode(match[1]);
34:       } else {
35:         const padraoDono = '0001';
36:         const date = new Date();
37:         date.setTime(date.getTime() + (30 * 24 * 60 * 60 * 1000));
38:         document.cookie = `consultoque_ref=${padraoDono}; expires=${date.toUTCString()}; path=/`;
39:         setRefCode(padraoDono);
40:         notificarN8n(padraoDono, 'visita');
41:       }
42:     }
43:   }, [id]);
44: 
```

**B/src/App.tsx**

```text
40: const CHAVE_INDICADOR =
41:   'indicador_colab';
42: 
43: const COOKIE_INDICADOR =
44:   'indicador_consultoque';
45: 
46: const URL_RESOLVER_REFERENCIA =
47:   'https://n8n.saintsolution.com.br/webhook/resolver-referencia-publica';
48: 
49: function getCookie(
55:     document.cookie
56:       .split(';')
57:       .map((item) =>
58:         item.trim()
59:       )
60:       .find((item) =>
61:         item.startsWith(
148:   localStorage.setItem(
149:     CHAVE_INDICADOR,
150:     indicador
151:   );
152: 
153:   const dias = 30;
154: 
182:   document.cookie =
183:     partesCookie.join('; ');
184: }
185: 
186: function EntradaIndicador() {
187:   const { indicador } =
188:     useParams();
189: 
190:   const navigate =
191:     useNavigate();
192: 
193:   useEffect(() => {
194:     let cancelado = false;
396:       localStorage.setItem(
397:         CHAVE_INDICADOR,
398:         indicadorCompartilhado
399:       );
400:     }
401:   }, []);
402: 
```

**B/src/components/CortesiasAdmin.tsx**

```text
19:   import.meta.env.VITE_WEBHOOK_EMP_ADMIN_CORTESIAS ??
20:   "https://n8n.saintsolution.com.br/webhook/emp-admin-cortesias";
21: 
22: type Registro = Record<string, unknown>;
23: 
24: type RespostaCortesia = {
25:   status?: string;
```

**B/src/pages/Admin.tsx**

```text
26:   import.meta.env.VITE_WEBHOOK_EMP_ADMIN_LOGIN ??
27:   "https://n8n.saintsolution.com.br/webhook/admin-login";
28: 
29: const WEBHOOK_DASHBOARD_ADMIN =
30:   import.meta.env.VITE_WEBHOOK_EMP_ADMIN_DASHBOARD ??
31:   "https://n8n.saintsolution.com.br/webhook/admin-dashboard";
32: 
33: const CHAVE_TOKEN_ADMIN = "consultoque_admin_token";
34: const CHAVE_EXPIRACAO_ADMIN = "consultoque_admin_expira";
35: const CHAVE_DADOS_ADMIN = "consultoque_admin_dados";
36: 
37: type Aba =
38:   | "resumo"
39:   | "contratos"
40:   | "vendas"
41:   | "associados"
511:     sessionStorage.removeItem(CHAVE_TOKEN_ADMIN);
512:     sessionStorage.removeItem(CHAVE_EXPIRACAO_ADMIN);
513:     sessionStorage.removeItem(CHAVE_DADOS_ADMIN);
514: 
515:     setLogado(false);
516:     setAdmin(null);
517:     setDashboard(null);
518:     setAba("resumo");
519:     setBusca("");
570:     const token = sessionStorage.getItem(CHAVE_TOKEN_ADMIN);
571:     const expiracao = sessionStorage.getItem(CHAVE_EXPIRACAO_ADMIN);
572:     const adminSalvo = sessionStorage.getItem(CHAVE_DADOS_ADMIN);
573: 
574:     if (!token || !sessaoAindaValida(expiracao)) {
575:       encerrarSessao();
576:       return;
577:     }
578: 
583:         sessionStorage.removeItem(CHAVE_DADOS_ADMIN);
584:       }
585:     }
586: 
587:     setLogado(true);
588:     buscarDashboard(token);
589:   }, []);
633:       sessionStorage.setItem(CHAVE_TOKEN_ADMIN, resultado.token_sessao);
634:       sessionStorage.setItem(CHAVE_EXPIRACAO_ADMIN, resultado.expira_sessao);
635: 
636:       if (resultado.admin) {
637:         sessionStorage.setItem(
638:           CHAVE_DADOS_ADMIN,
639:           JSON.stringify(resultado.admin),
640:         );
641:         setAdmin(resultado.admin);
642:       }
643: 
665:     const token = sessionStorage.getItem(CHAVE_TOKEN_ADMIN);
666: 
667:     if (!token) {
668:       encerrarSessao("Entre novamente para continuar.");
669:       return;
670:     }
671: 
1312:               token={sessionStorage.getItem(CHAVE_TOKEN_ADMIN) || ""}
1313:               onAtualizar={atualizarDashboard}
1314:               onSessaoExpirada={() =>
1315:                 encerrarSessao(
1316:                   "Sua sessão expirou. Entre novamente para continuar.",
1317:                 )
1318:               }
```

**B/src/pages/Associado.tsx**

```text
277:         sessionStorage.setItem(
278:           'associado_sessao',
279:           JSON.stringify(sessao)
280:         );
281: 
282:         sessionStorage.setItem(
283:           'associado_token_sessao',
284:           data.token_sessao
285:         );
286: 
287:         /*
288:          * O n8n atualmente devolve:
```

**B/src/pages/AssociadoDashboard.tsx**

```text
34:   import.meta.env.VITE_WEBHOOK_ASSOCIADO_DASHBOARD?.trim() ||
35:   'https://n8n.saintsolution.com.br/webhook/associado-dashboard';
36:   
37: const ASSOCIADO_EDITAR_DADOS_URL =
38:   import.meta.env.VITE_WEBHOOK_ASSOCIADO_EDITAR_DADOS?.trim() ||
39:   'https://n8n.saintsolution.com.br/webhook/associado-editar-dados';
40: 
41: const ASSOCIADO_INCLUIR_TITULAR_URL =
42:   import.meta.env.VITE_WEBHOOK_ASSOCIADO_INCLUIR_TITULAR?.trim() ||
43:   'https://n8n.saintsolution.com.br/webhook/associado-incluir-titular';
44: 
45: const ASSOCIADO_EXCLUIR_TITULAR_URL =
46:   import.meta.env.VITE_WEBHOOK_ASSOCIADO_EXCLUIR_TITULAR?.trim() ||
47:   'https://n8n.saintsolution.com.br/webhook/associado-excluir-titular';
48: 
49: const CHAVE_SESSAO = 'associado_sessao';
50: const CHAVE_TOKEN = 'associado_token_sessao';
51: 
52: type SessaoAssociado = {
53:   token_sessao: string;
54:   token_expira?: string;
55:   tipo_usuario?: string;
56:   cpf_assoc?: string;
342:     const salva = sessionStorage.getItem(CHAVE_SESSAO);
343:     const tokenSeparado = sessionStorage.getItem(CHAVE_TOKEN);
344: 
345:     if (!salva && !tokenSeparado) return null;
346: 
347:     const dados = salva ? (JSON.parse(salva) as SessaoAssociado) : null;
348:     const token = texto(dados?.token_sessao || tokenSeparado);
349: 
362:   sessionStorage.removeItem(CHAVE_SESSAO);
363:   sessionStorage.removeItem(CHAVE_TOKEN);
364: }
365: 
366: export default function AssociadoDashboard() {
367:   const navigate = useNavigate();
368:   const [sessao, setSessao] = useState<SessaoAssociado | null>(() =>
369:     lerSessao()
```

**B/src/pages/Colaborador.tsx**

```text
25:   import.meta.env
26:     .VITE_WEBHOOK_COLABORADOR_LOGIN ||
27:   'https://n8n.saintsolution.com.br/webhook/colaborador-login';
28: 
29: const WEBHOOK_RECUPERAR_SENHA =
30:   import.meta.env
31:     .VITE_WEBHOOK_COLABORADOR_RECUPERAR_SENHA ||
32:   'https://n8n.saintsolution.com.br/webhook/colaborador-recuperar-senha';
33: 
34: function somenteNumeros(
35:   valor: string
36: ) {
361:       sessionStorage.removeItem(
362:         'colaborador'
363:       );
364: 
365:       sessionStorage.removeItem(
366:         'colaborador_dados'
367:       );
368: 
369:       sessionStorage.removeItem(
370:         'colaborador_token'
371:       );
372: 
373:       /*
374:        * Chave principal utilizada
375:        * pelo dashboard.
377:       sessionStorage.setItem(
378:         'colaborador',
379:         JSON.stringify(
380:           resposta.colaborador
381:         )
382:       );
383: 
388:       sessionStorage.setItem(
389:         'colaborador_dados',
390:         JSON.stringify(
391:           resposta.colaborador
392:         )
393:       );
394: 
396:         sessionStorage.setItem(
397:           'colaborador_token',
398:           resposta.token
399:         );
400:       }
401: 
402:       setMensagem(
414:       sessionStorage.removeItem(
415:         'colaborador'
416:       );
417: 
418:       sessionStorage.removeItem(
419:         'colaborador_dados'
420:       );
421: 
422:       sessionStorage.removeItem(
423:         'colaborador_token'
424:       );
425: 
426:       setErro(
427:         erroRecebido instanceof Error
428:           ? erroRecebido.message
```

**B/src/pages/ColaboradorDashboard.tsx**

```text
69:   import.meta.env
70: 
71:     .VITE_WEBHOOK_COLABORADOR_DASHBOARD
72: 
73:     ?.trim() ||
74: 
75:   'https://n8n.saintsolution.com.br/webhook/colaborador-dashboard';
81:   import.meta.env
82: 
83:     .VITE_WEBHOOK_COLABORADOR_ATUALIZAR_DADOS
84: 
85:     ?.trim() ||
86: 
87:   'https://n8n.saintsolution.com.br/webhook/colaborador-atualiza-dados';
311:   sessionStorage.removeItem(
312: 
313:     'colaborador'
314: 
315:   );
316: 
317: 
319:   sessionStorage.removeItem(
320: 
321:     'colaborador_dados'
322: 
323:   );
324: 
325: 
327:   sessionStorage.removeItem(
328: 
329:     'colaborador_token'
330: 
331:   );
332: 
333: }
778:       sessionStorage.getItem(
779: 
780:         'colaborador'
781: 
782:       );
783: 
784: 
788:       sessionStorage.getItem(
789: 
790:         'colaborador_token'
791: 
792:       );
793: 
794: 
924:         sessionStorage.getItem(
925: 
926:           'colaborador_token'
927: 
928:         );
929: 
930: 
1666:       sessionStorage.getItem(
1667: 
1668:         'colaborador_token'
1669: 
1670:       );
1671: 
1672: 
2160:       sessionStorage.setItem(
2161: 
2162:         'colaborador',
2163: 
2164:         JSON.stringify(
2165: 
2166:           colaboradorAtualizado
2174:       sessionStorage.setItem(
2175: 
2176:         'colaborador_dados',
2177: 
2178:         JSON.stringify(
2179: 
2180:           colaboradorAtualizado
```

**B/src/pages/CompletarAdesao.tsx**

```text
26:   import.meta.env.VITE_WEBHOOK_BUSCAR_ADESAO_PENDENTE?.trim() ||
27:   "https://n8n.saintsolution.com.br/webhook/consultar-adesao-pendente";
28: 
29: const WEBHOOK_COMPLEMENTAR_ADESAO =
30:   import.meta.env.VITE_WEBHOOK_COMPLEMENTAR_ADESAO_PENDENTE?.trim() ||
31:   "https://n8n.saintsolution.com.br/webhook/complementar-adesao-pendente";
32: 
33: type Titular = {
34:   cpf_titular?: string;
35:   nome_titular?: string;
36:   nasc_titular?: string;
```

**B/src/pages/CriarSenha.tsx**

```text
47:     parametros.get('token') ?? ''
48:   ).trim();
49: }
50: 
51: function validarSenha(
52:   senha: string
53: ) {
```

**B/src/pages/FormColetivo.tsx**

```text
49: const CHAVE_INDICADOR = "indicador_colab";
50: const COOKIE_INDICADOR = "indicador_consultoque";
51: const CHAVE_TRANSFERENCIA_COLETIVO = "consultoque_transferencia_coletivo";
52: 
53: type TransferenciaPessoal = {
54:   criado_em: string;
55:   cod_colab: string;
56:   nome_assoc: string;
57:   cpf_assoc: string;
75:   const cookie = document.cookie
76:     .split(";")
77:     .map((item) => item.trim())
78:     .find((item) => item.startsWith(prefix));
79: 
80:   return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : null;
81: }
85:   const local = localStorage.getItem(CHAVE_INDICADOR);
86:   const codigo = String(cookie || local || "").trim();
87: 
88:   if (/^\d{4}$/.test(codigo)) {
89:     localStorage.setItem(CHAVE_INDICADOR, codigo);
90: 
91:     return codigo;
92:   }
93: 
94:   return "0001";
95: }
241:     const salvo = sessionStorage.getItem(CHAVE_TRANSFERENCIA_COLETIVO);
242:     if (!salvo) return;
243: 
244:     try {
245:       const dados = JSON.parse(salvo) as TransferenciaPessoal;
246:       const criadoEm = new Date(dados.criado_em).getTime();
247:       if (!Number.isFinite(criadoEm) || Date.now() - criadoEm > 30 * 60 * 1000)
272:       sessionStorage.removeItem(CHAVE_TRANSFERENCIA_COLETIVO);
273:     }
274:   }, []);
275: 
276:   const breakdown = useMemo(
277:     () => calculatePrice(holders.map(toHolderEntry)),
278:     [holders],
```

**B/src/pages/FormPessoal.tsx**

```text
41: const CHAVE_INDICADOR = "indicador_colab";
42: const COOKIE_INDICADOR = "indicador_consultoque";
43: const CHAVE_TRANSFERENCIA_COLETIVO = "consultoque_transferencia_coletivo";
44: 
45: function normalizarNome(valor: string): string {
46:   return valor
47:     .normalize("NFD")
48:     .replace(/[\u0300-\u036f]/g, "")
49:     .toUpperCase();
54:   const cookie = document.cookie
55:     .split(";")
56:     .map((item) => item.trim())
57:     .find((item) => item.startsWith(prefix));
58: 
59:   return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : null;
60: }
64:   const local = localStorage.getItem(CHAVE_INDICADOR);
65:   const codigo = String(cookie || local || "").trim();
66: 
67:   if (/^\d{4}$/.test(codigo)) {
68:     localStorage.setItem(CHAVE_INDICADOR, codigo);
69: 
70:     return codigo;
71:   }
72: 
73:   return "0001";
74: }
373:     sessionStorage.setItem(
374:       CHAVE_TRANSFERENCIA_COLETIVO,
375:       JSON.stringify({
376:         criado_em: new Date().toISOString(),
377:         cod_colab: getCodColab(),
378:         nome_assoc: normalizarNome(responsibleName.trim()),
379:         cpf_assoc: onlyDigits(responsibleCpf),
```

**B/src/pages/MaterialPromocional.tsx**

```text
156:     sessionStorage.getItem(
157:       'colaborador'
158:     );
159: 
160:   if (!sessao) {
161:     return null;
162:   }
```

**B/src/pages/MontarFolder.tsx**

```text
140:     sessionStorage.getItem(
141:       'colaborador'
142:     );
143: 
144:   if (!sessao) {
145:     return null;
146:   }
242:     parametros.get(
243:       'modelo'
244:     ) || '';
245: 
246:   const panfleto =
247:     panfletos.find(
248:       (item) =>
557:       sessionStorage.setItem(
558:         'arte_personalizada',
559:         artePersonalizada
560:       );
561: 
562:       sessionStorage.setItem(
563:         'arte_modelo',
564:         panfleto.id
565:       );
566: 
567:       window.location.href =
568:         `/solicitar-impressos?modelo=${encodeURIComponent(
```

**B/src/pages/PanfletosPromocionais.tsx**

```text
105:     sessionStorage.getItem(
106:       'colaborador'
107:     );
108: 
109:   if (!sessao) {
110:     return null;
111:   }
```

**B/src/pages/Play.tsx**

```text
66: const CHAVE_INDICADOR =
67:   'indicador_colab';
68: 
69: const COOKIE_INDICADOR =
70:   'indicador_colab';
71: 
72: const SEGUNDOS_ANTES_DO_FIM =
73:   7;
74: 
75: const videosPromocionais:
170:   localStorage.setItem(
171:     CHAVE_INDICADOR,
172:     codigo
173:   );
174: 
175:   /*
176:    * Mantemos também a chave antiga
179:   localStorage.setItem(
180:     'referenciador_id',
181:     codigo
182:   );
183: 
184:   const segundos =
185:     60 *
190:   document.cookie =
191:     `${COOKIE_INDICADOR}=${encodeURIComponent(
192:       codigo
193:     )}; ` +
194:     `Max-Age=${segundos}; ` +
195:     'Path=/; ' +
196:     'SameSite=Lax; ' +
203:   document.cookie =
204:     `referenciador_id=${encodeURIComponent(
205:       codigo
206:     )}; ` +
207:     `Max-Age=${segundos}; ` +
208:     'Path=/; ' +
209:     'SameSite=Lax; ' +
261:         localStorage.getItem(
262:           CHAVE_INDICADOR
263:         )
264:       );
265: 
266:     const codigo =
267:       codigoDoLink ||
```

**B/src/pages/SejaColaborador.tsx**

```text
160:   const cookie = document.cookie
161:     .split(";")
162:     .map((item) => item.trim())
163:     .find((item) => item.startsWith(prefixo));
164: 
165:   if (!cookie) {
166:     return "";
173:   const indicadorLocal = localStorage.getItem("indicador_colab");
174: 
175:   const indicadorCookie = buscarCookie("indicador_consultoque");
176: 
177:   return (
178:     normalizarCodigo(indicadorLocal) ||
179:     normalizarCodigo(indicadorCookie) ||
185:   localStorage.setItem("indicador_colab", codigo);
186: 
187:   const dias = 30;
188:   const segundos = dias * 24 * 60 * 60;
189: 
190:   const partesCookie = [
191:     `indicador_consultoque=${encodeURIComponent(codigo)}`,
206:   document.cookie = partesCookie.join("; ");
207: }
208: 
209: export default function SejaColaborador() {
210:   const { indicador } = useParams();
211: 
212:   const [formulario, setFormulario] =
213:     useState<FormularioColaborador>(formularioInicial);
214: 
215:   const [enviando, setEnviando] = useState(false);
216: 
```

**B/src/pages/SolicitarImpressos.tsx**

```text
78:       sessionStorage.getItem('colaborador');
79: 
80:     if (!sessao) {
81:       return null;
82:     }
83: 
84:     const colaborador =
111:   const modeloId = params.get('modelo') || '';
112: 
113:   const panfleto = panfletos.find(
114:     (item) => item.id === modeloId
115:   );
116: 
117:   const codColab =
125:     sessionStorage.getItem('arte_modelo') === modeloId
126:       ? sessionStorage.getItem('arte_personalizada') || ''
127:       : '';
128: 
129:   const [enviando, setEnviando] = useState(false);
130:   const [pedidoEnviado, setPedidoEnviado] = useState(false);
131:   const [numeroPedido, setNumeroPedido] = useState('');
132:   const [artePersonalizada, setArtePersonalizada] =
208:       sessionStorage.setItem(
209:         'arte_personalizada',
210:         novaArte
211:       );
212:       sessionStorage.setItem('arte_modelo', panfleto.id);
213: 
214:       setArtePersonalizada(novaArte);
215:       setPreparandoArte(false);
216:     };
217: 
218:     imagemBase.onerror = () => {
388:       sessionStorage.removeItem('arte_personalizada');
389:       sessionStorage.removeItem('arte_modelo');
390: 
391:       window.scrollTo({
392:         top: 0,
393:         behavior: 'smooth',
394:       });
395:     } catch (error) {
```

## Apêndice F — Colisões de assets públicos

Comparação binária por SHA-256, sem modificação dos originais.

| Caminho relativo | Comparação A/B |
|---|---|
| public/_redirects | Idêntico |
| public/banner_cel.png | Idêntico |
| public/banner_desk.png | Idêntico |
| public/consultoque_logo_fundo_branco_final.png | Idêntico |
| public/logo.png | Idêntico |
| public/logo_x.png | Idêntico |
| public/mediconocel.png | Idêntico |
| public/vendedor.png | Idêntico |
