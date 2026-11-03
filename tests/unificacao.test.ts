import { consultarParceiro } from '../src/services/parceiro';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { criarResolvedorReferencia, normalizarCodigo, armazenamentoReferencia } from '../src/services/referencia';
import { referenciaDaUrl, ROTAS_RESERVADAS } from '../src/app/rotas';
import { construirContratacao, type DadosContratacao } from '../src/services/contratacao';
import { calculatePrice } from '../src/lib/pricing';
import { validarCpf } from '../src/lib/cpf';
import { enviarIntegracao } from '../src/services/http';

function memoria(inicial = '') {
  let salvo = inicial;
  const historico: string[] = [];
  return { ler: () => salvo, salvar: (codigo: string) => { salvo = codigo; historico.push(codigo); }, historico };
}
function response(dados: unknown, status = 200) {
  return new Response(JSON.stringify(dados), { status, headers: { 'Content-Type': 'application/json' } });
}
const semRede = (() => { throw new Error('Rede não autorizada neste teste'); }) as typeof fetch;

test('códigos são estritos: não transforma apelido com dígitos em código', () => {
  assert.equal(normalizarCodigo('2'), '0002');
  for (const valor of ['ana42', '00002', '-2', '12.3', '', null]) assert.equal(normalizarCodigo(valor), '');
});
test('referência numérica explícita vence armazenamento e não chama serviço', async () => {
  const storage = memoria('0008');
  const resolver = criarResolvedorReferencia(storage, semRede);
  assert.equal(await resolver.preparar('12'), '0012');
  assert.equal(resolver.codigoConfirmado(), '0012');
});
test('apelido é normalizado e só recebe código se backend confirmar', async () => {
  const storage = memoria('0009');
  const resolver = criarResolvedorReferencia(storage, (async (url, init) => {
    assert.match(String(url), /resolver-referencia-publica$/);
    assert.deepEqual(JSON.parse(String(init?.body)), { referencia: 'joao-42' });
    return response({ encontrado: true, cod_colab: '4' });
  }) as typeof fetch);
  assert.throws(() => resolver.codigoConfirmado());
  assert.equal(await resolver.preparar('João 42'), '0004');
});
test('apelido inexistente, HTTP inválido ou código inválido nunca autoriza venda com indicação antiga', async () => {
  for (const [dados, status] of [[{ encontrado: false }, 200], [{ encontrado: true, cod_colab: 'xyz2' }, 200], [{ encontrado: true, cod_colab: '0002' }, 500]] as const) {
    const storage = memoria('0009');
    const resolver = criarResolvedorReferencia(storage, (async () => response(dados, status)) as typeof fetch);
    await assert.rejects(resolver.preparar('ana'));
    assert.throws(() => resolver.codigoConfirmado());
    assert.deepEqual(storage.historico, []);
  }
});
test('falha de rede e JSON inválido não atribuem venda ao padrão', async () => {
  for (const requisitar of [semRede, (async () => new Response('não-json')) as typeof fetch]) {
    const resolver = criarResolvedorReferencia(memoria('0010'), requisitar);
    await assert.rejects(resolver.preparar('ana'));
    assert.throws(() => resolver.codigoConfirmado());
  }
});
test('resposta atrasada não sobrescreve referência mais recente', async () => {
  let concluir!: (valor: Response) => void;
  const storage = memoria();
  const resolver = criarResolvedorReferencia(storage, (() => new Promise(resolve => { concluir = resolve; })) as typeof fetch);
  const antiga = resolver.preparar('ana');
  assert.throws(() => resolver.codigoConfirmado());
  await resolver.preparar('3');
  concluir(response({ encontrado: true, cod_colab: '0002' }));
  assert.equal(await antiga, null);
  assert.equal(resolver.codigoConfirmado(), '0003');
  assert.deepEqual(storage.historico, ['0003']);
});
test('cancelamento e retry não deixam código de uma sessão de resolução anterior', async () => {
  let concluir!: (valor: Response) => void;
  const storage = memoria();
  const resolver = criarResolvedorReferencia(storage, (() => new Promise(resolve => { concluir = resolve; })) as typeof fetch);
  const pendente = resolver.preparar('ana');
  resolver.cancelar();
  concluir(response({ encontrado: true, cod_colab: '0002' }));
  assert.equal(await pendente, null);
  assert.throws(() => resolver.codigoConfirmado());
  assert.equal(await resolver.preparar('4'), '0004');
});
test('sem referência nova conserva código válido ou usa venda direta', async () => {
  for (const [anterior, esperado] of [['0015', '0015'], ['', '0001'], ['ana42', '0001']]) {
    const resolver = criarResolvedorReferencia(memoria(anterior), semRede);
    assert.equal(await resolver.preparar(null), esperado);
  }
});
test('rotas públicas, aliases, token e modelos não são resolvidos como apelidos', () => {
  for (const rota of ROTAS_RESERVADAS) assert.deepEqual(referenciaDaUrl(`/${rota}`, '?token=abc&modelo=x'), { referencia: null, entrada: false });
  assert.deepEqual(referenciaDaUrl('/ana42', ''), { referencia: 'ana42', entrada: true });
  assert.equal(referenciaDaUrl('/contratar', '?ref=ana42').referencia, 'ana42');
  assert.equal(referenciaDaUrl('/play/crianca-noite/0004', '').referencia, '0004');
  assert.equal(referenciaDaUrl('/seja-colaborador/ana', '').referencia, 'ana');
});
function fixture(total: number, empresa = false): DadosContratacao {
  const holders = Array.from({ length: total }, (_, index) => ({ id: String(index), cpf: `900000000${String(index).padStart(2, '0')}`, name: 'Titular Sintético', birthDate: '1990-01-02', email: '', phone: '', plan: index % 2 ? 'familia' as const : 'individual' as const }));
  return { agora: '2026-10-25T12:00:00.000Z', codColab: '0042', responsibleName: ' Pessoa Sintética ', responsibleCpf: '900.000.000-00', responsibleBirthDate: '1990-01-02', responsibleEmail: ' TESTE@EXAMPLE.INVALID ', responsiblePhone: '(21) 90000-0000', cobrancaEmpresa: empresa, companyName: ' Empresa Sintética ', cnpj: '90.000.000/0001-00', responsibleCpfValidation: { cpf_validado: true, maior_idade: true, consulta_id: 'consulta-simulada' }, holders, breakdown: calculatePrice(holders), versaoTermo: 'TESTE' };
}
// Evaluate the exact original payload expression from an immutable audit fixture, not a live backend.
const originalPayload = readFileSync('tests/fixtures/form-coletivo-payload-original.txt', 'utf8');
const originalBuilder = new Function('dados', `const {agora,codColab,responsibleName,responsibleCpf,responsibleBirthDate,responsibleEmail,responsiblePhone,cobrancaEmpresa,companyName,cnpj,responsibleCpfValidation,breakdown,holders,versaoTermo:VERSAO_TERMO_ASSOCIADO}=dados;
const onlyDigits=v=>v.replace(/\\D/g,'');
const normalizarNome=v=>v.normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toUpperCase();
const formatBirthDateBR=d=>/^\\d{4}-\\d{2}-\\d{2}$/.test(d)?d.split('-').reverse().join('/'):d;
${originalPayload}; return payload;`);
test('payload PF/PJ é idêntico ao FormColetivo original para 1,9,10,11 titulares', () => {
  for (const total of [1,9,10,11]) for (const empresa of [false,true]) {
    const dados = fixture(total, empresa);
    assert.deepEqual(construirContratacao(dados), originalBuilder(dados));
    const payload = construirContratacao(dados);
    assert.equal(payload.cod_colab, '0042');
    assert.equal(payload.desconto_coletivo, total >= 10);
    assert.equal(payload.titulares[0].cod_plano, '2878');
    if (total > 1) assert.equal(payload.titulares[1].cod_plano, '2880');
    assert.equal(payload.tipo_doc_cobranca, empresa ? 'CNPJ' : 'CPF');
  }
});
test('builder rejeita indicação não confirmada e não altera origem/versão de termos', () => {
  assert.throws(() => construirContratacao({ ...fixture(1), codColab: 'ana' }));
  const payload = construirContratacao(fixture(1));
  assert.equal(payload.origem, 'site_consultoque_empresas');
  assert.equal(payload.versao_termo, 'TESTE');
  assert.equal(payload.empresa, '');
  assert.equal(payload.cnpj, '');
});
test('preços individuais e familiares preservam limiar misto e retorno abaixo de 10', () => {
  for (const total of [1,9,10,11]) {
    const price = fixture(total).breakdown;
    assert.equal(price.individualUnit, total >= 10 ? 30 : 33);
    assert.equal(price.familyUnit, total >= 10 ? 60 : 66);
    assert.equal(price.totalMonthly, price.individualCount * price.individualUnit + price.familyCount * price.familyUnit);
  }
  assert.equal(validarCpf('11111111111'), false);
});
test('transporte mantém headers de autorização, corpo, status e não repete operação', async () => {
  const originalFetch = globalThis.fetch;
  let chamadas = 0;
  globalThis.fetch = (async (_url, init) => {
    chamadas++;
    assert.equal((init?.headers as Record<string,string>)['X-Associado-Token'], 'token-sintetico');
    assert.equal(init?.body, '{"cpf_titular":"90000000000"}');
    return response({ sucesso: false }, 403);
  }) as typeof fetch;
  try {
    const result = await enviarIntegracao('https://example.invalid/mock', { method:'POST', headers:{'X-Associado-Token':'token-sintetico'}, body:'{"cpf_titular":"90000000000"}' });
    assert.equal(result.status, 403);
    assert.deepEqual(await result.json(), { sucesso: false });
    assert.equal(chamadas, 1);
  } finally { globalThis.fetch = originalFetch; }
});

test('ponte de indicação prioriza cookie válido e sincroniza chaves legadas sem tocar em sessões', () => {
  const anteriores = Object.fromEntries(['window', 'document', 'localStorage'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  const valores = new Map([['indicador_colab', '0042'], ['referenciador_id', '0003']]);
  const gravados: string[] = [];
  let cookie = 'indicador_consultoque=0020';
  const documento = { get cookie() { return cookie; }, set cookie(value: string) { gravados.push(value); } };
  try {
    Object.defineProperties(globalThis, {
      window: { value: { location: { hostname: 'consultoque.com.br' } }, configurable: true },
      document: { value: documento, configurable: true },
      localStorage: { value: { getItem: (key: string) => valores.get(key) ?? null, setItem: (key: string, value: string) => valores.set(key, value) }, configurable: true },
    });
    assert.equal(armazenamentoReferencia.ler(), '0020');
    cookie = 'indicador_consultoque=%E0%A4%A';
    assert.equal(armazenamentoReferencia.ler(), '0042');
    armazenamentoReferencia.salvar('0017');
    assert.equal(valores.get('referenciador_id'), '0017');
    assert.equal(valores.get('indicador_colab'), '0017');
    assert.match(gravados.find(x => x.startsWith('indicador_consultoque='))!, /Domain=\.consultoque\.com\.br; Secure/);
    assert.ok(gravados.every(x => x.includes('SameSite=Lax') && x.includes('Max-Age=2592000')));
    assert.ok(gravados.every(x => !x.includes('token')));
  } finally {
    for (const [key, descriptor] of Object.entries(anteriores)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
  }
});
test('encoding inválido de URL não derruba o roteador nem transforma rota reservada em apelido', () => {
  assert.doesNotThrow(() => referenciaDaUrl('/%E0%A4%A', ''));
  assert.equal(referenciaDaUrl('/%63ontratar', '').referencia, null);
});

test('parceiro exige confirmação do cadastro, código correspondente e marca exata', async () => {
  assert.deepEqual(await consultarParceiro('timewebesportes', '0012', (async () => response({ encontrado: true, cod_colab: '0012', parceiro: 'PARCEIRO', apelido_referencia: 'timewebesportes' })) as typeof fetch), { codigo: '0012', apelido: 'timewebesportes' });
  assert.deepEqual(await consultarParceiro('adesaodigital', '0002', (async () => response({ encontrado: true, cod_colab: '0002', parceiro: 'PARCEIRO', referencia: 'outro' })) as typeof fetch), {codigo:'0002',apelido:'0002'});
  for (const parceiro of [undefined, null, '', 'sim', true, 1, 'parceiro teste']) {
    assert.equal(await consultarParceiro('adesaodigital', '0002', (async () => response({ encontrado: true, cod_colab: '0002', apelido_referencia: 'adesaodigital', parceiro })) as typeof fetch), null);
  }
  for (const parceiro of ['PARCEIRO', 'parceiro', ' Parceiro ']) {
    assert.deepEqual(await consultarParceiro('0002', '0002', (async () => response({ encontrado: true, cod_colab: '0002', apelido_referencia: 'adesaodigital', parceiro })) as typeof fetch), { codigo: '0002', apelido: 'adesaodigital' });
  }
  await assert.rejects(consultarParceiro('0002', '0002', (async () => response({ encontrado: false, cod_colab: '0002', parceiro: 'PARCEIRO' })) as typeof fetch));
  await assert.rejects(consultarParceiro('0002', '0002', (async () => response({ encontrado: true, cod_colab: '0042', parceiro: 'PARCEIRO' })) as typeof fetch));
  await assert.rejects(consultarParceiro('0002', '0002', (async () => response({ sucesso: false, encontrado: true, cod_colab: '0002', parceiro: 'PARCEIRO' })) as typeof fetch));
  await assert.rejects(consultarParceiro('0002', '0002', semRede));
});
test('parceiro reaproveita 30/60 sem alterar o limiar coletivo nem o cálculo padrão', () => {
  for (const total of [1, 9, 10, 11]) {
    for (const plan of ['individual', 'familia'] as const) {
      const holders = Array.from({length:total}, (_, i) => ({ id:String(i), plan, name:'SINTETICO', cpf:'' }));
      const especial = calculatePrice(holders, true);
      assert.equal(especial.totalMonthly, total * (plan === 'individual' ? 30 : 60));
      assert.equal(especial.hasBulkDiscount, total >= 10);
      assert.equal(calculatePrice(holders).totalMonthly, total * (plan === 'individual' ? (total >= 10 ? 30 : 33) : (total >= 10 ? 60 : 66)));
    }
  }
});

test('oferta persiste apenas identidade e prazo fixo de trinta dias; leitura não renova', async () => {
  const { criarPersistenciaOferta, ofertaNoPrazo, VALIDADE_OFERTA_PARCEIRO, CHAVE_OFERTA_PARCEIRO, linkComercial } = await import('../src/services/parceiro');
  const itens = new Map<string,string>();
  const store = { getItem: (k:string) => itens.get(k) ?? null, setItem: (k:string,v:string) => { itens.set(k,v); }, removeItem: (k:string) => { itens.delete(k); } };
  const p = criarPersistenciaOferta(store);
  const oferta = {codigo:'0002',apelido:'adesaodigital'};
  const inicio = 1000000;
  const c = p.salvar(oferta,inicio);
  assert.deepEqual(Object.keys(c).sort(),['apelido','codigo','expiraEm','iniciadoEm']);
  assert.equal(c.expiraEm,inicio+VALIDADE_OFERTA_PARCEIRO);
  assert.deepEqual(p.ler(),c);
  assert.equal(ofertaNoPrazo(c,inicio+VALIDADE_OFERTA_PARCEIRO-1),true);
  assert.equal(ofertaNoPrazo(c,c.expiraEm),false);
  assert.equal(ofertaNoPrazo(c,inicio-1),false);
  assert.equal(p.ler()?.iniciadoEm,inicio);
  assert.equal(linkComercial('/contratar',oferta,'0002'),'/contratar?ref=0002&oferta=adesaodigital');
  assert.equal(linkComercial('/contratar',null,'0042'),'/contratar?ref=0042');
  store.setItem(CHAVE_OFERTA_PARCEIRO,JSON.stringify({...c,expiraEm:c.expiraEm+1}));
  assert.equal(p.ler(),null);
  p.salvar(oferta,inicio);p.limpar();assert.equal(p.ler(),null);
});

test('prévia do complemento usa modalidade contratual com composições de 1, 9, 10 e 11', () => {
  for (const modalidade of [undefined, '', 'PADRAO', 'PARCEIRO', ' parceiro ', 'OUTRO']) {
    for (const total of [1, 9, 10, 11]) {
      for (const familiares of [0, Math.floor(total / 2), total]) {
        const holders = Array.from({ length: total }, (_, i) => ({ id: String(i), name: '', cpf: '', plan: i < familiares ? 'familia' as const : 'individual' as const }));
        const parceiro = String(modalidade ?? '').trim().toUpperCase() === 'PARCEIRO';
        const resumo = calculatePrice(holders, parceiro);
        const reduzida = parceiro || total >= 10;
        assert.equal(resumo.totalMonthly, (total - familiares) * (reduzida ? 30 : 33) + familiares * (reduzida ? 60 : 66));
        assert.equal(resumo.hasBulkDiscount, total >= 10);
      }
    }
  }
});


test('origem visual aceita somente destinos cadastrados e não modifica referência ou oferta', async () => {
  const { destinoOrigemVisual, comOrigemVisual } = await import('../src/app/origemVisual');
  for (const [origem, destino] of [['home', '/'], ['coletivo', '/coletivo'], ['parceiro:adesaodigital', '/adesaodigital'], ['parceiro:0002', '/0002'], ['parceiro:novo-parceiro', '/novo-parceiro']]) {
    const link = comOrigemVisual('/contratar?ref=0042&oferta=outra', origem);
    assert.equal(destinoOrigemVisual(link.slice(link.indexOf('?'))), destino);
    const params = new URLSearchParams(link.slice(link.indexOf('?')));
    assert.equal(params.get('ref'), '0042');
    assert.equal(params.get('oferta'), 'outra');
  }
  for (const search of ['', '?ref=0002&oferta=adesaodigital', '?origem_visual=https://example.invalid', '?origem_visual=//example.invalid', '?origem_visual=/adesaodigital', '?origem_visual=parceiro:admin', '?origem_visual=parceiro:..', '?origem_visual=__proto__', '?origem_visual=constructor', '?origem_visual=home&origem_visual=coletivo']) {
    assert.equal(destinoOrigemVisual(search), '/');
  }
});

 test('modalidade não depende de identidade visual e rejeita status inativo', async () => {
  const mock = (dados: object) => (async () => response(dados)) as typeof fetch;
  assert.deepEqual(await consultarParceiro('0020', '0020', mock({ encontrado: true, status_colab: 'ATIVO', cod_colab: '0020', parceiro: 'PARCEIRO', apelido_referencia: 'novo-parceiro' })), { codigo: '0020', apelido: 'novo-parceiro' });
  assert.deepEqual(await consultarParceiro('0021', '0021', mock({ encontrado: true, status_colab: 'ATIVO', cod_colab: '0021', parceiro: 'PARCEIRO' })), { codigo: '0021', apelido: '0021' });
  await assert.rejects(consultarParceiro('0020', '0020', mock({ encontrado: true, status_colab: 'INATIVO', cod_colab: '0020', parceiro: 'PARCEIRO' })));
 });

test('consulta de modalidade envia exclusivamente o código já normalizado', async () => {
  const fetchCodigo = (async (_url: unknown, init: RequestInit) => {
    assert.deepEqual(JSON.parse(String(init.body)), {cod_colab:'0002'});
    return response({encontrado:true,cod_colab:'0002',status_colab:'ATIVO',parceiro:'PARCEIRO',apelido_referencia:'adesaodigital'});
  }) as typeof fetch;
  assert.deepEqual(await consultarParceiro('apelido-apenas-publico','2',fetchCodigo),{codigo:'0002',apelido:'adesaodigital'});
  await assert.rejects(consultarParceiro('adesaodigital','invalido',semRede),/Código/);
});
