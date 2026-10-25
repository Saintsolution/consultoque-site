const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const artifacts = process.env.TEST_ARTIFACTS || require('node:os').tmpdir();
fs.mkdirSync(artifacts,{recursive:true});
let browser;
(async () => {
 browser = await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {})});
 const context = await browser.newContext({viewport:{width:1280,height:900}});
 const base=process.env.TEST_BASE_URL || 'http://127.0.0.1:5173';
 const requests=[]; const errors=[];
 await context.route('**/*',async route=>{
  const url=new URL(route.request().url());
  if(url.hostname==='127.0.0.1') return route.continue();
  if(url.hostname==='n8n.saintsolution.com.br') {
   const body=route.request().postDataJSON();requests.push({url:url.pathname,body,headers:route.request().headers()});
   let data={}; let status=200;
   if(url.pathname.endsWith('resolver-referencia-publica')) data={encontrado:true,cod_colab:'0042'};
   else if(url.pathname.endsWith('validar-cpf-cadastro')) data={sucesso:true,cpf_validado:true,maior_idade:true,cpf:body.cpf,nome:'PESSOA SINTETICA',nascimento:'02/01/1990',consulta_id:'mock-cpf',origem:body.origem};
   else if(url.pathname.endsWith('coletivo-empresarial')) data={status:'sucesso',url_pagamento:'https://example.invalid/boleto-simulado',message:'SIMULADO',email:'teste@example.invalid'};
   else if(url.pathname.endsWith('associado-login')) data={sucesso:true,autenticado:true,token_sessao:'token-sintetico',cpf_assoc:body.cpf_assoc};
   else if(url.pathname.endsWith('consultar-adesao-pendente')) data={sucesso:true,token_complemento:'complemento-sintetico',contrato:{num_contrato:'TESTE0001',vl_total:33,qtd_individual:1,qtd_familiar:0},associado:{cpf_assoc:body.cpf_assoc,nome_assoc:'PESSOA SINTETICA'},titulares:[{cpf_titular:'11144477735',nome_titular:'TITULAR SINTETICO',cod_plano:'2878'}]};
   else if(url.pathname.endsWith('complementar-adesao-pendente')) data={sucesso:true,mensagem:'Complemento SIMULADO',url_pagamento:'https://example.invalid/complemento'};
   else if(url.pathname.endsWith('colaborador-login')) data={sucesso:true,autenticado:true,token:'token-colaborador-sintetico',colaborador:{cod_colab:'0042',nome_colab:'COLABORADOR SINTETICO'}};
   else if(url.pathname.endsWith('admin-login')) data={autorizado:true,token_sessao:'token-admin-sintetico',expira_sessao:'2099-01-01T00:00:00Z',admin:{nome:'ADMIN SINTETICO'}};
   else if(url.pathname.endsWith('admin-dashboard')) {status=401;data={autorizado:false};}
   else if(url.pathname.endsWith('colaborador-dashboard')) {status=403;data={sucesso:false};}
   else if(url.pathname.endsWith('recuperar-senha')) data={sucesso:true,mensagem:'Recuperação SIMULADA'};
   else if(url.pathname.endsWith('criar-senha')) data={sucesso:true,mensagem:'Senha SIMULADA',tipo_usuario:'ASSOCIADO'};
   else data={sucesso:false,mensagem:'SIMULADO'};
   return route.fulfill({status,contentType:'application/json',body:JSON.stringify(data),headers:{'access-control-allow-origin':'*'}});
  }
  return route.abort();
 });
 const page=await context.newPage();page.setDefaultTimeout(15000);page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(base+'/');await page.getByText('ATENDEMOS EMPRESAS E PLANOS COLETIVOS',{exact:true}).waitFor();
 await page.screenshot({path:path.join(artifacts,'consultoque-home.png'),fullPage:true});
 await page.getByRole('link',{name:'SAIBA MAIS',exact:true}).click();await page.waitForURL('**/coletivo');
 await page.screenshot({path:path.join(artifacts,'consultoque-coletivo.png'),fullPage:true});
 for(const width of [360,390,768,1280]) {
  await page.setViewportSize({width,height:900});
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
  if(overflow)throw Error('Overflow /coletivo '+width);
 }
 for(const path of ['/formpessoal','/form-individual','/form-familiar','/formcoletivo','/form-coletivo']){
  await page.goto(base+path+'?ref=ana42&modelo=teste#secao');
  await page.waitForURL('**/contratar?ref=ana42&modelo=teste#secao');
  await page.getByRole('heading',{name:'Monte seu plano ConsulToque'}).waitFor();
 }
 if(requests.some(r=>r.url.endsWith('coletivo-empresarial')))throw Error('Alias enviou contratação automaticamente');
 await page.setViewportSize({width:1280,height:900});
 await page.goto(base+'/contratar?ref=ana42');
 await page.locator('#responsibleCpf').fill('52998224725');
 await page.getByRole('button',{name:'Validar CPF',exact:true}).click();
 await page.locator('#responsibleEmail').fill('teste@example.invalid');
 await page.locator('#responsiblePhone').fill('21900000000');
 await page.getByRole('button',{name:'Salvar responsável',exact:true}).click();
 await page.getByRole('button',{name:'Adicionar titular',exact:true}).click();
 await page.getByPlaceholder('000.000.000-00').fill('52998224725');
 await page.getByRole('button',{name:'Validar CPF',exact:true}).click();
 await page.getByRole('button',{name:'Salvar titular',exact:true}).click();
 await page.getByRole('button',{name:'Emitir boleto e concluir',exact:true}).click();
 const confirmar=page.getByRole('button',{name:'Confirmar contratação',exact:true});
 if(await confirmar.isEnabled())throw Error('Contratação sem aceite');
 await page.getByRole('checkbox').last().check();
 await confirmar.click();
 await page.getByRole('heading',{name:'Boleto emitido com sucesso!'}).waitFor();
 const vendas=requests.filter(r=>r.url.endsWith('coletivo-empresarial'));
 if(vendas.length!==1 || vendas[0].body.cod_colab!=='0042' || vendas[0].body.vl_total!==33)throw Error('Venda incorreta '+JSON.stringify(vendas));
 // References from promotional video and collaborator signup preserve attribution.
 await page.goto(base+'/play/crianca-noite/17');
 await page.waitForFunction(()=>localStorage.getItem('indicador_colab')==='0017');
 await page.goto(base+'/seja-colaborador/ana42');
 await page.waitForFunction(()=>localStorage.getItem('indicador_colab')==='0042');
 // Invalid explicit reference cannot expose a form using a previous person's code.
 await context.route('**/webhook/resolver-referencia-publica',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({encontrado:false})}));
 await page.goto(base+'/contratar?ref=inexistente');
 await page.getByRole('button',{name:'Tentar novamente'}).waitFor();
 if(await page.locator('#collective-form').count())throw Error('Formulário disponível com referência inválida');
 await context.unroute('**/webhook/resolver-referencia-publica');
 await page.goto(base+'/completar-adesao');
 await page.getByRole('heading').first().waitFor();
 await page.getByPlaceholder('000.000.000-00').fill('52998224725');
 await page.getByRole('button',{name:'Buscar adesão pendente'}).click();
 await page.getByText('TESTE0001',{exact:true}).waitFor();
 await page.getByRole('button',{name:'Adicionar',exact:true}).click();
 await page.getByPlaceholder('000.000.000-00').fill('52998224725');
 await page.getByRole('button',{name:'Validar CPF',exact:true}).click();
 await page.getByRole('button',{name:'Salvar titular',exact:true}).click();
 if(await page.getByRole('button',{name:'Atualizar adesão e boleto'}).isEnabled())throw Error('Complemento liberado antes da conferência');
 await page.getByRole('button',{name:'Conferir relação',exact:true}).click();
 await page.getByRole('button',{name:'Atualizar adesão e boleto'}).click();
 await page.getByRole('link',{name:'Abrir novo boleto',exact:true}).waitFor();
 const complemento=requests.find(r=>r.url.endsWith('complementar-adesao-pendente'));
 if(complemento.body.token_complemento!=='complemento-sintetico'||complemento.body.titulares_adicionados.length!==1)throw Error('Contrato de complemento alterado');

 await page.goto(base+'/colaborador/dashboard');
 await page.waitForURL('**/colaborador');
 await page.goto(base+'/admin-asaas?origem=antiga#painel');
 await page.waitForURL('**/admin?origem=antiga#painel');
 if(requests.some(r=>r.url.endsWith('admin-dashboard')))throw Error('Dashboard admin sem autenticação');
 await page.getByPlaceholder('ADM0001').fill('ADMTESTE');
 await page.getByPlaceholder('Sua senha administrativa').fill('Sintetica123!');
 const consultaAdmin=page.waitForResponse(r=>r.url().endsWith('/admin-dashboard'));
 await page.getByRole('button',{name:'Entrar',exact:true}).click();
 await consultaAdmin;
 await page.waitForFunction(()=>!sessionStorage.getItem('consultoque_admin_token'));
 await page.getByPlaceholder('ADM0001').waitFor();
 const admin=requests.find(r=>r.url.endsWith('admin-dashboard'));
 if(admin.headers['x-admin-token']!=='token-admin-sintetico')throw Error('Header admin alterado');
 await page.goto(base+'/colaborador');
 await page.locator('#cpf-colaborador').fill('52998224725');
 await page.getByRole('button',{name:'Primeiro acesso ou esqueci minha senha',exact:true}).click();
 await page.getByText('Recuperação SIMULADA',{exact:true}).waitFor();
 await page.locator('#senha-colaborador').fill('Sintetica123!');
 const consultaColaborador=page.waitForResponse(r=>r.url().endsWith('/colaborador-dashboard'));
 await page.getByRole('button',{name:'Entrar',exact:true}).click();
 await consultaColaborador;
 await page.waitForFunction(()=>!sessionStorage.getItem('colaborador_token'));
 await page.locator('#cpf-colaborador').waitFor();
 const colaborador=requests.find(r=>r.url.endsWith('colaborador-dashboard'));
 if(colaborador.headers['x-colaborador-token']!=='token-colaborador-sintetico')throw Error('Header colaborador alterado');
 await page.goto(base+'/criar-senha?token=token-sintetico-com-mais-de-vinte-caracteres');
 await page.locator('#senha').fill('abcdefgh');
 await page.locator('#confirmar-senha').fill('abcdefgh');
 await page.getByRole('button',{name:'Criar minha senha',exact:true}).click();
 if(requests.some(r=>r.url.endsWith('criar-senha')))throw Error('Senha fraca enviada');
 await page.locator('#senha').fill('Sintetica123!');
 await page.locator('#confirmar-senha').fill('Sintetica123!');
 await page.getByRole('button',{name:'Criar minha senha',exact:true}).click();
 await page.getByText('Senha SIMULADA',{exact:true}).waitFor();
 await page.goto(base+'/material-promocional');
 await page.evaluate(()=>sessionStorage.setItem('colaborador',JSON.stringify({cod_colab:'0042',nome_colab:'COLABORADOR SINTETICO',apelido_referencia:'ana42'})));
 for(const rota of ['/material-promocional','/panfletos-promocionais','/montar-folder?modelo=folder_consultoque_33_reais']) {
  await page.goto(base+rota);
  await page.locator('.coletivo-layout').waitFor();
  if(rota.startsWith('/montar-folder')) {
   await page.getByRole('heading',{name:'Consultoque 33 Reais',exact:true}).waitFor();
   if(await page.locator('canvas').count()<2)throw Error('Arte ou QR Code ausente');
  }
 }

 for(const width of [360,390,768,1280]) {
  await page.setViewportSize({width,height:900});
  await page.goto(base+'/contratar');
  await page.locator('#collective-form').waitFor();
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Overflow formulário '+width);
 }
 if(errors.length)throw Error('Erros JS '+errors.join('\n'));
 fs.writeFileSync(path.join(artifacts,'consultoque-browser-results.json'),JSON.stringify({requests,errors,success:true}));
 console.log('PASS: Home, coletivo, 5 aliases, PF + aceite + boleto simulado, indicação/vídeo/cadastro, referência inválida, complemento enviado, admin/colaborador com token e expiração, recuperação, política de senha, materiais, 4 larguras.');

 await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{await browser?.close()});
