// Exercita o bundle de produção com endpoints externos simulados. Não emite cobrança.
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const fs = require('node:fs');

const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:5176';

function resposta(data, status = 200) {
  return { status, contentType: 'application/json', body: JSON.stringify(data) };
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE }
      : {}),
  });
  try {
    const context = await browser.newContext();
    const n8nNaoPrevisto = [];
    const vendas = [];
    await context.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.origin === base && url.pathname === '/novo-parceiro.png') {
        return route.fulfill({ contentType: 'image/png', body: fs.readFileSync('public/adesaodigital.png') });
      }
      if (url.origin === base && url.pathname === '/sem-logo.png') return route.abort();
      if (url.origin === base) return route.continue();
      if (url.pathname.endsWith('resolver-referencia-publica')) {
        const body = route.request().postDataJSON();
        const referencia = body.cod_colab ?? body.referencia;
        const piloto = ['0002', '2', 'adesaodigital'].includes(referencia);
        const segundo = ['0020', '20', 'novo-parceiro'].includes(referencia);
        const semLogo = ['0021', '21', 'sem-logo'].includes(referencia);
        const parceiro = piloto || segundo || semLogo;
        return route.fulfill(resposta({
          sucesso: true,
          encontrado: true,
          cod_colab: piloto ? '0002' : segundo ? '0020' : semLogo ? '0021' : '0001',
          status_colab: 'ATIVO',
          parceiro: parceiro ? 'PARCEIRO' : '',
          apelido_referencia: piloto ? 'adesaodigital' : segundo ? 'novo-parceiro' : semLogo ? 'sem-logo' : 'padrao',
        }));
      }
      if (url.pathname.endsWith('validar-cpf-cadastro')) {
        const body = route.request().postDataJSON();
        return route.fulfill(resposta({
          sucesso: true,
          cpf_validado: true,
          maior_idade: true,
          cpf: body.cpf,
          nome: 'PESSOA SINTETICA',
          nascimento: '02/01/1990',
          consulta_id: 'mock-producao',
          origem: body.origem,
        }));
      }
      if (url.pathname.endsWith('coletivo-empresarial')) {
        vendas.push(route.request().postDataJSON());
        return route.fulfill(resposta({
          status: 'sucesso',
          url_pagamento: 'https://example.invalid/boleto-simulado',
          email: 'teste@example.invalid',
        }));
      }
      if (url.hostname === 'n8n.saintsolution.com.br') n8nNaoPrevisto.push(url.pathname);
      return route.abort();
    });

    const page = await context.newPage();
    page.setDefaultTimeout(15000);
    const form = () => page.getByRole('heading', { name: 'Monte seu plano ConsulToque' }).waitFor();

    await page.goto(base + '/adesaodigital');
    await page.getByRole('button', { name: 'Quero o plano individual', exact: true }).waitFor();
    await page.getByRole('button', { name: 'Quero o plano individual', exact: true }).click();
    await form();
    assert.equal(new URL(page.url()).searchParams.get('origem_visual'), 'parceiro:adesaodigital');
    assert.equal(await page.getByRole('link', { name: 'Voltar ao início', exact: true }).getAttribute('href'), '/adesaodigital');
    assert.match(await page.getByText(/indicação 0002 · planos/).innerText(), /R\$ 30\/R\$ 60/);

    await page.getByRole('link', { name: 'Voltar ao início', exact: true }).click();
    await page.getByRole('button', { name: 'Quero o plano individual', exact: true }).waitFor();
    await page.goto(base + '/0002');
    await page.getByRole('button', { name: 'Quero o plano familiar', exact: true }).waitFor();

    await page.goto(base + '/contratar?ref=0002');
    await form();
    assert.match(await page.getByText(/indicação 0002 · planos/).innerText(), /R\$ 30\/R\$ 60/);

    await page.goto(base + '/novo-parceiro');
    await page.getByRole('button', { name: 'Quero o plano individual', exact: true }).waitFor();
    const logo = page.locator('.partner-primary-logo');
    assert.equal(await logo.getAttribute('src'), '/novo-parceiro.png');
    await page.waitForFunction(() => document.querySelector('.partner-primary-logo')?.naturalWidth > 0);
    await page.getByRole('button', { name: 'Quero o plano individual', exact: true }).click();
    await form();
    assert.equal(new URL(page.url()).searchParams.get('ref'), '0020');
    assert.equal(await page.getByRole('link', { name: 'Voltar ao início', exact: true }).getAttribute('href'), '/novo-parceiro');
    await page.goto(base + '/0020');
    await page.getByRole('button', { name: 'Quero o plano individual', exact: true }).waitFor();
    assert.equal(await page.locator('.partner-primary-logo').getAttribute('src'), '/novo-parceiro.png');

    await page.goto(base + '/sem-logo');
    await page.getByRole('button', { name: 'Quero o plano individual', exact: true }).waitFor();
    await page.locator('.partner-logo-frame strong').waitFor();
    assert.match(await page.locator('.partner-logo-frame strong').innerText(), /sem logo/i);

    await page.evaluate(() => localStorage.clear());
    await context.addCookies([{ name: 'indicador_consultoque', value: '0002', url: base }]);
    await page.goto(base + '/');
    await page.locator('#hero a').first().waitFor();
    assert.match(await page.locator('#hero').innerText(), /R\$ 30,00/);
    await page.goto(base + '/?ref=0001');
    await page.locator('#hero a').first().waitFor();
    assert.match(await page.locator('#hero').innerText(), /R\$ 33,00/);
    await page.goto(base + '/0001');
    await page.locator('#hero a').first().waitFor();
    assert.match(await page.locator('#hero').innerText(), /R\$ 33,00/);

    await page.goto(base + '/contratar?ref=0002&oferta=adesaodigital');
    await form();
    const recusar = page.getByRole('button', { name: 'Recusar opcionais', exact: true });
    if (await recusar.count()) await recusar.click();
    await page.locator('#responsibleCpf').fill('52998224725');
    await page.getByRole('button', { name: 'Validar CPF', exact: true }).click();
    await page.locator('#responsibleEmail').fill('teste@example.invalid');
    await page.locator('#responsiblePhone').fill('21900000000');
    await page.getByRole('button', { name: 'Salvar responsável', exact: true }).click();
    await page.getByRole('button', { name: 'Adicionar titular', exact: true }).click();
    await page.getByPlaceholder('000.000.000-00').fill('52998224725');
    await page.getByRole('button', { name: 'Validar CPF', exact: true }).click();
    await page.getByRole('button', { name: 'Salvar titular', exact: true }).click();
    await page.getByRole('button', { name: 'Emitir boleto e concluir', exact: true }).click();
    await page.getByRole('checkbox').last().check();
    await page.getByRole('button', { name: 'Confirmar contratação', exact: true }).click();
    await page.getByRole('heading', { name: 'Boleto emitido com sucesso!' }).waitFor();

    assert.equal(vendas.length, 1);
    assert.equal(vendas[0].cod_colab, '0002');
    assert.equal(vendas[0].tipo_venda, 'PARCEIRO');
    assert.equal(vendas[0].parceiro_apelido, 'adesaodigital');
    assert.equal(vendas[0].vl_total, 30);
    assert.deepEqual(n8nNaoPrevisto, []);
    console.log('PASS: bundle de produção resolve /adesaodigital, /0002, referência direta e cookie; preserva retorno visual e envia PARCEIRO 0002 / R$30 somente ao endpoint simulado.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
