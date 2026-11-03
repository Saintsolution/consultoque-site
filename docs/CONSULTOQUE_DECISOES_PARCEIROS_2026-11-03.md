# CONSULTOQUE — DECISÕES FECHADAS DO SISTEMA DE PARCEIROS

**Data:** 03/11/2026
**Finalidade:** documento de referência para ChatGPT, Codex e futuros programadores. Ler antes de propor ou executar mudanças no módulo de parceiros. Não reabrir decisões aprovadas sem um problema concreto ou nova orientação do responsável.

## 1. Contexto e objetivo

O ConsulToque **já funciona e vende** em produção. Usa **React (frontend), n8n, Google Sheets e Asaas**. Os processos de contratos, pagamentos e comissões já existiam antes desta implementação. **Não estamos criando um novo sistema de vendas, nem migrando a infraestrutura.**

O trabalho atual é incorporar **um canal reutilizável de páginas comerciais personalizadas para qualquer quantidade de parceiros**, usando o sistema compartilhado de contratação e os mesmos workflows.

`adesaodigital` é o **apelido público do colaborador 0002, que pertence ao irmão do responsável**. É **o primeiro exemplo**, não um sistema separado, um tipo especial de fluxo nem o objetivo exclusivo da implementação.

## 2. Cadastro e operação cotidiana — decisão do responsável

Após a entrega, a rotina administrativa desejada é **somente**:

1. Receber o pedido de parceria e o logotipo.
2. No cadastro já existente do colaborador, preencher/manter seu código e apelido e marcar `PARCEIRO` na planilha.
3. Colocar o arquivo do logotipo na pasta pública do frontend com nome baseado no apelido (por exemplo, `adesaodigital.png`).
4. Fazer **um deploy normal para publicar a imagem**, se necessário.

A página deve surgir do **template compartilhado**, sem programar uma nova página, sem editar uma lista específica de identidades, sem pedir ao Codex/ChatGPT para cada parceiro. **O deploy para subir a imagem é aceito e esperado**; não confundir com exigência de deploy para adicionar código/configuração por parceiro.

O frontend atual ainda usa `src/app/identidadesParceiros.ts` para configurar identidade visual e imagens em `public/`. **Pendência pontual real:** retirar a necessidade de acrescentar manualmente cada parceiro ao arquivo de configuração, usando o cadastro/resolvedor já existente e uma regra genérica de localização do logotipo por apelido. Não criar painel administrativo, novo banco ou novo workflow só para isso. Verificar detalhes do fallback de imagem sem quebrar páginas existentes.

## 3. Regras comerciais aprovadas

- Colaborador tem **código numérico interno autoritativo** (`0002`) e pode ter **apelido público** (`adesaodigital`). `/0002` e `/adesaodigital` resolvem para o mesmo colaborador.
- O marcador `PARCEIRO` está no **cadastro do colaborador na planilha**, não é deduzido pelo nome da página nem autorizado pelo frontend.
- Colaborador `ATIVO` e marcado `PARCEIRO`: **R$30 individual / R$60 familiar desde o primeiro titular**.
- Colaborador padrão: **R$33 / R$66 abaixo de 10 titulares; R$30 / R$60 a partir de 10**.
- Filhos/descendentes de um parceiro não herdam automaticamente sua condição. Comissões, indicação, cookies, hierarquia e regras existentes são preservados.
- Usar **o mesmo FormColetivo**, os mesmos workflows de contratos e o mesmo Asaas.
- Operações de contratos já existentes devem respeitar a modalidade registrada no contrato, não reinterpretar o cadastro atual do colaborador.

## 4. Estado confirmado em 03/11/2026

- Resolvedor `CONSULTOQUE` publicado na versão `e2480af6-7c51-4239-954d-8a268944095e`. Checagens reais de leitura confirmaram `0002` e `adesaodigital` como o mesmo PARCEIRO; `0001` como PADRAO.
- Workflow `CONSULTOQUE Contratos e Adesoes`, ID `FMZ47k3ueOelyleu`: versão publicada `d789efe5-910c-4f63-bbfc-fd408cfd7818`.
- Rascunho preparado `f1cd0715-f7f2-48a3-9b98-96b84b8bae40`: **única alteração** `LIBERAR_ADESAO_PARCEIRO = false` para `true` no nó `Valida Modalidade e Valores da Adesão`. **AINDA NÃO PUBLICADO** conforme último relatório recebido.
- Frontend preparado localmente: a identidade visual agora é derivada do apelido retornado pelo cadastro, sem lista de parceiros em TypeScript. Esta atualização substitui a pendência descrita na seção 2. **Ainda não publicado.**
- A ativação do rascunho libera **todos os colaboradores ativos marcados PARCEIRO**, não só `0002`.
- Não houve nova cobrança real de homologação desta modalidade nesta etapa; o fluxo financeiro de produção preexistente já era utilizado para as vendas normais.

### Encerramento local do template

O resolvedor existente transforma o apelido em código. A consulta comercial verifica o cadastro pelo código; só apresenta o template para parceiro confirmado. O arquivo `public/<apelido-normalizado>.png` fornece o logo, e a ausência da imagem apresenta o apelido em texto. O nome textual é derivado do apelido: por exemplo, `novo-parceiro` aparece como `Novo Parceiro`; um apelido sem hífen não permite deduzir os espaços ou acentos do nome comercial. A autorização de preço continua no servidor, independente da imagem e da origem visual.

Rotina para o próximo parceiro, após a publicação desta entrega:

1. Conferir no cadastro existente um colaborador ativo com código e apelido público único, sem conflito com rotas do site; marcar `PARCEIRO` na coluna existente.
2. Salvar o logo PNG em `public`, nomeado exatamente como o apelido normalizado em minúsculas, sem acentos e com hífens no lugar de espaços: por exemplo, `public/novo-parceiro.png`. Confirmar que o nome corresponde ao apelido cadastrado. O acesso por código também usa esse logo.
3. Incluir a imagem no deploy normal do frontend. A imagem precisa ser publicada; copiá-la apenas no computador não a disponibiliza no site. Abrir o link do apelido e o do código para conferir a apresentação. Não é necessário editar a lista de identidades ou criar rota por parceiro.

Testes locais: build de produção, typecheck, 28 testes unitários e 132 verificações protegidas aprovados. Navegador sobre o bundle de produção com consultas e cobrança simuladas: piloto por apelido e código, referência direta e cookie; segundo parceiro fictício por apelido e código com imagem simulada; logo ausente; padrão; retorno e payload de R$30. O teste offline do workflow reconciliado validou as tabelas, incluindo R$30/R$60, sem execução real. A atualização de nome de arquivo e este teste não criam homologação financeira real.

O histórico do n8n foi novamente consultado: `d789efe5-910c-4f63-bbfc-fd408cfd7818` permanece publicada, e `f1cd0715-f7f2-48a3-9b98-96b84b8bae40` permanece em Current changes. O novo export privado do rascunho é idêntico ao aprovado (SHA-256 `df907d3f2a6fa9542b83d6dc41051bccd3c5b770fd49872998db8cea7cfe699b`); o diff documentado continua sendo apenas a constante. Não foi publicado nem executado.

Branch `dev/fundacao-mensuracao`, HEAD `0b7470a`; sem commit desta entrega. Há alterações locais de outras etapas e arquivos não rastreados: selecionar e revisar as dependências da entrega antes de um commit, sem incluir backups privados. Não presumir que todo o diff contra HEAD pertence a esta etapa. Publicações e commit dependem de autorização expressa. Após autorização: publicar frontend; conferir as páginas reais sem contratar; publicar o rascunho n8n; conferir o reconhecimento comercial. Uma contratação real requer autorização específica. Os riscos já registrados de reenvio, concorrência e divergência de valor permanecem.

## 5. Escopo da conclusão — SEM AMPLIAR

Finalizar o que está pendente, com mudança mínima:

1. Garantir página comercial genérica para parceiros por código/apelido, **sem entrada individual em `identidadesParceiros.ts`**; logotipo pode exigir copiar arquivo e fazer deploy.
2. Preservar o frontend já aprovado, FormColetivo e origem visual.
3. Publicar frontend e rascunho n8n **apenas com autorização expressa do responsável**; não executar cobrança real sem autorização específica.
4. Conferir o percurso do parceiro sem reabrir auditorias gerais dos sistemas já operacionais.

**Proibido ampliar automaticamente para:** PostgreSQL, Supabase, Redis, fila externa, novo banco, painel administrativo, sistema separado de adesão, reconstrução do Asaas, mudança da numeração de contratos, pró-rata, comissões, inclusões, exclusões ou mensalidades.

Os cenários simulados de duplicidade/reenvio/concorrência e divergência financeira ficaram documentados para **etapa futura**, não como obrigação de migrar infraestrutura antes deste lançamento. Não afirmar que estão eliminados.

## 6. Regras de trabalho para Codex e ChatGPT

- **Ler este memorial antes de orientar mudanças**; conferir estado atual no código e relatório mais recente antes de afirmar que algo já foi publicado.
- Não rediscutir decisões fechadas ou pedir novos testes extensos sem apresentar um defeito pontual reproduzível que afete esta entrega.
- Não confundir `adesaodigital` com produto novo: é apenas o parceiro de exemplo, colaborador `0002`.
- **O critério de pronto é cadastrar outros parceiros com planilha + arquivo do logo + deploy normal, sem escrever código específico por parceiro.**
- Antes de qualquer publicação, emissão real, commit ou push, solicitar autorização conforme a etapa e o escopo definido.
- Após cada avanço, atualizar apenas a seção de estado/handoff do repositório e preservar estas decisões.

## 7. Referências do projeto

- `docs/HANDOFF_CONSULTOQUE_2026-11-02.md`
- `docs/n8n-parceiro/reconciliado-11836b64/RASCUNHO_LIBERACAO_PARCEIRO.md`
- `docs/n8n-parceiro/reconciliado-11836b64/RESULTADO_PUBLICACAO_RESOLVEDOR.md`
- `docs/n8n-parceiro/reconciliado-11836b64/RESULTADO_PUBLICACAO_CONTRATOS.md`
- `docs/n8n-parceiro/reconciliado-11836b64/RESULTADO_ENSAIO_DURAVEL.md`

**Regra-mestra:** *ConsulToque já vende. O sistema de parceiros é só uma nova apresentação comercial e modalidade de preço no mecanismo existente. Para o próximo parceiro: cadastro na planilha, logotipo e deploy — sem reprogramar o site.*
