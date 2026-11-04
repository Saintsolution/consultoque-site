// Fonte compartilhada do cálculo React e dos artefatos n8n locais.
// Calcular uma tabela não concede autorização para utilizá-la.
export type FamiliaComercial = 'PADRAO' | 'PARCEIRO';
export const REGRA_COMERCIAL = 'COMERCIAL_2026_11';
export interface PoliticaComercial {
  familia: FamiliaComercial;
  versao?: string | null;
}

export function resolverPolitica(familia: FamiliaComercial, versao?: string | null) {
  if (familia !== 'PADRAO' && familia !== 'PARCEIRO') throw new Error('Família comercial inválida.');
  // Identificadores antigos são somente rastreabilidade; nunca escolhem outra tabela.
  if (versao != null && versao !== '') {
    const permitidas = [REGRA_COMERCIAL, familia + '_V1', ...(familia === 'PARCEIRO' ? ['PARCEIRO_V2'] : [])];
    if (!permitidas.includes(versao)) throw new Error('Identificação de política desconhecida ou incompatível.');
  }
  return { familia, versao: REGRA_COMERCIAL };
}

// Compatibilidade: modalidade não reconhecida sem versão preserva o PADRAO legado.
// Uma versão explícita nunca é descartada silenciosamente.
export function politicaDoContrato(contrato: { tipo_venda?: unknown; versao_politica?: unknown }) {
  const tipo = String(contrato.tipo_venda ?? '').trim().toUpperCase();
  const versao = contrato.versao_politica;
  if (versao != null && typeof versao !== 'string') throw new Error('Versão de política inválida.');
  if (versao && tipo !== 'PADRAO' && tipo !== 'PARCEIRO') throw new Error('Modalidade contratual inválida para a versão.');
  return resolverPolitica(tipo === 'PARCEIRO' ? 'PARCEIRO' : 'PADRAO', versao);
}

export function calcularPolitica(politica: PoliticaComercial, individuais: number, familiares: number) {
  const selecionada = resolverPolitica(politica.familia, politica.versao);
  for (const qtd of [individuais, familiares, individuais + familiares]) {
    if (!Number.isSafeInteger(qtd) || qtd < 0) throw new Error('Quantidade de titulares inválida.');
  }
  const quantidade = individuais + familiares;
  const coletivo = quantidade >= 10;
  const individualCentavos = selecionada.familia === 'PARCEIRO'
    ? (coletivo ? 2700 : 3000)
    : (coletivo ? 3000 : 3300);
  const familiarCentavos = individualCentavos * 2;
  const subtotalIndividualCentavos = individuais * individualCentavos;
  const subtotalFamiliarCentavos = familiares * familiarCentavos;
  const totalCentavos = subtotalIndividualCentavos + subtotalFamiliarCentavos;
  const economiaCentavos = individuais * 3300 + familiares * 6600 - totalCentavos;
  if (![totalCentavos, economiaCentavos].every(Number.isSafeInteger)) throw new Error('Valor fora do limite de cálculo.');
  return {
    ...selecionada, quantidade, faixa: coletivo ? '10_MAIS' : 'ATE_9', coletivo,
    individualCentavos, familiarCentavos, subtotalIndividualCentavos,
    subtotalFamiliarCentavos, totalCentavos, economiaCentavos,
  };
}
