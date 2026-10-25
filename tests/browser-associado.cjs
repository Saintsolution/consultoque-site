const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:5173';
const artifacts = process.env.TEST_ARTIFACTS || require('node:os').tmpdir();
let browser;
(async () => {
  browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
    ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}) });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const requests = [];
  const errors = [];
  let statusDashboard = 200;
  let pago = true;
  let envelope = false;
  let pausarCpf = false;
  let liberarCpf;
  let liberarInclusao;
  let titularExcluido = false;
  const dashboard = () => ({
    sucesso: true, autenticado: true,
    associado: { nome_assoc: 'PESSOA SINTETICA', cpf_assoc: '52998224725', nasc_assoc: '02/01/1990', email_assoc: 'teste@example.invalid', tel_assoc: '21900000000' },
    contrato: { num_contrato: 'TESTE0001', qtd_individual: 1, qtd_familiar: 0, vl_individual: 33, vl_familiar: 0, vl_total: 33, dia_vencimento: 10, status_pagamento: pago ? 'PAGO' : 'VENCIDO' },
    cobranca: { vl_cobranca: 33, status_pagamento: pago ? 'PAGO' : 'VENCIDO', dt_cliente_pagou: '10/10/2026' },
    titulares: titularExcluido ? [] : [{ cpf_titular: '12345678909', nome_titular: 'TITULAR SINTETICO', nasc_titular: '02/01/1990', email_titular: 'titular@example.invalid', tel_titular: '21900000000', cod_plano: '2878', status_titular: 'ativo' }],
  });
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.hostname === '127.0.0.1') return route.continue();
    if (url.hostname !== 'n8n.saintsolution.com.br') return route.abort();
    const endpoint = url.pathname.split('/').pop();
    const body = route.request().postDataJSON();
    requests.push({ endpoint, body, headers: route.request().headers() });
    let data;
    let status = 200;
    switch (endpoint) {
      case 'associado-login':
        data = { sucesso: true, autenticado: true, token_sessao: 'token-associado-sintetico', token_expira: '2099-01-01T00:00:00Z', cpf_assoc: body.cpf_assoc, nome_assoc: 'PESSOA SINTETICA' };
        break;
      case 'associado-dashboard':
        status = statusDashboard;
        data = status === 200 ? (envelope ? [{ json: dashboard() }] : dashboard()) : { sucesso: false, autenticado: false };
        break;
      case 'validar-cpf-cadastro':
        if (pausarCpf) await new Promise(resolve => { liberarCpf = resolve; });
        data = { sucesso: true, cpf_validado: true, cpf: body.cpf, nome: 'TITULAR NOVO SINTETICO', nascimento: '02/01/1990', consulta_id: 'consulta-sintetica' };
        break;
      case 'associado-editar-dados': data = { sucesso: true }; break;
      case 'associado-incluir-titular':
        await new Promise(resolve => { liberarInclusao = resolve; });
        data = { sucesso: true, mensagem: 'Inclusão SIMULADA', valor: 11, vencimento: '30/10/2026', url_pagamento: 'https://example.invalid/inclusao' };
        break;
      case 'associado-excluir-titular': titularExcluido = true; data = { sucesso: true }; break;
      default: throw new Error(`Endpoint não simulado: ${endpoint}`);
    }
    return route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(data) });
  });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  page.on('pageerror', error => errors.push(String(error)));
  const login = async () => {
    await page.goto(base + '/associado');
    await page.locator('#assocCpf').fill('52998224725');
    await page.locator('#assocPassword').fill('Sintetica123!');
    const consultaInicial = page.waitForResponse(r => r.url().endsWith('/associado-dashboard'));
    await page.getByRole('button', { name: 'Entrar', exact: true }).click();
    await consultaInicial;
    await page.waitForURL('**/associado/dashboard');
    await page.getByRole('heading', { name: 'Olá, PESSOA', exact: true }).waitFor();
  };
  await page.goto(base + '/dashboard');
  await page.getByRole('heading', { name: 'Sessão não encontrada', exact: true }).waitFor();
  assert.equal(requests.length, 0, 'Não consultar backend sem sessão');
  await login();
  const consulta = requests.find(item => item.endpoint === 'associado-dashboard');
  assert.deepEqual(consulta.body, { cpf_assoc: '52998224725', token_sessao: 'token-associado-sintetico' });
  assert.equal(consulta.headers['x-associado-token'], 'token-associado-sintetico');

  await page.getByRole('button', { name: 'Editar', exact: true }).click();
  await page.locator('#edicao-email').fill('EDITADO@EXAMPLE.INVALID');
  await page.locator('#edicao-telefone').fill('21911111111');
  await page.getByRole('button', { name: 'Salvar alterações', exact: true }).click();
  await page.getByRole('dialog', { name: 'Editar meus dados' }).waitFor({ state: 'hidden' });
  const edicao = requests.find(item => item.endpoint === 'associado-editar-dados');
  assert.deepEqual(edicao.body, { alvo_edicao: 'ASSOCIADO', email: 'editado@example.invalid', telefone: '21911111111' });
  assert.equal(edicao.headers['x-associado-token'], 'token-associado-sintetico');

  await page.getByRole('button').filter({ hasText: 'TITULAR SINTETICO' }).click();
  await page.getByRole('button', { name: 'Editar dados', exact: true }).click();
  await page.locator('#edicao-email').fill('titular-editado@example.invalid');
  await page.locator('#edicao-telefone').fill('21933333333');
  await page.getByRole('button', { name: 'Salvar alterações', exact: true }).click();
  await page.getByRole('dialog', { name: 'Editar dados de TITULAR SINTETICO' }).waitFor({ state: 'hidden' });
  const edicaoTitular = requests.filter(item => item.endpoint === 'associado-editar-dados').at(-1);
  assert.deepEqual(edicaoTitular.body, { alvo_edicao: 'TITULAR', cpf_titular: '12345678909', email: 'titular-editado@example.invalid', telefone: '21933333333' });
  assert.equal(edicaoTitular.headers['x-associado-token'], 'token-associado-sintetico');
  await page.getByRole('button').filter({ hasText: 'TITULAR SINTETICO' }).click();

  await page.getByRole('button', { name: 'Incluir titular', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Incluir titular', exact: true });
  const inputs = dialog.locator('input');
  const cpf = inputs.nth(1);
  const bloqueados = async () => {
    for (const index of [0, 2, 3, 4]) assert.equal(await inputs.nth(index).isDisabled(), true);
    assert.equal(await dialog.locator('select').isDisabled(), true);
    assert.equal(await dialog.getByRole('button', { name: 'Gerar boleto de inclusão', exact: true }).isDisabled(), true);
  };
  await dialog.getByText('Informe e valide o CPF para liberar os demais campos.', { exact: true }).waitFor();
  await bloqueados();
  assert.equal(await cpf.getAttribute('aria-describedby'), 'orientacao-cpf-inclusao');
  pausarCpf = true;
  await cpf.fill('52998224725');
  const consultaPendente = page.waitForRequest(r => r.url().endsWith('/validar-cpf-cadastro'));
  const respostaPendente = page.waitForResponse(r => r.url().endsWith('/validar-cpf-cadastro'));
  await dialog.getByRole('button', { name: 'Validar CPF', exact: true }).click();
  await consultaPendente;
  await bloqueados();
  // Mudar o CPF invalida a consulta anterior; o retorno atrasado não libera dados incorretos.
  await cpf.fill('11144477735');
  liberarCpf();
  await respostaPendente;
  await bloqueados();
  assert.equal(await inputs.nth(0).inputValue(), '');
  pausarCpf = false;
  await dialog.getByRole('button', { name: 'Validar CPF', exact: true }).click();
  await dialog.getByText('CPF validado.', { exact: true }).waitFor();
  for (const index of [0, 2, 3, 4]) assert.equal(await inputs.nth(index).isEnabled(), true);
  assert.equal(await dialog.locator('select').isEnabled(), true);
  await inputs.nth(3).fill('novo@example.invalid');
  await inputs.nth(4).fill('21922222222');
  const inclusaoPendente = page.waitForRequest(r => r.url().endsWith('/associado-incluir-titular'));
  await dialog.getByRole('button', { name: 'Gerar boleto de inclusão', exact: true }).click();
  await inclusaoPendente;
  for (const index of [0, 1, 2, 3, 4]) assert.equal(await inputs.nth(index).isDisabled(), true);
  liberarInclusao();
  await dialog.getByRole('link', { name: 'Abrir boleto', exact: true }).waitFor();
  const inclusao = requests.find(item => item.endpoint === 'associado-incluir-titular');
  assert.deepEqual(inclusao.body, { nome_titular: 'TITULAR NOVO SINTETICO', cpf_titular: '11144477735', nasc_titular: '02/01/1990', email_titular: 'novo@example.invalid', tel_titular: '21922222222', cod_plano: '2878' });
  assert.equal(inclusao.headers['x-associado-token'], 'token-associado-sintetico');
  await dialog.getByRole('button', { name: 'Fechar', exact: true }).click();

  await page.getByRole('button').filter({ hasText: 'TITULAR SINTETICO' }).click();
  await page.getByRole('button', { name: 'Excluir titular', exact: true }).click();
  await page.getByRole('dialog', { name: 'Excluir titular', exact: true }).getByRole('button', { name: 'Confirmar exclusão', exact: true }).click();
  await page.getByRole('dialog', { name: 'Excluir titular', exact: true }).waitFor({ state: 'hidden' });
  const exclusao = requests.find(item => item.endpoint === 'associado-excluir-titular');
  assert.deepEqual(exclusao.body, { cpf_titular: '12345678909' });
  assert.equal(exclusao.headers['x-associado-token'], 'token-associado-sintetico');

  pago = false;
  envelope = true;
  const consultaInadimplencia = page.waitForResponse(r => r.url().endsWith('/associado-dashboard'));
  await page.getByRole('button', { name: 'Atualizar', exact: true }).click();
  await consultaInadimplencia;
  await page.waitForFunction(() => [...document.querySelectorAll('button')].some(b => b.textContent.includes('Incluir titular') && b.disabled));
  for (const width of [360, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `Overflow associado ${width}`);
  }
  fs.mkdirSync(artifacts, { recursive: true });
  await page.screenshot({ path: path.join(artifacts, 'consultoque-associado.png'), fullPage: true });
  for (const status of [401, 403]) {
    statusDashboard = status;
    await page.getByRole('button', { name: 'Atualizar', exact: true }).click();
    await page.waitForURL('**/associado');
    assert.equal(await page.evaluate(() => sessionStorage.getItem('associado_token_sessao')), null);
    assert.equal(await page.evaluate(() => sessionStorage.getItem('associado_sessao')), null);
    statusDashboard = 200;
    pago = true;
    await login();
  }
  await page.getByRole('button', { name: 'Sair', exact: true }).click();
  await page.waitForURL('**/associado');
  assert.equal(await page.evaluate(() => sessionStorage.getItem('associado_token_sessao')), null);
  assert.deepEqual(errors, []);
  fs.writeFileSync(path.join(artifacts, 'consultoque-associado-results.json'), JSON.stringify({ success: true, requests, errors }, null, 2));
  console.log('PASS: associado — login, consulta, edição, bloqueio CPF, consulta atrasada, inclusão/boleto, exclusão, inadimplência, envelopes, 401/403, logout, 4 larguras. Integrações simuladas.');
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => { await browser?.close(); });
