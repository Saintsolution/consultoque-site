export interface ResumoComissoes {
  total_gerado: number;
  total_pago: number;
  total_pendente: number;
  total_a_vencer: number | null;
  total_vencido: number | null;
  total_devido_liberado: number | null;
  total_em_conferencia: number | null;
  qtd_em_conferencia?: number | null;
}

export interface ComissaoDetalhe {
  id_comissao: string;
  num_contrato: string;
  tipo_comissao: string;
  competencia: string;
  percentual: number;
  vl_comissao: number;
  vl_base?: number;
  dt_pagamento?: string | null;
  data_prevista_iso: string | null;
  elegivel_financeiro: boolean | null;
  motivo_nao_elegivel: string;
  status_comissao: string;
  pago?: boolean;
  liberado_para_pagamento?: boolean | null;
  situacao_pagamento: string;
}

export interface ColaboradorResumo extends ResumoComissoes {
  cod_colab: string;
  nome_colab: string;
  pix_colab?: string | null;
  cpf_colab?: string | null;
  comissoes: ComissaoDetalhe[];
}

export interface PagamentosComissao {
  conferencia_disponivel: boolean;
  data_referencia?: string;
  dados_pix_autorizados?: boolean;
  indicadores: ResumoComissoes;
  colaboradores: ColaboradorResumo[];
}

const situacoes: Record<string, string> = {
  PAGO: "Pago",
  A_VENCER: "A vencer",
  VENCIDO: "Vencido",
  EM_CONFERENCIA: "Em conferência",
  CONFERENCIA_INDISPONIVEL: "Conferência indisponível",
  SEM_DATA_PREVISTA: "Sem data prevista",
};

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
export function valor(reais?: number | null) {
  if (typeof reais !== "number") return "—";

  // O n8n serializa em reais após somar em centavos.
  const centavos = Math.round(reais * 100);
  return Number.isSafeInteger(centavos) ? moeda.format(centavos / 100) : "—";
}

export function dataBrasileira(data?: string | null) {
  if (data && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(data)) {
    return data.split("/").map((parte) => parte.padStart(2, "0")).join("/");
  }
  const partes = data?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return partes ? `${partes[3]}/${partes[2]}/${partes[1]}` : "—";
}

export function rotulo(valor: string) {
  return valor ? valor.toLocaleLowerCase("pt-BR").replace(/_/g, " ") : "—";
}

export function estaPaga(comissao: ComissaoDetalhe) {
  return comissao.pago === true || comissao.situacao_pagamento === "PAGO"
    || /^(PAG[OA]|RECEBID[OA]|RECEIVED|PAYMENT_RECEIVED)$/i.test(comissao.status_comissao.trim());
}

export function podeSelecionar(comissao: ComissaoDetalhe, baseValidada: boolean) {
  return baseValidada && comissao.elegivel_financeiro === true
    && comissao.liberado_para_pagamento === true && !estaPaga(comissao);
}

export function somar(comissoes: ComissaoDetalhe[]) {
  return comissoes.reduce((soma, item) => soma + Math.round(item.vl_comissao * 100), 0) / 100;
}

export function resumir(comissoes: ComissaoDetalhe[], baseValidada: boolean): ResumoComissoes {
  const pendentes = comissoes.filter((item) => !estaPaga(item));
  const liberadas = pendentes.filter((item) => podeSelecionar(item, baseValidada));
  return {
    total_gerado: somar(comissoes),
    total_pago: somar(comissoes.filter(estaPaga)),
    total_pendente: somar(pendentes),
    total_a_vencer: baseValidada ? somar(liberadas.filter((item) => item.situacao_pagamento === "A_VENCER")) : null,
    total_vencido: baseValidada ? somar(liberadas.filter((item) => item.situacao_pagamento === "VENCIDO")) : null,
    total_devido_liberado: baseValidada ? somar(liberadas) : null,
    total_em_conferencia: baseValidada ? somar(pendentes.filter((item) => item.situacao_pagamento === "EM_CONFERENCIA")) : null,
  };
}

export function situacaoPagamento(item: ComissaoDetalhe) {
  return situacoes[item.situacao_pagamento] ?? rotulo(item.situacao_pagamento);
}

export function elegibilidade(item: ComissaoDetalhe, baseValidada: boolean) {
  if (!baseValidada || item.elegivel_financeiro === null) return "Conferência indisponível";
  return item.elegivel_financeiro ? "Elegível" : "Em conferência";
}
