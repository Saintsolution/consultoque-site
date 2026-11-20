import assert from "node:assert/strict";
import { test } from "node:test";
import { build } from "esbuild";

const bundle = await build({
  stdin: {
    contents: `
      export { resumir } from "./src/coletivo/components/dadosComissoes";
      export { fechamentoDoLote, montagemRelatorio } from "./src/coletivo/components/relatoriosComissoes";
    `,
    resolveDir: process.cwd(),
  },
  bundle: true, write: false, platform: "node", format: "esm",
});
const { resumir, fechamentoDoLote, montagemRelatorio } = await import(
  `data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`
);
const lote = "2026-12-05";
const contexto = { baseValidada: true, dataReferencia: "2026-11-20", competencia: "2026-11", lote };
const comissao = (id, extra = {}) => ({
  id_comissao: id, num_contrato: "CON01", tipo_comissao: "PAI_REDE", competencia: "11/2026",
  percentual: 10, vl_base: 1200, vl_comissao: 120, data_prevista_iso: lote,
  pago: false, elegivel_financeiro: true, liberado_para_pagamento: true,
  situacao_pagamento: "A_VENCER", status_comissao: "PENDENTE", ...extra,
});
const paga = comissao("PAGA-A", { pago: true, vl_comissao: 159, status_comissao: "PAGO", dt_pagamento: "19/11/2026", situacao_pagamento: "PAGO" });
const pendente = comissao("PENDENTE-A");
const bloqueada = comissao("BLOQUEADA-A", { vl_comissao: 13, elegivel_financeiro: false, liberado_para_pagamento: false, situacao_pagamento: "EM_CONFERENCIA" });
const vencida = comissao("VENCIDA-A", { vl_comissao: 25, data_prevista_iso: "2026-11-05", situacao_pagamento: "VENCIDO" });
const grupo = (codigo, comissoes) => ({
  cod_colab: codigo,
  nome_colab: `Colaborador <${codigo}>`,
  pix_colab: "pix-teste",
  ...resumir(comissoes, true), comissoes,
});

test("Indicadores distinguem PAGO, pendente liberado e conferência", () => {
  const total = resumir([paga, pendente, bloqueada, vencida], true);
  assert.deepEqual(total, {
    total_gerado: 317, total_pago: 159, total_pendente: 158,
    total_devido_liberado: 145, total_vencido: 25, total_a_vencer: 120, total_em_conferencia: 13,
  });
});

test("Relatórios vazios emitem um documento com totais zerados", () => {
  for (const tipo of ["geral", "guia", "simplificado"]) {
    const html = montagemRelatorio(tipo, [], contexto);
    assert.match(html, /Nenhum lançamento/);
    assert.match(html, /0,00/);
  }
});

test("Relatórios agrupam e totalizam, com cabeçalhos repetíveis na impressão", () => {
  const muitos = Array.from({ length: 120 }, (_, i) => comissao(`PEND-${i}`, { vl_comissao: 1.25 }));
  const grupos = [grupo("0002", muitos), grupo("0001", [paga, bloqueada])];
  const geral = montagemRelatorio("geral", grupos, contexto);
  assert.ok(geral.indexOf("0001 ·") < geral.indexOf("0002 ·"));
  assert.match(geral, /PEND-119/);
  assert.match(geral, /19\/11\/2026/);
  assert.match(geral, /322,00/);
  assert.match(geral, /table-header-group/);
  assert.match(geral, /break-inside:avoid/);
  assert.doesNotMatch(geral, /pix-teste/);
  const simples = montagemRelatorio("simplificado", grupos, contexto);
  assert.match(simples, /Colaborador &lt;0001&gt;/);
  assert.match(simples, /322,00/);
  assert.doesNotMatch(simples, /PEND-119/);
});

test("Guia exige fechamento e lote exato e só mostra PIX com autorização explícita", () => {
  assert.equal(fechamentoDoLote("2027-01-05"), "2026-12-20");
  assert.equal(fechamentoDoLote("2027-01-12"), null);
  const grupos = [grupo("0001", [paga, pendente, bloqueada, vencida])];
  assert.match(montagemRelatorio("guia", grupos, { ...contexto, dataReferencia: "2026-11-19" }), /Nenhum lançamento/);
  const guia = montagemRelatorio("guia", grupos, contexto);
  assert.match(guia, /PENDENTE-A/);
  assert.match(guia, /120,00/);
  assert.match(guia, /Marcar pago/);
  assert.doesNotMatch(guia, /PAGA-A|BLOQUEADA-A|VENCIDA-A|pix-teste/);
  assert.match(montagemRelatorio("guia", grupos, { ...contexto, dadosPixAutorizados: true }), /pix-teste/);
});
