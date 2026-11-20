const DASHBOARD = "https://n8n.saintsolution.com.br/webhook/admin-dashboard";
const BAIXAS = "https://n8n.saintsolution.com.br/webhook/admin-baixas-comissoes";

function responder(statusCode, dados) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    body: JSON.stringify(dados),
  };
}

function falha(status, mensagem) {
  return responder(status, { status: "erro", mensagem });
}

function loteValido(body) {
  return Array.isArray(body?.ids_comissoes) && body.ids_comissoes.length > 0
    && body.ids_comissoes.every((id) => typeof id === "string" && /^COM_[A-Za-z0-9_]+$/.test(id))
    && typeof body.dt_pagamento === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.dt_pagamento)
    && !body.dt_pagamento.startsWith("0000-")
    && new Date(body.dt_pagamento).toJSON()?.slice(0, 10) === body.dt_pagamento
    && body.dt_pagamento <= new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Sao_Paulo" }).format();
}

function primeiro(payload) {
  return Array.isArray(payload) ? payload[0] : payload;
}

function confirmaLote(resultado, lote) {
  const ids = resultado?.ids_comissoes_atualizadas;
  return resultado?.status === "sucesso" && resultado.dt_pagamento === lote.dt_pagamento
    && Array.isArray(ids) && ids.length === lote.ids_comissoes.length
    && new Set(ids).size === ids.length && lote.ids_comissoes.every((id) => ids.includes(id));
}

function post(url, headers, body) {
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
    redirect: "error",
    signal: AbortSignal.timeout(12000),
  });
}

export async function handler(event) {
  const chave = process.env.CONSULTOQUE_ADMIN_BAIXAS_KEY?.trim();
  const habilitada = process.env.CONSULTOQUE_ADMIN_BAIXAS_ENABLED === "true" && Boolean(chave);

  if (event.httpMethod === "GET") return responder(200, { habilitada });
  if (event.httpMethod !== "POST") return falha(405, "Método indisponível.");
  if (!habilitada) return falha(503, "Gravação de baixas pendente de homologação.");

  const token = Object.entries(event.headers ?? {})
    .find(([nome]) => nome.toLowerCase() === "x-admin-token")?.[1]?.trim();
  if (!token) return falha(401, "Entre novamente para continuar.");

  let body;
  try {
    body = JSON.parse(event.body ?? "");
  } catch {
    return falha(400, "JSON inválido.");
  }
  if (!loteValido(body)) return falha(400, "Informe IDs válidos e a data real do pagamento.");

  const lote = {
    ids_comissoes: [...new Set(body.ids_comissoes)],
    dt_pagamento: body.dt_pagamento,
  };

  try {
    const consulta = await post(DASHBOARD, { "X-Admin-Token": token }, {});
    const painel = primeiro(await consulta.json().catch(() => null));

    if (consulta.status === 401 || painel?.autorizado === false) {
      return falha(401, "Sessão administrativa inválida ou expirada.");
    }
    if (consulta.status === 403) return falha(403, "Acesso administrativo negado.");
    if (!consulta.ok || painel?.status !== "sucesso") {
      return falha(502, "Não foi possível validar a sessão administrativa.");
    }

    const bloco = painel.pagamentos_comissao;
    if (bloco?.conferencia_disponivel !== true || !Array.isArray(bloco.lancamentos)) {
      return falha(409, "A conferência financeira está indisponível.");
    }

    const selecionados = new Set(lote.ids_comissoes);
    const registros = bloco.lancamentos.filter((item) => selecionados.has(item.id_comissao));
    const aptos = new Set(registros.map((item) => item.id_comissao));
    if (registros.length !== selecionados.size || aptos.size !== selecionados.size
      || registros.some((item) => item.pago !== false || item.elegivel_financeiro !== true
        || item.liberado_para_pagamento !== true || item.situacao_pagamento === "PAGO")) {
      return falha(409, "O lote contém lançamentos indisponíveis para baixa. Atualize o painel.");
    }

    const resposta = await post(BAIXAS, { "x-consultoque-admin-key": chave }, lote);
    const resultado = primeiro(await resposta.json().catch(() => null));
    if (resposta.status === 409) {
      return falha(409, "O n8n recusou a baixa por conflito. Atualize o painel e confira o lote.");
    }
    if (!resposta.ok || !confirmaLote(resultado, lote)) {
      return falha(502, "O n8n não confirmou o lote completo. Confira o painel antes de tentar novamente.");
    }

    return responder(200, {
      status: "sucesso",
      ids_comissoes_atualizadas: lote.ids_comissoes,
      dt_pagamento: lote.dt_pagamento,
    });
  } catch {
    return falha(502, "Não foi possível confirmar a baixa. Confira o painel antes de tentar novamente.");
  }
}
