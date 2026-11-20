import assert from "node:assert/strict";
import { test } from "node:test";
import { handler } from "../netlify/functions/admin-baixas-comissoes.mjs";

const id = "COM_payteste_0001_PAI_REDE";
const data = "2020-02-29";
const lote = { ids_comissoes: [id], dt_pagamento: data };
const evento = {
  httpMethod: "POST",
  headers: { "X-Admin-Token": "sessao-teste" },
  body: JSON.stringify({ ...lote, ids_comissoes: [id, id] }),
};
const registro = {
  id_comissao: id,
  pago: false,
  elegivel_financeiro: true,
  liberado_para_pagamento: true,
  situacao_pagamento: "VENCIDO",
};

test("Proxy valida o lote e só reconhece persistência confirmada", async (t) => {
  const chave = "chave-sintetica";
  const env = { ...process.env };
  process.env.CONSULTOQUE_ADMIN_BAIXAS_KEY = chave;
  delete process.env.CONSULTOQUE_ADMIN_BAIXAS_ENABLED;
  t.after(() => {
    for (const nome of ["CONSULTOQUE_ADMIN_BAIXAS_KEY", "CONSULTOQUE_ADMIN_BAIXAS_ENABLED"]) {
      if (env[nome] === undefined) delete process.env[nome];
      else process.env[nome] = env[nome];
    }
  });

  const respostas = [];
  const chamadas = t.mock.method(globalThis, "fetch", async () => respostas.shift());
  const painel = (lancamentos = [registro]) => Response.json([{
    status: "sucesso",
    pagamentos_comissao: { conferencia_disponivel: true, lancamentos },
  }]);
  const estado = await handler({ httpMethod: "GET" });
  assert.deepEqual(JSON.parse(estado.body), { habilitada: false });
  assert.equal((await handler(evento)).statusCode, 503);
  assert.equal(chamadas.mock.callCount(), 0);

  process.env.CONSULTOQUE_ADMIN_BAIXAS_ENABLED = "true";
  assert.equal((await handler({ ...evento, headers: {} })).statusCode, 401);
  for (const body of [
    { ...lote, dt_pagamento: "2026-02-29" },
    { ...lote, dt_pagamento: "9999-12-31" },
    { ...lote, ids_comissoes: ["../invalido"] },
  ]) {
    assert.equal((await handler({ ...evento, body: JSON.stringify(body) })).statusCode, 400);
  }
  assert.equal(chamadas.mock.callCount(), 0);

  respostas.push(Response.json({ autorizado: false }, { status: 401 }));
  assert.equal((await handler(evento)).statusCode, 401);
  assert.equal(chamadas.mock.callCount(), 1);

  respostas.push(painel([{ ...registro, pago: true }]));
  assert.equal((await handler(evento)).statusCode, 409);
  assert.equal(chamadas.mock.callCount(), 2);

  respostas.push(painel(), Response.json({ status: "erro" }, { status: 409 }));
  assert.equal((await handler(evento)).statusCode, 409);

  respostas.push(painel(), Response.json({ myField: "value" }));
  assert.equal((await handler(evento)).statusCode, 502);
  respostas.push(painel(), Response.json({ status: "sucesso", dt_pagamento: data, ids_comissoes_atualizadas: [] }));
  assert.equal((await handler(evento)).statusCode, 502);

  const confirmado = { status: "sucesso", dt_pagamento: data, ids_comissoes_atualizadas: [id] };
  respostas.push(painel(), Response.json(confirmado));
  const resultado = await handler(evento);
  assert.equal(resultado.statusCode, 200);
  assert.deepEqual(JSON.parse(resultado.body), confirmado);

  const [[urlPainel, consulta], [urlBaixas, baixa]] = chamadas.mock.calls.slice(-2).map((call) => call.arguments);
  assert.ok(urlPainel.endsWith("/admin-dashboard"));
  assert.ok(urlBaixas.endsWith("/admin-baixas-comissoes"));
  assert.equal(consulta.headers["X-Admin-Token"], "sessao-teste");
  assert.equal(consulta.headers["x-consultoque-admin-key"], undefined);
  assert.equal(baixa.headers["x-consultoque-admin-key"], chave);
  assert.equal(baixa.headers["X-Admin-Token"], undefined);
  assert.deepEqual(JSON.parse(baixa.body), lote);
});
